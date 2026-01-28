import type { ExpenseRow } from "@/features/expenses/types";

export function sumExpenseAmounts(rows: ExpenseRow[]) {
  return rows.reduce(
    (acc, r) => acc + (typeof r.amount === "number" ? r.amount : 0),
    0
  );
}

