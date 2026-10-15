# Vollständiger Vorher-/Nachher-Nachweis: Quellenpflege für V1

Dieser Nachweis wurde unmittelbar aus dem bisherigen Git-Stand `HEAD` und den ausgelieferten Arbeitsdateien erzeugt. Die Nachher-Blöcke entsprechen byteinhaltlich (abgesehen von plattformabhängigen Zeilenenden) den Dateien zum Zeitpunkt der Übergabe.

Bewusst unverändert blieben die fachlichen Zählregeln `[today, target)`, die inklusive Auslegung von `daysOff`, die Vereinigungslogik ohne Doppelabzug, die bestehenden Feiertags-Provider-Ergebnisse, das responsive Kartenraster und die aktive persönliche MagicMirror-Konfiguration. Die Online-Prüfung verändert keine Berechnung und installiert keine Aktualisierung selbst.


## .gitignore

Konkrete Notwendigkeit: Der neue Laufzeitcache `.cache/source-health.json` darf weder veröffentlicht noch als Quellcodeänderung eingecheckt werden.

Abgrenzung: Nicht durch diesen Grund erforderliche fachliche Abläufe und öffentliche Schnittstellen dieser Datei wurden nicht umgebaut.

### Vorher

~~~~gitignore
node_modules/
coverage/
.DS_Store
npm-debug.log*
~~~~

### Nachher

~~~~gitignore
node_modules/
.cache/
coverage/
.DS_Store
npm-debug.log*

~~~~


## CHANGELOG.md

Konkrete Notwendigkeit: Die für V1 hinzugekommenen Quellenprüfungen, Wartungshinweise und deren Dokumentation müssen in der Versionshistorie genannt sein.

Abgrenzung: Nicht durch diesen Grund erforderliche fachliche Abläufe und öffentliche Schnittstellen dieser Datei wurden nicht umgebaut.

### Vorher

~~~~markdown
# Changelog

All notable changes to this project are documented here.

## 1.0.0 - 2026-10-14

- Multiple equal-width countdowns with responsive wrapping
- Calendar days, working days, selected weekdays, and live durations
- Inclusive global and countdown-specific days-off ranges
- Offline public-holiday calculation through `date-holidays`
- Country and supported subdivision coverage worldwide
- Exact municipality-level rules for all Bavarian municipalities
- Explicit warning, error, or silent fallback behavior for unsupported locations
- German and English labels
- Configuration validation and automated calculation tests
~~~~

### Nachher

~~~~markdown
# Changelog

All notable changes to this project are documented here.

## 1.0.0 - 2026-10-14

- Multiple equal-width countdowns with responsive wrapping
- Calendar days, working days, selected weekdays, and live durations
- Inclusive global and countdown-specific days-off ranges
- Offline public-holiday calculation through `date-holidays`
- Country and supported subdivision coverage worldwide
- Exact municipality-level rules for all Bavarian municipalities
- Explicit warning, error, or silent fallback behavior for unsupported locations
- Monthly runtime and repository checks for dependency and official-data freshness
- Footer notices when a source needs review or cannot be verified
- Dependabot proposals for controlled dependency updates
- Documented provider contract, Bavarian rule mapping, and maintenance process
- German and English labels
- Configuration validation and automated calculation tests

~~~~



## MMM-CalendarAwareCountdown.css

Konkrete Notwendigkeit: Die ausdrücklich gewünschte Quellenmeldung unter den Countdowns benötigt eine zurückhaltende, vom Kartenraster getrennte Darstellung.

Abgrenzung: Nicht durch diesen Grund erforderliche fachliche Abläufe und öffentliche Schnittstellen dieser Datei wurden nicht umgebaut.

### Vorher

~~~~css
.cac {
  width: 100%;
}

.cac__grid {
  display: grid;
  grid-template-columns: repeat(
    auto-fit,
    minmax(min(100%, var(--cac-min-column-width, 220px)), 1fr)
  );
  gap: 8px;
  align-items: start;
}

.cac__card {
  min-width: 0;
  text-align: center;
}

.cac__title {
  overflow: hidden;
  font-size: 24px;
  font-weight: 700;
  line-height: 1.1;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.cac__values {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-top: 4px;
}

.cac__metric + .cac__metric {
  margin-top: 6px;
}

.cac__value {
  font-size: 36px;
  font-weight: 700;
  line-height: 1;
  white-space: nowrap;
}

.cac__value--combined {
  font-size: 34px;
}

.cac__label {
  margin-top: 3px;
  font-size: 13px;
  line-height: 1.15;
  white-space: nowrap;
}

.cac--error {
  color: #ff6565;
  font-size: 18px;
}

.cac__warning {
  margin-top: 8px;
  font-size: 13px;
  line-height: 1.2;
  text-align: left;
}

@media (max-width: 700px) {
  .cac__grid {
    gap: 6px;
  }

  .cac__title {
    font-size: 22px;
  }

  .cac__value,
  .cac__value--combined {
    font-size: 32px;
  }
}
~~~~

### Nachher

~~~~css
.cac {
  width: 100%;
}

.cac__grid {
  display: grid;
  grid-template-columns: repeat(
    auto-fit,
    minmax(min(100%, var(--cac-min-column-width, 220px)), 1fr)
  );
  gap: 8px;
  align-items: start;
}

.cac__card {
  min-width: 0;
  text-align: center;
}

.cac__title {
  overflow: hidden;
  font-size: 24px;
  font-weight: 700;
  line-height: 1.1;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.cac__values {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-top: 4px;
}

.cac__metric + .cac__metric {
  margin-top: 6px;
}

.cac__value {
  font-size: 36px;
  font-weight: 700;
  line-height: 1;
  white-space: nowrap;
}

.cac__value--combined {
  font-size: 34px;
}

.cac__label {
  margin-top: 3px;
  font-size: 13px;
  line-height: 1.15;
  white-space: nowrap;
}

.cac--error {
  color: #ff6565;
  font-size: 18px;
}

.cac__warning {
  margin-top: 8px;
  font-size: 13px;
  line-height: 1.2;
  text-align: left;
}

/* Shared maintenance notices sit below the grid and remain deliberately smaller
 * than countdown labels so an update warning does not dominate mirror content. */
.cac__source-health {
  margin-top: 8px;
  font-size: 11px;
  line-height: 1.25;
  text-align: left;
}

@media (max-width: 700px) {
  .cac__grid {
    gap: 6px;
  }

  .cac__title {
    font-size: 22px;
  }

  .cac__value,
  .cac__value--combined {
    font-size: 32px;
  }
}

~~~~



## MMM-CalendarAwareCountdown.js

Konkrete Notwendigkeit: Die Oberfläche muss Quellenstatus empfangen, nach Relevanz filtern und bei Handlungsbedarf in der Fußzeile anzeigen; die verlangten Funktions- und Ablaufkommentare wurden ergänzt.

Abgrenzung: Nicht durch diesen Grund erforderliche fachliche Abläufe und öffentliche Schnittstellen dieser Datei wurden nicht umgebaut.

### Vorher

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
    updateInterval: 60 * 60 * 1000,
    animationSpeed: 500
  },

  getStyles() {
    return ["MMM-CalendarAwareCountdown.css"];
  },

  getTranslations() {
    return {
      de: "translations/de.json",
      en: "translations/en.json"
    };
  },

  start() {
    this.result = null;
    this.error = null;
    this.requestData();
    this.scheduleTimers();
  },

  scheduleTimers() {
    clearInterval(this.refreshTimer);
    clearInterval(this.clockTimer);
    this.refreshTimer = setInterval(() => this.requestData(), this.config.updateInterval);
    this.clockTimer = setInterval(() => {
      if (this.hasDuration()) this.updateDom(0);
    }, 1000);
  },

  suspend() {
    clearInterval(this.refreshTimer);
    clearInterval(this.clockTimer);
    this.refreshTimer = null;
    this.clockTimer = null;
  },

  resume() {
    this.requestData();
    this.scheduleTimers();
  },

  requestData() {
    this.sendSocketNotification("CAC_CONFIG", {
      identifier: this.identifier,
      config: this.config
    });
  },

  socketNotificationReceived(notification, payload) {
    if (!payload || payload.identifier !== this.identifier) return;

    if (notification === "CAC_DATA") {
      this.result = payload;
      this.error = null;
      this.updateDom(this.config.animationSpeed);
    } else if (notification === "CAC_ERROR") {
      this.error = payload.message;
      this.updateDom(this.config.animationSpeed);
    }
  },

  hasDuration() {
    return Boolean(
      this.result?.countdowns.some((countdown) =>
        countdown.calculations.some((calculation) => calculation.type === "duration")
      )
    );
  },

  metricLabel(calculation) {
    if (calculation.label) return calculation.label;
    if (calculation.type === "calendarDays") return this.translate("CALENDAR_DAYS");
    if (calculation.type === "workdays") return this.translate("WORKDAYS");
    if (
      calculation.type === "weekday" &&
      calculation.daysOfWeek?.length === 1 &&
      calculation.daysOfWeek[0] === 1
    ) {
      return this.translate("MONDAYS");
    }
    if (calculation.type === "weekday") return this.translate("WEEKDAYS");
    return "";
  },

  sourceDiagnosticText(diagnostic) {
    const location = diagnostic.location ?? {};
    const fallback = location.state ?? location.country ?? "?";
    return `${this.translate("LOCATION_FALLBACK")} ${location.municipality ?? "?"} → ${fallback}`;
  },

  formatDuration(targetEpoch, showSeconds) {
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
    if (showSeconds) parts.push(`${seconds} ${this.translate("SECONDS_SHORT")}`);
    return parts.join(" ");
  },

  getDom() {
    const wrapper = document.createElement("div");
    wrapper.className = "cac";

    if (this.error) {
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

    return wrapper;
  }
});
~~~~

### Nachher

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



## NOTICE.md

Konkrete Notwendigkeit: Herkunft, Prüfgrenzen und kontrollierter Aktualisierungsweg der amtlichen Gemeindedaten müssen bei der Datenattribution nachvollziehbar sein.

Abgrenzung: Nicht durch diesen Grund erforderliche fachliche Abläufe und öffentliche Schnittstellen dieser Datei wurden nicht umgebaut.

### Vorher

~~~~markdown
# Data notice

`data/DE-BY-municipalities.json` contains a derived mapping of Bavarian
municipalities used to select the local rules for Assumption Day and the Augsburg
Peace Festival.

Source: Bayerisches Landesamt für Statistik, "Mariä Himmelfahrt" municipality
database:

<https://www.statistik.bayern.de/statistik/gebiet_bevoelkerung/zensus/himmelfahrt/>

The mapping is based on the 2022 census and has applied since 2025. The source
URL and generation timestamp are also recorded inside the generated JSON file.

