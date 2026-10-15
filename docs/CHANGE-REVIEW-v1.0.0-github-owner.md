# Vollständiger Vorher-/Nachher-Nachweis: GitHub-Konto

Ausgangsbasis ist der unmittelbar vorherige Git-Stand `24a42e8`. Geändert wurden ausschließlich die bestätigten öffentlichen GitHub-Adressen und der davon abhängige Installationshinweis. Modulberechnung, Laufzeitkonfiguration, Tests, Quellenprüfung und MagicMirror-Installation blieben unverändert.


## README.md

Konkrete Notwendigkeit: Der Platzhalter in der Installationsanleitung musste durch den vom Benutzer bestätigten GitHub-Kontonamen `spitzlbergerj` ersetzt und der dadurch überflüssige Platzhalterhinweis entfernt werden.

Abgrenzung: Alle nicht von dieser Adressänderung betroffenen Inhalte der vollständigen Datei blieben unverändert.

### Vorher

~~~~markdown
# MMM-CalendarAwareCountdown

A calendar-aware multi-countdown module for MagicMirror². It can show calendar
days, regional working days, selected weekdays, and a live duration while taking
public holidays and personal days off into account.

Version 1.0 is the first stable release. The calculation rules and configuration
keys documented below are the supported V1 interface.

## Features

- Multiple countdowns in a responsive grid
- Calendar-day calculation based on local dates
- Working days based on a configurable working week
- Worldwide country-level and available subdivision holidays through `date-holidays`
- Municipality-aware Bavarian holidays from official local data
- Global and countdown-specific days off as dates or date ranges
- Counts selected weekdays, for example Mondays
- Live days/hours/minutes/seconds display
- German and English labels
- Offline countdown calculation; optional monthly online source-health checks

## Installation

From the MagicMirror `modules` directory:

```sh
git clone https://github.com/YOUR-GITHUB-ACCOUNT/MMM-CalendarAwareCountdown.git
cd MMM-CalendarAwareCountdown
npm ci --omit=dev
```

Replace `YOUR-GITHUB-ACCOUNT` with the repository owner after publishing. Restart
MagicMirror after adding the module to `config/config.js`.

## Example configuration

```js
{
  module: "MMM-CalendarAwareCountdown",
  position: "top_center",
  header: "Upcoming events",
  config: {
    language: "en",
    location: {
      timeZone: "Europe/Berlin",
      country: "DE",
      state: "BE",
      municipality: null
    },
    holidaySources: [
      {
        provider: "date-holidays",
        types: ["public"],
        onUnsupportedLocation: "warn"
      }
    ],
    minimumColumnWidth: "140px",
    sourceHealth: {
      enabled: true,
      checkInterval: 30 * 24 * 60 * 60 * 1000,
      requestTimeout: 15000,
      repositoryStaleAfterDays: 365,
      showUnavailable: true
    },

    customDaysOff: [
      "2030-05-10",
      { start: "2030-08-05", end: "2030-08-09", label: "Vacation" }
    ],

    countdowns: [
      {
        id: "conference",
        title: "Conference",
        target: "2030-09-15",
        calculations: ["calendarDays"]
      },
      {
        id: "anniversary",
        title: "Anniversary",
        target: "2030-10-20",
        calculations: ["calendarDays"]
      },
      {
        id: "project-launch",
        title: "Project launch",
        target: "2030-12-01",
        daysOff: [
          { start: "2030-11-04", end: "2030-11-05", label: "Project only" }
        ],
        calculations: ["calendarDays", "workdays"]
      }
    ]
  }
}
```

With two number-based calculations, the automatic presentation uses a combined
value such as `120 / 78`. Set `display: "separate"` on a countdown to put the
values on separate lines.

The grid creates as many equal-width columns as the available MagicMirror region
can hold. Further countdowns wrap into a new row. `minimumColumnWidth` controls
when wrapping occurs; there is no fixed column count.

## Counting convention

The module counts the interval **including today but excluding the target date**,
written mathematically as `[today, target)`. This produces the
same familiar result as the difference between two calendar dates. For example,
2030-01-01 to 2030-01-31 is 30 calendar days.

Working days use the same interval and remove:

1. days outside `workWeekdays`,
2. public holidays for the configured country/state/region,
3. dates in the global `customDaysOff`,
4. dates in the countdown's own `daysOff`.

