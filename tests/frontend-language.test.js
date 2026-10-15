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
