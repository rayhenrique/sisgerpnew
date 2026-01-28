import type { ReportDefinition } from "@/server/reports/models/types";

export const REPORT_DEFINITIONS: ReportDefinition[] = [
  {
    key: "transactions",
    category: "Financeiro",
    name: "Transações (Receitas e Despesas)",
    description: "Lista receitas e despesas no período, com filtro opcional por categoria.",
    supportsCategoryFilter: true,
  },
  {
    key: "summary_by_category",
    category: "Financeiro",
    name: "Resumo por Categoria",
    description: "Consolida valores do período agrupados por categoria.",
    supportsCategoryFilter: true,
  },
];

export function findReportDefinition(key: string) {
  return REPORT_DEFINITIONS.find((d) => d.key === key) ?? null;
}

