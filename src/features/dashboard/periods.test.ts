import { describe, expect, it } from "vitest";

import { groupMonthlyTotals } from "./periods";

describe("groupMonthlyTotals", () => {
  it("agrega bimestral", () => {
    const monthly = [
      { month: "Jan", receitas: 1, despesas: 2 },
      { month: "Fev", receitas: 3, despesas: 4 },
      { month: "Mar", receitas: 5, despesas: 6 },
      { month: "Abr", receitas: 7, despesas: 8 },
    ];

    expect(groupMonthlyTotals(monthly, "bimestral")).toEqual([
      { month: "Jan–Fev", receitas: 4, despesas: 6 },
      { month: "Mar–Abr", receitas: 12, despesas: 14 },
    ]);
  });

  it("agrega anual", () => {
    const monthly = [
      { month: "Jan", receitas: 1, despesas: 2 },
      { month: "Fev", receitas: 3, despesas: 4 },
    ];
    expect(groupMonthlyTotals(monthly, "anual")).toEqual([
      { month: "Jan–Fev", receitas: 4, despesas: 6 },
    ]);
  });
});

