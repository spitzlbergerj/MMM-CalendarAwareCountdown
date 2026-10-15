# Änderungsnachweis: instanzbezogene Oberflächensprache

## Notwendigkeit

MagicMirror lädt Modulübersetzungen standardmäßig ausschließlich anhand seiner globalen Sprache. Dadurch zeigte eine mit `language: "en"` konfigurierte Instanz weiterhin deutsche Bezeichnungen und Dauer-Einheiten. Die Änderung lädt zusätzlich die für die jeweilige Modulinstanz konfigurierte lokale Übersetzungsdatei. Berechnungen, Feiertagsregeln und alle anderen Modulabläufe bleiben unverändert.

## Datei `MMM-CalendarAwareCountdown.js` – Vorher

~~~~js
Module.register("MMM-CalendarAwareCountdown", {
  defaults: {
    language: "de",
    location: {
      timeZone: "Europe/Berlin",
      country: "DE",
      state: null,
      municipality: null,
      municipalityCode: null
    },
    holidaySources: [
      {
        provider: "date-holidays",
        types: ["public"],
        region: null,
        onUnsupportedLocation: "warn"
      }
    ],
    workWeekdays: [1, 2, 3, 4, 5],
    customDaysOff: [],
    countdowns: [],
    minimumColumnWidth: "220px",
    showMetricLabels: true,
    showSourceWarnings: true,
    sourceHealth: {
      enabled: true,
      checkInterval: 30 * 24 * 60 * 60 * 1000,
      requestTimeout: 15000,
      repositoryStaleAfterDays: 365,
      showUnavailable: true
    },
    updateInterval: 60 * 60 * 1000,
    animationSpeed: 500
  },

  /**
   * Declares the module stylesheet loaded by MagicMirror.
   *
   * @returns {string[]} Stylesheet paths relative to the module directory.
   */
  getStyles() {
    return ["MMM-CalendarAwareCountdown.css"];
  },

  /**
   * Declares bundled interface translations. Holiday names themselves are
   * localized independently by the configured holiday provider.
   *
   * @returns {object} MagicMirror language-to-file mapping.
   */
  getTranslations() {
    return {
      de: "translations/de.json",
      en: "translations/en.json"
    };
  },

  /**
   * Initializes browser-side state, requests the first calculation, and starts
   * the long calculation timer plus the one-second duration display timer.
   *
   * @returns {void}
   */
  start() {
    // Results and errors are independent states: a successful response clears a
    // previous error, while source maintenance arrives on its own socket event.
    this.result = null;
    this.error = null;
    this.sourceHealth = null;
    this.requestData();
    this.scheduleTimers();
  },

  /**
   * Replaces existing timers so repeated resume calls cannot create duplicate
   * work. Full date/holiday calculations use `updateInterval`; only a visible
   * exact-duration value causes a lightweight one-second DOM refresh.
   *
   * @returns {void}
   */
  scheduleTimers() {
    // Clearing old handles makes the method safe after repeated suspend/resume
    // cycles and prevents duplicate server requests or DOM refreshes.
    clearInterval(this.refreshTimer);
    clearInterval(this.clockTimer);
    this.refreshTimer = setInterval(() => this.requestData(), this.config.updateInterval);
    this.clockTimer = setInterval(() => {
      // Calendar-day values change only after a new server calculation. Exact
      // durations are the sole reason to redraw every second in the browser.
      if (this.hasDuration()) this.updateDom(0);
    }, 1000);
  },

  /**
   * Stops browser timers while MagicMirror has suspended the module.
   *
   * @returns {void}
   */
  suspend() {
    clearInterval(this.refreshTimer);
    clearInterval(this.clockTimer);
    this.refreshTimer = null;
    this.clockTimer = null;
  },

  /**
   * Requests fresh data and recreates timers after MagicMirror resumes the
   * module.
   *
   * @returns {void}
   */
  resume() {
    this.requestData();
    this.scheduleTimers();
  },

  /**
   * Sends the effective module configuration to the Node helper. The instance
   * identifier keeps responses separated when the module is configured twice.
   *
   * @returns {void}
   */
  requestData() {
    // MagicMirror has already merged defaults into `this.config`. The helper
    // therefore receives the complete validated configuration contract.
    this.sendSocketNotification("CAC_CONFIG", {
      identifier: this.identifier,
      config: this.config
    });
  },

  /**
   * Receives calculation, validation-error, and source-maintenance results from
   * the Node helper and refreshes only the matching module instance.
   *
   * @param {string} notification Internal socket notification name.
   * @param {object} payload Serialized helper response.
   * @returns {void}
   */
  socketNotificationReceived(notification, payload) {
    // Socket notifications are shared by all instances of the module. Responses
    // without the matching identifier must not change this instance's display.
    if (!payload || payload.identifier !== this.identifier) return;

    if (notification === "CAC_DATA") {
      this.result = payload;
      this.error = null;
      this.updateDom(this.config.animationSpeed);
    } else if (notification === "CAC_ERROR") {
      this.error = payload.message;
      this.updateDom(this.config.animationSpeed);
    } else if (notification === "CAC_SOURCE_HEALTH") {
      // Health state is intentionally separate from calculation errors: an
      // unreachable online source must not hide valid locally calculated values.
      this.sourceHealth = payload.health;
      this.updateDom(this.config.animationSpeed);
    }
  },

  /**
   * Detects whether any current result contains a live duration calculation.
   *
   * @returns {boolean} Whether second-by-second browser updates are necessary.
   */
  hasDuration() {
    // Optional chaining also covers the interval before the first result arrives.
    return Boolean(
      this.result?.countdowns.some((countdown) =>
        countdown.calculations.some((calculation) => calculation.type === "duration")
      )
    );
  },

  /**
   * Selects the configured or translated label for one calculation result.
   *
   * @param {object} calculation Calculated metric returned by the helper.
   * @returns {string} Human-readable metric label.
   */
  metricLabel(calculation) {
    // A user-provided label always wins over built-in translated names.
    if (calculation.label) return calculation.label;
    if (calculation.type === "calendarDays") return this.translate("CALENDAR_DAYS");
    if (calculation.type === "workdays") return this.translate("WORKDAYS");
    if (
      calculation.type === "weekday" &&
      calculation.daysOfWeek?.length === 1 &&
      calculation.daysOfWeek[0] === 1
    ) {
      // The common single-Monday case has a natural dedicated translation.
      return this.translate("MONDAYS");
    }
    if (calculation.type === "weekday") return this.translate("WEEKDAYS");
    return "";
  },

  /**
   * Formats a structured municipality fallback diagnostic for the mirror.
   *
   * @param {object} diagnostic Provider diagnostic returned by the helper.
   * @returns {string} Localized warning text.
   */
  sourceDiagnosticText(diagnostic) {
    const location = diagnostic.location ?? {};
    // The fallback target is the state when present, otherwise the country.
    const fallback = location.state ?? location.country ?? "?";
    return `${this.translate("LOCATION_FALLBACK")} ${location.municipality ?? "?"} → ${fallback}`;
  },

  /**
   * Maps a stable maintenance-source identifier to a translated display name.
   *
   * @param {string} sourceId Source identifier emitted by `source-health.js`.
   * @returns {string} Localized source name.
   */
  sourceHealthName(sourceId) {
    // Stable identifiers come from the helper; mapping them here keeps backend
    // maintenance logic independent of the selected user-interface language.
    if (sourceId === "date-holidays-package") {
      return this.translate("SOURCE_DATE_HOLIDAYS_PACKAGE");
    }
    if (sourceId === "date-holidays-repository") {
      return this.translate("SOURCE_DATE_HOLIDAYS_REPOSITORY");
    }
    if (sourceId === "bavaria-municipalities") {
      return this.translate("SOURCE_BAVARIA_MUNICIPALITIES");
    }
    return sourceId;
  },

  /**
   * Determines whether a maintained source can affect this module instance.
   * Repository-wide checks cover every bundled source, while the mirror footer
   * avoids warnings for providers or regional data the configured countdowns do
   * not use.
   *
   * @param {string} sourceId Source identifier emitted by `source-health.js`.
   * @returns {boolean} Whether the source is relevant to the active configuration.
   */
  sourceHealthIsRelevant(sourceId) {
    const usesDateHolidays = this.config.holidaySources.some(
      (source) => source.provider === "date-holidays"
    );

    if (
      sourceId === "date-holidays-package" ||
      sourceId === "date-holidays-repository"
    ) {
      return usesDateHolidays;
    }

    if (sourceId === "bavaria-municipalities") {
      // The local mapping participates only when the dedicated Bavarian
      // municipality resolver is selected by country, state, and place name.
      const location = this.config.location;
      const isBavarianMunicipality =
        location.country?.toUpperCase() === "DE" &&
        location.state?.toUpperCase() === "BY" &&
        Boolean(location.municipality);
      return usesDateHolidays && isBavarianMunicipality;
    }

    // Future unknown sources stay visible until an explicit relevance rule is
    // added, preventing a new serious maintenance warning from being hidden.
    return true;
  },

  /**
   * Converts one machine-readable source-health entry into concise footer text.
   * Healthy entries are intentionally omitted; the footer is reserved for
   * maintenance work or unavailable checks.
   *
   * @param {object} source Source-health entry returned by the Node helper.
   * @returns {string} Localized warning, or an empty string for healthy status.
   */
  sourceHealthText(source) {
    const sourceName = this.sourceHealthName(source.id);

    // Version numbers are preserved verbatim because they are the actionable
    // evidence an administrator needs when preparing a dependency update.
    if (source.code === "DEPENDENCY_UPDATE_AVAILABLE") {
      return `${sourceName}: ${source.installedVersion} → ${source.latestVersion}`;
    }
    if (source.code === "REPOSITORY_INACTIVE") {
      return `${sourceName}: ${this.translate("SOURCE_REPOSITORY_INACTIVE")}`;
    }
    if (source.code === "REPOSITORY_STALE") {
      return `${sourceName}: ${this.translate("SOURCE_REPOSITORY_STALE")} (${source.daysSinceLastPush} ${this.translate("SOURCE_DAYS")})`;
    }
    if (source.code === "MUNICIPALITY_UPDATE_AVAILABLE") {
      return `${sourceName}: ${this.translate("SOURCE_UPDATE_AVAILABLE")}`;
    }
    if (source.code === "SOURCE_UNAVAILABLE") {
      return `${sourceName}: ${this.translate("SOURCE_CHECK_UNAVAILABLE")}`;
    }
    if (source.code === "SOURCE_INVALID") {
      return `${sourceName}: ${this.translate("SOURCE_CHECK_INVALID")}`;
    }

    // Current sources and unknown non-actionable codes produce no footer text.
    return "";
  },

  /**
   * Formats the remaining time to an exact target instant. Negative durations
   * are clamped to zero; the countdown's expired state decides whether the card
   * is replaced by a dash after the target date.
   *
   * @param {number} targetEpoch Target instant in Unix milliseconds.
   * @param {boolean} showSeconds Whether seconds should be included.
   * @returns {string} Localized compact duration.
   */
  formatDuration(targetEpoch, showSeconds) {
    // Clamping prevents a negative clock during the short interval before the
    // next full calculation marks a target as expired.
    const remaining = Math.max(0, targetEpoch - Date.now());
    const totalSeconds = Math.floor(remaining / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const parts = [
      `${days} ${this.translate("DAYS_SHORT")}`,
      `${hours} ${this.translate("HOURS_SHORT")}`,
      `${minutes} ${this.translate("MINUTES_SHORT")}`
    ];
    // Seconds are optional because they require a one-second visual refresh.
    if (showSeconds) parts.push(`${seconds} ${this.translate("SECONDS_SHORT")}`);
    return parts.join(" ");
  },

  /**
   * Builds the complete module DOM: responsive equal-width countdown cards,
   * provider fallback warnings, and optional source-maintenance information.
   * Text is assigned through `textContent` so titles and diagnostics cannot
   * inject markup.
   *
   * @returns {HTMLElement} Root element rendered by MagicMirror.
   */
  getDom() {
    // Every rendering path returns the same root class, keeping sizing behavior
    // stable for loading, error, and populated states.
    const wrapper = document.createElement("div");
    wrapper.className = "cac";

    if (this.error) {
      // Configuration/calculation errors replace cards because their values are
      // not trustworthy. Source-health warnings follow a different path below.
      wrapper.classList.add("cac--error");
      wrapper.textContent = `${this.translate("CONFIG_ERROR")}: ${this.error}`;
      return wrapper;
    }

    if (!this.result) {
      wrapper.classList.add("dimmed", "light", "small");
      wrapper.textContent = this.translate("LOADING");
      return wrapper;
    }

    const grid = document.createElement("div");
    grid.className = "cac__grid";
    const minimumColumnWidth =
      typeof this.config.minimumColumnWidth === "number"
        ? `${this.config.minimumColumnWidth}px`
        : this.config.minimumColumnWidth;
    grid.style.setProperty("--cac-min-column-width", minimumColumnWidth);

    // CSS Grid determines the number of equal-width columns from available
    // region width. Additional countdowns wrap without JavaScript breakpoints.
    for (const countdown of this.result.countdowns) {
      const card = document.createElement("section");
      card.className = "cac__card";

      const title = document.createElement("div");
      title.className = "cac__title bright";
      title.textContent = countdown.title;
      card.appendChild(title);

      const values = document.createElement("div");
      values.className = "cac__values";
      const isCombined =
        countdown.display !== "separate" &&
        countdown.calculations.length === 2 &&
        countdown.calculations.every((item) => item.type !== "duration");

      if (isCombined) {
        // Exactly two number-based metrics use the compact `value / value`
        // presentation requested for calendar days plus working days.
        const value = document.createElement("div");
        value.className = "cac__value cac__value--combined bright";
        value.textContent = countdown.expired
          ? "-"
          : countdown.calculations.map((item) => item.value).join(" / ");
        values.appendChild(value);

        if (this.config.showMetricLabels) {
          const label = document.createElement("div");
          label.className = "cac__label dimmed";
          label.textContent = countdown.calculations
            .map((item) => this.metricLabel(item))
            .join(" / ");
          values.appendChild(label);
        }
      } else {
        // All other combinations use individual rows so labels and a potentially
        // long duration remain unambiguous.
        for (const calculation of countdown.calculations) {
          const metric = document.createElement("div");
          metric.className = "cac__metric";

          const value = document.createElement("div");
          value.className = "cac__value bright";
          value.textContent = countdown.expired
            ? "-"
            : calculation.type === "duration"
              ? this.formatDuration(countdown.targetEpoch, calculation.showSeconds)
              : calculation.value;
          metric.appendChild(value);

          if (this.config.showMetricLabels && calculation.type !== "duration") {
            const label = document.createElement("div");
            label.className = "cac__label dimmed";
            label.textContent = this.metricLabel(calculation);
            metric.appendChild(label);
          }
          values.appendChild(metric);
        }
      }

      card.appendChild(values);
      grid.appendChild(card);
    }

    wrapper.appendChild(grid);

    if (this.config.showSourceWarnings) {
      // Provider diagnostics describe geographic fallback in the calculation
      // itself and are therefore displayed independently of maintenance checks.
      const diagnostics = this.result.holidaySources.flatMap(
        (source) => source.diagnostics ?? []
      );
      for (const diagnostic of diagnostics) {
        const warning = document.createElement("div");
        warning.className = "cac__warning dimmed";
        warning.textContent = this.sourceDiagnosticText(diagnostic);
        wrapper.appendChild(warning);
      }
    }

    const sourceHealthEnabled = this.config.sourceHealth?.enabled !== false;
    if (sourceHealthEnabled && this.sourceHealth?.sources) {
      // Healthy sources remain invisible. Administrators see only actionable
      // updates/errors and, when configured, temporarily unreachable checks.
      const visibleSourceMessages = this.sourceHealth.sources
        .filter(
          (source) =>
            this.sourceHealthIsRelevant(source.id) &&
            source.status !== "ok" &&
            (
              source.status !== "unavailable" ||
              this.config.sourceHealth.showUnavailable !== false
            )
        )
        .map((source) => this.sourceHealthText(source))
        .filter(Boolean);

      if (visibleSourceMessages.length > 0) {
        // One compact footer avoids increasing every card's height and makes it
        // clear that the notice applies to shared sources, not one countdown.
        const sourceHealthFooter = document.createElement("div");
        sourceHealthFooter.className = "cac__source-health dimmed";
        sourceHealthFooter.textContent = `${this.translate("SOURCE_MAINTENANCE")}: ${visibleSourceMessages.join(" · ")}`;
        wrapper.appendChild(sourceHealthFooter);
      }
    }

    return wrapper;
  }
});
~~~~

## Datei `MMM-CalendarAwareCountdown.js` – Nachher

~~~~js
Module.register("MMM-CalendarAwareCountdown", {
  defaults: {
    language: "de",
    location: {
      timeZone: "Europe/Berlin",
      country: "DE",
      state: null,
      municipality: null,
      municipalityCode: null
    },
    holidaySources: [
      {
        provider: "date-holidays",
        types: ["public"],
        region: null,
        onUnsupportedLocation: "warn"
      }
    ],
    workWeekdays: [1, 2, 3, 4, 5],
    customDaysOff: [],
    countdowns: [],
    minimumColumnWidth: "220px",
    showMetricLabels: true,
    showSourceWarnings: true,
    sourceHealth: {
      enabled: true,
      checkInterval: 30 * 24 * 60 * 60 * 1000,
      requestTimeout: 15000,
      repositoryStaleAfterDays: 365,
      showUnavailable: true
    },
    updateInterval: 60 * 60 * 1000,
    animationSpeed: 500
  },

  /**
   * Declares the module stylesheet loaded by MagicMirror.
   *
   * @returns {string[]} Stylesheet paths relative to the module directory.
   */
  getStyles() {
    return ["MMM-CalendarAwareCountdown.css"];
  },

  /**
   * Declares bundled interface translations. Holiday names themselves are
   * localized independently by the configured holiday provider.
   *
   * @returns {object} MagicMirror language-to-file mapping.
   */
  getTranslations() {
    return {
      de: "translations/de.json",
      en: "translations/en.json"
    };
  },

  /**
   * Initializes browser-side state, requests the first calculation, and starts
   * the long calculation timer plus the one-second duration display timer.
   *
   * @returns {void}
   */
  start() {
    // Results and errors are independent states: a successful response clears a
    // previous error, while source maintenance arrives on its own socket event.
    this.result = null;
    this.error = null;
    this.sourceHealth = null;

    // MagicMirror normally loads module translations according to its one global
    // interface language. This module deliberately supports a language per
    // instance, so the configured translation file is loaded separately before
    // visible labels are resolved. A failed file request keeps the framework
    // translation as a safe fallback and never blocks countdown calculation.
    this.interfaceTranslations = null;
    this.loadConfiguredInterfaceTranslations();

    this.requestData();
    this.scheduleTimers();
  },

  /**
   * Loads the interface translation selected by this module instance's
   * `config.language`. MagicMirror's standard translation loader follows only
   * the global mirror language, which caused an English countdown instance on a
   * German mirror to retain German labels and duration units.
   *
   * The configured value may be a direct key such as `en` or a regional form
   * such as `en-GB`; regional forms fall back to their base language. Unknown
   * values use the first translation declared by `getTranslations`, matching
   * MagicMirror's own documented fallback behavior.
   *
   * @returns {Promise<void>} Resolves after the translation was loaded or the
   * fallback path was selected following a recoverable loading error.
   */
  async loadConfiguredInterfaceTranslations() {
    // Reuse the public translation-file mapping so file locations have one
    // authoritative definition instead of being duplicated in calculation code.
    const translationFiles = this.getTranslations();
    const availableLanguages = Object.keys(translationFiles);
    if (availableLanguages.length === 0) return;

    // Normalize only for lookup. The original language remains unchanged for
    // date-holidays, which may support more locale detail than the interface.
    const configuredLanguage = String(this.config.language ?? "").toLowerCase();
    const baseLanguage = configuredLanguage.split("-")[0];
    const selectedLanguage = translationFiles[configuredLanguage]
      ? configuredLanguage
      : translationFiles[baseLanguage]
        ? baseLanguage
        : availableLanguages[0];
    const translationFile = translationFiles[selectedLanguage];

    try {
      // The files are local module assets. `no-store` prevents a long-running
      // kiosk profile from retaining outdated labels after a module update.
      const response = await fetch(this.file(translationFile), { cache: "no-store" });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status} while loading ${translationFile}`);
      }

      const translations = await response.json();
      const isTranslationObject =
        translations && typeof translations === "object" && !Array.isArray(translations);
      if (!isTranslationObject) {
        throw new TypeError(`${translationFile} does not contain a translation object`);
      }

      // Store the complete dictionary only after successful validation so a
      // partial or malformed response cannot replace the framework fallback.
      this.interfaceTranslations = translations;
      this.updateDom(0);
    } catch (error) {
      // Translation availability affects presentation, not date correctness.
      // Logging the exact reason aids maintenance while the mirror continues
      // with the translation already loaded by MagicMirror itself.
      Log.warn(
        `[MMM-CalendarAwareCountdown] Could not load configured interface language "${configuredLanguage}": ${error.message}`
      );
    }
  },

  /**
   * Returns interface text from the per-instance dictionary. Before that local
   * file finishes loading, or when a key is absent, MagicMirror's normal
   * translation remains the non-blocking fallback.
   *
   * @param {string} key Stable key from the module translation files.
   * @returns {string} Localized interface text for the current module instance.
   */
  interfaceText(key) {
    const configuredText = this.interfaceTranslations?.[key];
    if (typeof configuredText === "string") return configuredText;
    return this.translate(key);
  },

  /**
   * Replaces existing timers so repeated resume calls cannot create duplicate
   * work. Full date/holiday calculations use `updateInterval`; only a visible
   * exact-duration value causes a lightweight one-second DOM refresh.
   *
   * @returns {void}
   */
  scheduleTimers() {
    // Clearing old handles makes the method safe after repeated suspend/resume
    // cycles and prevents duplicate server requests or DOM refreshes.
    clearInterval(this.refreshTimer);
    clearInterval(this.clockTimer);
    this.refreshTimer = setInterval(() => this.requestData(), this.config.updateInterval);
    this.clockTimer = setInterval(() => {
      // Calendar-day values change only after a new server calculation. Exact
      // durations are the sole reason to redraw every second in the browser.
      if (this.hasDuration()) this.updateDom(0);
    }, 1000);
  },

  /**
   * Stops browser timers while MagicMirror has suspended the module.
   *
   * @returns {void}
   */
  suspend() {
    clearInterval(this.refreshTimer);
    clearInterval(this.clockTimer);
    this.refreshTimer = null;
    this.clockTimer = null;
  },

  /**
   * Requests fresh data and recreates timers after MagicMirror resumes the
   * module.
   *
   * @returns {void}
   */
  resume() {
    this.requestData();
    this.scheduleTimers();
  },

  /**
   * Sends the effective module configuration to the Node helper. The instance
   * identifier keeps responses separated when the module is configured twice.
   *
   * @returns {void}
   */
  requestData() {
    // MagicMirror has already merged defaults into `this.config`. The helper
    // therefore receives the complete validated configuration contract.
    this.sendSocketNotification("CAC_CONFIG", {
      identifier: this.identifier,
      config: this.config
    });
  },

  /**
   * Receives calculation, validation-error, and source-maintenance results from
   * the Node helper and refreshes only the matching module instance.
   *
   * @param {string} notification Internal socket notification name.
   * @param {object} payload Serialized helper response.
   * @returns {void}
   */
  socketNotificationReceived(notification, payload) {
    // Socket notifications are shared by all instances of the module. Responses
    // without the matching identifier must not change this instance's display.
    if (!payload || payload.identifier !== this.identifier) return;

    if (notification === "CAC_DATA") {
      this.result = payload;
      this.error = null;
      this.updateDom(this.config.animationSpeed);
    } else if (notification === "CAC_ERROR") {
      this.error = payload.message;
      this.updateDom(this.config.animationSpeed);
    } else if (notification === "CAC_SOURCE_HEALTH") {
      // Health state is intentionally separate from calculation errors: an
      // unreachable online source must not hide valid locally calculated values.
      this.sourceHealth = payload.health;
      this.updateDom(this.config.animationSpeed);
    }
  },

  /**
   * Detects whether any current result contains a live duration calculation.
   *
   * @returns {boolean} Whether second-by-second browser updates are necessary.
   */
  hasDuration() {
    // Optional chaining also covers the interval before the first result arrives.
    return Boolean(
      this.result?.countdowns.some((countdown) =>
        countdown.calculations.some((calculation) => calculation.type === "duration")
      )
    );
  },

  /**
   * Selects the configured or translated label for one calculation result.
   *
   * @param {object} calculation Calculated metric returned by the helper.
   * @returns {string} Human-readable metric label.
   */
  metricLabel(calculation) {
    // A user-provided label always wins over built-in translated names.
    if (calculation.label) return calculation.label;
    if (calculation.type === "calendarDays") return this.interfaceText("CALENDAR_DAYS");
    if (calculation.type === "workdays") return this.interfaceText("WORKDAYS");
    if (
      calculation.type === "weekday" &&
      calculation.daysOfWeek?.length === 1 &&
      calculation.daysOfWeek[0] === 1
    ) {
      // The common single-Monday case has a natural dedicated translation.
      return this.interfaceText("MONDAYS");
    }
    if (calculation.type === "weekday") return this.interfaceText("WEEKDAYS");
    return "";
  },

  /**
   * Formats a structured municipality fallback diagnostic for the mirror.
   *
   * @param {object} diagnostic Provider diagnostic returned by the helper.
   * @returns {string} Localized warning text.
   */
  sourceDiagnosticText(diagnostic) {
    const location = diagnostic.location ?? {};
    // The fallback target is the state when present, otherwise the country.
    const fallback = location.state ?? location.country ?? "?";
    return `${this.interfaceText("LOCATION_FALLBACK")} ${location.municipality ?? "?"} → ${fallback}`;
  },

  /**
   * Maps a stable maintenance-source identifier to a translated display name.
   *
   * @param {string} sourceId Source identifier emitted by `source-health.js`.
   * @returns {string} Localized source name.
   */
  sourceHealthName(sourceId) {
    // Stable identifiers come from the helper; mapping them here keeps backend
    // maintenance logic independent of the selected user-interface language.
    if (sourceId === "date-holidays-package") {
      return this.interfaceText("SOURCE_DATE_HOLIDAYS_PACKAGE");
    }
    if (sourceId === "date-holidays-repository") {
      return this.interfaceText("SOURCE_DATE_HOLIDAYS_REPOSITORY");
    }
    if (sourceId === "bavaria-municipalities") {
      return this.interfaceText("SOURCE_BAVARIA_MUNICIPALITIES");
    }
    return sourceId;
  },

  /**
   * Determines whether a maintained source can affect this module instance.
   * Repository-wide checks cover every bundled source, while the mirror footer
   * avoids warnings for providers or regional data the configured countdowns do
   * not use.
   *
   * @param {string} sourceId Source identifier emitted by `source-health.js`.
   * @returns {boolean} Whether the source is relevant to the active configuration.
   */
  sourceHealthIsRelevant(sourceId) {
    const usesDateHolidays = this.config.holidaySources.some(
      (source) => source.provider === "date-holidays"
    );

    if (
      sourceId === "date-holidays-package" ||
      sourceId === "date-holidays-repository"
    ) {
      return usesDateHolidays;
    }

    if (sourceId === "bavaria-municipalities") {
      // The local mapping participates only when the dedicated Bavarian
      // municipality resolver is selected by country, state, and place name.
      const location = this.config.location;
      const isBavarianMunicipality =
        location.country?.toUpperCase() === "DE" &&
        location.state?.toUpperCase() === "BY" &&
        Boolean(location.municipality);
      return usesDateHolidays && isBavarianMunicipality;
    }

    // Future unknown sources stay visible until an explicit relevance rule is
    // added, preventing a new serious maintenance warning from being hidden.
    return true;
  },

  /**
   * Converts one machine-readable source-health entry into concise footer text.
   * Healthy entries are intentionally omitted; the footer is reserved for
   * maintenance work or unavailable checks.
   *
   * @param {object} source Source-health entry returned by the Node helper.
   * @returns {string} Localized warning, or an empty string for healthy status.
   */
  sourceHealthText(source) {
    const sourceName = this.sourceHealthName(source.id);

    // Version numbers are preserved verbatim because they are the actionable
    // evidence an administrator needs when preparing a dependency update.
    if (source.code === "DEPENDENCY_UPDATE_AVAILABLE") {
      return `${sourceName}: ${source.installedVersion} → ${source.latestVersion}`;
    }
    if (source.code === "REPOSITORY_INACTIVE") {
      return `${sourceName}: ${this.interfaceText("SOURCE_REPOSITORY_INACTIVE")}`;
    }
    if (source.code === "REPOSITORY_STALE") {
      return `${sourceName}: ${this.interfaceText("SOURCE_REPOSITORY_STALE")} (${source.daysSinceLastPush} ${this.interfaceText("SOURCE_DAYS")})`;
    }
    if (source.code === "MUNICIPALITY_UPDATE_AVAILABLE") {
      return `${sourceName}: ${this.interfaceText("SOURCE_UPDATE_AVAILABLE")}`;
    }
    if (source.code === "SOURCE_UNAVAILABLE") {
      return `${sourceName}: ${this.interfaceText("SOURCE_CHECK_UNAVAILABLE")}`;
    }
    if (source.code === "SOURCE_INVALID") {
      return `${sourceName}: ${this.interfaceText("SOURCE_CHECK_INVALID")}`;
    }

    // Current sources and unknown non-actionable codes produce no footer text.
    return "";
  },

  /**
   * Formats the remaining time to an exact target instant. Negative durations
   * are clamped to zero; the countdown's expired state decides whether the card
   * is replaced by a dash after the target date.
   *
   * @param {number} targetEpoch Target instant in Unix milliseconds.
   * @param {boolean} showSeconds Whether seconds should be included.
   * @returns {string} Localized compact duration.
   */
  formatDuration(targetEpoch, showSeconds) {
    // Clamping prevents a negative clock during the short interval before the
    // next full calculation marks a target as expired.
    const remaining = Math.max(0, targetEpoch - Date.now());
    const totalSeconds = Math.floor(remaining / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const parts = [
      `${days} ${this.interfaceText("DAYS_SHORT")}`,
      `${hours} ${this.interfaceText("HOURS_SHORT")}`,
      `${minutes} ${this.interfaceText("MINUTES_SHORT")}`
    ];
    // Seconds are optional because they require a one-second visual refresh.
    if (showSeconds) parts.push(`${seconds} ${this.interfaceText("SECONDS_SHORT")}`);
    return parts.join(" ");
  },

  /**
   * Builds the complete module DOM: responsive equal-width countdown cards,
   * provider fallback warnings, and optional source-maintenance information.
   * Text is assigned through `textContent` so titles and diagnostics cannot
   * inject markup.
   *
   * @returns {HTMLElement} Root element rendered by MagicMirror.
   */
  getDom() {
    // Every rendering path returns the same root class, keeping sizing behavior
    // stable for loading, error, and populated states.
    const wrapper = document.createElement("div");
    wrapper.className = "cac";

    if (this.error) {
      // Configuration/calculation errors replace cards because their values are
      // not trustworthy. Source-health warnings follow a different path below.
      wrapper.classList.add("cac--error");
      wrapper.textContent = `${this.interfaceText("CONFIG_ERROR")}: ${this.error}`;
      return wrapper;
    }

    if (!this.result) {
      wrapper.classList.add("dimmed", "light", "small");
      wrapper.textContent = this.interfaceText("LOADING");
      return wrapper;
    }

    const grid = document.createElement("div");
    grid.className = "cac__grid";
    const minimumColumnWidth =
      typeof this.config.minimumColumnWidth === "number"
        ? `${this.config.minimumColumnWidth}px`
        : this.config.minimumColumnWidth;
    grid.style.setProperty("--cac-min-column-width", minimumColumnWidth);

    // CSS Grid determines the number of equal-width columns from available
    // region width. Additional countdowns wrap without JavaScript breakpoints.
    for (const countdown of this.result.countdowns) {
      const card = document.createElement("section");
      card.className = "cac__card";

      const title = document.createElement("div");
      title.className = "cac__title bright";
      title.textContent = countdown.title;
      card.appendChild(title);

      const values = document.createElement("div");
      values.className = "cac__values";
      const isCombined =
        countdown.display !== "separate" &&
        countdown.calculations.length === 2 &&
        countdown.calculations.every((item) => item.type !== "duration");

      if (isCombined) {
        // Exactly two number-based metrics use the compact `value / value`
        // presentation requested for calendar days plus working days.
        const value = document.createElement("div");
        value.className = "cac__value cac__value--combined bright";
        value.textContent = countdown.expired
          ? "-"
          : countdown.calculations.map((item) => item.value).join(" / ");
        values.appendChild(value);

        if (this.config.showMetricLabels) {
          const label = document.createElement("div");
          label.className = "cac__label dimmed";
          label.textContent = countdown.calculations
            .map((item) => this.metricLabel(item))
            .join(" / ");
          values.appendChild(label);
        }
      } else {
        // All other combinations use individual rows so labels and a potentially
        // long duration remain unambiguous.
        for (const calculation of countdown.calculations) {
          const metric = document.createElement("div");
          metric.className = "cac__metric";

          const value = document.createElement("div");
          value.className = "cac__value bright";
          value.textContent = countdown.expired
            ? "-"
            : calculation.type === "duration"
              ? this.formatDuration(countdown.targetEpoch, calculation.showSeconds)
              : calculation.value;
          metric.appendChild(value);

          if (this.config.showMetricLabels && calculation.type !== "duration") {
            const label = document.createElement("div");
            label.className = "cac__label dimmed";
            label.textContent = this.metricLabel(calculation);
            metric.appendChild(label);
          }
          values.appendChild(metric);
        }
      }

      card.appendChild(values);
      grid.appendChild(card);
    }

    wrapper.appendChild(grid);

    if (this.config.showSourceWarnings) {
      // Provider diagnostics describe geographic fallback in the calculation
      // itself and are therefore displayed independently of maintenance checks.
      const diagnostics = this.result.holidaySources.flatMap(
        (source) => source.diagnostics ?? []
      );
      for (const diagnostic of diagnostics) {
        const warning = document.createElement("div");
        warning.className = "cac__warning dimmed";
        warning.textContent = this.sourceDiagnosticText(diagnostic);
        wrapper.appendChild(warning);
      }
    }

    const sourceHealthEnabled = this.config.sourceHealth?.enabled !== false;
    if (sourceHealthEnabled && this.sourceHealth?.sources) {
      // Healthy sources remain invisible. Administrators see only actionable
      // updates/errors and, when configured, temporarily unreachable checks.
      const visibleSourceMessages = this.sourceHealth.sources
        .filter(
          (source) =>
            this.sourceHealthIsRelevant(source.id) &&
            source.status !== "ok" &&
            (
              source.status !== "unavailable" ||
              this.config.sourceHealth.showUnavailable !== false
            )
        )
        .map((source) => this.sourceHealthText(source))
        .filter(Boolean);

      if (visibleSourceMessages.length > 0) {
        // One compact footer avoids increasing every card's height and makes it
        // clear that the notice applies to shared sources, not one countdown.
        const sourceHealthFooter = document.createElement("div");
        sourceHealthFooter.className = "cac__source-health dimmed";
        sourceHealthFooter.textContent = `${this.interfaceText("SOURCE_MAINTENANCE")}: ${visibleSourceMessages.join(" · ")}`;
        wrapper.appendChild(sourceHealthFooter);
      }
    }

    return wrapper;
  }
});
~~~~

## Datei `tests/frontend-language.test.js` – Vorher

Die Testdatei war nicht vorhanden. Der tatsächliche vorherige Quellcode dieser neu angelegten Programmeinheit ist daher leer:

~~~~js
~~~~

## Datei `tests/frontend-language.test.js` – Nachher

~~~~js
"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");

let registeredModule;

// The browser module registers its definition with MagicMirror instead of
// exporting it. This test double captures the unchanged production methods so
// language behavior can be verified without a browser or MagicMirror process.
global.Module = {
  register(moduleName, moduleDefinition) {
    assert.equal(moduleName, "MMM-CalendarAwareCountdown");
    registeredModule = moduleDefinition;
  }
};
require("../MMM-CalendarAwareCountdown");
delete global.Module;

/**
 * Creates the smallest browser-side module instance needed by the translation
 * methods. File resolution and DOM refresh calls are observable test doubles;
 * the real language selection and duration formatting methods remain unchanged.
 *
 * @param {string} language Per-instance language from the public configuration.
 * @returns {object} Testable frontend module instance.
 */
function createFrontendInstance(language) {
  return {
    ...registeredModule,
    config: { language },
    interfaceTranslations: null,
    updateCount: 0,
    file(relativePath) {
      // MagicMirror normally expands this path below the module's public URL.
      return `/modules/MMM-CalendarAwareCountdown/${relativePath}`;
    },
    translate(key) {
      // A visibly different fallback proves whether the configured dictionary
      // or MagicMirror's global-language translation supplied the final text.
      return `framework:${key}`;
    },
    updateDom() {
      this.updateCount += 1;
    }
  };
}

test("loads the configured English interface independently of MagicMirror's global language", async () => {
  const instance = createFrontendInstance("en");
  const originalFetch = global.fetch;
  let requestedUrl;
  let requestedOptions;

  // The response represents the existing local translations/en.json asset.
  // No network service participates in production or in this test.
  global.fetch = async (url, options) => {
    requestedUrl = url;
    requestedOptions = options;
    return {
      ok: true,
      async json() {
        return {
          DAYS_SHORT: "d",
          HOURS_SHORT: "h",
          MINUTES_SHORT: "m",
          SECONDS_SHORT: "s",
          CALENDAR_DAYS: "Calendar days"
        };
      }
    };
  };

  try {
    await instance.loadConfiguredInterfaceTranslations();
  } finally {
    // Restoring the process-global implementation prevents this test double
    // from influencing source-health tests that use real HTTP mocks.
    global.fetch = originalFetch;
  }

  assert.equal(
    requestedUrl,
    "/modules/MMM-CalendarAwareCountdown/translations/en.json"
  );
  assert.deepEqual(requestedOptions, { cache: "no-store" });
  assert.equal(instance.interfaceText("CALENDAR_DAYS"), "Calendar days");
  assert.equal(instance.updateCount, 1);
});

test("uses the base language for a regional language code", async () => {
  const instance = createFrontendInstance("en-GB");
  const originalFetch = global.fetch;
  let requestedUrl;

  global.fetch = async (url) => {
    requestedUrl = url;
    return {
      ok: true,
      async json() {
        return { DAYS_SHORT: "d" };
      }
    };
  };

  try {
    await instance.loadConfiguredInterfaceTranslations();
  } finally {
    global.fetch = originalFetch;
  }

  assert.match(requestedUrl, /translations\/en\.json$/);
});

test("formats duration units from the instance language dictionary", () => {
  const instance = createFrontendInstance("en");
  instance.interfaceTranslations = {
    DAYS_SHORT: "d",
    HOURS_SHORT: "h",
    MINUTES_SHORT: "m",
    SECONDS_SHORT: "s"
  };

  const originalDateNow = Date.now;
  Date.now = () => 0;
  try {
    const durationMilliseconds = ((1 * 24 + 2) * 60 * 60 + 3 * 60 + 4) * 1000;
    assert.equal(
      instance.formatDuration(durationMilliseconds, true),
      "1 d 2 h 3 m 4 s"
    );
  } finally {
    Date.now = originalDateNow;
  }
});

test("falls back to MagicMirror translation until the local dictionary is available", () => {
  const instance = createFrontendInstance("en");
  assert.equal(instance.interfaceText("WORKDAYS"), "framework:WORKDAYS");
});
~~~~

## Tatsächlich vorgenommene Änderungen

- `start` stößt zusätzlich das Laden der instanzbezogenen Oberflächensprache an.
- `loadConfiguredInterfaceTranslations` lädt ausschließlich eine lokale, bereits zum Modul gehörende JSON-Datei. Regionale Sprachcodes verwenden ihre Basissprache; unbekannte Sprachen fallen wie bei MagicMirror auf die zuerst deklarierte Übersetzung zurück.
- `interfaceText` verwendet die instanzbezogene Übersetzung und lässt MagicMirrors vorhandene Übersetzung als ausfallsicheren Rückfallweg bestehen.
- Alle sichtbaren Bezeichnungen, Dauer-Einheiten, Diagnosemeldungen und Quellenhinweise verwenden denselben instanzbezogenen Zugriff.
- Vier Tests belegen englische Instanzsprache, regionale Sprachcodes, englische Dauer-Einheiten und den Rückfallweg.

## Bewusst unverändert

Die Berechnung von Kalender-, Arbeits- und Wochentagen, Feiertagsquellen, freie Tage, Quellenprüfungen, Socket-Nachrichten, Timerintervalle, DOM-Struktur und CSS wurden nicht verändert.