The project code is distributed under the MIT license. Third-party dependencies
and source data remain subject to their respective terms.
~~~~

### Nachher

~~~~markdown
# Data notice

`data/DE-BY-municipalities.json` contains a derived mapping of Bavarian
municipalities used to select the local rules for Assumption Day and the Augsburg
Peace Festival.

Source: Bayerisches Landesamt für Statistik, "Mariä Himmelfahrt" municipality
database:

<https://www.statistik.bayern.de/statistik/gebiet_bevoelkerung/zensus/himmelfahrt/>

The mapping is based on the 2022 census and has applied since 2025. The source
URL and generation timestamp are also recorded inside the generated JSON file.
The source is checked monthly against the bundled mapping. Because the authority
publishes an HTML database rather than a versioned API, the importer requires all
2,056 unique and structurally valid municipality records before it accepts a
download. A detected difference requires review and a new module release; the
running module never overwrites this legal mapping silently.

The project code is distributed under the MIT license. Third-party dependencies
and source data remain subject to their respective terms.

~~~~



## README.md

Konkrete Notwendigkeit: Die gewünschte ausführliche Erklärung zu Berechnung, bayerischer Sonderrolle, Quellenvertrag, Zuverlässigkeit und Aktualisierungszyklus wird dauerhaft in der Projektdokumentation festgehalten.

Abgrenzung: Nicht durch diesen Grund erforderliche fachliche Abläufe und öffentliche Schnittstellen dieser Datei wurden nicht umgebaut.

### Vorher

~~~~markdown
# MMM-CalendarAwareCountdown

A calendar-aware multi-countdown module for MagicMirror². It can show calendar
days, regional working days, selected weekdays, and a live duration while taking
public holidays and personal days off into account.

Version 1.0 is the first stable release. The calculation rules and configuration
keys documented below are the supported V1 interface.

## Features

- Multiple countdowns in a responsive grid
- Calendar-day calculation based on local dates
- Working days based on a configurable working week
- Worldwide country-level and available subdivision holidays through `date-holidays`
- Municipality-aware Bavarian holidays from official local data
- Global and countdown-specific days off as dates or date ranges
- Counts selected weekdays, for example Mondays
- Live days/hours/minutes/seconds display
- German and English labels
- No external web service required

## Installation

From the MagicMirror `modules` directory:

```sh
git clone https://github.com/YOUR-GITHUB-ACCOUNT/MMM-CalendarAwareCountdown.git
cd MMM-CalendarAwareCountdown
npm ci --omit=dev
```

Replace `YOUR-GITHUB-ACCOUNT` with the repository owner after publishing. Restart
MagicMirror after adding the module to `config/config.js`.

## Example configuration

```js
{
  module: "MMM-CalendarAwareCountdown",
  position: "top_center",
  header: "Upcoming events",
  config: {
    language: "en",
    location: {
      timeZone: "Europe/Berlin",
      country: "DE",
      state: "BE",
      municipality: null
    },
    holidaySources: [
      {
        provider: "date-holidays",
        types: ["public"],
        onUnsupportedLocation: "warn"
      }
    ],
    minimumColumnWidth: "140px",

    customDaysOff: [
      "2030-05-10",
      { start: "2030-08-05", end: "2030-08-09", label: "Vacation" }
    ],

    countdowns: [
      {
        id: "conference",
        title: "Conference",
        target: "2030-09-15",
        calculations: ["calendarDays"]
      },
      {
        id: "anniversary",
        title: "Anniversary",
        target: "2030-10-20",
        calculations: ["calendarDays"]
      },
      {
        id: "project-launch",
        title: "Project launch",
        target: "2030-12-01",
        daysOff: [
          { start: "2030-11-04", end: "2030-11-05", label: "Project only" }
        ],
        calculations: ["calendarDays", "workdays"]
      }
    ]
  }
}
```

With two number-based calculations, the automatic presentation uses a combined
value such as `120 / 78`. Set `display: "separate"` on a countdown to put the
values on separate lines.

The grid creates as many equal-width columns as the available MagicMirror region
can hold. Further countdowns wrap into a new row. `minimumColumnWidth` controls
when wrapping occurs; there is no fixed column count.

## Counting convention

The module counts the interval **including today but excluding the target date**,
written mathematically as `[today, target)`. This produces the
same familiar result as the difference between two calendar dates. For example,
2030-01-01 to 2030-01-31 is 30 calendar days.

Working days use the same interval and remove:

1. days outside `workWeekdays`,
2. public holidays for the configured country/state/region,
3. dates in the global `customDaysOff`,
4. dates in the countdown's own `daysOff`.

All days off are whole calendar days. On the target date a countdown shows `0`.
After the target date it remains visible and shows `-`.

### Days off and inclusive ranges

Use a date string for one free day and an object for a range:

```js
customDaysOff: [
  "2027-01-04",
  { start: "2027-05-03", end: "2027-05-10", label: "Vacation" }
]
```

Both `start` and `end` are included. The example range therefore expands to all
calendar dates from May 3 through May 10, including both dates. Expansion does
not mean that every expanded date is subtracted from a working-day result. A
date reduces `workdays` only when all of the following are true:

1. it lies inside `[today, target)`,
2. it is one of the configured `workWeekdays`,
3. it is not already a public holiday,
4. it has not already been supplied by another overlapping day-off entry.

This prevents double subtraction. For a Monday-to-Friday work week, weekends in
a vacation range have no effect. If a vacation date is also a public holiday, it
has already been removed and is not removed a second time. A range beginning on
the target date has no effect because the target date is excluded.

Global `customDaysOff` apply to every countdown. A countdown's own `daysOff`
apply only to that countdown. Both lists use the same string and inclusive-range
formats, and their dates are merged without duplicates.

A `weekday` calculation counts the selected weekdays regardless of holidays by
default. Set `excludeHolidays` or `excludeCustomDaysOff` to `true` when it should
only count usable days.

## Main configuration

| Option | Default | Meaning |
| --- | --- | --- |
| `language` | `de` | Language for module and holiday data |
| `location` | see example | Shared location used by holiday sources |
| `holidaySources` | `date-holidays` | One or more holiday-data providers |
| `workWeekdays` | `[1,2,3,4,5]` | ISO weekdays; Monday is 1, Sunday is 7 |
| `customDaysOff` | `[]` | Personal dates and inclusive date ranges |
| `minimumColumnWidth` | `220px` | Minimum width before equal columns wrap |
| `showMetricLabels` | `true` | Show labels below values |
| `showSourceWarnings` | `true` | Show a visible warning after a location fallback |
| `updateInterval` | `3600000` | Full recalculation interval in milliseconds |
| `animationSpeed` | `500` | MagicMirror DOM update animation in milliseconds |

### Countdown configuration

| Option | Default | Meaning |
| --- | --- | --- |
| `id` | title | Stable identifier for the countdown |
| `title` | required | Heading shown above the value |
| `target` | required | `YYYY-MM-DD` or an ISO timestamp for `duration` |
| `calculations` | `["calendarDays"]` | One or more calculation definitions |
| `daysOff` | `[]` | Dates and inclusive ranges used only by this countdown |
| `display` | `auto` | `auto` combines two numeric values; `separate` uses rows |

### Location

| Option | Meaning |
| --- | --- |
| `timeZone` | IANA time zone used to determine the current local date |
| `country` | ISO 3166-1 alpha-2 country code |
| `state` | Optional country subdivision code |
| `municipality` | Optional municipality name for finer local rules |
| `municipalityCode` | Optional official code if a municipality name is ambiguous |

### Holiday sources and coverage

Version 1 has the following explicit support promise:

