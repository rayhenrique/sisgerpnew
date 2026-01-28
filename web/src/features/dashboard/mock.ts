import type { DashboardOverview } from "@/features/dashboard/types";

export function getDashboardMock(): DashboardOverview {
  const receitas = 7_640_343.43;
  const despesas = 0;

  return {
    totals: {
      receitas,
      despesas,
      saldo: receitas - despesas,
    },
    monthly: [
      { month: "Jan", receitas: 610_120.24, despesas: 0 },
      { month: "Fev", receitas: 588_001.14, despesas: 0 },
      { month: "Mar", receitas: 642_553.88, despesas: 0 },
      { month: "Abr", receitas: 603_880.61, despesas: 0 },
      { month: "Mai", receitas: 659_334.2, despesas: 0 },
      { month: "Jun", receitas: 621_778.51, despesas: 0 },
      { month: "Jul", receitas: 667_941.05, despesas: 0 },
      { month: "Ago", receitas: 649_210.93, despesas: 0 },
      { month: "Set", receitas: 630_011.71, despesas: 0 },
      { month: "Out", receitas: 646_330.52, despesas: 0 },
      { month: "Nov", receitas: 635_444.76, despesas: 0 },
      { month: "Dez", receitas: 685_735.88, despesas: 0 },
    ],
    categories: [
      { name: "Transferências", value: 3_210_000, color: "#0f4c81" },
      { name: "Convênios", value: 1_820_000, color: "#10b981" },
      { name: "Tributos", value: 1_260_000, color: "#3b82f6" },
      { name: "Serviços", value: 740_343.43, color: "#f59e0b" },
      { name: "Outros", value: 610_000, color: "#64748b" },
    ],
    recentTransactions: [
      {
        id: "tx_001",
        date: "2026-01-15",
        description: "Transferência estadual",
        type: "receita",
        amount: 1_245_000,
      },
      {
        id: "tx_002",
        date: "2026-01-14",
        description: "Arrecadação de tributos",
        type: "receita",
        amount: 385_420.75,
      },
      {
        id: "tx_003",
        date: "2026-01-12",
        description: "Convênio - saúde",
        type: "receita",
        amount: 910_000,
      },
      {
        id: "tx_004",
        date: "2026-01-10",
        description: "Serviços administrativos",
        type: "despesa",
        amount: 0,
      },
      {
        id: "tx_005",
        date: "2026-01-08",
        description: "Receita de serviços",
        type: "receita",
        amount: 124_321.33,
      },
    ],
  };
}

