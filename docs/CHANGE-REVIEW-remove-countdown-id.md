# Änderungsnachweis: Entfernung der Countdown-Option `id`

## Notwendigkeit

Die optionale Countdown-Eigenschaft `id` wurde weder für die Darstellung noch
für Berechnungen, Aktualisierungen oder die Zuordnung von Benachrichtigungen
verwendet. Da noch keine öffentliche Installation auf diese Eigenschaft
angewiesen ist, wird sie vollständig aus dem Countdown-Datenmodell entfernt.
Die internen Kennungen der Quellenprüfung sind davon nicht betroffen; sie
ordnen Wartungsmeldungen weiterhin ihrer jeweiligen Datenquelle zu.

## Datei `lib/config-validator.js` – Vorher

```js
"use strict";

const {
  normalizeCustomDaysOff,
  parseDateKey
} = require("./countdown-calculator");

const CALCULATION_TYPES = new Set([
  "calendarDays",
  "workdays",
  "weekday",
  "duration"
]);
const HOLIDAY_PROVIDERS = new Set(["date-holidays", "none"]);
const FALLBACK_POLICIES = new Set(["warn", "error", "silent"]);

/**
 * Validates an array of ISO weekday numbers. ISO weekday 1 is Monday and 7 is
 * Sunday. Duplicate entries are rejected because they usually indicate a
 * configuration mistake and never change a calculation result.
 *
 * @param {unknown} value Candidate array from the module configuration.
 * @param {string} fieldName Configuration path used in error messages.
 * @throws {TypeError|RangeError} If the value is empty, invalid, or duplicated.
 * @returns {void}
 */
function validateIsoWeekdays(value, fieldName) {
  // Empty arrays would make every workday calculation zero and are more likely
  // a configuration error than an intentional work schedule.
  if (!Array.isArray(value) || value.length === 0) {
    throw new TypeError(`${fieldName} must be a non-empty array`);
  }
  // ISO-8601 defines Monday as 1 and Sunday as 7; integers outside that range
  // cannot be interpreted consistently by the calculation layer.
  if (value.some((day) => !Number.isInteger(day) || day < 1 || day > 7)) {
    throw new RangeError(`${fieldName} must only contain ISO weekdays 1 through 7`);
  }
  // A set removes duplicates. Comparing its size detects repeated entries
  // without changing the original configured order.
  if (new Set(value).size !== value.length) {
    throw new RangeError(`${fieldName} must not contain duplicate weekdays`);
  }
}

/**
 * Verifies that a value is an IANA time-zone identifier understood by the
 * current Node.js runtime. The module uses this zone to determine the local
 * calendar date independently of the server's operating-system time zone.
 *
 * @param {unknown} timeZone Candidate IANA time-zone name.
 * @throws {TypeError|RangeError} If the name is missing or unsupported.
 * @returns {void}
 */
function validateTimeZone(timeZone) {
  // The explicit string requirement avoids environment-dependent coercion of
  // null, numbers, or empty values by Intl.DateTimeFormat.
  if (typeof timeZone !== "string" || !timeZone) {
    throw new TypeError("location.timeZone must be an IANA time-zone name");
  }
  try {
    // The JavaScript runtime maintains the IANA database. Constructing and using
    // a formatter is the authoritative local support check for that runtime.
    new Intl.DateTimeFormat("en", { timeZone }).format();
  } catch {
    throw new RangeError(`Unknown IANA time zone: ${timeZone}`);
  }
}

/**
 * Validates one string or object calculation definition for a countdown.
 * Type-specific settings are checked here so invalid rules fail before any
 * holiday data is loaded.
 *
 * @param {unknown} calculation Calculation configuration to inspect.
 * @param {string} countdownTitle Parent title for precise error messages.
 * @throws {RangeError} If the calculation type or weekday list is invalid.
 * @returns {void}
 */
function validateCalculation(calculation, countdownTitle) {
  // Short string notation and expanded object notation represent the same type.
  // Keeping both forms here matches the public configuration contract.
  const options = typeof calculation === "string" ? {} : calculation;
  const type = typeof calculation === "string" ? calculation : calculation?.type;
  if (!CALCULATION_TYPES.has(type)) {
    throw new RangeError(`Unknown calculation type in "${countdownTitle}": ${type}`);
  }
  // Only weekday calculations consume daysOfWeek. Other calculation types keep
  // their existing options untouched for calculation/display code.
  if (type === "weekday" && options.daysOfWeek !== undefined) {
    validateIsoWeekdays(options.daysOfWeek, `daysOfWeek in "${countdownTitle}"`);
  }
}

/**
 * Validates one countdown including its target, calculations, private days
 * off, and display mode. Date ranges are normalized as part of validation so
 * reversed or impossible ranges are rejected immediately.
 *
 * @param {unknown} countdown Countdown configuration to inspect.
 * @throws {TypeError|RangeError} If a required field or option is invalid.
 * @returns {void}
 */
function validateCountdown(countdown) {
  // Arrays technically are objects in JavaScript but cannot represent named
  // countdown properties, so they are rejected explicitly.
  if (!countdown || typeof countdown !== "object" || Array.isArray(countdown)) {
    throw new TypeError("Every countdown must be an object");
  }
  // A visible, non-whitespace title is required both for display and as the
  // default stable identifier when no explicit id is configured.
  if (typeof countdown.title !== "string" || !countdown.title.trim()) {
    throw new TypeError("Every countdown needs a non-empty title");
  }
  // Every target begins with a date key. Exact duration timestamps may append a
  // time and offset, but their calendar portion follows the same strict rules.
  if (typeof countdown.target !== "string") {
    throw new TypeError(`Countdown "${countdown.title}" needs a target`);
  }
  parseDateKey(countdown.target.slice(0, 10), `target of "${countdown.title}"`);
  // Date.parse is used only for the time-bearing form. Date-only calculations
  // remain in ordinal calendar arithmetic and do not depend on this parser.
  if (countdown.target.length > 10 && !Number.isFinite(Date.parse(countdown.target))) {
    throw new RangeError(`Target of "${countdown.title}" is not a valid timestamp`);
  }

  const calculations = countdown.calculations ?? ["calendarDays"];
  // At least one metric is necessary for a meaningful card value.
  if (!Array.isArray(calculations) || calculations.length === 0) {
    throw new TypeError(`calculations in "${countdown.title}" must be a non-empty array`);
  }
  calculations.forEach((calculation) =>
    validateCalculation(calculation, countdown.title)
  );

  // Per-countdown days off are optional; when present they use exactly the same
  // inclusive range format and validation as the global list.
  if (countdown.daysOff !== undefined && !Array.isArray(countdown.daysOff)) {
    throw new TypeError(`daysOff in "${countdown.title}" must be an array`);
  }
  normalizeCustomDaysOff(countdown.daysOff ?? []);

  // V1 deliberately supports only automatic compact presentation or explicit
  // separate rows; accepting unknown values would make CSS behavior accidental.
  if (![undefined, "auto", "separate"].includes(countdown.display)) {
    throw new RangeError(`display in "${countdown.title}" must be "auto" or "separate"`);
  }
}

/**
 * Validates source-health settings without requiring the optional online check
 * to be enabled. Numeric limits protect the module from accidental continuous
 * requests or indefinitely hanging source checks.
 *
 * @param {unknown} sourceHealth Source-health configuration to inspect.
 * @throws {TypeError|RangeError} If a setting has an unsafe type or value.
 * @returns {void}
 */
function validateSourceHealth(sourceHealth) {
  // MagicMirror merges the defaults before validation. A missing object here
  // therefore indicates a malformed effective configuration, not an omission.
  if (!sourceHealth || typeof sourceHealth !== "object" || Array.isArray(sourceHealth)) {
    throw new TypeError("sourceHealth must be an object");
  }
  // Each nested option is optional so a shallow MagicMirror configuration merge
  // still permits concise overrides such as `{ enabled: false }`.
  if (
    sourceHealth.enabled !== undefined &&
    typeof sourceHealth.enabled !== "boolean"
  ) {
    throw new TypeError("sourceHealth.enabled must be a boolean");
  }
  // One day is the lowest allowed interval to prevent a configuration typo from
  // repeatedly querying npm, GitHub, and the Bavarian authority.
  if (
    sourceHealth.checkInterval !== undefined &&
    (
      typeof sourceHealth.checkInterval !== "number" ||
      !Number.isFinite(sourceHealth.checkInterval) ||
      sourceHealth.checkInterval < 24 * 60 * 60 * 1000
    )
  ) {
    throw new RangeError("sourceHealth.checkInterval must be at least one day");
  }
  // One second is a practical lower bound that still allows deliberately short
  // tests while rejecting an immediate-abort configuration.
  if (
    sourceHealth.requestTimeout !== undefined &&
    (
      typeof sourceHealth.requestTimeout !== "number" ||
      !Number.isFinite(sourceHealth.requestTimeout) ||
      sourceHealth.requestTimeout < 1000
    )
  ) {
    throw new RangeError("sourceHealth.requestTimeout must be at least 1000 milliseconds");
  }
  // Thirty days is the minimum meaningful upstream inactivity threshold. A
  // shorter value would flag healthy projects between ordinary releases.
  if (
    sourceHealth.repositoryStaleAfterDays !== undefined &&
    (
      !Number.isInteger(sourceHealth.repositoryStaleAfterDays) ||
      sourceHealth.repositoryStaleAfterDays < 30
    )
  ) {
    throw new RangeError("sourceHealth.repositoryStaleAfterDays must be at least 30");
  }
  // Administrators may hide temporary network failures, but the choice must be
  // explicit boolean state so string values such as "false" cannot act as true.
  if (
    sourceHealth.showUnavailable !== undefined &&
    typeof sourceHealth.showUnavailable !== "boolean"
  ) {
    throw new TypeError("sourceHealth.showUnavailable must be a boolean");
  }
}

/**
 * Validates the complete effective MagicMirror configuration. MagicMirror has
 * already merged module defaults at this point, so required defaulted values
 * are expected to be present.
 *
 * @param {unknown} config Effective module configuration.
 * @returns {object} The validated configuration for convenient caller reuse.
 * @throws {TypeError|RangeError} If any supported V1 option is invalid.
 */
function validateConfig(config) {
  // The top-level object is the trust boundary for all data sent by the browser.
  if (!config || typeof config !== "object" || Array.isArray(config)) {
    throw new TypeError("config must be an object");
  }
  if (!config.location || typeof config.location !== "object") {
    throw new TypeError("config.location must be an object");
  }

  validateTimeZone(config.location.timeZone);
  // Country uses the two-letter ISO form expected by date-holidays. Case is
  // accepted here because the provider and resolver normalize it where needed.
  if (
    typeof config.location.country !== "string" ||
    !/^[A-Za-z]{2}$/.test(config.location.country)
  ) {
    throw new TypeError("location.country must be a two-letter ISO country code");
  }
  // Municipality is nullable because country/state precision is valid. When set,
  // only text can participate in the documented name resolver.
  if (
    config.location.municipality !== null &&
    config.location.municipality !== undefined &&
    typeof config.location.municipality !== "string"
  ) {
    throw new TypeError("location.municipality must be a string");
  }

  // Work-week and global range validation occurs before provider access, making
  // configuration problems independent of internet or holiday-library state.
  validateIsoWeekdays(config.workWeekdays, "workWeekdays");

  if (!Array.isArray(config.customDaysOff)) {
    throw new TypeError("customDaysOff must be an array");
  }
  normalizeCustomDaysOff(config.customDaysOff);

  // At least one explicit provider prevents a missing setting from being
  // mistaken for a verified empty holiday calendar.
  if (!Array.isArray(config.holidaySources) || config.holidaySources.length === 0) {
    throw new TypeError("holidaySources must contain at least one provider");
  }
  for (const source of config.holidaySources) {
    // Provider names form a closed V1 interface. Additional sources require an
    // adapter rather than silently accepting arbitrary remote data.
    if (!source || typeof source !== "object" || !HOLIDAY_PROVIDERS.has(source.provider)) {
      throw new RangeError(`Unknown holiday provider: ${source?.provider}`);
    }
    // Fallback policy controls whether missing municipality precision is visible,
    // fatal, or deliberately silent; unknown policies must never default by typo.
    if (
      source.onUnsupportedLocation !== undefined &&
      !FALLBACK_POLICIES.has(source.onUnsupportedLocation)
    ) {
      throw new RangeError(
        `Unknown onUnsupportedLocation policy: ${source.onUnsupportedLocation}`
      );
    }
  }

  // An empty countdown list would render a blank module and usually indicates a
  // misplaced configuration property.
  if (!Array.isArray(config.countdowns) || config.countdowns.length === 0) {
    throw new RangeError("config.countdowns must contain at least one countdown");
  }
  config.countdowns.forEach(validateCountdown);

  validateSourceHealth(config.sourceHealth);

  // Full recalculation is deliberately bounded to at least one second. Exact
  // duration display uses a separate browser timer and needs no shorter interval.
  if (
    typeof config.updateInterval !== "number" ||
    !Number.isFinite(config.updateInterval) ||
    config.updateInterval < 1000
  ) {
    throw new RangeError("updateInterval must be at least 1000 milliseconds");
  }

  const minimumColumnWidth = config.minimumColumnWidth;
  // Numeric values mean pixels in the browser; strings allow normal CSS units
  // such as px, rem, or %. CSS itself performs final syntax interpretation.
  if (
    !(
      (typeof minimumColumnWidth === "number" && minimumColumnWidth > 0) ||
      (typeof minimumColumnWidth === "string" && minimumColumnWidth.trim())
    )
  ) {
    throw new TypeError("minimumColumnWidth must be a positive number or CSS length");
  }

  return config;
}

module.exports = {
  validateConfig,
  validateCountdown,
  validateIsoWeekdays,
  validateSourceHealth,
  validateTimeZone
};
```