- country-level holiday calculation for every country available in
  [`date-holidays`](https://github.com/commenthol/date-holidays), currently more
  than 200 countries,
- state/province/canton/region calculation wherever that provider supplies the
  subdivision,
- municipality-level calculation where this module has a dedicated local
  resolver, initially all Bavarian municipalities,
- manual correction or extension through global `customDaysOff` and per-countdown
  `daysOff`.

Holiday calculation is provider-based. Version 1 contains the following sources:

| Provider | Network | Coverage |
| --- | --- | --- |
| `date-holidays` | No | Countries and the subdivisions/regions supplied by the library |
| `none` | No | Disables automatic public holidays |

The module does not claim municipality precision where the provider has none. Every source
reports whether it used country, state, region, or municipality data. If a
requested municipality cannot be resolved, `onUnsupportedLocation` controls the
behavior:

- `warn` (default): use state/country rules and show a warning
- `error`: stop the calculation rather than use less precise data
- `silent`: use state/country rules without displaying a warning

An advanced `region` value can be set on the individual source when the provider
has a regional code but no automatic municipality resolver.

The provider boundary deliberately allows later adapters for a web API or iCalendar
feed without changing countdown calculations. A generic arbitrary-JSON endpoint is
not accepted: each provider needs a defined schema, validation, caching, and a clear
fallback policy.

## Calculation types

| Type | Result |
| --- | --- |
| `calendarDays` | Local calendar days until the target |
| `workdays` | Configured workdays minus public holidays and personal days off |
| `weekday` | Occurrences of selected ISO weekdays |
| `duration` | Live duration to an exact timestamp |

For `duration`, an ISO timestamp with UTC offset is recommended, for example
`2027-08-14T06:00:00+02:00`. This makes the intended instant unambiguous.

## Bavarian municipality data

The bundled municipality mapping determines whether Assumption Day is a public
holiday and handles the Augsburg Peace Festival separately. It is generated from
the Bavarian State Office for Statistics list based on the 2022 census, applicable
since 2025. Runtime calculations remain completely local.

Maintainers can refresh the checked-in data with:

```sh
npm run update:bavaria-municipalities
```

## Development

The calculation code is deliberately independent from MagicMirror:

```sh
npm test
```

This makes date rules testable without starting MagicMirror or a browser.

Before a release, run:

```sh
npm ci
npm run check
npm pack --dry-run
```

V1 was tested with MagicMirror² 2.38.0 and Node.js 24 on Raspberry Pi. The
package requires Node.js 22 or newer.

## Data attribution

The bundled Bavarian municipality mapping is derived from data published by the
Bavarian State Office for Statistics. See [`NOTICE.md`](NOTICE.md) for the exact
source and scope. Third-party JavaScript dependencies retain their own licenses.

## License

MIT
~~~~

### Nachher

~~~~markdown
# MMM-CalendarAwareCountdown

A calendar-aware multi-countdown module for MagicMirror². It can show calendar
days, regional working days, selected weekdays, and a live duration while taking
public holidays and personal days off into account.

Version 1.0 is the first stable release. The calculation rules and configuration
keys documented below are the supported V1 interface.

## Features

- Multiple countdowns in a responsive grid
- Calendar-day calculation based on local dates
- Working days based on a configurable working week
- Worldwide country-level and available subdivision holidays through `date-holidays`
- Municipality-aware Bavarian holidays from official local data
- Global and countdown-specific days off as dates or date ranges
- Counts selected weekdays, for example Mondays
- Live days/hours/minutes/seconds display
- German and English labels
- Offline countdown calculation; optional monthly online source-health checks

## Installation

From the MagicMirror `modules` directory:

```sh
git clone https://github.com/YOUR-GITHUB-ACCOUNT/MMM-CalendarAwareCountdown.git
cd MMM-CalendarAwareCountdown
npm ci --omit=dev
```

Replace `YOUR-GITHUB-ACCOUNT` with the repository owner after publishing. Restart
MagicMirror after adding the module to `config/config.js`.

## Example configuration

```js
{
  module: "MMM-CalendarAwareCountdown",
  position: "top_center",
  header: "Upcoming events",
  config: {
    language: "en",
    location: {
      timeZone: "Europe/Berlin",
      country: "DE",
      state: "BE",
      municipality: null
    },
    holidaySources: [
      {
        provider: "date-holidays",
        types: ["public"],
        onUnsupportedLocation: "warn"
      }
    ],
    minimumColumnWidth: "140px",
    sourceHealth: {
      enabled: true,
      checkInterval: 30 * 24 * 60 * 60 * 1000,
      requestTimeout: 15000,
      repositoryStaleAfterDays: 365,
      showUnavailable: true
    },

    customDaysOff: [
      "2030-05-10",
      { start: "2030-08-05", end: "2030-08-09", label: "Vacation" }
    ],

    countdowns: [
      {
        id: "conference",
        title: "Conference",
        target: "2030-09-15",
        calculations: ["calendarDays"]
      },
      {
        id: "anniversary",
        title: "Anniversary",
        target: "2030-10-20",
        calculations: ["calendarDays"]
      },
      {
        id: "project-launch",
        title: "Project launch",
        target: "2030-12-01",
        daysOff: [
          { start: "2030-11-04", end: "2030-11-05", label: "Project only" }
        ],
        calculations: ["calendarDays", "workdays"]
      }
    ]
  }
}
```

With two number-based calculations, the automatic presentation uses a combined
value such as `120 / 78`. Set `display: "separate"` on a countdown to put the
values on separate lines.

The grid creates as many equal-width columns as the available MagicMirror region
can hold. Further countdowns wrap into a new row. `minimumColumnWidth` controls
when wrapping occurs; there is no fixed column count.

## Counting convention

The module counts the interval **including today but excluding the target date**,
written mathematically as `[today, target)`. This produces the
same familiar result as the difference between two calendar dates. For example,
2030-01-01 to 2030-01-31 is 30 calendar days.

Working days use the same interval and remove:

1. days outside `workWeekdays`,
2. public holidays for the configured country/state/region,
3. dates in the global `customDaysOff`,
4. dates in the countdown's own `daysOff`.

All days off are whole calendar days. On the target date a countdown shows `0`.
After the target date it remains visible and shows `-`.

### Days off and inclusive ranges

Use a date string for one free day and an object for a range:

```js
customDaysOff: [
  "2027-01-04",
  { start: "2027-05-03", end: "2027-05-10", label: "Vacation" }
]
```

Both `start` and `end` are included. The example range therefore expands to all
calendar dates from May 3 through May 10, including both dates. Expansion does
not mean that every expanded date is subtracted from a working-day result. A
date reduces `workdays` only when all of the following are true:

1. it lies inside `[today, target)`,
2. it is one of the configured `workWeekdays`,
3. it is not already a public holiday,
4. it has not already been supplied by another overlapping day-off entry.

This prevents double subtraction. For a Monday-to-Friday work week, weekends in
a vacation range have no effect. If a vacation date is also a public holiday, it
has already been removed and is not removed a second time. A range beginning on
the target date has no effect because the target date is excluded.

Global `customDaysOff` apply to every countdown. A countdown's own `daysOff`
apply only to that countdown. Both lists use the same string and inclusive-range
formats, and their dates are merged without duplicates.

A `weekday` calculation counts the selected weekdays regardless of holidays by
default. Set `excludeHolidays` or `excludeCustomDaysOff` to `true` when it should
only count usable days.

## Main configuration

| Option | Default | Meaning |
| --- | --- | --- |
| `language` | `de` | Language for module and holiday data |
| `location` | see example | Shared location used by holiday sources |
| `holidaySources` | `date-holidays` | One or more holiday-data providers |
| `workWeekdays` | `[1,2,3,4,5]` | ISO weekdays; Monday is 1, Sunday is 7 |
| `customDaysOff` | `[]` | Personal dates and inclusive date ranges |
| `minimumColumnWidth` | `220px` | Minimum width before equal columns wrap |
| `showMetricLabels` | `true` | Show labels below values |
| `showSourceWarnings` | `true` | Show a visible warning after a location fallback |
| `sourceHealth` | see below | Optional online maintenance checks; calculations remain local |
| `updateInterval` | `3600000` | Full recalculation interval in milliseconds |
| `animationSpeed` | `500` | MagicMirror DOM update animation in milliseconds |

### Countdown configuration

| Option | Default | Meaning |
| --- | --- | --- |
| `id` | title | Stable identifier for the countdown |
| `title` | required | Heading shown above the value |
| `target` | required | `YYYY-MM-DD` or an ISO timestamp for `duration` |
| `calculations` | `["calendarDays"]` | One or more calculation definitions |
| `daysOff` | `[]` | Dates and inclusive ranges used only by this countdown |
| `display` | `auto` | `auto` combines two numeric values; `separate` uses rows |

### Location

| Option | Meaning |
| --- | --- |
| `timeZone` | IANA time zone used to determine the current local date |
| `country` | ISO 3166-1 alpha-2 country code |
| `state` | Optional country subdivision code |
| `municipality` | Optional municipality name for finer local rules |
| `municipalityCode` | Optional official code if a municipality name is ambiguous |

### Holiday sources and coverage

Version 1 has the following explicit support promise:

- country-level holiday calculation for every country available in
  [`date-holidays`](https://github.com/commenthol/date-holidays), currently more
  than 200 countries,
- state/province/canton/region calculation wherever that provider supplies the
  subdivision,
- municipality-level calculation where this module has a dedicated local
  resolver, initially all Bavarian municipalities,
- manual correction or extension through global `customDaysOff` and per-countdown
  `daysOff`.

Holiday calculation is provider-based. Version 1 contains the following sources:

| Provider | Network | Coverage |
| --- | --- | --- |
| `date-holidays` | No | Countries and the subdivisions/regions supplied by the library |
| `none` | No | Disables automatic public holidays |

The module does not claim municipality precision where the provider has none. Every source
reports whether it used country, state, region, or municipality data. If a
requested municipality cannot be resolved, `onUnsupportedLocation` controls the
behavior:

- `warn` (default): use state/country rules and show a warning
- `error`: stop the calculation rather than use less precise data
- `silent`: use state/country rules without displaying a warning

An advanced `region` value can be set on the individual source when the provider
has a regional code but no automatic municipality resolver.

The provider boundary deliberately allows later adapters for a web API or iCalendar
feed without changing countdown calculations. A generic arbitrary-JSON endpoint is
not accepted: each provider needs a defined schema, validation, caching, and a clear
fallback policy.

### Internal provider contract

Holiday providers do not pass their native response directly into countdown
calculation. Every adapter must return the following normalized structure:

```js
{
  dates: new Set(["2030-01-01", "2030-12-25"]),
  report: {
    provider: "provider-name",
    coverage: "country", // country, state, region, municipality, or none
    status: "exact",     // exact or fallback
    diagnostics: []
  }
}
```

`dates` may contain only validated local dates in `YYYY-MM-DD` format. Multiple
providers are combined as a set, so the same holiday is never subtracted twice.
`report` explains the actual geographic precision and any fallback. This is the
fixed internal format into which another data source can be integrated. A new
web API, iCalendar feed, or national library therefore needs a small adapter that
validates its native data and produces this contract; the countdown algorithms
and display do not need to know the original source format.

## How holiday and working-day calculation works

The complete calculation is intentionally split into four explicit stages:

1. `location-resolver.js` resolves the configured country, state, and optional
   municipality into the best supported holiday region. It also reports whether
   the result is exact or a documented fallback.
2. `holiday-sources.js` asks each configured provider for all years covered by
   the active countdowns and normalizes the results to a set of date keys.
3. `countdown-calculator.js` iterates over `[today, target)`. A date counts as a
   working day only when its ISO weekday is in `workWeekdays`, it is not in the
   public-holiday set, and it is not in the merged global/per-countdown day-off
   set.
4. The browser receives only calculated values and diagnostics. It does not
   reproduce holiday rules and cannot accidentally calculate them differently.

`date-holidays` is installed locally at the exact version recorded in
`package-lock.json`. Normal countdown operation therefore does not call a web
service and keeps working without internet access. The separate source-health
check described below never changes a result during a calculation.

## Calculation types

| Type | Result |
| --- | --- |
| `calendarDays` | Local calendar days until the target |
| `workdays` | Configured workdays minus public holidays and personal days off |
| `weekday` | Occurrences of selected ISO weekdays |
| `duration` | Live duration to an exact timestamp |

For `duration`, an ISO timestamp with UTC offset is recommended, for example
`2027-08-14T06:00:00+02:00`. This makes the intended instant unambiguous.

## Bavarian municipality data

The special Bavarian handling is deliberately small and traceable:

- Germany/Bavaria without a municipality uses the normal Bavarian state rules
  from `date-holidays`.
- With a municipality, `location-resolver.js` looks up its official eight-digit
  code and Assumption Day status in `data/DE-BY-municipalities.json`.
- Code `09761000` (Augsburg) selects the provider region `A`, which includes the
  Augsburg Peace Festival on August 8.
- Every other municipality selects `KATH` when the official mapping marks
  Assumption Day as a holiday, otherwise `EVANG`.

This is not a hand-maintained list of local holidays. The mapping is generated
from the [Bavarian State Office for Statistics municipality database](https://www.statistik.bayern.de/statistik/gebiet_bevoelkerung/zensus/himmelfahrt/).
Under [Article 1 of the Bavarian Public Holidays Act](https://www.gesetze-bayern.de/Content/Document/BayFTG-1),
that office determines the affected municipalities from the latest census;
Augsburg's Peace Festival is specified separately by the same law. The current
official page states that the Census 2022 classification applies from August 15,
2025.

The authority page is a reliable primary source, but it is an HTML database page,
not a versioned programming interface. The importer therefore fails closed: it
accepts the download only when all 2,056 municipality records are present, all
official codes are unique, and every required field is valid. A changed page
layout causes a visible source-check failure instead of silently replacing good
data with an incomplete list. Runtime calculations use only the validated data
bundled with the released module.

Maintainers can refresh the checked-in data with:

```sh
npm run update:bavaria-municipalities
```

The generated file records its exact source URL, legal/data basis, and generation
timestamp. `NOTICE.md` contains the attribution.

## Source updates and monthly maintenance

There are two different operations, and V1 keeps them separate on purpose:

1. **Fetch and verify:** retrieve current source metadata/data, validate it, and
   compare it with the installed release.
2. **Install an update:** change a dependency or bundled municipality file,
   rerun tests, review the result, and publish/deploy a new module release.

The first operation is automated. The second is not performed silently on a
running mirror because upstream code or changed legal data could otherwise alter
results without tests, review, or a rollback point.

### Checks performed by the running module

With `sourceHealth.enabled: true` (the default), the Node helper performs these
online checks at most every 30 days and stores the result in
`.cache/source-health.json`:

- compare the pinned `date-holidays` version with npm's current release,
- verify through the GitHub repository metadata that the upstream repository is
  neither archived nor disabled, and warn when its last push is older than
  `repositoryStaleAfterDays`,
- download the official Bavarian municipality table, validate all invariants,
  and compare calculation-relevant fields with the bundled mapping.

Only an available update, an invalid/stale source, or an unavailable check is
shown in a small footer below the countdowns. Healthy sources stay invisible.
The runtime footer also filters by the active configuration: Bavarian municipality
data is shown only for a configured Bavarian municipality, and `date-holidays`
messages are shown only when that provider is enabled.
An unavailable or invalid verification source does not invalidate locally
calculated countdowns. “Unavailable” means freshness could not be checked because
of a transport/HTTP failure; “invalid” means a reachable response did not satisfy
the expected schema or completeness checks. Failed network checks are retried
after one day rather than being cached for a full month.

| `sourceHealth` option | Default | Meaning |
| --- | --- | --- |
| `enabled` | `true` | Enable the optional online maintenance check |
| `checkInterval` | `2592000000` | Healthy-result cache duration (30 days) |
| `requestTimeout` | `15000` | Maximum wait per HTTPS request in milliseconds |
| `repositoryStaleAfterDays` | `365` | Warn after this many days without an upstream push |
| `showUnavailable` | `true` | Show a footer when a source could not be checked |

Set `enabled: false` for a fully offline installation. This disables freshness
notices only; all holiday and countdown calculations still use local released
data in either mode.

### Checks performed by the GitHub repository

`.github/workflows/monthly-source-check.yml` runs on the first day of every month
and can also be started manually. It installs the exact lockfile, runs all tests,
and executes:

```sh
npm run check:sources
```

The job fails on every source state requiring review, allowing normal GitHub
Actions notifications to alert maintainers. `.github/dependabot.yml` separately
opens a monthly pull request when npm dependencies have updates. Neither mechanism
commits municipality data or publishes a release automatically.

A responsible source update is therefore:

1. review the failed check or Dependabot pull request,
2. for municipality changes run `npm run update:bavaria-municipalities`,
3. review the exact data difference and its official basis,
4. run `npm ci`, `npm run check`, and `npm run check:sources`,
5. publish and deploy a new tagged release.

This cycle checks both whether data changed and whether the principal dependency
still appears maintained. It cannot guarantee future maintenance by a third
party; an archived/disabled or unusually inactive repository is made visible so
the maintainer can replace the provider deliberately.

## Development

The calculation code is deliberately independent from MagicMirror:

```sh
npm test
```

This makes date rules testable without starting MagicMirror or a browser.

Before a release, run:

```sh
npm ci
npm run check
npm pack --dry-run
```

V1 was tested with MagicMirror² 2.38.0 and Node.js 24 on Raspberry Pi. The
package requires Node.js 22 or newer.

## Data attribution

The bundled Bavarian municipality mapping is derived from data published by the
Bavarian State Office for Statistics. See [`NOTICE.md`](NOTICE.md) for the exact
source and scope. Third-party JavaScript dependencies retain their own licenses.

## License

MIT

~~~~



## lib/config-validator.js

Konkrete Notwendigkeit: Die neue `sourceHealth`-Konfiguration braucht sichere Grenzen und muss auch bei einer flachen MagicMirror-Zusammenführung partielle Unteroptionen erlauben; alle Funktionen erhielten die angeforderten Dokumentationsköpfe und Ablaufkommentare.

Abgrenzung: Nicht durch diesen Grund erforderliche fachliche Abläufe und öffentliche Schnittstellen dieser Datei wurden nicht umgebaut.

### Vorher

~~~~js
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

function validateIsoWeekdays(value, fieldName) {
  if (!Array.isArray(value) || value.length === 0) {
    throw new TypeError(`${fieldName} must be a non-empty array`);
  }
  if (value.some((day) => !Number.isInteger(day) || day < 1 || day > 7)) {
    throw new RangeError(`${fieldName} must only contain ISO weekdays 1 through 7`);
  }
  if (new Set(value).size !== value.length) {
    throw new RangeError(`${fieldName} must not contain duplicate weekdays`);
  }
}

function validateTimeZone(timeZone) {
  if (typeof timeZone !== "string" || !timeZone) {
    throw new TypeError("location.timeZone must be an IANA time-zone name");
  }
  try {
    new Intl.DateTimeFormat("en", { timeZone }).format();
  } catch {
    throw new RangeError(`Unknown IANA time zone: ${timeZone}`);
  }
}

function validateCalculation(calculation, countdownTitle) {
  const options = typeof calculation === "string" ? {} : calculation;
  const type = typeof calculation === "string" ? calculation : calculation?.type;
  if (!CALCULATION_TYPES.has(type)) {
    throw new RangeError(`Unknown calculation type in "${countdownTitle}": ${type}`);
  }
  if (type === "weekday" && options.daysOfWeek !== undefined) {
    validateIsoWeekdays(options.daysOfWeek, `daysOfWeek in "${countdownTitle}"`);
  }
}

function validateCountdown(countdown) {
  if (!countdown || typeof countdown !== "object" || Array.isArray(countdown)) {
    throw new TypeError("Every countdown must be an object");
  }
  if (typeof countdown.title !== "string" || !countdown.title.trim()) {
    throw new TypeError("Every countdown needs a non-empty title");
  }
  if (typeof countdown.target !== "string") {
    throw new TypeError(`Countdown "${countdown.title}" needs a target`);
  }
  parseDateKey(countdown.target.slice(0, 10), `target of "${countdown.title}"`);
  if (countdown.target.length > 10 && !Number.isFinite(Date.parse(countdown.target))) {
    throw new RangeError(`Target of "${countdown.title}" is not a valid timestamp`);
  }

  const calculations = countdown.calculations ?? ["calendarDays"];
  if (!Array.isArray(calculations) || calculations.length === 0) {
    throw new TypeError(`calculations in "${countdown.title}" must be a non-empty array`);
  }
  calculations.forEach((calculation) =>
    validateCalculation(calculation, countdown.title)
  );

  if (countdown.daysOff !== undefined && !Array.isArray(countdown.daysOff)) {
    throw new TypeError(`daysOff in "${countdown.title}" must be an array`);
  }
  normalizeCustomDaysOff(countdown.daysOff ?? []);

  if (![undefined, "auto", "separate"].includes(countdown.display)) {
    throw new RangeError(`display in "${countdown.title}" must be "auto" or "separate"`);
  }
}

function validateConfig(config) {
  if (!config || typeof config !== "object" || Array.isArray(config)) {
    throw new TypeError("config must be an object");
  }
  if (!config.location || typeof config.location !== "object") {
    throw new TypeError("config.location must be an object");
  }

  validateTimeZone(config.location.timeZone);
  if (
    typeof config.location.country !== "string" ||
    !/^[A-Za-z]{2}$/.test(config.location.country)
  ) {
    throw new TypeError("location.country must be a two-letter ISO country code");
  }
  if (
    config.location.municipality !== null &&
    config.location.municipality !== undefined &&
    typeof config.location.municipality !== "string"
  ) {
    throw new TypeError("location.municipality must be a string");
  }

  validateIsoWeekdays(config.workWeekdays, "workWeekdays");

  if (!Array.isArray(config.customDaysOff)) {
    throw new TypeError("customDaysOff must be an array");
  }
  normalizeCustomDaysOff(config.customDaysOff);

  if (!Array.isArray(config.holidaySources) || config.holidaySources.length === 0) {
    throw new TypeError("holidaySources must contain at least one provider");
  }
  for (const source of config.holidaySources) {
    if (!source || typeof source !== "object" || !HOLIDAY_PROVIDERS.has(source.provider)) {
      throw new RangeError(`Unknown holiday provider: ${source?.provider}`);
    }
    if (
      source.onUnsupportedLocation !== undefined &&
      !FALLBACK_POLICIES.has(source.onUnsupportedLocation)
    ) {
      throw new RangeError(
        `Unknown onUnsupportedLocation policy: ${source.onUnsupportedLocation}`
      );
    }
  }

  if (!Array.isArray(config.countdowns) || config.countdowns.length === 0) {
    throw new RangeError("config.countdowns must contain at least one countdown");
  }
  config.countdowns.forEach(validateCountdown);

  if (
    typeof config.updateInterval !== "number" ||
    !Number.isFinite(config.updateInterval) ||
    config.updateInterval < 1000
  ) {
    throw new RangeError("updateInterval must be at least 1000 milliseconds");
  }

  const minimumColumnWidth = config.minimumColumnWidth;
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
  validateTimeZone
};
~~~~

### Nachher

~~~~js
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

~~~~



## lib/countdown-calculator.js

Konkrete Notwendigkeit: Die bestehende, unveränderte Zähllogik musste für menschliche Leser vollständig hinsichtlich Intervall, Zeitzone, Inklusivität und Doppelzählung dokumentiert werden.

Abgrenzung: Nicht durch diesen Grund erforderliche fachliche Abläufe und öffentliche Schnittstellen dieser Datei wurden nicht umgebaut.

### Vorher

~~~~js
"use strict";

const DAY_IN_MS = 24 * 60 * 60 * 1000;
const DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

function parseDateKey(value, fieldName = "date") {
  if (typeof value !== "string" || !DATE_PATTERN.test(value)) {
    throw new TypeError(`${fieldName} must use YYYY-MM-DD format`);
  }

  const [, yearText, monthText, dayText] = value.match(DATE_PATTERN);
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  const date = new Date(Date.UTC(year, month - 1, day));

  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    throw new RangeError(`${fieldName} is not a valid calendar date`);
  }

  return { year, month, day };
}

function dateKeyToOrdinal(dateKey) {
  const { year, month, day } = parseDateKey(dateKey);
  return Math.floor(Date.UTC(year, month - 1, day) / DAY_IN_MS);
}

function ordinalToDateKey(ordinal) {
  return new Date(ordinal * DAY_IN_MS).toISOString().slice(0, 10);
}

function isoWeekday(dateKey) {
  const weekday = new Date(dateKeyToOrdinal(dateKey) * DAY_IN_MS).getUTCDay();
  return weekday === 0 ? 7 : weekday;
}

function dateKeyInTimeZone(date, timeZone) {
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
  return `${parts.year}-${parts.month}-${parts.day}`;
}

function normalizeCustomDaysOff(entries = []) {
  const result = new Set();

  for (const entry of entries) {
    if (typeof entry === "string") {
      parseDateKey(entry, "customDaysOff entry");
      result.add(entry);
      continue;
    }

    if (!entry || typeof entry !== "object") {
      throw new TypeError("customDaysOff entries must be dates or date ranges");
    }

    const start = dateKeyToOrdinal(entry.start);
    const end = dateKeyToOrdinal(entry.end ?? entry.start);
    if (end < start) {
      throw new RangeError("customDaysOff range end must not precede start");
    }

    for (let ordinal = start; ordinal <= end; ordinal += 1) {
      result.add(ordinalToDateKey(ordinal));
    }
  }

  return result;
}

function countMatchingDays(startDate, targetDate, predicate) {
  const start = dateKeyToOrdinal(startDate);
  const target = dateKeyToOrdinal(targetDate);
  if (start === target) return 0;

  let count = 0;
  if (target > start) {
    for (let ordinal = start; ordinal < target; ordinal += 1) {
      if (predicate(ordinalToDateKey(ordinal))) count += 1;
    }
  } else {
    for (let ordinal = target; ordinal < start; ordinal += 1) {
      if (predicate(ordinalToDateKey(ordinal))) count -= 1;
    }
  }
  return count;
}

function calculateMetric(metric, context) {
  const type = typeof metric === "string" ? metric : metric.type;
  const options = typeof metric === "string" ? {} : metric;
  const { today, targetDate, holidays, customDaysOff, workWeekdays } = context;

  switch (type) {
    case "calendarDays":
      return dateKeyToOrdinal(targetDate) - dateKeyToOrdinal(today);

    case "workdays":
      return countMatchingDays(today, targetDate, (dateKey) => {
        return (
          workWeekdays.has(isoWeekday(dateKey)) &&
          !holidays.has(dateKey) &&
          !customDaysOff.has(dateKey)
        );
      });

    case "weekday": {
      const daysOfWeek = new Set(options.daysOfWeek ?? [1]);
      return countMatchingDays(today, targetDate, (dateKey) => {
        if (!daysOfWeek.has(isoWeekday(dateKey))) return false;
        if (options.excludeHolidays && holidays.has(dateKey)) return false;
        if (options.excludeCustomDaysOff && customDaysOff.has(dateKey)) return false;
        return true;
      });
    }

    case "duration":
      return context.targetEpoch - context.nowEpoch;

    default:
      throw new RangeError(`Unknown calculation type: ${type}`);
  }
}

function calculateCountdown(countdown, context) {
  if (!countdown || typeof countdown !== "object") {
    throw new TypeError("Every countdown must be an object");
  }
  if (!countdown.title || typeof countdown.title !== "string") {
    throw new TypeError("Every countdown needs a title");
  }
  if (!countdown.target || typeof countdown.target !== "string") {
    throw new TypeError(`Countdown "${countdown.title}" needs a target`);
  }

  const targetDate = countdown.target.slice(0, 10);
  parseDateKey(targetDate, `target of "${countdown.title}"`);
  const targetEpoch = new Date(
    DATE_PATTERN.test(countdown.target)
      ? `${countdown.target}T00:00:00`
      : countdown.target
  ).getTime();
  if (!Number.isFinite(targetEpoch)) {
    throw new RangeError(`Target of "${countdown.title}" is invalid`);
  }

  const countdownDaysOff = normalizeCustomDaysOff(countdown.daysOff ?? []);
  const calculationContext = {
    ...context,
    targetDate,
    targetEpoch,
    customDaysOff: new Set([...context.customDaysOff, ...countdownDaysOff])
  };
  const calculations = countdown.calculations ?? ["calendarDays"];

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
~~~~

### Nachher

~~~~js
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

~~~~



## lib/holiday-sources.js

Konkrete Notwendigkeit: Der feste interne Quellenvertrag und die unveränderte Zusammenführung der Feiertagsmengen mussten direkt an den ausführenden Funktionen dokumentiert werden.

Abgrenzung: Nicht durch diesen Grund erforderliche fachliche Abläufe und öffentliche Schnittstellen dieser Datei wurden nicht umgebaut.

### Vorher

~~~~js
"use strict";

const Holidays = require("date-holidays");
const { resolveHolidayLocation } = require("./location-resolver");

function yearsInRange(startDate, targetDates) {
  const years = targetDates.map((date) => Number(date.slice(0, 4)));
  years.push(Number(startDate.slice(0, 4)));
  const minimum = Math.min(...years);
  const maximum = Math.max(...years);
  return Array.from({ length: maximum - minimum + 1 }, (_, index) => minimum + index);
}

function loadDateHolidays(source, settings, years) {
  const resolution = resolveHolidayLocation(settings.location, source);
  const provider = new Holidays();
  const options = {
    languages: [settings.language],
    timezone: settings.location.timeZone,
    types: source.types ?? ["public"]
  };

  let initialized;
  if (resolution.holidayRegion) {
    initialized = provider.init(
      settings.location.country,
      settings.location.state,
      resolution.holidayRegion,
      options
    );
  } else if (settings.location.state) {
    initialized = provider.init(
      settings.location.country,
      settings.location.state,
      options
    );
  } else {
    initialized = provider.init(settings.location.country, options);
  }

  if (initialized === false) {
    throw new RangeError(
      `date-holidays does not support country/state ${settings.location.country}-${settings.location.state ?? ""}`
    );
  }

  const dates = new Set();
  for (const year of years) {
    for (const holiday of provider.getHolidays(year, settings.language)) {
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
      throw new RangeError(`Unknown holiday provider: ${source.provider}`);
    }

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
~~~~

### Nachher

~~~~js
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

~~~~



## lib/location-resolver.js

Konkrete Notwendigkeit: Die bayerische Zuordnung zu `A`, `KATH` und `EVANG` sowie die Rückfallwege mussten direkt am bestehenden Code nachvollziehbar erklärt werden.

Abgrenzung: Nicht durch diesen Grund erforderliche fachliche Abläufe und öffentliche Schnittstellen dieser Datei wurden nicht umgebaut.

### Vorher

~~~~js
"use strict";

const bavarianMunicipalities = require("../data/DE-BY-municipalities.json");

const AUGSBURG_CITY_CODE = "09761000";

function normalizeName(value) {
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

function resolveBavarianMunicipality(municipality, municipalityCode) {
  let matches;

  if (municipalityCode) {
    matches = bavarianMunicipalities.municipalities.filter(
      (entry) => entry.code === String(municipalityCode)
    );
  } else {
    const normalized = normalizeName(municipality);
    matches = bavarianMunicipalities.municipalities.filter(
      (entry) =>
        normalizeName(entry.name) === normalized ||
        normalizeName(entry.name.split(",")[0]) === normalized
    );
  }

  if (matches.length === 0) {
    throw new RangeError(
      `Unknown Bavarian municipality: ${municipalityCode ?? municipality}`
    );
  }
  if (matches.length > 1) {
    throw new RangeError(
      `Municipality "${municipality}" is ambiguous; add municipalityCode`
    );
  }

  const match = matches[0];
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

function fallbackLocation(location, policy, code, message) {
  if (policy === "error") throw new RangeError(message);

  return {
    holidayRegion: null,
    coverage: location.state ? "state" : "country",
    status: "fallback",
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

function resolveHolidayLocation(location, options = {}) {
  const policy = options.onUnsupportedLocation ?? "warn";
  if (options.region) {
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
      return fallbackLocation(
        location,
        policy,
        "UNKNOWN_MUNICIPALITY",
        error.message
      );
    }
  }

  if (location.municipality) {
    return fallbackLocation(
      location,
      policy,
      "MUNICIPALITY_NOT_SUPPORTED",
      `No municipality resolver is available for ${location.country}-${location.state ?? ""}`
    );
  }

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
~~~~

### Nachher

~~~~js
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

~~~~



## node_helper.js

Konkrete Notwendigkeit: Die lokale Berechnung muss unabhängig von der optionalen Online-Prüfung bleiben und den Quellenstatus über eine getrennte Nachricht ausliefern.

Abgrenzung: Nicht durch diesen Grund erforderliche fachliche Abläufe und öffentliche Schnittstellen dieser Datei wurden nicht umgebaut.

### Vorher

~~~~js
"use strict";

const NodeHelper = require("node_helper");
const {
  calculateCountdown,
  dateKeyInTimeZone,
  normalizeCustomDaysOff
} = require("./lib/countdown-calculator");
const { loadHolidaySources } = require("./lib/holiday-sources");
const { validateConfig } = require("./lib/config-validator");

module.exports = NodeHelper.create({
  async socketNotificationReceived(notification, payload) {
    if (notification !== "CAC_CONFIG") return;

    try {
      const { identifier, config } = payload;
      validateConfig(config);

      const now = new Date();
      const today = dateKeyInTimeZone(now, config.location.timeZone);
      const targetDates = config.countdowns.map((item) => item.target.slice(0, 10));
      const holidayCalendar = await loadHolidaySources(config, today, targetDates);
      const customDaysOff = normalizeCustomDaysOff(config.customDaysOff);
      const context = {
        today,
        nowEpoch: now.getTime(),
        holidays: holidayCalendar.dates,
        customDaysOff,
        workWeekdays: new Set(config.workWeekdays)
      };

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
      console.error(`[MMM-CalendarAwareCountdown] ${error.stack ?? error.message}`);
      this.sendSocketNotification("CAC_ERROR", {
        identifier: payload?.identifier,
        message: error.message
      });
    }
  }
});
~~~~

### Nachher

~~~~js
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

~~~~



## package.json

Konkrete Notwendigkeit: Für lokale Pflege und GitHub Actions wird ein reproduzierbarer Befehl `npm run check:sources` benötigt.

Abgrenzung: Nicht durch diesen Grund erforderliche fachliche Abläufe und öffentliche Schnittstellen dieser Datei wurden nicht umgebaut.

### Vorher

~~~~json
{
  "name": "mmm-calendarawarecountdown",
  "version": "1.0.0",
  "description": "Calendar-aware multi-countdowns for MagicMirror²",
  "main": "node_helper.js",
  "files": [
    "CHANGELOG.md",
    "NOTICE.md",
    "MMM-CalendarAwareCountdown.css",
    "MMM-CalendarAwareCountdown.js",
    "data/",
    "lib/",
    "node_helper.js",
    "scripts/",
    "translations/"
  ],
  "scripts": {
    "test": "node --test",
    "check": "node --check MMM-CalendarAwareCountdown.js && node --check node_helper.js && node --test",
    "update:bavaria-municipalities": "node scripts/update-bavaria-municipalities.js"
  },
  "keywords": [
    "magicmirror",
    "countdown",
    "working-days",
    "public-holidays"
  ],
  "license": "MIT",
  "engines": {
    "node": ">=22"
  },
  "dependencies": {
    "date-holidays": "3.37.0"
  }
}
~~~~

### Nachher

~~~~json
{
  "name": "mmm-calendarawarecountdown",
  "version": "1.0.0",
  "description": "Calendar-aware multi-countdowns for MagicMirror²",
  "main": "node_helper.js",
  "files": [
    "CHANGELOG.md",
    "NOTICE.md",
    "MMM-CalendarAwareCountdown.css",
    "MMM-CalendarAwareCountdown.js",
    "data/",
    "lib/",
    "node_helper.js",
    "scripts/",
    "translations/"
  ],
  "scripts": {
    "test": "node --test",
    "check": "node --check MMM-CalendarAwareCountdown.js && node --check node_helper.js && node --test",
    "check:sources": "node scripts/check-data-sources.js",
    "update:bavaria-municipalities": "node scripts/update-bavaria-municipalities.js"
  },
  "keywords": [
    "magicmirror",
    "countdown",
    "working-days",
    "public-holidays"
  ],
  "license": "MIT",
  "engines": {
    "node": ">=22"
  },
  "dependencies": {
    "date-holidays": "3.37.0"
  }
}

~~~~



## scripts/update-bavaria-municipalities.js

Konkrete Notwendigkeit: Parser, Prüfer und amtliche Quell-URL werden von der neuen Gesundheitsprüfung wiederverwendet; der bestehende Importablauf musste ausführlich dokumentiert werden.

Abgrenzung: Nicht durch diesen Grund erforderliche fachliche Abläufe und öffentliche Schnittstellen dieser Datei wurden nicht umgebaut.

### Vorher

~~~~js
"use strict";

const { writeFile } = require("node:fs/promises");
const path = require("node:path");

const SOURCE_URL =
  "https://www.statistik.bayern.de/statistik/gebiet_bevoelkerung/zensus/himmelfahrt/index.php?Suchfeld=gemeindename&sort=gemeindename";
const OUTPUT_FILE = path.join(__dirname, "..", "data", "DE-BY-municipalities.json");

function decodeHtml(value) {
  const namedEntities = {
    amp: "&",
    apos: "'",
    auml: "ä",
    Auml: "Ä",
    gt: ">",
    lt: "<",
    nbsp: " ",
    quot: '"',
    szlig: "ß",
    uuml: "ü",
    Uuml: "Ü",
    ouml: "ö",
    Ouml: "Ö"
  };

  return value
    .replace(/<[^>]+>/g, "")
    .replace(/&#(\d+);/g, (_, number) => String.fromCodePoint(Number(number)))
    .replace(/&#x([\da-f]+);/gi, (_, number) => String.fromCodePoint(parseInt(number, 16)))
    .replace(/&([a-z]+);/gi, (entity, name) => namedEntities[name] ?? entity)
    .replace(/\s+/g, " ")
    .trim();
}

function parseMunicipalities(html) {
  const rowPattern =
    /<tr[^>]*>\s*<td[^>]*>((?:(?!<\/td>)[\s\S])*?)<br\s*\/?>\s*(\d{8})<\/td>\s*<td[^>]*>(.*?)<\/td>\s*<td[^>]*>(.*?)<\/td>\s*<td[^>]*>\s*(ja|nein)\s*<\/td>/gis;
  const municipalities = [];

  for (const match of html.matchAll(rowPattern)) {
    municipalities.push({
      code: match[2],
      name: decodeHtml(match[1]).replace(/,$/, ""),
      district: decodeHtml(match[3]),
      administrativeDistrict: decodeHtml(match[4]),
      assumptionDay: match[5].toLowerCase() === "ja"
    });
  }

  return municipalities;
}

function validateMunicipalities(municipalities) {
  const codes = new Set(municipalities.map((entry) => entry.code));

  if (municipalities.length !== 2056) {
    throw new Error(`Expected 2056 municipalities, received ${municipalities.length}`);
  }
  if (codes.size !== municipalities.length) {
    throw new Error("Municipality codes are not unique");
  }
  if (
    municipalities.some(
      (entry) =>
        !/^\d{8}$/.test(entry.code) ||
        !entry.name ||
        entry.name.length > 100 ||
        !entry.district ||
        !entry.administrativeDistrict
    )
  ) {
    throw new Error("Municipality data contains an invalid entry");
  }
}

async function main() {
  const response = await fetch(SOURCE_URL);
  if (!response.ok) throw new Error(`Official data request failed: HTTP ${response.status}`);
  const municipalities = parseMunicipalities(await response.text());
  validateMunicipalities(municipalities);

  const output = {
    source: SOURCE_URL,
    basis: "Zensus 2022; applicable since 2025",
    generatedAt: new Date().toISOString(),
    municipalities
  };
  await writeFile(OUTPUT_FILE, `${JSON.stringify(output, null, 2)}\n`, "utf8");
  console.log(`Wrote ${municipalities.length} municipalities to ${OUTPUT_FILE}`);
}

if (require.main === module) {
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}

module.exports = {
  parseMunicipalities,
  validateMunicipalities
};
~~~~

### Nachher

~~~~js
"use strict";

const { writeFile } = require("node:fs/promises");
const path = require("node:path");

const SOURCE_URL =
  "https://www.statistik.bayern.de/statistik/gebiet_bevoelkerung/zensus/himmelfahrt/index.php?Suchfeld=gemeindename&sort=gemeindename";
const OUTPUT_FILE = path.join(__dirname, "..", "data", "DE-BY-municipalities.json");

/**
 * Converts the small HTML subset used by the official municipality table into
 * readable text. Tags, numeric character references, and the named entities
 * occurring in Bavarian place names are handled explicitly so the importer
 * does not depend on a browser or a large HTML parser.
 *
 * @param {string} value Raw HTML content from one table cell.
 * @returns {string} Decoded and whitespace-normalized cell text.
 */
function decodeHtml(value) {
  // This closed map contains the named entities currently needed for official
  // Bavarian place/district names. Unknown entities stay visible for validation.
  const namedEntities = {
    amp: "&",
    apos: "'",
    auml: "ä",
    Auml: "Ä",
    gt: ">",
    lt: "<",
    nbsp: " ",
    quot: '"',
    szlig: "ß",
    uuml: "ü",
    Uuml: "Ü",
    ouml: "ö",
    Ouml: "Ö"
  };

  // Tags are removed first, followed by decimal/hexadecimal and named entities.
  // Whitespace normalization turns line breaks and indentation into plain text.
  return value
    .replace(/<[^>]+>/g, "")
    .replace(/&#(\d+);/g, (_, number) => String.fromCodePoint(Number(number)))
    .replace(/&#x([\da-f]+);/gi, (_, number) => String.fromCodePoint(parseInt(number, 16)))
    .replace(/&([a-z]+);/gi, (entity, name) => namedEntities[name] ?? entity)
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Extracts municipality records from the official Bavarian State Office for
 * Statistics result table. The expression is intentionally anchored to one
 * complete table row. This prevents page headings or unrelated tables from
 * becoming part of the first municipality name when the source page changes.
 *
 * @param {string} html Complete HTML response from {@link SOURCE_URL}.
 * @returns {Array<object>} Parsed municipality records in source-page order.
 */
function parseMunicipalities(html) {
  // The code must occur after a line break inside the first cell, followed by
  // district, administrative district, and the German yes/no classification.
  const rowPattern =
    /<tr[^>]*>\s*<td[^>]*>((?:(?!<\/td>)[\s\S])*?)<br\s*\/?>\s*(\d{8})<\/td>\s*<td[^>]*>(.*?)<\/td>\s*<td[^>]*>(.*?)<\/td>\s*<td[^>]*>\s*(ja|nein)\s*<\/td>/gis;
  const municipalities = [];

  for (const match of html.matchAll(rowPattern)) {
    // Capture positions are kept explicit so each output field can be compared
    // directly with the authority table structure during maintenance review.
    municipalities.push({
      code: match[2],
      name: decodeHtml(match[1]).replace(/,$/, ""),
      district: decodeHtml(match[3]),
      administrativeDistrict: decodeHtml(match[4]),
      assumptionDay: match[5].toLowerCase() === "ja"
    });
  }

  return municipalities;
}

/**
 * Applies release invariants to newly downloaded municipality data. The fixed
 * record count and unique official codes make unnoticed HTML layout changes
 * fail closed instead of silently producing incomplete holiday rules.
 *
 * @param {Array<object>} municipalities Records returned by
 *   {@link parseMunicipalities}.
 * @throws {Error} If the source data is incomplete, duplicated, or malformed.
 * @returns {void}
 */
function validateMunicipalities(municipalities) {
  // Official municipality codes are the stable identity used to detect both
  // duplicate rows and legal-rule changes after a census update.
  const codes = new Set(municipalities.map((entry) => entry.code));

  // Bavaria currently publishes exactly 2,056 municipalities. A different count
  // requires human review rather than automatic acceptance because it could be
  // either a real territorial change or a broken HTML parser.
  if (municipalities.length !== 2056) {
    throw new Error(`Expected 2056 municipalities, received ${municipalities.length}`);
  }
  if (codes.size !== municipalities.length) {
    throw new Error("Municipality codes are not unique");
  }
  // Required text and code-shape checks reject partially captured rows. The name
  // length guard also detects accidental absorption of page text into a cell.
  if (
    municipalities.some(
      (entry) =>
        !/^\d{8}$/.test(entry.code) ||
        !entry.name ||
        entry.name.length > 100 ||
        !entry.district ||
        !entry.administrativeDistrict
    )
  ) {
    throw new Error("Municipality data contains an invalid entry");
  }
}

/**
 * Downloads, validates, and writes the bundled Bavarian municipality mapping.
 * This command is intended for a reviewed repository update; the running
 * MagicMirror module never overwrites its installed rules automatically.
 *
 * @returns {Promise<void>} Resolves after the validated JSON file was written.
 */
async function main() {
  // Node's built-in fetch follows normal HTTPS redirects. Non-success responses
  // are rejected before their error page can reach the parser.
  const response = await fetch(SOURCE_URL);
  if (!response.ok) throw new Error(`Official data request failed: HTTP ${response.status}`);
  const municipalities = parseMunicipalities(await response.text());
  // No output file is touched until the complete download passes every invariant.
  validateMunicipalities(municipalities);

  // Source, legal/data basis, and generation time make the released file
  // independently auditable after it has been copied to a mirror.
  const output = {
    source: SOURCE_URL,
    basis: "Zensus 2022; applicable since 2025",
    generatedAt: new Date().toISOString(),
    municipalities
  };
  // Pretty-printed deterministic JSON is intentionally suitable for human Git
  // review before a new tagged release is produced.
  await writeFile(OUTPUT_FILE, `${JSON.stringify(output, null, 2)}\n`, "utf8");
  console.log(`Wrote ${municipalities.length} municipalities to ${OUTPUT_FILE}`);
}

if (require.main === module) {
  // Importing this script for parser tests/source checks must never write data.
  // Only direct command-line execution invokes the update operation.
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}

module.exports = {
  SOURCE_URL,
  decodeHtml,
  parseMunicipalities,
  validateMunicipalities
};

~~~~



## tests/config-validator.test.js

Konkrete Notwendigkeit: Die neuen Sicherheitsgrenzen und der zulässige partielle Ausschalter `sourceHealth: { enabled: false }` brauchen Regressionstests.

Abgrenzung: Nicht durch diesen Grund erforderliche fachliche Abläufe und öffentliche Schnittstellen dieser Datei wurden nicht umgebaut.

### Vorher

~~~~js
"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const { validateConfig } = require("../lib/config-validator");

function validConfig() {
  return {
    location: {
      timeZone: "Europe/Berlin",
      country: "DE",
      state: "BY",
      municipality: "Kumhausen"
    },
    holidaySources: [
      {
        provider: "date-holidays",
        types: ["public"],
        onUnsupportedLocation: "warn"
      }
    ],
    workWeekdays: [1, 2, 3, 4, 5],
    customDaysOff: [],
    countdowns: [
      {
        title: "Example",
        target: "2027-06-17",
        calculations: ["calendarDays", "workdays"]
      }
    ],
    minimumColumnWidth: "140px",
    updateInterval: 3600000
  };
}

test("accepts a complete valid configuration", () => {
  const config = validConfig();
  assert.equal(validateConfig(config), config);
});

test("rejects invalid time zones before calculation", () => {
  const config = validConfig();
  config.location.timeZone = "Europe/Nowhere";
  assert.throws(() => validateConfig(config), /Unknown IANA time zone/);
});

test("rejects invalid or duplicate ISO work weekdays", () => {
  const invalid = validConfig();
  invalid.workWeekdays = [1, 2, 8];
  assert.throws(() => validateConfig(invalid), /ISO weekdays/);

  const duplicate = validConfig();
  duplicate.workWeekdays = [1, 1, 2];
  assert.throws(() => validateConfig(duplicate), /duplicate weekdays/);
});

test("rejects malformed day-off ranges", () => {
  const config = validConfig();
  config.customDaysOff = [{ start: "2027-05-10", end: "2027-05-03" }];
  assert.throws(() => validateConfig(config), /must not precede/);
});

test("rejects unknown calculation types", () => {
  const config = validConfig();
  config.countdowns[0].calculations = ["moonDays"];
  assert.throws(() => validateConfig(config), /Unknown calculation type/);
});
~~~~

### Nachher

~~~~js
"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const { validateConfig } = require("../lib/config-validator");

function validConfig() {
  return {
    location: {
      timeZone: "Europe/Berlin",
      country: "DE",
      state: "BY",
      municipality: "Kumhausen"
    },
    holidaySources: [
      {
        provider: "date-holidays",
        types: ["public"],
        onUnsupportedLocation: "warn"
      }
    ],
    workWeekdays: [1, 2, 3, 4, 5],
    customDaysOff: [],
    countdowns: [
      {
        title: "Example",
        target: "2027-06-17",
        calculations: ["calendarDays", "workdays"]
      }
    ],
    sourceHealth: {
      enabled: true,
      checkInterval: 30 * 24 * 60 * 60 * 1000,
      requestTimeout: 15000,
      repositoryStaleAfterDays: 365,
      showUnavailable: true
    },
    minimumColumnWidth: "140px",
    updateInterval: 3600000
  };
}

test("accepts a complete valid configuration", () => {
  const config = validConfig();
  assert.equal(validateConfig(config), config);
});

test("rejects invalid time zones before calculation", () => {
  const config = validConfig();
  config.location.timeZone = "Europe/Nowhere";
  assert.throws(() => validateConfig(config), /Unknown IANA time zone/);
});

test("rejects invalid or duplicate ISO work weekdays", () => {
  const invalid = validConfig();
  invalid.workWeekdays = [1, 2, 8];
  assert.throws(() => validateConfig(invalid), /ISO weekdays/);

  const duplicate = validConfig();
  duplicate.workWeekdays = [1, 1, 2];
  assert.throws(() => validateConfig(duplicate), /duplicate weekdays/);
});

test("rejects malformed day-off ranges", () => {
  const config = validConfig();
  config.customDaysOff = [{ start: "2027-05-10", end: "2027-05-03" }];
  assert.throws(() => validateConfig(config), /must not precede/);
});

test("rejects unknown calculation types", () => {
  const config = validConfig();
  config.countdowns[0].calculations = ["moonDays"];
  assert.throws(() => validateConfig(config), /Unknown calculation type/);
});

test("rejects a source-health interval shorter than one day", () => {
  const config = validConfig();
  config.sourceHealth.checkInterval = 60 * 60 * 1000;
  assert.throws(() => validateConfig(config), /must be at least one day/);
});

test("accepts a partial source-health override", () => {
  const config = validConfig();
  config.sourceHealth = { enabled: false };
  assert.equal(validateConfig(config), config);
});

~~~~



## translations/de.json

Konkrete Notwendigkeit: Die neue Fußzeile benötigt deutsche Texte für Aktualisierung, Inaktivität, Nichterreichbarkeit und ungültige Prüfdaten.

Abgrenzung: Nicht durch diesen Grund erforderliche fachliche Abläufe und öffentliche Schnittstellen dieser Datei wurden nicht umgebaut.

### Vorher

~~~~json
{
  "LOADING": "Countdowns werden berechnet …",
  "CONFIG_ERROR": "Konfiguration fehlerhaft",
  "CALENDAR_DAYS": "Kalendertage",
  "WORKDAYS": "Arbeitstage",
  "MONDAYS": "Montage",
  "WEEKDAYS": "Wochentage",
  "DAYS_SHORT": "T",
  "HOURS_SHORT": "Std",
  "MINUTES_SHORT": "Min",
  "SECONDS_SHORT": "Sek",
  "LOCATION_FALLBACK": "Gemeindeebene für Feiertage nicht verfügbar:"
}
~~~~

### Nachher

~~~~json
{
  "LOADING": "Countdowns werden berechnet …",
  "CONFIG_ERROR": "Konfiguration fehlerhaft",
  "CALENDAR_DAYS": "Kalendertage",
  "WORKDAYS": "Arbeitstage",
  "MONDAYS": "Montage",
  "WEEKDAYS": "Wochentage",
  "DAYS_SHORT": "T",
  "HOURS_SHORT": "Std",
  "MINUTES_SHORT": "Min",
  "SECONDS_SHORT": "Sek",
  "LOCATION_FALLBACK": "Gemeindeebene für Feiertage nicht verfügbar:",
  "SOURCE_MAINTENANCE": "Quellenprüfung",
  "SOURCE_DATE_HOLIDAYS_PACKAGE": "Feiertagsbibliothek",
  "SOURCE_DATE_HOLIDAYS_REPOSITORY": "date-holidays-Repository",
  "SOURCE_BAVARIA_MUNICIPALITIES": "Bayerische Gemeindedaten",
  "SOURCE_REPOSITORY_INACTIVE": "Repository ist archiviert oder deaktiviert",
  "SOURCE_REPOSITORY_STALE": "keine Repository-Aktivität seit",
  "SOURCE_UPDATE_AVAILABLE": "geprüfte Aktualisierung erforderlich",
  "SOURCE_CHECK_UNAVAILABLE": "Prüfung derzeit nicht erreichbar",
  "SOURCE_CHECK_INVALID": "Quelle liefert keine gültigen Prüfdaten",
  "SOURCE_DAYS": "Tagen"
}

~~~~



## translations/en.json

Konkrete Notwendigkeit: Die öffentliche englische Moduloberfläche benötigt dieselben neuen Quellenstatus-Texte.

Abgrenzung: Nicht durch diesen Grund erforderliche fachliche Abläufe und öffentliche Schnittstellen dieser Datei wurden nicht umgebaut.

### Vorher

~~~~json
{
  "LOADING": "Calculating countdowns …",
  "CONFIG_ERROR": "Invalid configuration",
  "CALENDAR_DAYS": "Calendar days",
  "WORKDAYS": "Working days",
  "MONDAYS": "Mondays",
  "WEEKDAYS": "Weekdays",
  "DAYS_SHORT": "d",
  "HOURS_SHORT": "h",
  "MINUTES_SHORT": "m",
  "SECONDS_SHORT": "s",
  "LOCATION_FALLBACK": "Municipality-level holidays unavailable:"
}
~~~~

### Nachher

~~~~json
{
  "LOADING": "Calculating countdowns …",
  "CONFIG_ERROR": "Invalid configuration",
  "CALENDAR_DAYS": "Calendar days",
  "WORKDAYS": "Working days",
  "MONDAYS": "Mondays",
  "WEEKDAYS": "Weekdays",
  "DAYS_SHORT": "d",
  "HOURS_SHORT": "h",
  "MINUTES_SHORT": "m",
  "SECONDS_SHORT": "s",
  "LOCATION_FALLBACK": "Municipality-level holidays unavailable:",
  "SOURCE_MAINTENANCE": "Source check",
  "SOURCE_DATE_HOLIDAYS_PACKAGE": "Holiday library",
  "SOURCE_DATE_HOLIDAYS_REPOSITORY": "date-holidays repository",
  "SOURCE_BAVARIA_MUNICIPALITIES": "Bavarian municipality data",
  "SOURCE_REPOSITORY_INACTIVE": "repository is archived or disabled",
  "SOURCE_REPOSITORY_STALE": "no repository activity for",
  "SOURCE_UPDATE_AVAILABLE": "reviewed update required",
  "SOURCE_CHECK_UNAVAILABLE": "check currently unavailable",
  "SOURCE_CHECK_INVALID": "source returned invalid verification data",
  "SOURCE_DAYS": "days"
}

~~~~



## .github/dependabot.yml

Konkrete Notwendigkeit: Abhängigkeitsupdates sollen monatlich als prüfbarer Pull Request vorgeschlagen und nicht ungeprüft auf dem Spiegel installiert werden.

Abgrenzung: Nicht durch diesen Grund erforderliche fachliche Abläufe und öffentliche Schnittstellen dieser Datei wurden nicht umgebaut.
Die Datei existierte im vorherigen Git-Stand nicht; der Vorher-Block ist daher leer.


### Vorher

~~~~yaml

~~~~

### Nachher

~~~~yaml
version: 2
updates:
  # Dependabot proposes reviewed dependency changes. The running mirror never
  # executes npm update on its own, so a new holiday-rule package first passes
  # this repository's tests and normal release process.
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "monthly"
    open-pull-requests-limit: 5
    labels:
      - "dependencies"

~~~~



## .github/workflows/monthly-source-check.yml

Konkrete Notwendigkeit: Alle Quellen, Tests und der gesperrte Abhängigkeitsstand sollen monatlich sowie manuell überprüfbar sein.

Abgrenzung: Nicht durch diesen Grund erforderliche fachliche Abläufe und öffentliche Schnittstellen dieser Datei wurden nicht umgebaut.
Die Datei existierte im vorherigen Git-Stand nicht; der Vorher-Block ist daher leer.


### Vorher

~~~~yaml

~~~~

### Nachher

~~~~yaml
name: Monthly source check

on:
  # The fixed UTC schedule is intentionally offset from the top of the hour,
  # when shared GitHub Actions capacity is commonly busiest.
  schedule:
    - cron: "17 6 1 * *"
  # Maintainers can repeat the exact same source check before a release.
  workflow_dispatch:

# The workflow only reads repository content. It cannot commit downloaded data,
# publish a package, or silently modify a release.
permissions:
  contents: read

jobs:
  verify-sources:
    runs-on: ubuntu-latest
    steps:
      - name: Check out the repository
        uses: actions/checkout@v4

      - name: Use supported Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "22"
          cache: "npm"

      # npm ci installs exactly the versions recorded in package-lock.json. This
      # verifies the released dependency set rather than silently updating it.
      - name: Install locked dependencies
        run: npm ci

      - name: Run syntax and calculation tests
        run: npm run check

      # A non-current, invalid, or unreachable source fails the job so GitHub's
      # normal Actions notification mechanism brings it to maintainer attention.
      - name: Compare maintained sources
        run: npm run check:sources

~~~~



## lib/source-health.js

Konkrete Notwendigkeit: Das Modul benötigt die neue, zwischengespeicherte Monatsprüfung für npm-Version, Repository-Pflegezustand und amtliche bayerische Gemeindedaten.

Abgrenzung: Nicht durch diesen Grund erforderliche fachliche Abläufe und öffentliche Schnittstellen dieser Datei wurden nicht umgebaut.
Die Datei existierte im vorherigen Git-Stand nicht; der Vorher-Block ist daher leer.


### Vorher

~~~~js

~~~~

### Nachher

~~~~js
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

~~~~



## scripts/check-data-sources.js

Konkrete Notwendigkeit: Wartung und GitHub Actions benötigen eine verständliche Befehlsausgabe und einen fehlschlagenden Status bei Prüfbedarf.

Abgrenzung: Nicht durch diesen Grund erforderliche fachliche Abläufe und öffentliche Schnittstellen dieser Datei wurden nicht umgebaut.
Die Datei existierte im vorherigen Git-Stand nicht; der Vorher-Block ist daher leer.


### Vorher

~~~~js

~~~~

### Nachher

~~~~js
"use strict";

const { inspectSources } = require("../lib/source-health");

/**
 * Creates a complete maintenance message for one checked source. The command
 * deliberately includes version, activity, or record-count evidence so a
 * maintainer can understand a failure without inspecting raw JSON.
 *
 * @param {object} source Structured source result from `inspectSources`.
 * @returns {string} One line for terminal and GitHub Actions output.
 */
function describeSource(source) {
  // The npm package check needs both versions to make the required review clear.
  if (source.id === "date-holidays-package") {
    if (source.status === "unavailable") {
      return `${source.id}: unavailable (${source.reason})`;
    }

    return `${source.id}: ${source.status}; installed=${source.installedVersion}; latest=${source.latestVersion}`;
  }

  // Repository activity is evidence for continued upstream maintenance. An
  // archived repository is invalid; a long period without a push needs review.
  if (source.id === "date-holidays-repository") {
    if (source.status === "unavailable") {
      return `${source.id}: unavailable (${source.reason})`;
    }

    return `${source.id}: ${source.status}; pushedAt=${source.pushedAt}; daysSinceLastPush=${source.daysSinceLastPush}`;
  }

  // The authority data check reports the validated row count and whether its
  // calculation-relevant content still matches the released local mapping.
  if (source.id === "bavaria-municipalities") {
    if (source.status === "unavailable") {
      return `${source.id}: unavailable (${source.reason})`;
    }

    return `${source.id}: ${source.status}; municipalityCount=${source.municipalityCount}; bundledGeneratedAt=${source.bundledGeneratedAt}`;
  }

  // This fallback keeps future provider results visible before a specialized
  // formatter is added; it does not reinterpret their status.
  return `${source.id}: ${source.status}`;
}

/**
 * Runs an uncached online inspection for maintainers and continuous integration.
 * Any non-healthy source sets a failing process status. This causes the monthly
 * GitHub workflow to notify maintainers instead of merely logging an unnoticed
 * warning, while still printing all source results in one run.
 *
 * @returns {Promise<void>} Resolves after output and exit status are prepared.
 */
async function main() {
  // The shared inspector applies the same URLs, validation rules, and staleness
  // threshold as the runtime footer, preventing two definitions of “current”.
  const health = await inspectSources();

  console.log(`Source health checked at ${health.checkedAt}`);
  for (const source of health.sources) {
    console.log(describeSource(source));
  }

  // CI must fail on updates, invalid sources, and unavailable checks. A red run
  // therefore always means a human must review the evidence; no production file
  // or dependency is changed automatically by this command.
  const sourcesRequiringReview = health.sources.filter(
    (source) => source.status !== "ok"
  );
  if (sourcesRequiringReview.length > 0) {
    process.exitCode = 1;
  }
}

if (require.main === module) {
  main().catch((error) => {
    // Unexpected programming/runtime errors remain distinguishable from the
    // structured source statuses printed by a normal completed inspection.
    console.error(error);
    process.exitCode = 1;
  });
}

module.exports = {
  describeSource
};

~~~~



## tests/frontend-source-health.test.js

Konkrete Notwendigkeit: Die Relevanzfilterung und Versionsdarstellung der neuen Fußzeile benötigen einen browserunabhängigen Regressionstest.

Abgrenzung: Nicht durch diesen Grund erforderliche fachliche Abläufe und öffentliche Schnittstellen dieser Datei wurden nicht umgebaut.
Die Datei existierte im vorherigen Git-Stand nicht; der Vorher-Block ist daher leer.


### Vorher

~~~~js

~~~~

### Nachher

~~~~js
"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");

let registeredModule;

// The browser file registers an object with MagicMirror instead of exporting it.
// This small test double captures that object without starting a browser.
global.Module = {
  register(moduleName, moduleDefinition) {
    assert.equal(moduleName, "MMM-CalendarAwareCountdown");
    registeredModule = moduleDefinition;
  }
};
require("../MMM-CalendarAwareCountdown");
delete global.Module;

/**
 * Creates only the browser-instance properties required by the source-health
 * helper methods. Production methods themselves are reused unchanged.
 *
 * @param {object} location Geographic module configuration.
 * @param {Array<object>} holidaySources Active holiday providers.
 * @returns {object} Minimal method receiver for a unit test.
 */
function createFrontendInstance(location, holidaySources) {
  return {
    ...registeredModule,
    config: {
      location,
      holidaySources
    },
    translate(key) {
      // Stable test translations make the final message assertion independent
      // of MagicMirror's translation loader.
      return key;
    }
  };
}

test("shows Bavarian source health only when the local resolver is active", () => {
  const bavarianInstance = createFrontendInstance(
    { country: "DE", state: "BY", municipality: "Kumhausen" },
    [{ provider: "date-holidays" }]
  );
  const frenchInstance = createFrontendInstance(
    { country: "FR", state: null, municipality: null },
    [{ provider: "date-holidays" }]
  );

  assert.equal(
    bavarianInstance.sourceHealthIsRelevant("bavaria-municipalities"),
    true
  );
  assert.equal(
    frenchInstance.sourceHealthIsRelevant("bavaria-municipalities"),
    false
  );
});

test("formats an available dependency update with both versions", () => {
  const instance = createFrontendInstance(
    { country: "DE", state: "BY", municipality: "Kumhausen" },
    [{ provider: "date-holidays" }]
  );

  const message = instance.sourceHealthText({
    id: "date-holidays-package",
    code: "DEPENDENCY_UPDATE_AVAILABLE",
    installedVersion: "3.37.0",
    latestVersion: "3.38.0"
  });

  assert.equal(
    message,
    "SOURCE_DATE_HOLIDAYS_PACKAGE: 3.37.0 → 3.38.0"
  );
});

~~~~



## tests/source-health.test.js

Konkrete Notwendigkeit: Der Vergleich amtlicher Gemeindedaten muss Reihenfolge ignorieren, aber eine fachliche Feiertagsänderung erkennen.

Abgrenzung: Nicht durch diesen Grund erforderliche fachliche Abläufe und öffentliche Schnittstellen dieser Datei wurden nicht umgebaut.
Die Datei existierte im vorherigen Git-Stand nicht; der Vorher-Block ist daher leer.


### Vorher

~~~~js

~~~~

### Nachher

~~~~js
"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const bundledMunicipalityData = require("../data/DE-BY-municipalities.json");
const {
  canonicalizeMunicipalities,
  municipalityDataChanged
} = require("../lib/source-health");

test("municipality comparison ignores source ordering", () => {
  // A reversed copy represents the same official rules delivered in another
  // table order. Ordering alone must not create a maintenance warning.
  const reorderedMunicipalities = [
    ...bundledMunicipalityData.municipalities
  ].reverse();

  assert.equal(
    municipalityDataChanged(
      reorderedMunicipalities,
      bundledMunicipalityData.municipalities
    ),
    false
  );
});

test("municipality comparison detects a holiday-rule change", () => {
  // Only one copied record is changed, leaving the checked-in fixture untouched.
  // This verifies that a legal status change raises an update warning.
  const changedMunicipalities = canonicalizeMunicipalities(
    bundledMunicipalityData.municipalities
  );
  changedMunicipalities[0] = {
    ...changedMunicipalities[0],
    assumptionDay: !changedMunicipalities[0].assumptionDay
  };

  assert.equal(
    municipalityDataChanged(
      changedMunicipalities,
      bundledMunicipalityData.municipalities
    ),
    true
  );
});

~~~~


<!-- END -->

