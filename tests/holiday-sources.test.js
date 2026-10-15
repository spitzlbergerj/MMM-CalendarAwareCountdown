"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");

let loadHolidaySources;
try {
  ({ loadHolidaySources } = require("../lib/holiday-sources"));
} catch (error) {
  if (error.code !== "MODULE_NOT_FOUND" || !error.message.includes("date-holidays")) {
    throw error;
  }
}

const dependencyMissing = !loadHolidaySources;

test(
  "loads exact municipal holidays for Kumhausen",
  { skip: dependencyMissing && "date-holidays is not installed" },
  async () => {
    const result = await loadHolidaySources(
      {
        language: "de",
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
        ]
      },
      "2027-08-01",
      ["2027-08-20"]
    );

    assert.equal(result.dates.has("2027-08-15"), true);
    assert.equal(result.dates.has("2027-08-08"), false);
    assert.equal(result.reports[0].coverage, "municipality");
    assert.equal(result.reports[0].diagnostics.length, 0);
  }
);

test(
  "loads holidays for countries without a state",
  { skip: dependencyMissing && "date-holidays is not installed" },
  async () => {
    const result = await loadHolidaySources(
      {
        language: "fr",
        location: {
          timeZone: "Europe/Paris",
          country: "FR",
          state: null,
          municipality: null
        },
        holidaySources: [{ provider: "date-holidays", types: ["public"] }]
      },
      "2027-01-01",
      ["2027-12-31"]
    );

    assert.equal(result.dates.has("2027-07-14"), true);
    assert.equal(result.reports[0].coverage, "country");
  }
);
