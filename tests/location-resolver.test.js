"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const {
  resolveBavarianMunicipality,
  resolveHolidayLocation
} = require("../lib/location-resolver");

test("resolves Kumhausen through official municipality data", () => {
  const result = resolveBavarianMunicipality("Kumhausen");
  assert.equal(result.code, "09274146");
  assert.equal(result.holidayRegion, "KATH");
  assert.equal(result.assumptionDay, true);
});

test("accepts common German ASCII spelling", () => {
  const result = resolveBavarianMunicipality("Muenchen");
  assert.equal(result.name, "München, Landeshauptstadt");
});

test("uses the special Augsburg holiday region only for the city", () => {
  const result = resolveBavarianMunicipality("Augsburg");
  assert.equal(result.code, "09761000");
  assert.equal(result.holidayRegion, "A");
});

test("allows an explicit region to override municipality resolution", () => {
  const result = resolveHolidayLocation(
    {
      country: "DE",
      state: "BY",
      municipality: "Kumhausen"
    },
    { region: "EVANG" }
  );
  assert.equal(result.holidayRegion, "EVANG");
});

test("reports state fallback when municipality resolution is unavailable", () => {
  const result = resolveHolidayLocation(
    {
      country: "US",
      state: "CA",
      municipality: "San Francisco"
    },
    { onUnsupportedLocation: "warn" }
  );

  assert.equal(result.coverage, "state");
  assert.equal(result.status, "fallback");
  assert.equal(result.diagnostics[0].code, "MUNICIPALITY_NOT_SUPPORTED");
});

test("can reject an unsupported municipality instead of falling back", () => {
  assert.throws(
    () =>
      resolveHolidayLocation(
        {
          country: "US",
          state: "CA",
          municipality: "San Francisco"
        },
        { onUnsupportedLocation: "error" }
      ),
    /No municipality resolver/
  );
});
