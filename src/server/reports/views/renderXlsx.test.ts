import { describe, expect, it } from "vitest";
import * as XLSX from "xlsx";

import { renderSummaryByCategoryXlsx, renderTransactionsXlsx } from "./renderXlsx";

describe("renderXlsx", () => {
  it("gera XLSX de transações", () => {
    const bytes = renderTransactionsXlsx([
      {
        date: "2026-01-01",
        type: "receita",
        description: "Teste",
        amount: 10,
        categoryId: "1",
        categoryName: "Cat",
      },
    ]);
    expect(bytes.length).toBeGreaterThan(100);
    const wb = XLSX.read(bytes, { type: "array" });
    expect(wb.SheetNames).toContain("Transações");
  });

  it("gera XLSX de resumo", () => {
    const bytes = renderSummaryByCategoryXlsx([
      { categoryId: null, categoryName: "Sem categoria", despesas: 5, receitas: 10, total: 5 },
    ]);
    expect(bytes.length).toBeGreaterThan(100);
    const wb = XLSX.read(bytes, { type: "array" });
    expect(wb.SheetNames).toContain("Resumo");
  });
});

