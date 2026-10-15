"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const data = require("../data/DE-BY-municipalities.json");
const {
  parseMunicipalities,
  validateMunicipalities
} = require("../scripts/update-bavaria-municipalities");

test("bundled Bavarian municipality data passes release invariants", () => {
  assert.equal(data.municipalities.length, 2056);
  assert.equal(new Set(data.municipalities.map((entry) => entry.code)).size, 2056);
  assert.equal(data.municipalities[0].name, "Abenberg, St");
  assert.doesNotThrow(() => validateMunicipalities(data.municipalities));
});

test("municipality importer does not absorb preceding table or page text", () => {
  const html = `
    <table>
      <tr><td>Unrelated header and page text</td></tr>
      <tr>
        <td>Abenberg, St<br>09576111</td>
        <td>Roth</td>
        <td>Mittelfranken</td>
        <td>ja</td>
      </tr>
    </table>`;

  assert.deepEqual(parseMunicipalities(html), [
    {
      code: "09576111",
      name: "Abenberg, St",
      district: "Roth",
      administrativeDistrict: "Mittelfranken",
      assumptionDay: true
    }
  ]);
});
