import type { MonthlyTotals } from "@/features/dashboard/types";

export type Periodicity =
  | "mensal"
  | "bimestral"
  | "trimestral"
  | "quadrimestral"
  | "semestral"
  | "anual";

export function monthsPerPeriod(periodicity: Periodicity) {
  switch (periodicity) {
    case "mensal":
      return 1;
    case "bimestral":
      return 2;
    case "trimestral":
      return 3;
    case "quadrimestral":
      return 4;
    case "semestral":
      return 6;
    case "anual":
      return 12;
  }
}

export function periodicityLabel(periodicity: Periodicity) {
  switch (periodicity) {
    case "mensal":
      return "Mensal";
    case "bimestral":
      return "Bimestral";
    case "trimestral":
      return "Trimestral";
    case "quadrimestral":
      return "Quadrimestral";
    case "semestral":
      return "Semestral";
    case "anual":
      return "Anual";
  }
}

export function groupMonthlyTotals(
  monthly: MonthlyTotals[],
  periodicity: Periodicity
): MonthlyTotals[] {
  const size = monthsPerPeriod(periodicity);
  if (size <= 1) return monthly;

  const result: MonthlyTotals[] = [];
  for (let i = 0; i < monthly.length; i += size) {
    const chunk = monthly.slice(i, i + size);
    const first = chunk[0];
    const last = chunk[chunk.length - 1];
    if (!first || !last) continue;
    const month = first.month === last.month ? first.month : `${first.month}–${last.month}`;
    const receitas = chunk.reduce((acc, r) => acc + r.receitas, 0);
    const despesas = chunk.reduce((acc, r) => acc + r.despesas, 0);
    result.push({ month, receitas, despesas });
  }

  return result;
}

