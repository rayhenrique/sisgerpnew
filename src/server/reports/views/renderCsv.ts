import type { TransactionRow, SummaryByCategoryRow } from "@/server/reports/services/reportData";

function esc(v: string) {
  const needs = /[",\n\r;]/.test(v);
  const s = v.replace(/"/g, '""');
  return needs ? `"${s}"` : s;
}

export function renderTransactionsCsv(rows: TransactionRow[]) {
  const header = ["Data", "Tipo", "Descrição", "Categoria", "Valor"].join(";");
  const body = rows
    .map((r) =>
      [
        esc(r.date),
        esc(r.type),
        esc(r.description),
        esc(r.categoryName ?? ""),
        esc(String(r.amount)),
      ].join(";")
    )
    .join("\n");
  return `${header}\n${body}\n`;
}

export function renderSummaryByCategoryCsv(rows: SummaryByCategoryRow[]) {
  const header = ["Categoria", "Receitas", "Despesas", "Saldo"].join(";");
  const body = rows
    .map((r) =>
      [
        esc(r.categoryName),
        esc(String(r.receitas)),
        esc(String(r.despesas)),
        esc(String(r.total)),
      ].join(";")
    )
    .join("\n");
  return `${header}\n${body}\n`;
}

