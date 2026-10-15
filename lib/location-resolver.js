"use strict";

const bavarianMunicipalities = require("../data/DE-BY-municipalities.json");

const AUGSBURG_CITY_CODE = "09761000";

/**
 * Normalizes a place name for tolerant lookup while preserving the original
 * spelling in stored data and diagnostics. German umlauts, punctuation, case,
 * and administrative suffix separators do not affect matching.
 *
 * @param {string} value Place name to normalize.
 * @returns {string} Lowercase alphanumeric lookup key.
 */
function normalizeName(value) {
  // German letter replacements happen before Unicode mark removal so common
  // ASCII spellings such as Muenchen and official spellings such as München match.
  return value
    .trim()
    .toLocaleLowerCase("de-DE")
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .normalize("NFKD")
    .replace(/\p{Mark}/gu, "")
    .replace(/[^a-z0-9]/g, "");
}

/**
 * Resolves a Bavarian municipality to one of the regional rule identifiers
 * supplied by `date-holidays`. `A` selects Augsburg's additional Peace Festival,
 * `KATH` selects municipalities where Assumption Day is a holiday, and `EVANG`
 * selects the remaining municipalities. These identifiers are provider data;
 * the legal municipality classification itself comes from the official mapping.
 *
 * @param {string} municipality Configured municipality name.
 * @param {string|number|null} municipalityCode Optional official eight-digit code.
 * @returns {object} Matched municipality plus the provider's holiday region.
 * @throws {RangeError} If the municipality is unknown or the name is ambiguous.
 */
function resolveBavarianMunicipality(municipality, municipalityCode) {
  let matches;

  if (municipalityCode) {
    // An official code is unambiguous and therefore takes precedence over name.
    matches = bavarianMunicipalities.municipalities.filter(
      (entry) => entry.code === String(municipalityCode)
    );
  } else {
    const normalized = normalizeName(municipality);
    // The text before the first comma allows a natural place name to match an
    // official entry containing an administrative suffix such as “St” or “M”.
    matches = bavarianMunicipalities.municipalities.filter(
      (entry) =>
        normalizeName(entry.name) === normalized ||
        normalizeName(entry.name.split(",")[0]) === normalized
    );
  }

  // Returning no match as a hard resolver error lets the caller apply the user's
  // explicit warn/error/silent fallback policy in one place.
  if (matches.length === 0) {
    throw new RangeError(
      `Unknown Bavarian municipality: ${municipalityCode ?? municipality}`
    );
  }
  // If natural-name normalization is ambiguous, the official code is required;
  // guessing could select the wrong municipality-level holiday rule.
  if (matches.length > 1) {
    throw new RangeError(
      `Municipality "${municipality}" is ambiguous; add municipalityCode`
    );
  }

  const match = matches[0];
  // Augsburg has its own provider region because the Peace Festival is additional
  // to Assumption Day classification. Every other municipality needs only the
  // official majority classification stored in `assumptionDay`.
  return {
    ...match,
    holidayRegion:
      match.code === AUGSBURG_CITY_CODE
        ? "A"
        : match.assumptionDay
          ? "KATH"
          : "EVANG"
  };
}

/**
 * Applies the configured behavior when municipality-level precision is not
 * available. The returned state/country fallback always includes structured
 * diagnostics so the browser can decide whether to display a warning.
 *
 * @param {object} location Requested location configuration.
 * @param {string} policy One of `warn`, `error`, or `silent`.
 * @param {string} code Stable machine-readable diagnostic code.
 * @param {string} message Detailed diagnostic message.
 * @returns {object} Fallback resolution and diagnostics.
 * @throws {RangeError} When the selected policy is `error`.
 */
function fallbackLocation(location, policy, code, message) {
  // `error` is intended for installations where reduced geographic precision is
  // unacceptable and must stop calculation visibly.
  if (policy === "error") throw new RangeError(message);

  return {
    holidayRegion: null,
    coverage: location.state ? "state" : "country",
    status: "fallback",
    // Silent fallback suppresses display diagnostics but still reports fallback
    // status/coverage in the provider report for programmatic inspection.
    diagnostics:
      policy === "silent"
        ? []
        : [
            {
              level: "warning",
              code,
              location: { ...location },
              message
            }
          ]
  };
}

/**
 * Translates the module's geographic configuration into the region understood
 * by a holiday provider. V1 contains a dedicated municipality resolver for
 * Bavaria and otherwise reports the exact country/state coverage or an explicit
 * fallback; unsupported municipality precision is never silently claimed.
 *
 * @param {object} location Country, state, municipality, and optional code.
 * @param {object} [options={}] Provider region and fallback policy.
 * @returns {object} Provider region, coverage level, status, and diagnostics.
 */
function resolveHolidayLocation(location, options = {}) {
  const policy = options.onUnsupportedLocation ?? "warn";
  if (options.region) {
    // An explicit provider region is an advanced override and bypasses the local
    // municipality resolver exactly as documented.
    return {
      holidayRegion: options.region,
      coverage: "region",
      status: "exact",
      diagnostics: []
    };
  }

  if (
    location.country?.toUpperCase() === "DE" &&
    location.state?.toUpperCase() === "BY" &&
    location.municipality
  ) {
    try {
      // Bavaria is the only V1 municipality resolver. Its official mapping turns
      // a human place into the provider's precise regional rules.
      return {
        ...resolveBavarianMunicipality(
          location.municipality,
          location.municipalityCode
        ),
        coverage: "municipality",
        status: "exact",
        diagnostics: []
      };
    } catch (error) {
      // Unknown or ambiguous places are handled by the configured policy rather
      // than silently claiming municipality precision.
      return fallbackLocation(
        location,
        policy,
        "UNKNOWN_MUNICIPALITY",
        error.message
      );
    }
  }

  if (location.municipality) {
    // Other countries/states can still calculate at country/state level, but V1
    // makes the missing municipality adapter explicit.
    return fallbackLocation(
      location,
      policy,
      "MUNICIPALITY_NOT_SUPPORTED",
      `No municipality resolver is available for ${location.country}-${location.state ?? ""}`
    );
  }

  // Without a municipality request, country or state coverage is exact for the
  // configured precision and needs no diagnostic.
  return {
    holidayRegion: null,
    coverage: location.state ? "state" : "country",
    status: "exact",
    diagnostics: []
  };
}

module.exports = {
  normalizeName,
  resolveBavarianMunicipality,
  resolveHolidayLocation
};
