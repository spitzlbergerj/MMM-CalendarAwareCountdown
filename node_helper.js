"use strict";

const NodeHelper = require("node_helper");
const {
  calculateCountdown,
  dateKeyInTimeZone,
  normalizeCustomDaysOff
} = require("./lib/countdown-calculator");
const { loadHolidaySources } = require("./lib/holiday-sources");
const { validateConfig } = require("./lib/config-validator");
const { loadSourceHealth } = require("./lib/source-health");

module.exports = NodeHelper.create({
  /**
   * Validates one module instance, calculates all countdowns using a shared
   * holiday calendar, and sends a display result back to the browser. The
   * optional online source-health inspection starts only after validation and
   * cannot prevent or alter the local countdown calculation.
   *
   * @param {string} notification Internal MagicMirror socket event name.
   * @param {object} payload Module instance identifier and effective config.
   * @returns {Promise<void>} Resolves after calculation and any health response.
   */
  async socketNotificationReceived(notification, payload) {
    // Ignore every event not belonging to this module's configuration protocol.
    // Other MagicMirror modules share the same socket channel.
    if (notification !== "CAC_CONFIG") return;

    // Keep the identifier available even if configuration validation fails; the
    // browser needs it to route an error to the correct module instance.
    const identifier = payload?.identifier;
    const config = payload?.config;

    try {
      // Validation happens before date or provider work so an invalid option
      // produces one precise error instead of a secondary library failure.
      validateConfig(config);

      // One time reference is reused for “today”, live durations, and the result
      // timestamp. This avoids boundary inconsistencies during a calculation.
      const now = new Date();
      const today = dateKeyInTimeZone(now, config.location.timeZone);

      // Providers need only the date portion to determine the inclusive year
      // range; exact timestamp details remain relevant only to duration metrics.
      const targetDates = config.countdowns.map((item) => item.target.slice(0, 10));
      const holidayCalendar = await loadHolidaySources(config, today, targetDates);

      // Global days off are normalized once and shared. Each countdown later
      // merges its private list without mutating this shared set.
      const customDaysOff = normalizeCustomDaysOff(config.customDaysOff);
      const context = {
        today,
        nowEpoch: now.getTime(),
        holidays: holidayCalendar.dates,
        customDaysOff,
        workWeekdays: new Set(config.workWeekdays)
      };

      // Only serializable values cross the MagicMirror socket. Set objects stay
      // in the helper and are consumed while each countdown is calculated.
      this.sendSocketNotification("CAC_DATA", {
        identifier,
        generatedAt: now.getTime(),
        today,
        holidaySources: holidayCalendar.reports,
        countdowns: config.countdowns.map((countdown) =>
          calculateCountdown(countdown, context)
        )
      });
    } catch (error) {
      // Configuration and calculation failures stop this request but not the
      // MagicMirror process. The browser shows the message in the affected module.
      console.error(`[MMM-CalendarAwareCountdown] ${error.stack ?? error.message}`);
      this.sendSocketNotification("CAC_ERROR", {
        identifier,
        message: error.message
      });
      return;
    }

    // Source maintenance is optional and deliberately begins after valid local
    // results were sent. Slow or unavailable internet therefore cannot delay or
    // replace the countdown values.
    // Missing `enabled` uses the documented true default, which also supports
    // MagicMirror versions that merge nested configuration objects shallowly.
    if (config.sourceHealth.enabled !== false) {
      try {
        const health = await loadSourceHealth(config.sourceHealth);

        // Health data has its own notification so a later monthly result can
        // refresh the small footer without recalculating or changing day counts.
        this.sendSocketNotification("CAC_SOURCE_HEALTH", {
          identifier,
          health
        });
      } catch (error) {
        // The shared inspector normally represents source failures as structured
        // entries. This catch is reserved for unexpected internal/cache errors;
        // it is logged but never converted into a countdown calculation error.
        console.warn(
          `[MMM-CalendarAwareCountdown] Source-health check failed: ${error.stack ?? error.message}`
        );
      }
    }
  }
});
