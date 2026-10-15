"use strict";

const Holidays = require("date-holidays");
const { resolveHolidayLocation } = require("./location-resolver");

/**
 * Builds the inclusive list of calendar years required by all countdowns. A
 * provider is queried once per year, even when several countdowns share it.
 *
 * @param {string} startDate Current local date in `YYYY-MM-DD` form.
 * @param {string[]} targetDates Countdown target dates.
 * @returns {number[]} Consecutive years from the earliest to the latest date.
 */
function yearsInRange(startDate, targetDates) {
  // Only the four-digit date prefix is needed after configuration validation.
  const years = targetDates.map((date) => Number(date.slice(0, 4)));
  // Including today's year covers short countdowns and targets in earlier years.
  years.push(Number(startDate.slice(0, 4)));
  const minimum = Math.min(...years);
  const maximum = Math.max(...years);
  // Consecutive years are necessary because a provider returns one year at a time.
  return Array.from({ length: maximum - minimum + 1 }, (_, index) => minimum + index);
}

/**
 * Loads public-holiday dates from the locally installed `date-holidays`
 * package. The resolved country/state/region combination is initialized once,
 * and all returned provider timestamps are reduced to local date keys.
 *
 * @param {object} source Provider-specific configuration.
 * @param {object} settings Complete module configuration.
 * @param {number[]} years Years needed by the active countdowns.
 * @returns {{dates: Set<string>, report: object}} Dates plus coverage metadata.
 * @throws {RangeError} If the requested country/state is unsupported.
 */
function loadDateHolidays(source, settings, years) {
  // Resolution is separate from provider loading so geographic fallbacks remain
  // testable and can later be reused by another provider adapter.
  const resolution = resolveHolidayLocation(settings.location, source);
  const provider = new Holidays();
  const options = {
    languages: [settings.language],
    timezone: settings.location.timeZone,
    types: source.types ?? ["public"]
  };

  let initialized;
  if (resolution.holidayRegion) {
    // Municipality-aware or explicitly configured regions are the most precise
    // form accepted by date-holidays and therefore take precedence.
    initialized = provider.init(
      settings.location.country,
      settings.location.state,
      resolution.holidayRegion,
      options
    );
  } else if (settings.location.state) {
    // State-level initialization is used when no finer region is resolved.
    initialized = provider.init(
      settings.location.country,
      settings.location.state,
      options
    );
  } else {
    // Countries without a configured subdivision use country-level holidays.
    initialized = provider.init(settings.location.country, options);
  }

  // date-holidays returns false for unsupported combinations. Failing here avoids
  // presenting an empty set as if the location simply had no public holidays.
  if (initialized === false) {
    throw new RangeError(
      `date-holidays does not support country/state ${settings.location.country}-${settings.location.state ?? ""}`
    );
  }

  // A set unifies holiday occurrences across years and removes any provider-side
  // duplicate entries that share the same local calendar date.
  const dates = new Set();
  for (const year of years) {
    for (const holiday of provider.getHolidays(year, settings.language)) {
      // Provider timestamps begin with an ISO date; time/offset details are not
      // relevant because this module subtracts whole local calendar days.
      if (typeof holiday.date === "string") dates.add(holiday.date.slice(0, 10));
    }
  }

  return {
    dates,
    report: {
      provider: "date-holidays",
      ...resolution
    }
  };
}

/**
 * Invokes every configured holiday provider and combines their dates as a set.
 * This set-based provider contract is the extension point for future adapters:
 * each source returns ISO date keys and a diagnostic report, while countdown
 * arithmetic stays independent of the provider's original format.
 *
 * @param {object} config Complete validated module configuration.
 * @param {string} today Current local date.
 * @param {string[]} targetDates Target dates from all countdowns.
 * @returns {Promise<{dates: Set<string>, reports: object[]}>} Unified calendar.
 */
async function loadHolidaySources(config, today, targetDates) {
  const sources = config.holidaySources ?? [];
  const years = yearsInRange(today, targetDates);
  const dates = new Set();
  const reports = [];

  for (const source of sources) {
    let result;
    if (source.provider === "date-holidays") {
      result = await loadDateHolidays(source, config, years);
    } else if (source.provider === "none") {
      // The explicit `none` provider is a verified empty calendar, useful when
      // users want work-week logic without automatic public holidays.
      result = {
        dates: new Set(),
        report: {
          provider: "none",
          coverage: "none",
          status: "exact",
          diagnostics: []
        }
      };
    } else {
      // The validator normally catches this. Keeping the guard here protects
      // direct library callers and future integration mistakes.
      throw new RangeError(`Unknown holiday provider: ${source.provider}`);
    }

    // Provider results are unioned. The same date from two providers remains one
    // exclusion and cannot reduce the workday count twice.
    for (const date of result.dates) dates.add(date);
    reports.push(result.report);
  }

  return { dates, reports };
}

module.exports = {
  loadDateHolidays,
  loadHolidaySources,
  yearsInRange
};
