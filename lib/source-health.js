"use strict";

const { mkdir, readFile, rename, writeFile } = require("node:fs/promises");
const path = require("node:path");
const bundledMunicipalityData = require("../data/DE-BY-municipalities.json");
const modulePackage = require("../package.json");
const {
  SOURCE_URL: BAVARIAN_MUNICIPALITY_SOURCE_URL,
  parseMunicipalities,
  validateMunicipalities
} = require("../scripts/update-bavaria-municipalities");

const DATE_HOLIDAYS_REGISTRY_URL =
  "https://registry.npmjs.org/date-holidays/latest";
const DATE_HOLIDAYS_REPOSITORY_URL =
  "https://api.github.com/repos/commenthol/date-holidays";
const CACHE_DIRECTORY = path.join(__dirname, "..", ".cache");
const CACHE_FILE = path.join(CACHE_DIRECTORY, "source-health.json");
const ONE_DAY_IN_MS = 24 * 60 * 60 * 1000;

let activeHealthCheck = null;

/**
 * Identifies a source response that was reachable but did not satisfy its
 * documented data contract. This is different from a transport outage because
 * repeating the same request is unlikely to restore trustworthy content.
 */
class SourceValidationError extends Error {
  /**
   * Creates a validation-specific error while retaining an ordinary Error stack.
   *
   * @param {string} message Precise description of the invalid source response.
   */
  constructor(message) {
    super(message);
    this.name = "SourceValidationError";
  }
}

/**
 * Downloads a text or JSON source with a bounded wait time and a descriptive
 * user agent. A separate helper keeps network behavior consistent for every
 * maintenance source and makes HTTP failures visible to the caller.
 *
 * @param {string} url HTTPS endpoint to request.
 * @param {number} timeoutMilliseconds Maximum request duration.
 * @param {string} responseType Either `text` or `json`.
 * @returns {Promise<string|object>} Parsed response body.
 * @throws {Error} If the request times out, fails, or returns a non-2xx status.
 */
async function fetchSource(url, timeoutMilliseconds, responseType) {
  // AbortController enforces the configured upper bound even when a remote
  // server accepts a connection but never finishes its response.
  const abortController = new AbortController();
  const timeout = setTimeout(() => abortController.abort(), timeoutMilliseconds);

  try {
    // GitHub requests a recognizable user agent. Sending the expected response
    // type also makes accidental HTML error pages easier to reject as JSON.
    let acceptedContentType = "text/html";
    if (responseType === "json") {
      acceptedContentType = "application/json";
    }

    const response = await fetch(url, {
      headers: {
        Accept: acceptedContentType,
        "User-Agent": "MMM-CalendarAwareCountdown source-health-check"
      },
      signal: abortController.signal
    });

    // Only successful HTTP responses may reach parsers. Redirect handling is
    // provided by fetch; all final 4xx/5xx responses become a source failure.
    if (!response.ok) {
      throw new Error(`HTTP ${response.status} ${response.statusText}`.trim());
    }

    if (responseType === "json") {
      return response.json();
    }
    return response.text();
  } finally {
    // The timer must be cleared on success and failure so it cannot keep the
    // Node process alive or abort an unrelated later operation.
    clearTimeout(timeout);
  }
}

/**
 * Produces a stable representation of municipality rules for comparisons.
 * Timestamps and source ordering are deliberately ignored: only fields that
 * can change a holiday result are included.
 *
 * @param {Array<object>} municipalities Municipality records to normalize.
 * @returns {Array<object>} Relevant records sorted by official municipality code.
 */
function canonicalizeMunicipalities(municipalities) {
  // Copy only fields that identify a municipality or influence its holiday
  // classification. Generated timestamps and page ordering are not legal data.
  const calculationRelevantRecords = municipalities.map((municipality) => ({
      code: municipality.code,
      name: municipality.name,
      district: municipality.district,
      administrativeDistrict: municipality.administrativeDistrict,
      assumptionDay: municipality.assumptionDay
    }));

  // Sorting by the official code makes a harmless reordering of the authority's
  // HTML table compare equal to the bundled release.
  calculationRelevantRecords.sort((left, right) =>
    left.code.localeCompare(right.code)
  );
  return calculationRelevantRecords;
}

/**
 * Compares live official municipality rules with the checked-in release data.
 * The function is intentionally pure so it can be covered by tests without
 * making a network request.
 *
 * @param {Array<object>} liveMunicipalities Parsed records from the authority.
 * @param {Array<object>} bundledMunicipalities Records shipped with the module.
 * @returns {boolean} `true` when a reviewed data update is required.
 */