## Datei `lib/config-validator.js` – Nachher

```js
"use strict";

const {
  normalizeCustomDaysOff,
  parseDateKey
} = require("./countdown-calculator");

const CALCULATION_TYPES = new Set([
  "calendarDays",
  "workdays",
  "weekday",
  "duration"
]);
const HOLIDAY_PROVIDERS = new Set(["date-holidays", "none"]);
const FALLBACK_POLICIES = new Set(["warn", "error", "silent"]);

/**
 * Validates an array of ISO weekday numbers. ISO weekday 1 is Monday and 7 is
 * Sunday. Duplicate entries are rejected because they usually indicate a
 * configuration mistake and never change a calculation result.
 *
 * @param {unknown} value Candidate array from the module configuration.
 * @param {string} fieldName Configuration path used in error messages.
 * @throws {TypeError|RangeError} If the value is empty, invalid, or duplicated.
 * @returns {void}
 */
function validateIsoWeekdays(value, fieldName) {
  // Empty arrays would make every workday calculation zero and are more likely
  // a configuration error than an intentional work schedule.
  if (!Array.isArray(value) || value.length === 0) {
    throw new TypeError(`${fieldName} must be a non-empty array`);
  }
  // ISO-8601 defines Monday as 1 and Sunday as 7; integers outside that range
  // cannot be interpreted consistently by the calculation layer.
  if (value.some((day) => !Number.isInteger(day) || day < 1 || day > 7)) {
    throw new RangeError(`${fieldName} must only contain ISO weekdays 1 through 7`);
  }
  // A set removes duplicates. Comparing its size detects repeated entries
  // without changing the original configured order.
  if (new Set(value).size !== value.length) {
    throw new RangeError(`${fieldName} must not contain duplicate weekdays`);
  }
}

/**
 * Verifies that a value is an IANA time-zone identifier understood by the
 * current Node.js runtime. The module uses this zone to determine the local
 * calendar date independently of the server's operating-system time zone.
 *
 * @param {unknown} timeZone Candidate IANA time-zone name.
 * @throws {TypeError|RangeError} If the name is missing or unsupported.
 * @returns {void}
 */
function validateTimeZone(timeZone) {
  // The explicit string requirement avoids environment-dependent coercion of
  // null, numbers, or empty values by Intl.DateTimeFormat.
  if (typeof timeZone !== "string" || !timeZone) {
    throw new TypeError("location.timeZone must be an IANA time-zone name");
  }
  try {
    // The JavaScript runtime maintains the IANA database. Constructing and using
    // a formatter is the authoritative local support check for that runtime.
    new Intl.DateTimeFormat("en", { timeZone }).format();
  } catch {
    throw new RangeError(`Unknown IANA time zone: ${timeZone}`);
  }
}

/**
 * Validates one string or object calculation definition for a countdown.
 * Type-specific settings are checked here so invalid rules fail before any
 * holiday data is loaded.
 *
 * @param {unknown} calculation Calculation configuration to inspect.
 * @param {string} countdownTitle Parent title for precise error messages.
 * @throws {RangeError} If the calculation type or weekday list is invalid.
 * @returns {void}
 */
function validateCalculation(calculation, countdownTitle) {
  // Short string notation and expanded object notation represent the same type.
  // Keeping both forms here matches the public configuration contract.
  const options = typeof calculation === "string" ? {} : calculation;
  const type = typeof calculation === "string" ? calculation : calculation?.type;
  if (!CALCULATION_TYPES.has(type)) {
    throw new RangeError(`Unknown calculation type in "${countdownTitle}": ${type}`);
  }
  // Only weekday calculations consume daysOfWeek. Other calculation types keep
  // their existing options untouched for calculation/display code.
  if (type === "weekday" && options.daysOfWeek !== undefined) {
    validateIsoWeekdays(options.daysOfWeek, `daysOfWeek in "${countdownTitle}"`);
  }
}

/**
 * Validates one countdown including its target, calculations, private days
 * off, and display mode. Date ranges are normalized as part of validation so
 * reversed or impossible ranges are rejected immediately.
 *
 * @param {unknown} countdown Countdown configuration to inspect.
 * @throws {TypeError|RangeError} If a required field or option is invalid.
 * @returns {void}
 */
function validateCountdown(countdown) {
  // Arrays technically are objects in JavaScript but cannot represent named
  // countdown properties, so they are rejected explicitly.
  if (!countdown || typeof countdown !== "object" || Array.isArray(countdown)) {
    throw new TypeError("Every countdown must be an object");
  }
  // A visible, non-whitespace title is required because every rendered card
  // needs a meaningful heading and error messages use it for context.
  if (typeof countdown.title !== "string" || !countdown.title.trim()) {
    throw new TypeError("Every countdown needs a non-empty title");
  }
  // Every target begins with a date key. Exact duration timestamps may append a
  // time and offset, but their calendar portion follows the same strict rules.
  if (typeof countdown.target !== "string") {
    throw new TypeError(`Countdown "${countdown.title}" needs a target`);
  }
  parseDateKey(countdown.target.slice(0, 10), `target of "${countdown.title}"`);
  // Date.parse is used only for the time-bearing form. Date-only calculations
  // remain in ordinal calendar arithmetic and do not depend on this parser.
  if (countdown.target.length > 10 && !Number.isFinite(Date.parse(countdown.target))) {
    throw new RangeError(`Target of "${countdown.title}" is not a valid timestamp`);
  }

  const calculations = countdown.calculations ?? ["calendarDays"];
  // At least one metric is necessary for a meaningful card value.
  if (!Array.isArray(calculations) || calculations.length === 0) {
    throw new TypeError(`calculations in "${countdown.title}" must be a non-empty array`);
  }
  calculations.forEach((calculation) =>
    validateCalculation(calculation, countdown.title)
  );

  // Per-countdown days off are optional; when present they use exactly the same
  // inclusive range format and validation as the global list.
  if (countdown.daysOff !== undefined && !Array.isArray(countdown.daysOff)) {
    throw new TypeError(`daysOff in "${countdown.title}" must be an array`);
  }
  normalizeCustomDaysOff(countdown.daysOff ?? []);

  // V1 deliberately supports only automatic compact presentation or explicit
  // separate rows; accepting unknown values would make CSS behavior accidental.
  if (![undefined, "auto", "separate"].includes(countdown.display)) {
    throw new RangeError(`display in "${countdown.title}" must be "auto" or "separate"`);
  }
}

/**
 * Validates source-health settings without requiring the optional online check
 * to be enabled. Numeric limits protect the module from accidental continuous
 * requests or indefinitely hanging source checks.
 *
 * @param {unknown} sourceHealth Source-health configuration to inspect.
 * @throws {TypeError|RangeError} If a setting has an unsafe type or value.
 * @returns {void}
 */
function validateSourceHealth(sourceHealth) {
  // MagicMirror merges the defaults before validation. A missing object here
  // therefore indicates a malformed effective configuration, not an omission.
  if (!sourceHealth || typeof sourceHealth !== "object" || Array.isArray(sourceHealth)) {
    throw new TypeError("sourceHealth must be an object");
  }
  // Each nested option is optional so a shallow MagicMirror configuration merge
  // still permits concise overrides such as `{ enabled: false }`.
  if (
    sourceHealth.enabled !== undefined &&
    typeof sourceHealth.enabled !== "boolean"
  ) {
    throw new TypeError("sourceHealth.enabled must be a boolean");
  }
  // One day is the lowest allowed interval to prevent a configuration typo from
  // repeatedly querying npm, GitHub, and the Bavarian authority.
  if (
    sourceHealth.checkInterval !== undefined &&
    (
      typeof sourceHealth.checkInterval !== "number" ||
      !Number.isFinite(sourceHealth.checkInterval) ||
      sourceHealth.checkInterval < 24 * 60 * 60 * 1000
    )
  ) {
    throw new RangeError("sourceHealth.checkInterval must be at least one day");
  }
  // One second is a practical lower bound that still allows deliberately short
  // tests while rejecting an immediate-abort configuration.
  if (
    sourceHealth.requestTimeout !== undefined &&
    (
      typeof sourceHealth.requestTimeout !== "number" ||
      !Number.isFinite(sourceHealth.requestTimeout) ||
      sourceHealth.requestTimeout < 1000
    )
  ) {
    throw new RangeError("sourceHealth.requestTimeout must be at least 1000 milliseconds");
  }
  // Thirty days is the minimum meaningful upstream inactivity threshold. A
  // shorter value would flag healthy projects between ordinary releases.
  if (
    sourceHealth.repositoryStaleAfterDays !== undefined &&
    (
      !Number.isInteger(sourceHealth.repositoryStaleAfterDays) ||
      sourceHealth.repositoryStaleAfterDays < 30
    )
  ) {
    throw new RangeError("sourceHealth.repositoryStaleAfterDays must be at least 30");
  }
  // Administrators may hide temporary network failures, but the choice must be
  // explicit boolean state so string values such as "false" cannot act as true.
  if (
    sourceHealth.showUnavailable !== undefined &&
    typeof sourceHealth.showUnavailable !== "boolean"
  ) {
    throw new TypeError("sourceHealth.showUnavailable must be a boolean");
  }
}

/**
 * Validates the complete effective MagicMirror configuration. MagicMirror has
 * already merged module defaults at this point, so required defaulted values
 * are expected to be present.
 *
 * @param {unknown} config Effective module configuration.
 * @returns {object} The validated configuration for convenient caller reuse.
 * @throws {TypeError|RangeError} If any supported V1 option is invalid.
 */
function validateConfig(config) {
  // The top-level object is the trust boundary for all data sent by the browser.
  if (!config || typeof config !== "object" || Array.isArray(config)) {
    throw new TypeError("config must be an object");
  }
  if (!config.location || typeof config.location !== "object") {
    throw new TypeError("config.location must be an object");
  }

  validateTimeZone(config.location.timeZone);
  // Country uses the two-letter ISO form expected by date-holidays. Case is
  // accepted here because the provider and resolver normalize it where needed.
  if (
    typeof config.location.country !== "string" ||
    !/^[A-Za-z]{2}$/.test(config.location.country)
  ) {
    throw new TypeError("location.country must be a two-letter ISO country code");
  }
  // Municipality is nullable because country/state precision is valid. When set,
  // only text can participate in the documented name resolver.
  if (
    config.location.municipality !== null &&
    config.location.municipality !== undefined &&
    typeof config.location.municipality !== "string"
  ) {
    throw new TypeError("location.municipality must be a string");
  }

  // Work-week and global range validation occurs before provider access, making
  // configuration problems independent of internet or holiday-library state.
  validateIsoWeekdays(config.workWeekdays, "workWeekdays");

  if (!Array.isArray(config.customDaysOff)) {
    throw new TypeError("customDaysOff must be an array");
  }
  normalizeCustomDaysOff(config.customDaysOff);

  // At least one explicit provider prevents a missing setting from being
  // mistaken for a verified empty holiday calendar.
  if (!Array.isArray(config.holidaySources) || config.holidaySources.length === 0) {
    throw new TypeError("holidaySources must contain at least one provider");
  }
  for (const source of config.holidaySources) {
    // Provider names form a closed V1 interface. Additional sources require an
    // adapter rather than silently accepting arbitrary remote data.
    if (!source || typeof source !== "object" || !HOLIDAY_PROVIDERS.has(source.provider)) {
      throw new RangeError(`Unknown holiday provider: ${source?.provider}`);
    }
    // Fallback policy controls whether missing municipality precision is visible,
    // fatal, or deliberately silent; unknown policies must never default by typo.
    if (
      source.onUnsupportedLocation !== undefined &&
      !FALLBACK_POLICIES.has(source.onUnsupportedLocation)
    ) {
      throw new RangeError(
        `Unknown onUnsupportedLocation policy: ${source.onUnsupportedLocation}`
      );
    }
  }

  // An empty countdown list would render a blank module and usually indicates a
  // misplaced configuration property.
  if (!Array.isArray(config.countdowns) || config.countdowns.length === 0) {
    throw new RangeError("config.countdowns must contain at least one countdown");
  }
  config.countdowns.forEach(validateCountdown);

  validateSourceHealth(config.sourceHealth);

  // Full recalculation is deliberately bounded to at least one second. Exact
  // duration display uses a separate browser timer and needs no shorter interval.
  if (
    typeof config.updateInterval !== "number" ||
    !Number.isFinite(config.updateInterval) ||
    config.updateInterval < 1000
  ) {
    throw new RangeError("updateInterval must be at least 1000 milliseconds");
  }

  const minimumColumnWidth = config.minimumColumnWidth;
  // Numeric values mean pixels in the browser; strings allow normal CSS units
  // such as px, rem, or %. CSS itself performs final syntax interpretation.
  if (
    !(
      (typeof minimumColumnWidth === "number" && minimumColumnWidth > 0) ||
      (typeof minimumColumnWidth === "string" && minimumColumnWidth.trim())
    )
  ) {
    throw new TypeError("minimumColumnWidth must be a positive number or CSS length");
  }

  return config;
}

module.exports = {
  validateConfig,
  validateCountdown,
  validateIsoWeekdays,
  validateSourceHealth,
  validateTimeZone
};
```

