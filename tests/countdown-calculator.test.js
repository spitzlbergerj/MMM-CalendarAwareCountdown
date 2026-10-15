"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const {
  calculateCountdown,
  countMatchingDays,
  dateKeyInTimeZone,
  isoWeekday,
  normalizeCustomDaysOff
} = require("../lib/countdown-calculator");

test("counts calendar days without daylight-saving errors", () => {
  const result = calculateCountdown(
    {
      title: "Werkstatt",
      target: "2027-06-17",
      calculations: ["calendarDays"]
    },
    {
      today: "2026-10-14",
      nowEpoch: new Date("2026-10-14T08:00:00+02:00").getTime(),
      holidays: new Set(),
      customDaysOff: new Set(),
      workWeekdays: new Set([1, 2, 3, 4, 5])
    }
  );

  assert.equal(result.calculations[0].value, 246);
});

test("counts working days and removes holidays and personal days off", () => {
  const result = calculateCountdown(
    {
      title: "Test",
      target: "2026-10-21",
      calculations: ["workdays"]
    },
    {
      today: "2026-10-14",
      nowEpoch: Date.now(),
      holidays: new Set(["2026-10-19"]),
      customDaysOff: new Set(["2026-10-20"]),
      workWeekdays: new Set([1, 2, 3, 4, 5])
    }
  );

  assert.equal(result.calculations[0].value, 3);
});

test("counts today and excludes the target date", () => {
  const result = calculateCountdown(
    {
      title: "Endpoint convention",
      target: "2026-10-20",
      calculations: ["workdays"]
    },
    {
      today: "2026-10-19",
      nowEpoch: Date.now(),
      holidays: new Set(),
      customDaysOff: new Set(),
      workWeekdays: new Set([1, 2, 3, 4, 5])
    }
  );

  assert.equal(result.calculations[0].value, 1);
});

test("combines global and countdown-specific days off", () => {
  const result = calculateCountdown(
    {
      title: "Personal calendar",
      target: "2026-10-21",
      daysOff: ["2026-10-20"],
      calculations: ["workdays"]
    },
    {
      today: "2026-10-19",
      nowEpoch: Date.now(),
      holidays: new Set(),
      customDaysOff: new Set(["2026-10-19"]),
      workWeekdays: new Set([1, 2, 3, 4, 5])
    }
  );

  assert.equal(result.calculations[0].value, 0);
});

test("counts selected weekdays independently from working-day rules", () => {
  assert.equal(
    countMatchingDays("2026-10-14", "2026-11-04", (date) => isoWeekday(date) === 1),
    3
  );
});

test("expands personal date ranges inclusively", () => {
  const result = normalizeCustomDaysOff([
    "2026-12-24",
    { start: "2026-12-28", end: "2026-12-30", label: "Urlaub" }
  ]);

  assert.deepEqual([...result], [
    "2026-12-24",
    "2026-12-28",
    "2026-12-29",
    "2026-12-30"
  ]);
});

test("days-off ranges include both endpoints and never double-count non-workdays", () => {
  const customDaysOff = normalizeCustomDaysOff([
    { start: "2026-11-13", end: "2026-11-16" },
    { start: "2027-01-04", end: "2027-01-05" },
    { start: "2027-02-25", end: "2027-03-01" },
    { start: "2027-05-03", end: "2027-05-10" },
    { start: "2027-06-17", end: "2027-06-30" }
  ]);
  const holidays = new Set([
    "2026-11-01",
    "2026-12-25",
    "2026-12-26",
    "2027-01-01",
    "2027-01-06",
    "2027-03-26",
    "2027-03-29",
    "2027-05-01",
    "2027-05-06",
    "2027-05-17",
    "2027-05-27"
  ]);

  const result = calculateCountdown(
    {
      title: "Werkstatt",
      target: "2027-06-17",
      calculations: ["calendarDays", "workdays"]
    },
    {
      today: "2026-10-14",
      nowEpoch: Date.now(),
      holidays,
      customDaysOff,
      workWeekdays: new Set([1, 2, 3, 4, 5])
    }
  );

  assert.deepEqual(
    result.calculations.map((calculation) => calculation.value),
    [246, 156]
  );
});

test("a day off beginning on the target date does not affect the result", () => {
  const result = calculateCountdown(
    {
      title: "Target boundary",
      target: "2027-06-17",
      daysOff: [{ start: "2027-06-17", end: "2027-06-30" }],
      calculations: ["workdays"]
    },
    {
      today: "2027-06-16",
      nowEpoch: Date.now(),
      holidays: new Set(),
      customDaysOff: new Set(),
      workWeekdays: new Set([1, 2, 3, 4, 5])
    }
  );

  assert.equal(result.calculations[0].value, 1);
});

test("derives the local date in the configured time zone", () => {
  const instant = new Date("2026-10-13T22:30:00Z");
  assert.equal(dateKeyInTimeZone(instant, "Europe/Berlin"), "2026-10-14");
  assert.equal(dateKeyInTimeZone(instant, "America/New_York"), "2026-10-13");
});