function municipalityDataChanged(liveMunicipalities, bundledMunicipalities) {
  const normalizedLiveData = canonicalizeMunicipalities(liveMunicipalities);
  const normalizedBundledData = canonicalizeMunicipalities(bundledMunicipalities);

  // Both normalized arrays contain the same ordered plain fields, making their
  // JSON representations a deterministic deep comparison without extra packages.
  return JSON.stringify(normalizedLiveData) !== JSON.stringify(normalizedBundledData);
}

/**
 * Converts an unknown network exception into a short diagnostic string. Full
 * stack traces remain available in the Node process while the mirror receives
 * a concise, non-sensitive status message.
 *
 * @param {unknown} error Value caught from a source check.
 * @returns {string} Human-readable reason suitable for logs and status data.
 */
function errorMessage(error) {
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
}

/**
 * Converts a caught source error into the shared status fields used by all
 * providers. Reachable but malformed data is `invalid`; DNS, timeout, HTTP, and
 * other transport failures are `unavailable`.
 *
 * @param {unknown} error Error raised while fetching or validating one source.
 * @returns {{status: string, code: string, reason: string}} Failure fields.
 */
function sourceFailure(error) {
  let status = "unavailable";
  let code = "SOURCE_UNAVAILABLE";

  if (error instanceof SourceValidationError) {
    status = "invalid";
    code = "SOURCE_INVALID";
  }

  return {
    status,
    code,
    reason: errorMessage(error)
  };
}

/**
 * Checks the installed holiday library against npm's current release and the
 * upstream GitHub repository's maintenance state. An available package update,
 * an archived repository, or a repository without recent activity is reported
 * as attention rather than changing installed code at runtime.
 *
 * @param {object} options Normalized source-health configuration.
 * @param {Date} now Time reference used for deterministic staleness checks.
 * @returns {Promise<Array<object>>} Status entries for package and repository.
 */
async function inspectDateHolidays(options, now) {
  // package.json pins one exact version. Reading that declared version works in
  // development, npm packages, and production without relying on package internals.
  const installedVersion = modulePackage.dependencies["date-holidays"];
  const results = [];

  try {
    // npm's `latest` document is intentionally small and represents the version
    // a normal reviewed dependency update would currently install.
    const registryData = await fetchSource(
      DATE_HOLIDAYS_REGISTRY_URL,
      options.requestTimeout,
      "json"
    );
    const latestVersion = registryData.version;
    // A successful HTTP/JSON response is not sufficient: comparison is reliable
    // only when npm supplies the documented non-empty version string.
    if (typeof latestVersion !== "string" || latestVersion.length === 0) {
      throw new SourceValidationError("npm response contains no valid version");
    }
    const updateAvailable = latestVersion !== installedVersion;

    let packageStatus = "ok";
    let packageCode = "DEPENDENCY_CURRENT";
    if (updateAvailable) {
      packageStatus = "attention";
      packageCode = "DEPENDENCY_UPDATE_AVAILABLE";
    }

    results.push({
      id: "date-holidays-package",
      status: packageStatus,
      code: packageCode,
      installedVersion,
      latestVersion
    });
  } catch (error) {
    // A registry outage says nothing about the installed local package and is
    // marked unavailable; a reachable malformed response is marked invalid.
    results.push({
      id: "date-holidays-package",
      ...sourceFailure(error)
    });
  }

  try {
    // Registry publication alone does not prove that the source project remains
    // viable. GitHub metadata supplies explicit archived/disabled flags and the
    // most recent repository push date.
    const repositoryData = await fetchSource(
      DATE_HOLIDAYS_REPOSITORY_URL,
      options.requestTimeout,
      "json"
    );
    const lastPush = new Date(repositoryData.pushed_at);
    // Required GitHub fields are checked explicitly so a changed API/error
    // document cannot be misclassified as ordinary repository inactivity.
    if (
      typeof repositoryData.archived !== "boolean" ||
      typeof repositoryData.disabled !== "boolean" ||
      !Number.isFinite(lastPush.getTime())
    ) {
      throw new SourceValidationError(
        "GitHub response contains no valid repository maintenance metadata"
      );
    }
    const millisecondsSinceLastPush = now.getTime() - lastPush.getTime();
    const daysSinceLastPush = Math.floor(
      millisecondsSinceLastPush / ONE_DAY_IN_MS
    );

    // Archived/disabled is stronger than age and therefore evaluated first. A
    // merely old repository remains usable but is surfaced for human review.
    let status = "ok";
    let code = "REPOSITORY_CURRENT";
    if (repositoryData.archived || repositoryData.disabled) {
      status = "invalid";
      code = "REPOSITORY_INACTIVE";
    } else if (daysSinceLastPush > options.repositoryStaleAfterDays) {
      status = "attention";
      code = "REPOSITORY_STALE";
    }

    results.push({
      id: "date-holidays-repository",
      status,
      code,
      pushedAt: repositoryData.pushed_at,
      daysSinceLastPush
    });
  } catch (error) {
    // As with npm, transport and response-shape failures retain separate status
    // values so the runtime footer can distinguish outage from invalid metadata.
    results.push({
      id: "date-holidays-repository",
      ...sourceFailure(error)
    });
  }

  return results;
}

