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
