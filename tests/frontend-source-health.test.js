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