/**
 * Downloads and validates the Bavarian authority's current municipality table,
 * then compares it with the mapping bundled in this module release. The live
 * file is never used until it has passed validation and a maintainer has
 * reviewed and released it.
 *
 * @param {object} options Normalized source-health configuration.
 * @returns {Promise<object>} One status entry for the official data source.
 */
async function inspectBavarianMunicipalities(options) {
  try {
    // The complete official table is downloaded because individual place-name
    // searches would not reveal additions, removals, or changes elsewhere.
    const html = await fetchSource(
      BAVARIAN_MUNICIPALITY_SOURCE_URL,
      options.requestTimeout,
      "text"
    );
    const liveMunicipalities = parseMunicipalities(html);

    // Validation must happen before comparison. A partial or structurally
    // changed page is invalid data, never a legitimate automatic update.
    try {
      validateMunicipalities(liveMunicipalities);
    } catch (error) {
      throw new SourceValidationError(
        `Official municipality data failed validation: ${errorMessage(error)}`
      );
    }
    const updateAvailable = municipalityDataChanged(
      liveMunicipalities,
      bundledMunicipalityData.municipalities
    );

    let municipalityStatus = "ok";
    let municipalityCode = "MUNICIPALITY_CURRENT";
    if (updateAvailable) {
      municipalityStatus = "attention";
      municipalityCode = "MUNICIPALITY_UPDATE_AVAILABLE";
    }

    return {
      id: "bavaria-municipalities",
      status: municipalityStatus,
      code: municipalityCode,
      bundledGeneratedAt: bundledMunicipalityData.generatedAt,
      municipalityCount: liveMunicipalities.length
    };
  } catch (error) {
    // Parser invariant failures and transport failures both leave bundled release
    // data untouched, but `sourceFailure` preserves their different meanings.
    return {
      id: "bavaria-municipalities",
      ...sourceFailure(error)
    };
  }
}

/**
 * Performs a complete online inspection of every maintained external source.
 * The result is data-only and can therefore be used by the MagicMirror helper,
 * the command-line maintenance check, and automated repository workflows.
 *
 * @param {object} [options={}] Source-health configuration overrides.
 * @param {Date} [now=new Date()] Time reference for tests and timestamps.
 * @returns {Promise<object>} Aggregated source status and individual results.
 */
async function inspectSources(options = {}, now = new Date()) {
  // Defaults mirror the public module configuration while allowing tests and
  // the command-line checker to call this function directly.
  const normalizedOptions = {
    requestTimeout: options.requestTimeout ?? 15000,
    repositoryStaleAfterDays: options.repositoryStaleAfterDays ?? 365
  };

  // Checks are sequential to keep external traffic small and make terminal
  // diagnostics appear in a predictable source order.
  const dateHolidayResults = await inspectDateHolidays(normalizedOptions, now);
  const municipalityResult = await inspectBavarianMunicipalities(normalizedOptions);
  const sources = [...dateHolidayResults, municipalityResult];

  const everySourceIsHealthy = sources.every(
    (source) => source.status === "ok"
  );
  let overallStatus = "attention";
  if (everySourceIsHealthy) {
    overallStatus = "ok";
  }

  return {
    checkedAt: now.toISOString(),
    // Cache compatibility depends on this result-affecting threshold. Request
    // timeout and display preferences do not change a completed source verdict.
    inspectionSettings: {
      repositoryStaleAfterDays: normalizedOptions.repositoryStaleAfterDays
    },
    status: overallStatus,
    sources
  };
}

