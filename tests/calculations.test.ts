import { describe, expect, it } from "vitest";
import {
  addMonthsClamped,
  annualizedActiveTotalsByCurrency,
  annualizedCost,
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
});
