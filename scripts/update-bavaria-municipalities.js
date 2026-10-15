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