/**
 * Reads a previously persisted source-health result. A missing or malformed
 * cache is treated like an empty cache so it can never prevent normal countdown
 * calculation.
 *
 * @returns {Promise<object|null>} Cached result, or `null` when unavailable.
 */
async function readHealthCache() {
  try {
    // JSON is parsed before use. Syntax errors from an interrupted/manual edit
    // therefore follow the same safe path as a missing cache.
    return JSON.parse(await readFile(CACHE_FILE, "utf8"));
  } catch {
    return null;
  }
}

/**
 * Writes a source-health result atomically. The temporary file is renamed only
 * after the complete JSON document has been written, avoiding a truncated cache
 * if MagicMirror stops during the operation.
 *
 * @param {object} health Source-health result to persist.
 * @returns {Promise<void>} Resolves after the cache was replaced.
 */
async function writeHealthCache(health) {
  const temporaryFile = `${CACHE_FILE}.tmp`;

  // The cache directory is runtime state and is excluded from Git and packages.
  await mkdir(CACHE_DIRECTORY, { recursive: true });

  // Pretty JSON remains inspectable by an administrator on the Raspberry Pi.
  await writeFile(temporaryFile, `${JSON.stringify(health, null, 2)}\n`, "utf8");

  // Renaming on the same filesystem replaces the cache as one final operation.
  await rename(temporaryFile, CACHE_FILE);
}

/**
 * Returns a fresh enough cached result or performs one shared online check.
 * Healthy results use the configured monthly interval; results containing an
 * unavailable source are retried after one day so a brief outage does not hide
 * recovery for an entire month.
 *
 * @param {object} [options={}] Source-health configuration overrides.
 * @returns {Promise<object>} Cached or newly inspected source status.
 */
async function loadSourceHealth(options = {}) {
  // Healthy results follow the public monthly interval. An unreachable source
  // uses a separate shorter retry interval, defaulting to one day.
  const checkInterval = options.checkInterval ?? 30 * ONE_DAY_IN_MS;
  const unavailableRetryInterval = options.unavailableRetryInterval ?? ONE_DAY_IN_MS;
  const cachedHealth = await readHealthCache();

  // A cache is reusable only when it contains a timestamp and a source list.
  // Older/unknown formats are ignored and replaced by a current inspection.
  if (cachedHealth?.checkedAt && Array.isArray(cachedHealth.sources)) {
    const configuredStaleThreshold = options.repositoryStaleAfterDays ?? 365;
    const cacheUsesCurrentThreshold =
      cachedHealth.inspectionSettings?.repositoryStaleAfterDays ===
      configuredStaleThreshold;
    const hasUnavailableSource = cachedHealth.sources.some(
      (source) => source.status === "unavailable"
    );
    const maximumAge = hasUnavailableSource
      ? Math.min(checkInterval, unavailableRetryInterval)
      : checkInterval;
    const cacheAge = Date.now() - Date.parse(cachedHealth.checkedAt);

    // Future timestamps are rejected (`cacheAge >= 0`) so a wrong system clock
    // cannot suppress source checks indefinitely.
    if (
      cacheUsesCurrentThreshold &&
      Number.isFinite(cacheAge) &&
      cacheAge >= 0 &&
      cacheAge < maximumAge
    ) {
      return cachedHealth;
    }
  }

  // Several configured module instances may request data simultaneously. They
  // share one promise so each monthly cycle makes only one set of web requests.
  if (!activeHealthCheck) {
    activeHealthCheck = inspectSources(options)
      .then(async (health) => {
        try {
          await writeHealthCache(health);
        } catch (error) {
          // A read-only module directory must not hide an otherwise useful live
          // result. The status is returned even when persistence is impossible.
          console.warn(
            `[MMM-CalendarAwareCountdown] Could not save source-health cache: ${errorMessage(error)}`
          );
        }
        return health;
      })
      .finally(() => {
        // Clearing the shared promise allows the next expired cycle to start a
        // new check and also releases references held by the completed promise.
        activeHealthCheck = null;
      });
  }

  return activeHealthCheck;
}

module.exports = {
  BAVARIAN_MUNICIPALITY_SOURCE_URL,
  DATE_HOLIDAYS_REGISTRY_URL,
  DATE_HOLIDAYS_REPOSITORY_URL,
  canonicalizeMunicipalities,
  inspectSources,
  loadSourceHealth,
  municipalityDataChanged
};
