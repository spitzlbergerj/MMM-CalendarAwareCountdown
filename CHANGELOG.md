# Changelog

All notable changes to this project are documented here.

## 1.0.2 - 2026-10-15

- Add the relevant module configuration below every screenshot
- Add a complete German README and language links between both README versions
- Clarify the display and workday-counting explanations and omit the optional
  `id` setting from public examples
- Remove the unused countdown `id` property from the calculated data model

## 1.0.1 - 2026-10-15

- Honor `language` separately for each module instance instead of inheriting
  visible labels and duration units from MagicMirror's global language
- Add automated tests for per-instance German and English translations
- Add German and English screenshots for the primary V1 display variants

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