## Datei `lib/countdown-calculator.js` – Vorher

```js
"use strict";

const DAY_IN_MS = 24 * 60 * 60 * 1000;
const DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

/**
 * Parses and validates an ISO calendar-date key without applying a time zone.
 * Constructing the date in UTC detects impossible values such as February 30
 * while keeping date-only calculations independent of daylight-saving changes.
 *
 * @param {unknown} value Candidate date in `YYYY-MM-DD` form.
 * @param {string} [fieldName="date"] Name used in validation errors.
 * @returns {{year: number, month: number, day: number}} Numeric date parts.
 * @throws {TypeError|RangeError} If the value is malformed or impossible.
 */
function parseDateKey(value, fieldName = "date") {
  // A strict pattern avoids JavaScript's implementation-dependent parsing of
  // incomplete or localized date strings.
  if (typeof value !== "string" || !DATE_PATTERN.test(value)) {
    throw new TypeError(`${fieldName} must use YYYY-MM-DD format`);
  }

  // Numeric conversion is explicit because the captured groups are strings.
  const [, yearText, monthText, dayText] = value.match(DATE_PATTERN);
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  const date = new Date(Date.UTC(year, month - 1, day));

  // Date.UTC normalizes impossible values (for example February 30 into March).
  // Comparing every part detects that normalization and rejects the input.
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    throw new RangeError(`${fieldName} is not a valid calendar date`);
  }

  return { year, month, day };
}

/**
 * Converts a validated date key to an integer day index relative to the Unix
 * epoch. Ordinals make calendar-day arithmetic safe across DST transitions.
 *
 * @param {string} dateKey Date in `YYYY-MM-DD` form.
 * @returns {number} Whole-day UTC ordinal.
 */
function dateKeyToOrdinal(dateKey) {
  const { year, month, day } = parseDateKey(dateKey);
  // UTC milliseconds are divided by a fixed 24-hour day only after the date has
  // been reduced to midnight UTC, where DST does not affect the interval.
  return Math.floor(Date.UTC(year, month - 1, day) / DAY_IN_MS);
}

/**
 * Converts a whole-day UTC ordinal back to an ISO calendar-date key.
 *
 * @param {number} ordinal Whole-day index relative to the Unix epoch.
 * @returns {string} Date in `YYYY-MM-DD` form.
 */
function ordinalToDateKey(ordinal) {
  return new Date(ordinal * DAY_IN_MS).toISOString().slice(0, 10);
}

/**
 * Returns the ISO weekday for a date key, where Monday is 1 and Sunday is 7.
 *
 * @param {string} dateKey Date in `YYYY-MM-DD` form.
 * @returns {number} ISO weekday from 1 through 7.
 */
function isoWeekday(dateKey) {
  const weekday = new Date(dateKeyToOrdinal(dateKey) * DAY_IN_MS).getUTCDay();
  // JavaScript uses Sunday=0; ISO uses Sunday=7 and keeps Monday through Saturday.
  return weekday === 0 ? 7 : weekday;
}

/**
 * Determines the calendar date seen in a configured IANA time zone. This is
 * used instead of the Raspberry Pi's local setting so the countdown follows
 * the explicitly configured location.
 *
 * @param {Date} date Instant to format.
 * @param {string} timeZone IANA time-zone identifier.
 * @returns {string} Local date in `YYYY-MM-DD` form.
 */
function dateKeyInTimeZone(date, timeZone) {
  // `en-CA` requests year-month-day ordering, while formatToParts prevents the
  // code from depending on separators or locale-specific presentation details.
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  });
  const parts = Object.fromEntries(
    formatter
      .formatToParts(date)
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, part.value])
  );
  // All requested fields are two/four digit text, producing the module's date key.
  return `${parts.year}-${parts.month}-${parts.day}`;
}

/**
 * Expands individual dates and inclusive date ranges into a de-duplicated set.
 * Both endpoints are included. Weekend or holiday filtering happens later,
 * which means ranges retain their literal calendar meaning here.
 *
 * @param {Array<string|{start: string, end?: string}>} [entries=[]] Days off.
 * @returns {Set<string>} Unique date keys covered by all entries.
 * @throws {TypeError|RangeError} If an entry or range is invalid.
 */
function normalizeCustomDaysOff(entries = []) {
  // Sets provide the required duplicate protection across overlapping ranges.
  const result = new Set();

  for (const entry of entries) {
    // A string is the compact representation of exactly one whole day off.
    if (typeof entry === "string") {
      parseDateKey(entry, "customDaysOff entry");
      result.add(entry);
      continue;
    }

    // Range objects require a start. An omitted end intentionally means a
    // one-day range, matching the string form.
    if (!entry || typeof entry !== "object") {
      throw new TypeError("customDaysOff entries must be dates or date ranges");
    }

    const start = dateKeyToOrdinal(entry.start);
    const end = dateKeyToOrdinal(entry.end ?? entry.start);
    // Reversed ranges are almost always typos and have no useful inclusive meaning.
    if (end < start) {
      throw new RangeError("customDaysOff range end must not precede start");
    }

    // `<= end` is the deliberate inclusive-end rule documented for daysOff.
    for (let ordinal = start; ordinal <= end; ordinal += 1) {
      result.add(ordinalToDateKey(ordinal));
    }
  }

  return result;
}

/**
 * Counts dates matching a predicate in a half-open interval `[start, target)`.
 * A target before the start produces a negative count using the same rule in
 * reverse; expired countdown display is handled separately by the caller.
 *
 * @param {string} startDate Included start date.
 * @param {string} targetDate Excluded target date.
 * @param {(dateKey: string) => boolean} predicate Rule selecting counted days.
 * @returns {number} Signed number of matching dates.
 */
function countMatchingDays(startDate, targetDate, predicate) {
  const start = dateKeyToOrdinal(startDate);
  const target = dateKeyToOrdinal(targetDate);
  // Equal dates describe an empty half-open interval and therefore count zero.
  if (start === target) return 0;

  let count = 0;
  if (target > start) {
    // Start is included and target is excluded. This is the normal countdown path.
    for (let ordinal = start; ordinal < target; ordinal += 1) {
      if (predicate(ordinalToDateKey(ordinal))) count += 1;
    }
  } else {
    // The reverse path preserves mathematically useful signed results for the
    // calculation API; the display replaces expired countdowns with a dash.
    for (let ordinal = target; ordinal < start; ordinal += 1) {
      if (predicate(ordinalToDateKey(ordinal))) count -= 1;
    }
  }
  return count;
}

/**
 * Evaluates one configured calculation against a prepared countdown context.
 * Calendar days use ordinal subtraction; workdays additionally exclude public
 * holidays and merged personal days off; weekday counts can opt into the same
 * exclusions; duration returns milliseconds to an exact instant.
 *
 * @param {string|object} metric Calculation name or calculation options object.
 * @param {object} context Prepared date, holiday, and work-week information.
 * @returns {number} Numeric result in days or milliseconds, depending on type.
 * @throws {RangeError} If the calculation type is unknown.
 */
function calculateMetric(metric, context) {
  // Each calculation accepts concise string or expanded object notation.
  const type = typeof metric === "string" ? metric : metric.type;
  const options = typeof metric === "string" ? {} : metric;
  const { today, targetDate, holidays, customDaysOff, workWeekdays } = context;

  switch (type) {
    case "calendarDays":
      // Ordinal subtraction exactly implements `[today, target)`.
      return dateKeyToOrdinal(targetDate) - dateKeyToOrdinal(today);

    case "workdays":
      return countMatchingDays(today, targetDate, (dateKey) => {
        // A date must satisfy all three independent conditions. Set lookup also
        // ensures an overlapping holiday/day-off can never be subtracted twice.
        return (
          workWeekdays.has(isoWeekday(dateKey)) &&
          !holidays.has(dateKey) &&
          !customDaysOff.has(dateKey)
        );
      });

    case "weekday": {
      // Monday is the useful default for requests such as “number of Mondays”.
      const daysOfWeek = new Set(options.daysOfWeek ?? [1]);
      return countMatchingDays(today, targetDate, (dateKey) => {
        // Holiday and personal-day exclusions are opt-in for weekday counts;
        // ordinary weekday occurrence counting remains independent by default.
        if (!daysOfWeek.has(isoWeekday(dateKey))) return false;
        if (options.excludeHolidays && holidays.has(dateKey)) return false;
        if (options.excludeCustomDaysOff && customDaysOff.has(dateKey)) return false;
        return true;
      });
    }

    case "duration":
      // Exact duration stays in milliseconds until the browser formats it. This
      // lets the visible clock update without another server calculation.
      return context.targetEpoch - context.nowEpoch;

    default:
      throw new RangeError(`Unknown calculation type: ${type}`);
  }
}

/**
 * Calculates every metric for one countdown and prepares a serializable result
 * for the MagicMirror browser. Global and countdown-specific days off are
 * merged into a set, so overlapping entries can never subtract a day twice.
 *
 * @param {object} countdown Validated countdown configuration.
 * @param {object} context Shared calculation context prepared by the node helper.
 * @returns {object} Display-ready countdown result.
 * @throws {TypeError|RangeError} If called with invalid standalone input.
 */
function calculateCountdown(countdown, context) {
  // These guards also protect direct library use outside the full config validator.
  if (!countdown || typeof countdown !== "object") {
    throw new TypeError("Every countdown must be an object");
  }
  if (!countdown.title || typeof countdown.title !== "string") {
    throw new TypeError("Every countdown needs a title");
  }
  if (!countdown.target || typeof countdown.target !== "string") {
    throw new TypeError(`Countdown "${countdown.title}" needs a target`);
  }

  // The date portion drives all whole-day metrics, including timestamp targets.
  const targetDate = countdown.target.slice(0, 10);
  parseDateKey(targetDate, `target of "${countdown.title}"`);
  const targetEpoch = new Date(
    DATE_PATTERN.test(countdown.target)
      ? `${countdown.target}T00:00:00`
      : countdown.target
  ).getTime();
  // An impossible timestamp yields NaN; returning it would break duration output.
  if (!Number.isFinite(targetEpoch)) {
    throw new RangeError(`Target of "${countdown.title}" is invalid`);
  }

  // Set construction merges global and local days off without duplicates and
  // without mutating the shared global set used by other countdowns.
  const countdownDaysOff = normalizeCustomDaysOff(countdown.daysOff ?? []);
  const calculationContext = {
    ...context,
    targetDate,
    targetEpoch,
    customDaysOff: new Set([...context.customDaysOff, ...countdownDaysOff])
  };
  const calculations = countdown.calculations ?? ["calendarDays"];

  // The serialized result retains display options needed by the browser but no
  // provider objects, Set instances, or executable predicates.
  return {
    id: countdown.id ?? countdown.title,
    title: countdown.title,
    target: countdown.target,
    targetEpoch,
    expired: dateKeyToOrdinal(targetDate) < dateKeyToOrdinal(context.today),
    display: countdown.display ?? "auto",
    calculations: calculations.map((calculation) => {
      const options = typeof calculation === "string" ? {} : calculation;
      return {
        type: typeof calculation === "string" ? calculation : calculation.type,
        label: options.label,
        showSeconds: options.showSeconds ?? true,
        daysOfWeek: options.daysOfWeek,
        value: calculateMetric(calculation, calculationContext)
      };
    })
  };
}

module.exports = {
  calculateCountdown,
  calculateMetric,
  countMatchingDays,
  dateKeyInTimeZone,
  dateKeyToOrdinal,
  isoWeekday,
  normalizeCustomDaysOff,
  ordinalToDateKey,
  parseDateKey
};
```

