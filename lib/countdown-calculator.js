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
