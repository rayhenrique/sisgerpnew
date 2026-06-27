import * as XLSX from "xlsx";

import type { TransactionRow, SummaryByCategoryRow } from "@/server/reports/services/reportData";
import type { BalanceByCategoryLevelRow } from "@/server/reports/models/types";

const LEVEL_LABEL: Record<string, string> = {
  fonte: "Fonte",
  bloco: "Bloco",
  grupo: "Grupo",
  acao: "Ação",
};

export function renderTransactionsXlsx(rows: TransactionRow[]) {
  const ws = XLSX.utils.json_to_sheet(
    rows.map((r) => ({
      Data: r.date,
      Tipo: r.type,
      Descrição: r.description,
      Categoria: r.categoryName ?? "",
      Valor: r.amount,
    }))
  );
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Transações");
  const out = XLSX.write(wb, { type: "array", bookType: "xlsx" }) as ArrayBuffer;
  return new Uint8Array(out);
}

export function renderSummaryByCategoryXlsx(rows: SummaryByCategoryRow[]) {
  const ws = XLSX.utils.json_to_sheet(
    rows.map((r) => ({
      Categoria: r.categoryName,
      Receitas: r.receitas,
      Despesas: r.despesas,
      Saldo: r.total,
    }))
  );
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Resumo");
  const out = XLSX.write(wb, { type: "array", bookType: "xlsx" }) as ArrayBuffer;
  return new Uint8Array(out);
}

export function renderBalanceByCategoryLevelXlsx(rows: BalanceByCategoryLevelRow[]) {
  const ws = XLSX.utils.json_to_sheet(
    rows.map((r) => ({
      Nível: LEVEL_LABEL[r.level] ?? r.level,
      Categoria: r.categoryName,
      Receitas: r.receitas,
      Despesas: r.despesas,
      Saldo: r.saldo,
    }))
  );
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Saldo por Nível");
  const out = XLSX.write(wb, { type: "array", bookType: "xlsx" }) as ArrayBuffer;
  return new Uint8Array(out);
}

