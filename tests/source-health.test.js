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
