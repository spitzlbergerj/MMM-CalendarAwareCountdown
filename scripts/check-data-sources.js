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