All days off are whole calendar days. On the target date a countdown shows `0`.
After the target date it remains visible and shows `-`.

### Days off and inclusive ranges

Use a date string for one free day and an object for a range:

```js
customDaysOff: [
  "2027-01-04",
  { start: "2027-05-03", end: "2027-05-10", label: "Vacation" }
]
```

Both `start` and `end` are included. The example range therefore expands to all
calendar dates from May 3 through May 10, including both dates. Expansion does
not mean that every expanded date is subtracted from a working-day result. A
date reduces `workdays` only when all of the following are true:

1. it lies inside `[today, target)`,
2. it is one of the configured `workWeekdays`,
3. it is not already a public holiday,
4. it has not already been supplied by another overlapping day-off entry.

This prevents double subtraction. For a Monday-to-Friday work week, weekends in
a vacation range have no effect. If a vacation date is also a public holiday, it
has already been removed and is not removed a second time. A range beginning on
the target date has no effect because the target date is excluded.

Global `customDaysOff` apply to every countdown. A countdown's own `daysOff`
apply only to that countdown. Both lists use the same string and inclusive-range
formats, and their dates are merged without duplicates.

A `weekday` calculation counts the selected weekdays regardless of holidays by
default. Set `excludeHolidays` or `excludeCustomDaysOff` to `true` when it should
only count usable days.

## Main configuration

| Option | Default | Meaning |
| --- | --- | --- |
| `language` | `de` | Language for module and holiday data |
| `location` | see example | Shared location used by holiday sources |
| `holidaySources` | `date-holidays` | One or more holiday-data providers |
| `workWeekdays` | `[1,2,3,4,5]` | ISO weekdays; Monday is 1, Sunday is 7 |
| `customDaysOff` | `[]` | Personal dates and inclusive date ranges |
| `minimumColumnWidth` | `220px` | Minimum width before equal columns wrap |
| `showMetricLabels` | `true` | Show labels below values |
| `showSourceWarnings` | `true` | Show a visible warning after a location fallback |
| `sourceHealth` | see below | Optional online maintenance checks; calculations remain local |
| `updateInterval` | `3600000` | Full recalculation interval in milliseconds |
| `animationSpeed` | `500` | MagicMirror DOM update animation in milliseconds |

### Countdown configuration

| Option | Default | Meaning |
| --- | --- | --- |
| `id` | title | Stable identifier for the countdown |
| `title` | required | Heading shown above the value |
| `target` | required | `YYYY-MM-DD` or an ISO timestamp for `duration` |
| `calculations` | `["calendarDays"]` | One or more calculation definitions |
| `daysOff` | `[]` | Dates and inclusive ranges used only by this countdown |
| `display` | `auto` | `auto` combines two numeric values; `separate` uses rows |

### Location

| Option | Meaning |
| --- | --- |
| `timeZone` | IANA time zone used to determine the current local date |
| `country` | ISO 3166-1 alpha-2 country code |
| `state` | Optional country subdivision code |
| `municipality` | Optional municipality name for finer local rules |
| `municipalityCode` | Optional official code if a municipality name is ambiguous |

### Holiday sources and coverage

Version 1 has the following explicit support promise:

- country-level holiday calculation for every country available in
  [`date-holidays`](https://github.com/commenthol/date-holidays), currently more
  than 200 countries,
- state/province/canton/region calculation wherever that provider supplies the
  subdivision,
- municipality-level calculation where this module has a dedicated local
  resolver, initially all Bavarian municipalities,
- manual correction or extension through global `customDaysOff` and per-countdown
  `daysOff`.

Holiday calculation is provider-based. Version 1 contains the following sources:

| Provider | Network | Coverage |
| --- | --- | --- |
| `date-holidays` | No | Countries and the subdivisions/regions supplied by the library |
| `none` | No | Disables automatic public holidays |

The module does not claim municipality precision where the provider has none. Every source
reports whether it used country, state, region, or municipality data. If a
requested municipality cannot be resolved, `onUnsupportedLocation` controls the
behavior:

- `warn` (default): use state/country rules and show a warning
- `error`: stop the calculation rather than use less precise data
- `silent`: use state/country rules without displaying a warning

An advanced `region` value can be set on the individual source when the provider
has a regional code but no automatic municipality resolver.

The provider boundary deliberately allows later adapters for a web API or iCalendar
feed without changing countdown calculations. A generic arbitrary-JSON endpoint is
not accepted: each provider needs a defined schema, validation, caching, and a clear
fallback policy.

### Internal provider contract

Holiday providers do not pass their native response directly into countdown
calculation. Every adapter must return the following normalized structure:

```js
{
  dates: new Set(["2030-01-01", "2030-12-25"]),
  report: {
    provider: "provider-name",
    coverage: "country", // country, state, region, municipality, or none
    status: "exact",     // exact or fallback
    diagnostics: []
  }
}
```

`dates` may contain only validated local dates in `YYYY-MM-DD` format. Multiple
providers are combined as a set, so the same holiday is never subtracted twice.
`report` explains the actual geographic precision and any fallback. This is the
fixed internal format into which another data source can be integrated. A new
web API, iCalendar feed, or national library therefore needs a small adapter that
validates its native data and produces this contract; the countdown algorithms
and display do not need to know the original source format.

## How holiday and working-day calculation works

The complete calculation is intentionally split into four explicit stages:

1. `location-resolver.js` resolves the configured country, state, and optional
   municipality into the best supported holiday region. It also reports whether
   the result is exact or a documented fallback.
2. `holiday-sources.js` asks each configured provider for all years covered by
   the active countdowns and normalizes the results to a set of date keys.
3. `countdown-calculator.js` iterates over `[today, target)`. A date counts as a
   working day only when its ISO weekday is in `workWeekdays`, it is not in the
   public-holiday set, and it is not in the merged global/per-countdown day-off
   set.
4. The browser receives only calculated values and diagnostics. It does not
   reproduce holiday rules and cannot accidentally calculate them differently.

`date-holidays` is installed locally at the exact version recorded in
`package-lock.json`. Normal countdown operation therefore does not call a web
service and keeps working without internet access. The separate source-health
check described below never changes a result during a calculation.

## Calculation types

| Type | Result |
| --- | --- |
| `calendarDays` | Local calendar days until the target |
| `workdays` | Configured workdays minus public holidays and personal days off |
| `weekday` | Occurrences of selected ISO weekdays |
| `duration` | Live duration to an exact timestamp |

For `duration`, an ISO timestamp with UTC offset is recommended, for example
`2027-08-14T06:00:00+02:00`. This makes the intended instant unambiguous.

## Bavarian municipality data

The special Bavarian handling is deliberately small and traceable:

- Germany/Bavaria without a municipality uses the normal Bavarian state rules
  from `date-holidays`.
- With a municipality, `location-resolver.js` looks up its official eight-digit
  code and Assumption Day status in `data/DE-BY-municipalities.json`.
- Code `09761000` (Augsburg) selects the provider region `A`, which includes the
  Augsburg Peace Festival on August 8.
- Every other municipality selects `KATH` when the official mapping marks
  Assumption Day as a holiday, otherwise `EVANG`.

This is not a hand-maintained list of local holidays. The mapping is generated
from the [Bavarian State Office for Statistics municipality database](https://www.statistik.bayern.de/statistik/gebiet_bevoelkerung/zensus/himmelfahrt/).
Under [Article 1 of the Bavarian Public Holidays Act](https://www.gesetze-bayern.de/Content/Document/BayFTG-1),
that office determines the affected municipalities from the latest census;
Augsburg's Peace Festival is specified separately by the same law. The current
official page states that the Census 2022 classification applies from August 15,
2025.

The authority page is a reliable primary source, but it is an HTML database page,
not a versioned programming interface. The importer therefore fails closed: it
accepts the download only when all 2,056 municipality records are present, all
official codes are unique, and every required field is valid. A changed page
layout causes a visible source-check failure instead of silently replacing good
data with an incomplete list. Runtime calculations use only the validated data
bundled with the released module.

Maintainers can refresh the checked-in data with:

```sh
npm run update:bavaria-municipalities
```

The generated file records its exact source URL, legal/data basis, and generation
timestamp. `NOTICE.md` contains the attribution.

## Source updates and monthly maintenance

There are two different operations, and V1 keeps them separate on purpose:

1. **Fetch and verify:** retrieve current source metadata/data, validate it, and
   compare it with the installed release.
2. **Install an update:** change a dependency or bundled municipality file,
   rerun tests, review the result, and publish/deploy a new module release.

The first operation is automated. The second is not performed silently on a
running mirror because upstream code or changed legal data could otherwise alter
results without tests, review, or a rollback point.

### Checks performed by the running module

With `sourceHealth.enabled: true` (the default), the Node helper performs these
online checks at most every 30 days and stores the result in
`.cache/source-health.json`:

- compare the pinned `date-holidays` version with npm's current release,
- verify through the GitHub repository metadata that the upstream repository is
  neither archived nor disabled, and warn when its last push is older than
  `repositoryStaleAfterDays`,
- download the official Bavarian municipality table, validate all invariants,
  and compare calculation-relevant fields with the bundled mapping.

Only an available update, an invalid/stale source, or an unavailable check is
shown in a small footer below the countdowns. Healthy sources stay invisible.
The runtime footer also filters by the active configuration: Bavarian municipality
data is shown only for a configured Bavarian municipality, and `date-holidays`
messages are shown only when that provider is enabled.
An unavailable or invalid verification source does not invalidate locally
calculated countdowns. “Unavailable” means freshness could not be checked because
of a transport/HTTP failure; “invalid” means a reachable response did not satisfy
the expected schema or completeness checks. Failed network checks are retried
after one day rather than being cached for a full month.

| `sourceHealth` option | Default | Meaning |
| --- | --- | --- |
| `enabled` | `true` | Enable the optional online maintenance check |
| `checkInterval` | `2592000000` | Healthy-result cache duration (30 days) |
| `requestTimeout` | `15000` | Maximum wait per HTTPS request in milliseconds |
| `repositoryStaleAfterDays` | `365` | Warn after this many days without an upstream push |
| `showUnavailable` | `true` | Show a footer when a source could not be checked |

Set `enabled: false` for a fully offline installation. This disables freshness
notices only; all holiday and countdown calculations still use local released
data in either mode.

### Checks performed by the GitHub repository

`.github/workflows/monthly-source-check.yml` runs on the first day of every month
and can also be started manually. It installs the exact lockfile, runs all tests,
and executes:

```sh
npm run check:sources
```

The job fails on every source state requiring review, allowing normal GitHub
Actions notifications to alert maintainers. `.github/dependabot.yml` separately
opens a monthly pull request when npm dependencies have updates. Neither mechanism
commits municipality data or publishes a release automatically.

A responsible source update is therefore:

1. review the failed check or Dependabot pull request,
2. for municipality changes run `npm run update:bavaria-municipalities`,
3. review the exact data difference and its official basis,
4. run `npm ci`, `npm run check`, and `npm run check:sources`,
5. publish and deploy a new tagged release.

This cycle checks both whether data changed and whether the principal dependency
still appears maintained. It cannot guarantee future maintenance by a third
party; an archived/disabled or unusually inactive repository is made visible so
the maintainer can replace the provider deliberately.

## Development

The calculation code is deliberately independent from MagicMirror:

```sh
npm test
```

This makes date rules testable without starting MagicMirror or a browser.

Before a release, run:

```sh
npm ci
npm run check
npm pack --dry-run
```

V1 was tested with MagicMirror² 2.38.0 and Node.js 24 on Raspberry Pi. The
package requires Node.js 22 or newer.

## Data attribution

The bundled Bavarian municipality mapping is derived from data published by the
Bavarian State Office for Statistics. See [`NOTICE.md`](NOTICE.md) for the exact
source and scope. Third-party JavaScript dependencies retain their own licenses.

## License

MIT
~~~~

### Nachher

~~~~markdown
# MMM-CalendarAwareCountdown

A calendar-aware multi-countdown module for MagicMirror². It can show calendar
days, regional working days, selected weekdays, and a live duration while taking
public holidays and personal days off into account.

Version 1.0 is the first stable release. The calculation rules and configuration
keys documented below are the supported V1 interface.

## Features

- Multiple countdowns in a responsive grid
- Calendar-day calculation based on local dates
- Working days based on a configurable working week
- Worldwide country-level and available subdivision holidays through `date-holidays`
- Municipality-aware Bavarian holidays from official local data
- Global and countdown-specific days off as dates or date ranges
- Counts selected weekdays, for example Mondays
- Live days/hours/minutes/seconds display
- German and English labels
- Offline countdown calculation; optional monthly online source-health checks

## Installation

From the MagicMirror `modules` directory:

```sh
git clone https://github.com/spitzlbergerj/MMM-CalendarAwareCountdown.git
cd MMM-CalendarAwareCountdown
npm ci --omit=dev
```

Restart MagicMirror after adding the module to `config/config.js`.

## Example configuration

```js
{
  module: "MMM-CalendarAwareCountdown",
  position: "top_center",
  header: "Upcoming events",
  config: {
    language: "en",
    location: {
      timeZone: "Europe/Berlin",
      country: "DE",
      state: "BE",
      municipality: null
    },
    holidaySources: [
      {
        provider: "date-holidays",
        types: ["public"],
        onUnsupportedLocation: "warn"
      }
    ],
    minimumColumnWidth: "140px",
    sourceHealth: {
      enabled: true,
      checkInterval: 30 * 24 * 60 * 60 * 1000,
      requestTimeout: 15000,
      repositoryStaleAfterDays: 365,
      showUnavailable: true
    },

    customDaysOff: [
      "2030-05-10",
      { start: "2030-08-05", end: "2030-08-09", label: "Vacation" }
    ],

    countdowns: [
      {
        id: "conference",
        title: "Conference",
        target: "2030-09-15",
        calculations: ["calendarDays"]
      },
      {
        id: "anniversary",
        title: "Anniversary",
        target: "2030-10-20",
        calculations: ["calendarDays"]
      },
      {
        id: "project-launch",
        title: "Project launch",
        target: "2030-12-01",
        daysOff: [
          { start: "2030-11-04", end: "2030-11-05", label: "Project only" }
        ],
        calculations: ["calendarDays", "workdays"]
      }
    ]
  }
}
```

With two number-based calculations, the automatic presentation uses a combined
value such as `120 / 78`. Set `display: "separate"` on a countdown to put the
values on separate lines.

The grid creates as many equal-width columns as the available MagicMirror region
can hold. Further countdowns wrap into a new row. `minimumColumnWidth` controls
when wrapping occurs; there is no fixed column count.

## Counting convention

The module counts the interval **including today but excluding the target date**,
written mathematically as `[today, target)`. This produces the
same familiar result as the difference between two calendar dates. For example,
2030-01-01 to 2030-01-31 is 30 calendar days.

Working days use the same interval and remove:

1. days outside `workWeekdays`,
2. public holidays for the configured country/state/region,
3. dates in the global `customDaysOff`,
4. dates in the countdown's own `daysOff`.

All days off are whole calendar days. On the target date a countdown shows `0`.
After the target date it remains visible and shows `-`.

### Days off and inclusive ranges

Use a date string for one free day and an object for a range:

```js
customDaysOff: [
  "2027-01-04",
  { start: "2027-05-03", end: "2027-05-10", label: "Vacation" }
]
```

Both `start` and `end` are included. The example range therefore expands to all
calendar dates from May 3 through May 10, including both dates. Expansion does
not mean that every expanded date is subtracted from a working-day result. A
date reduces `workdays` only when all of the following are true:

1. it lies inside `[today, target)`,
2. it is one of the configured `workWeekdays`,
3. it is not already a public holiday,
4. it has not already been supplied by another overlapping day-off entry.

This prevents double subtraction. For a Monday-to-Friday work week, weekends in
a vacation range have no effect. If a vacation date is also a public holiday, it
has already been removed and is not removed a second time. A range beginning on
the target date has no effect because the target date is excluded.

Global `customDaysOff` apply to every countdown. A countdown's own `daysOff`
apply only to that countdown. Both lists use the same string and inclusive-range
formats, and their dates are merged without duplicates.

A `weekday` calculation counts the selected weekdays regardless of holidays by
default. Set `excludeHolidays` or `excludeCustomDaysOff` to `true` when it should
only count usable days.

## Main configuration

| Option | Default | Meaning |
| --- | --- | --- |
| `language` | `de` | Language for module and holiday data |
| `location` | see example | Shared location used by holiday sources |
| `holidaySources` | `date-holidays` | One or more holiday-data providers |
| `workWeekdays` | `[1,2,3,4,5]` | ISO weekdays; Monday is 1, Sunday is 7 |
| `customDaysOff` | `[]` | Personal dates and inclusive date ranges |
| `minimumColumnWidth` | `220px` | Minimum width before equal columns wrap |
| `showMetricLabels` | `true` | Show labels below values |
| `showSourceWarnings` | `true` | Show a visible warning after a location fallback |
| `sourceHealth` | see below | Optional online maintenance checks; calculations remain local |
| `updateInterval` | `3600000` | Full recalculation interval in milliseconds |
| `animationSpeed` | `500` | MagicMirror DOM update animation in milliseconds |

### Countdown configuration

| Option | Default | Meaning |
| --- | --- | --- |
| `id` | title | Stable identifier for the countdown |
| `title` | required | Heading shown above the value |
| `target` | required | `YYYY-MM-DD` or an ISO timestamp for `duration` |
| `calculations` | `["calendarDays"]` | One or more calculation definitions |
| `daysOff` | `[]` | Dates and inclusive ranges used only by this countdown |
| `display` | `auto` | `auto` combines two numeric values; `separate` uses rows |

### Location

| Option | Meaning |
| --- | --- |
| `timeZone` | IANA time zone used to determine the current local date |
| `country` | ISO 3166-1 alpha-2 country code |
| `state` | Optional country subdivision code |
| `municipality` | Optional municipality name for finer local rules |
| `municipalityCode` | Optional official code if a municipality name is ambiguous |

### Holiday sources and coverage

Version 1 has the following explicit support promise:

- country-level holiday calculation for every country available in
  [`date-holidays`](https://github.com/commenthol/date-holidays), currently more
  than 200 countries,
- state/province/canton/region calculation wherever that provider supplies the
  subdivision,
- municipality-level calculation where this module has a dedicated local
  resolver, initially all Bavarian municipalities,
- manual correction or extension through global `customDaysOff` and per-countdown
  `daysOff`.

Holiday calculation is provider-based. Version 1 contains the following sources:

| Provider | Network | Coverage |
| --- | --- | --- |
| `date-holidays` | No | Countries and the subdivisions/regions supplied by the library |
| `none` | No | Disables automatic public holidays |

The module does not claim municipality precision where the provider has none. Every source
reports whether it used country, state, region, or municipality data. If a
requested municipality cannot be resolved, `onUnsupportedLocation` controls the
behavior:

- `warn` (default): use state/country rules and show a warning
- `error`: stop the calculation rather than use less precise data
- `silent`: use state/country rules without displaying a warning

An advanced `region` value can be set on the individual source when the provider
has a regional code but no automatic municipality resolver.

The provider boundary deliberately allows later adapters for a web API or iCalendar
feed without changing countdown calculations. A generic arbitrary-JSON endpoint is
not accepted: each provider needs a defined schema, validation, caching, and a clear
fallback policy.

### Internal provider contract

Holiday providers do not pass their native response directly into countdown
calculation. Every adapter must return the following normalized structure:

```js
{
  dates: new Set(["2030-01-01", "2030-12-25"]),
  report: {
    provider: "provider-name",
    coverage: "country", // country, state, region, municipality, or none
    status: "exact",     // exact or fallback
    diagnostics: []
  }
}
```

`dates` may contain only validated local dates in `YYYY-MM-DD` format. Multiple
providers are combined as a set, so the same holiday is never subtracted twice.
`report` explains the actual geographic precision and any fallback. This is the
fixed internal format into which another data source can be integrated. A new
web API, iCalendar feed, or national library therefore needs a small adapter that
validates its native data and produces this contract; the countdown algorithms
and display do not need to know the original source format.

## How holiday and working-day calculation works

The complete calculation is intentionally split into four explicit stages:

1. `location-resolver.js` resolves the configured country, state, and optional
   municipality into the best supported holiday region. It also reports whether
   the result is exact or a documented fallback.
2. `holiday-sources.js` asks each configured provider for all years covered by
   the active countdowns and normalizes the results to a set of date keys.
3. `countdown-calculator.js` iterates over `[today, target)`. A date counts as a
   working day only when its ISO weekday is in `workWeekdays`, it is not in the
   public-holiday set, and it is not in the merged global/per-countdown day-off
   set.
4. The browser receives only calculated values and diagnostics. It does not
   reproduce holiday rules and cannot accidentally calculate them differently.

`date-holidays` is installed locally at the exact version recorded in
`package-lock.json`. Normal countdown operation therefore does not call a web
service and keeps working without internet access. The separate source-health
check described below never changes a result during a calculation.

## Calculation types

| Type | Result |
| --- | --- |
| `calendarDays` | Local calendar days until the target |
| `workdays` | Configured workdays minus public holidays and personal days off |
| `weekday` | Occurrences of selected ISO weekdays |
| `duration` | Live duration to an exact timestamp |

For `duration`, an ISO timestamp with UTC offset is recommended, for example
`2027-08-14T06:00:00+02:00`. This makes the intended instant unambiguous.

## Bavarian municipality data

The special Bavarian handling is deliberately small and traceable:

- Germany/Bavaria without a municipality uses the normal Bavarian state rules
  from `date-holidays`.
- With a municipality, `location-resolver.js` looks up its official eight-digit
  code and Assumption Day status in `data/DE-BY-municipalities.json`.
- Code `09761000` (Augsburg) selects the provider region `A`, which includes the
  Augsburg Peace Festival on August 8.
- Every other municipality selects `KATH` when the official mapping marks
  Assumption Day as a holiday, otherwise `EVANG`.

This is not a hand-maintained list of local holidays. The mapping is generated
from the [Bavarian State Office for Statistics municipality database](https://www.statistik.bayern.de/statistik/gebiet_bevoelkerung/zensus/himmelfahrt/).
Under [Article 1 of the Bavarian Public Holidays Act](https://www.gesetze-bayern.de/Content/Document/BayFTG-1),
that office determines the affected municipalities from the latest census;
Augsburg's Peace Festival is specified separately by the same law. The current
official page states that the Census 2022 classification applies from August 15,
2025.

The authority page is a reliable primary source, but it is an HTML database page,
not a versioned programming interface. The importer therefore fails closed: it
accepts the download only when all 2,056 municipality records are present, all
official codes are unique, and every required field is valid. A changed page
layout causes a visible source-check failure instead of silently replacing good
data with an incomplete list. Runtime calculations use only the validated data
bundled with the released module.

Maintainers can refresh the checked-in data with:

```sh
npm run update:bavaria-municipalities
```

The generated file records its exact source URL, legal/data basis, and generation
timestamp. `NOTICE.md` contains the attribution.

## Source updates and monthly maintenance

There are two different operations, and V1 keeps them separate on purpose:

1. **Fetch and verify:** retrieve current source metadata/data, validate it, and
   compare it with the installed release.
2. **Install an update:** change a dependency or bundled municipality file,
   rerun tests, review the result, and publish/deploy a new module release.

The first operation is automated. The second is not performed silently on a
running mirror because upstream code or changed legal data could otherwise alter
results without tests, review, or a rollback point.

### Checks performed by the running module

With `sourceHealth.enabled: true` (the default), the Node helper performs these
online checks at most every 30 days and stores the result in
`.cache/source-health.json`:

- compare the pinned `date-holidays` version with npm's current release,
- verify through the GitHub repository metadata that the upstream repository is
  neither archived nor disabled, and warn when its last push is older than
  `repositoryStaleAfterDays`,
- download the official Bavarian municipality table, validate all invariants,
  and compare calculation-relevant fields with the bundled mapping.

Only an available update, an invalid/stale source, or an unavailable check is
shown in a small footer below the countdowns. Healthy sources stay invisible.
The runtime footer also filters by the active configuration: Bavarian municipality
data is shown only for a configured Bavarian municipality, and `date-holidays`
messages are shown only when that provider is enabled.
An unavailable or invalid verification source does not invalidate locally
calculated countdowns. “Unavailable” means freshness could not be checked because
of a transport/HTTP failure; “invalid” means a reachable response did not satisfy
the expected schema or completeness checks. Failed network checks are retried
after one day rather than being cached for a full month.

| `sourceHealth` option | Default | Meaning |
| --- | --- | --- |
| `enabled` | `true` | Enable the optional online maintenance check |
| `checkInterval` | `2592000000` | Healthy-result cache duration (30 days) |
| `requestTimeout` | `15000` | Maximum wait per HTTPS request in milliseconds |
| `repositoryStaleAfterDays` | `365` | Warn after this many days without an upstream push |
| `showUnavailable` | `true` | Show a footer when a source could not be checked |

Set `enabled: false` for a fully offline installation. This disables freshness
notices only; all holiday and countdown calculations still use local released
data in either mode.

### Checks performed by the GitHub repository

`.github/workflows/monthly-source-check.yml` runs on the first day of every month
and can also be started manually. It installs the exact lockfile, runs all tests,
and executes:

```sh
npm run check:sources
```

The job fails on every source state requiring review, allowing normal GitHub
Actions notifications to alert maintainers. `.github/dependabot.yml` separately
opens a monthly pull request when npm dependencies have updates. Neither mechanism
commits municipality data or publishes a release automatically.

A responsible source update is therefore:

1. review the failed check or Dependabot pull request,
2. for municipality changes run `npm run update:bavaria-municipalities`,
3. review the exact data difference and its official basis,
4. run `npm ci`, `npm run check`, and `npm run check:sources`,
5. publish and deploy a new tagged release.

This cycle checks both whether data changed and whether the principal dependency
still appears maintained. It cannot guarantee future maintenance by a third
party; an archived/disabled or unusually inactive repository is made visible so
the maintainer can replace the provider deliberately.

## Development

The calculation code is deliberately independent from MagicMirror:

```sh
npm test
```

This makes date rules testable without starting MagicMirror or a browser.

Before a release, run:

```sh
npm ci
npm run check
npm pack --dry-run
```

V1 was tested with MagicMirror² 2.38.0 and Node.js 24 on Raspberry Pi. The
package requires Node.js 22 or newer.

## Data attribution

The bundled Bavarian municipality mapping is derived from data published by the
Bavarian State Office for Statistics. See [`NOTICE.md`](NOTICE.md) for the exact
source and scope. Third-party JavaScript dependencies retain their own licenses.

## License

MIT

~~~~



## package.json

Konkrete Notwendigkeit: Die npm-Paketmetadaten benötigen die bestätigte kanonische Repository-, Dokumentations- und Fehlerverfolgungsadresse, damit veröffentlichte Pakete eindeutig auf das GitHub-Projekt verweisen.

Abgrenzung: Alle nicht von dieser Adressänderung betroffenen Inhalte der vollständigen Datei blieben unverändert.

### Vorher

~~~~json
{
  "name": "mmm-calendarawarecountdown",
  "version": "1.0.0",
  "description": "Calendar-aware multi-countdowns for MagicMirror²",
  "main": "node_helper.js",
  "files": [
    "CHANGELOG.md",
    "NOTICE.md",
    "MMM-CalendarAwareCountdown.css",
    "MMM-CalendarAwareCountdown.js",
    "data/",
    "lib/",
    "node_helper.js",
    "scripts/",
    "translations/"
  ],
  "scripts": {
    "test": "node --test",
    "check": "node --check MMM-CalendarAwareCountdown.js && node --check node_helper.js && node --test",
    "check:sources": "node scripts/check-data-sources.js",
    "update:bavaria-municipalities": "node scripts/update-bavaria-municipalities.js"
  },
  "keywords": [
    "magicmirror",
    "countdown",
    "working-days",
    "public-holidays"
  ],
  "license": "MIT",
  "engines": {
    "node": ">=22"
  },
  "dependencies": {
    "date-holidays": "3.37.0"
  }
}
~~~~

### Nachher

~~~~json
{
  "name": "mmm-calendarawarecountdown",
  "version": "1.0.0",
  "description": "Calendar-aware multi-countdowns for MagicMirror²",
  "main": "node_helper.js",
  "homepage": "https://github.com/spitzlbergerj/MMM-CalendarAwareCountdown#readme",
  "repository": {
    "type": "git",
    "url": "git+https://github.com/spitzlbergerj/MMM-CalendarAwareCountdown.git"
  },
  "bugs": {
    "url": "https://github.com/spitzlbergerj/MMM-CalendarAwareCountdown/issues"
  },
  "files": [
    "CHANGELOG.md",
    "NOTICE.md",
    "MMM-CalendarAwareCountdown.css",
    "MMM-CalendarAwareCountdown.js",
    "data/",
    "lib/",
    "node_helper.js",
    "scripts/",
    "translations/"
  ],
  "scripts": {
    "test": "node --test",
    "check": "node --check MMM-CalendarAwareCountdown.js && node --check node_helper.js && node --test",
    "check:sources": "node scripts/check-data-sources.js",
    "update:bavaria-municipalities": "node scripts/update-bavaria-municipalities.js"
  },
  "keywords": [
    "magicmirror",
    "countdown",
    "working-days",
    "public-holidays"
  ],
  "license": "MIT",
  "engines": {
    "node": ">=22"
  },
  "dependencies": {
    "date-holidays": "3.37.0"
  }
}

~~~~


<!-- END -->