## Datei `lib/countdown-calculator.js` – Nachher

```js
"use strict";

const DAY_IN_MS = 24 * 60 * 60 * 1000;
const DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

/**
 * Parses and validates an ISO calendar-date key without applying a time zone.
 * Constructing the date in UTC detects impossible values such as February 30
 * while keeping date-only calculations independent of daylight-saving changes.
 *
 * @param {unknown} value Candidate date in `YYYY-MM-DD` form.
 * @param {string} [fieldName="date"] Name used in validation errors.
 * @returns {{year: number, month: number, day: number}} Numeric date parts.
 * @throws {TypeError|RangeError} If the value is malformed or impossible.
 */
function parseDateKey(value, fieldName = "date") {
  // A strict pattern avoids JavaScript's implementation-dependent parsing of
  // incomplete or localized date strings.
  if (typeof value !== "string" || !DATE_PATTERN.test(value)) {
    throw new TypeError(`${fieldName} must use YYYY-MM-DD format`);
  }

  // Numeric conversion is explicit because the captured groups are strings.
  const [, yearText, monthText, dayText] = value.match(DATE_PATTERN);
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  const date = new Date(Date.UTC(year, month - 1, day));

  // Date.UTC normalizes impossible values (for example February 30 into March).
  // Comparing every part detects that normalization and rejects the input.
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    throw new RangeError(`${fieldName} is not a valid calendar date`);
  }

  return { year, month, day };
}

/**
 * Converts a validated date key to an integer day index relative to the Unix
 * epoch. Ordinals make calendar-day arithmetic safe across DST transitions.
 *
 * @param {string} dateKey Date in `YYYY-MM-DD` form.
 * @returns {number} Whole-day UTC ordinal.
 */
function dateKeyToOrdinal(dateKey) {
  const { year, month, day } = parseDateKey(dateKey);
  // UTC milliseconds are divided by a fixed 24-hour day only after the date has
  // been reduced to midnight UTC, where DST does not affect the interval.
  return Math.floor(Date.UTC(year, month - 1, day) / DAY_IN_MS);
}

/**
 * Converts a whole-day UTC ordinal back to an ISO calendar-date key.
 *
 * @param {number} ordinal Whole-day index relative to the Unix epoch.
 * @returns {string} Date in `YYYY-MM-DD` form.
 */
function ordinalToDateKey(ordinal) {
  return new Date(ordinal * DAY_IN_MS).toISOString().slice(0, 10);
}

/**
 * Returns the ISO weekday for a date key, where Monday is 1 and Sunday is 7.
 *
 * @param {string} dateKey Date in `YYYY-MM-DD` form.
 * @returns {number} ISO weekday from 1 through 7.
 */
function isoWeekday(dateKey) {
  const weekday = new Date(dateKeyToOrdinal(dateKey) * DAY_IN_MS).getUTCDay();
  // JavaScript uses Sunday=0; ISO uses Sunday=7 and keeps Monday through Saturday.
  return weekday === 0 ? 7 : weekday;
}

/**
 * Determines the calendar date seen in a configured IANA time zone. This is
 * used instead of the Raspberry Pi's local setting so the countdown follows
 * the explicitly configured location.
 *
 * @param {Date} date Instant to format.
 * @param {string} timeZone IANA time-zone identifier.
 * @returns {string} Local date in `YYYY-MM-DD` form.
 */
function dateKeyInTimeZone(date, timeZone) {
  // `en-CA` requests year-month-day ordering, while formatToParts prevents the
  // code from depending on separators or locale-specific presentation details.
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  });
  const parts = Object.fromEntries(
    formatter
      .formatToParts(date)
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, part.value])
  );
  // All requested fields are two/four digit text, producing the module's date key.
  return `${parts.year}-${parts.month}-${parts.day}`;
}

/**
 * Expands individual dates and inclusive date ranges into a de-duplicated set.
 * Both endpoints are included. Weekend or holiday filtering happens later,
 * which means ranges retain their literal calendar meaning here.
 *
 * @param {Array<string|{start: string, end?: string}>} [entries=[]] Days off.
 * @returns {Set<string>} Unique date keys covered by all entries.
 * @throws {TypeError|RangeError} If an entry or range is invalid.
 */
function normalizeCustomDaysOff(entries = []) {
  // Sets provide the required duplicate protection across overlapping ranges.
  const result = new Set();

  for (const entry of entries) {
    // A string is the compact representation of exactly one whole day off.
    if (typeof entry === "string") {
      parseDateKey(entry, "customDaysOff entry");
      result.add(entry);
      continue;
    }

    // Range objects require a start. An omitted end intentionally means a
    // one-day range, matching the string form.
    if (!entry || typeof entry !== "object") {
      throw new TypeError("customDaysOff entries must be dates or date ranges");
    }

    const start = dateKeyToOrdinal(entry.start);
    const end = dateKeyToOrdinal(entry.end ?? entry.start);
    // Reversed ranges are almost always typos and have no useful inclusive meaning.
    if (end < start) {
      throw new RangeError("customDaysOff range end must not precede start");
    }

    // `<= end` is the deliberate inclusive-end rule documented for daysOff.
    for (let ordinal = start; ordinal <= end; ordinal += 1) {
      result.add(ordinalToDateKey(ordinal));
    }
  }

  return result;
}

/**
 * Counts dates matching a predicate in a half-open interval `[start, target)`.
 * A target before the start produces a negative count using the same rule in
 * reverse; expired countdown display is handled separately by the caller.
 *
 * @param {string} startDate Included start date.
 * @param {string} targetDate Excluded target date.
 * @param {(dateKey: string) => boolean} predicate Rule selecting counted days.
 * @returns {number} Signed number of matching dates.
 */
function countMatchingDays(startDate, targetDate, predicate) {
  const start = dateKeyToOrdinal(startDate);
  const target = dateKeyToOrdinal(targetDate);
  // Equal dates describe an empty half-open interval and therefore count zero.
  if (start === target) return 0;

  let count = 0;
  if (target > start) {
    // Start is included and target is excluded. This is the normal countdown path.
    for (let ordinal = start; ordinal < target; ordinal += 1) {
      if (predicate(ordinalToDateKey(ordinal))) count += 1;
    }
  } else {
    // The reverse path preserves mathematically useful signed results for the
    // calculation API; the display replaces expired countdowns with a dash.
    for (let ordinal = target; ordinal < start; ordinal += 1) {
      if (predicate(ordinalToDateKey(ordinal))) count -= 1;
    }
  }
  return count;
}

/**
 * Evaluates one configured calculation against a prepared countdown context.
 * Calendar days use ordinal subtraction; workdays additionally exclude public
 * holidays and merged personal days off; weekday counts can opt into the same
 * exclusions; duration returns milliseconds to an exact instant.
 *
 * @param {string|object} metric Calculation name or calculation options object.
 * @param {object} context Prepared date, holiday, and work-week information.
 * @returns {number} Numeric result in days or milliseconds, depending on type.
 * @throws {RangeError} If the calculation type is unknown.
 */
function calculateMetric(metric, context) {
  // Each calculation accepts concise string or expanded object notation.
  const type = typeof metric === "string" ? metric : metric.type;
  const options = typeof metric === "string" ? {} : metric;
  const { today, targetDate, holidays, customDaysOff, workWeekdays } = context;

  switch (type) {
    case "calendarDays":
      // Ordinal subtraction exactly implements `[today, target)`.
      return dateKeyToOrdinal(targetDate) - dateKeyToOrdinal(today);

    case "workdays":
      return countMatchingDays(today, targetDate, (dateKey) => {
        // A date must satisfy all three independent conditions. Set lookup also
        // ensures an overlapping holiday/day-off can never be subtracted twice.
        return (
          workWeekdays.has(isoWeekday(dateKey)) &&
          !holidays.has(dateKey) &&
          !customDaysOff.has(dateKey)
        );
      });

    case "weekday": {
      // Monday is the useful default for requests such as “number of Mondays”.
      const daysOfWeek = new Set(options.daysOfWeek ?? [1]);
      return countMatchingDays(today, targetDate, (dateKey) => {
        // Holiday and personal-day exclusions are opt-in for weekday counts;
        // ordinary weekday occurrence counting remains independent by default.
        if (!daysOfWeek.has(isoWeekday(dateKey))) return false;
        if (options.excludeHolidays && holidays.has(dateKey)) return false;
        if (options.excludeCustomDaysOff && customDaysOff.has(dateKey)) return false;
        return true;
      });
    }

    case "duration":
      // Exact duration stays in milliseconds until the browser formats it. This
      // lets the visible clock update without another server calculation.
      return context.targetEpoch - context.nowEpoch;

    default:
      throw new RangeError(`Unknown calculation type: ${type}`);
  }
}

/**
 * Calculates every metric for one countdown and prepares a serializable result
 * for the MagicMirror browser. Global and countdown-specific days off are
 * merged into a set, so overlapping entries can never subtract a day twice.
 *
 * @param {object} countdown Validated countdown configuration.
 * @param {object} context Shared calculation context prepared by the node helper.
 * @returns {object} Display-ready countdown result.
 * @throws {TypeError|RangeError} If called with invalid standalone input.
 */
function calculateCountdown(countdown, context) {
  // These guards also protect direct library use outside the full config validator.
  if (!countdown || typeof countdown !== "object") {
    throw new TypeError("Every countdown must be an object");
  }
  if (!countdown.title || typeof countdown.title !== "string") {
    throw new TypeError("Every countdown needs a title");
  }
  if (!countdown.target || typeof countdown.target !== "string") {
    throw new TypeError(`Countdown "${countdown.title}" needs a target`);
  }

  // The date portion drives all whole-day metrics, including timestamp targets.
  const targetDate = countdown.target.slice(0, 10);
  parseDateKey(targetDate, `target of "${countdown.title}"`);
  const targetEpoch = new Date(
    DATE_PATTERN.test(countdown.target)
      ? `${countdown.target}T00:00:00`
      : countdown.target
  ).getTime();
  // An impossible timestamp yields NaN; returning it would break duration output.
  if (!Number.isFinite(targetEpoch)) {
    throw new RangeError(`Target of "${countdown.title}" is invalid`);
  }

  // Set construction merges global and local days off without duplicates and
  // without mutating the shared global set used by other countdowns.
  const countdownDaysOff = normalizeCustomDaysOff(countdown.daysOff ?? []);
  const calculationContext = {
    ...context,
    targetDate,
    targetEpoch,
    customDaysOff: new Set([...context.customDaysOff, ...countdownDaysOff])
  };
  const calculations = countdown.calculations ?? ["calendarDays"];

  // The serialized result retains display options needed by the browser but no
  // provider objects, Set instances, or executable predicates.
  return {
    title: countdown.title,
    target: countdown.target,
    targetEpoch,
    expired: dateKeyToOrdinal(targetDate) < dateKeyToOrdinal(context.today),
    display: countdown.display ?? "auto",
    calculations: calculations.map((calculation) => {
      const options = typeof calculation === "string" ? {} : calculation;
      return {
        type: typeof calculation === "string" ? calculation : calculation.type,
        label: options.label,
        showSeconds: options.showSeconds ?? true,
        daysOfWeek: options.daysOfWeek,
        value: calculateMetric(calculation, calculationContext)
      };
    })
  };
}

module.exports = {
  calculateCountdown,
  calculateMetric,
  countMatchingDays,
  dateKeyInTimeZone,
  dateKeyToOrdinal,
  isoWeekday,
  normalizeCustomDaysOff,
  ordinalToDateKey,
  parseDateKey
};
```

## Tatsächlich vorgenommene Änderungen

- Der berechnete Countdown-Rückgabewert enthält keine ungenutzte Eigenschaft
  `id` mehr.
- Der Kommentar zur Pflichtangabe `title` beschreibt jetzt nur noch deren
  tatsächliche Aufgaben: sichtbare Überschrift und Kontext für Fehlermeldungen.
- Berechnungsregeln, Eingabeprüfung, Feiertagsquellen, Zeiträume, Anzeige und
  interne Quellenkennungen blieben unverändert.
