import { describe, expect, it } from "vitest";

import { renderSummaryByCategoryCsv, renderTransactionsCsv } from "./renderCsv";

describe("renderTransactionsCsv", () => {
  it("inclui cabeçalho e linhas", () => {
    const csv = renderTransactionsCsv([
      {
        date: "2026-01-01",
        type: "receita",
        description: "Teste",
        amount: 10,
        categoryId: "1",
        categoryName: "Cat",
      },
    ]);
    expect(csv).toContain("Data;Tipo;Descrição;Categoria;Valor");
    expect(csv).toContain("2026-01-01;receita;Teste;Cat;10");
  });
});

describe("renderSummaryByCategoryCsv", () => {
  it("inclui cabeçalho", () => {
    const csv = renderSummaryByCategoryCsv([
      { categoryId: null, categoryName: "Sem categoria", despesas: 5, receitas: 10, total: 5 },
    ]);
    expect(csv).toContain("Categoria;Receitas;Despesas;Saldo");
    expect(csv).toContain("Sem categoria;10;5;5");
  });
});

