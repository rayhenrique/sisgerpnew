import type { RevenueRow } from "@/features/revenues/types";

export function sumRevenueAmounts(rows: RevenueRow[]) {
  return rows.reduce(
    (acc, r) => acc + (typeof r.amount === "number" ? r.amount : 0),
    0
  );
}

