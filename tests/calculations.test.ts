import { describe, expect, it } from "vitest";
import {
  addMonthsClamped,
  annualizedActiveTotalsByCurrency,
  annualizedCost,
  eventOccursOnLocalDate,
  eventRangeIsValid,
  localIsoDate,
  sortByOptionalIsoDate,
  sortUpcomingThenPastIsoDate,
  warrantyReviewDate,
} from "../src/lib/calculations";
describe("date and cost rules", () => {
  it("clamps month-end recurrence", () =>
    expect(addMonthsClamped("2026-01-31", 1)).toBe("2026-02-28"));
  it("handles leap-year month end", () =>
    expect(addMonthsClamped("2028-01-31", 1)).toBe("2028-02-29"));
  it("annualizes supported frequencies", () => {
    expect(annualizedCost(10, "monthly")).toBe(120);
    expect(annualizedCost(10, "quarterly")).toBe(40);
  });
  it("keeps active subscription totals separated by currency", () => {
    expect(
      annualizedActiveTotalsByCurrency([
        {
          cost: 100,
          billingFrequency: "monthly",
          currency: "twd",
          status: "active",
        },
        {
          cost: 12,
          billingFrequency: "annual",
          currency: "USD",
          status: "active",
        },
        {
          cost: 999,
          billingFrequency: "annual",
          currency: "TWD",
          status: "cancelled",
        },
      ]),
    ).toEqual({ TWD: 1200, USD: 12 });
  });
  it("calculates warranty review date", () =>
    expect(warrantyReviewDate("2026-12-31", 30)).toBe("2026-12-01"));
  it("formats the browser's local calendar date instead of its UTC date", () =>
    expect(localIsoDate(new Date(2026, 7, 22, 23, 59))).toBe("2026-08-22"));
  it("rejects an event ending at or before its start", () => {
    expect(eventRangeIsValid("2026-08-22T18:00", "")).toBe(true);
    expect(eventRangeIsValid("2026-08-22T18:00", "2026-08-22T19:00")).toBe(true);
    expect(eventRangeIsValid("2026-08-22T18:00", "2026-08-22T18:00")).toBe(false);
    expect(eventRangeIsValid("2026-08-22T18:00", "2026-08-22T17:59")).toBe(false);
  });
  it("includes an overnight event on both local calendar dates", () => {
    expect(
      eventOccursOnLocalDate(
        "2026-08-22T23:00",
        "2026-08-23T01:00",
        "2026-08-22",
      ),
    ).toBe(true);
    expect(
      eventOccursOnLocalDate(
        "2026-08-22T23:00",
        "2026-08-23T01:00",
        "2026-08-23",
      ),
    ).toBe(true);
    expect(
      eventOccursOnLocalDate("2026-08-22T23:00", "", "2026-08-23"),
    ).toBe(false);
  });
  it("sorts dated records first without mutating the original list", () => {
    const records = [
      { id: "undated", dueDate: "" },
      { id: "later", dueDate: "2026-09-02" },
      { id: "earlier", dueDate: "2026-08-23" },
    ];
    expect(sortByOptionalIsoDate(records, (item) => item.dueDate)).toEqual([
      { id: "earlier", dueDate: "2026-08-23" },
      { id: "later", dueDate: "2026-09-02" },
      { id: "undated", dueDate: "" },
    ]);
    expect(records[0].id).toBe("undated");
  });
  it("shows upcoming dates first and keeps expired dates newest-first", () => {
    const warranties = [
      { id: "old-expired", endDate: "2025-03-01" },
      { id: "later", endDate: "2026-10-01" },
      { id: "recent-expired", endDate: "2026-08-20" },
      { id: "next", endDate: "2026-08-23" },
    ];
    expect(
      sortUpcomingThenPastIsoDate(
        warranties,
        (item) => item.endDate,
        "2026-08-22",
      ).map((item) => item.id),
    ).toEqual(["next", "later", "recent-expired", "old-expired"]);
    expect(warranties[0].id).toBe("old-expired");
  });
});
