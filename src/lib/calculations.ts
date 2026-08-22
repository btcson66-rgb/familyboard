export function addMonthsClamped(isoDate: string, months: number) {
  const date = new Date(`${isoDate}T12:00:00`);
  if (Number.isNaN(date.valueOf())) throw new Error("Invalid date");
  const day = date.getDate();
  date.setDate(1);
  date.setMonth(date.getMonth() + months);
  date.setDate(
    Math.min(
      day,
      new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate(),
    ),
  );
  return date.toISOString().slice(0, 10);
}

export function annualizedCost(cost: number, frequency: string) {
  const factors: Record<string, number> = {
    weekly: 52,
    monthly: 12,
    quarterly: 4,
    annual: 1,
    yearly: 1,
  };
  return cost * (factors[frequency.toLowerCase()] || 0);
}

export function annualizedActiveTotalsByCurrency(
  subscriptions: Array<{
    cost: number;
    billingFrequency: string;
    currency: string;
    status: string;
  }>,
) {
  return subscriptions
    .filter((item) => item.status === "active")
    .reduce<Record<string, number>>((totals, item) => {
      const currency = item.currency.trim().toUpperCase() || "UNSPECIFIED";
      totals[currency] =
        (totals[currency] || 0) +
        annualizedCost(item.cost, item.billingFrequency);
      return totals;
    }, {});
}

export function warrantyReviewDate(endDate: string, daysBefore: number) {
  const date = new Date(`${endDate}T12:00:00`);
  if (Number.isNaN(date.valueOf())) throw new Error("Invalid date");
  date.setDate(date.getDate() - daysBefore);
  return date.toISOString().slice(0, 10);
}
