import { describe, expect, it } from "vitest";

import { renderSummaryByCategoryPdf, renderTransactionsPdf } from "./renderPdf";

function isPdf(bytes: Uint8Array) {
  const head = new TextDecoder().decode(bytes.slice(0, 4));
  return head === "%PDF";
}

describe("renderPdf", () => {
  it("gera PDF de transações", async () => {
    const bytes = await renderTransactionsPdf({
      rows: [
        {
          date: "2026-01-01",
          type: "receita",
          description: "Teste",
          amount: 10,
          categoryId: "1",
          categoryName: "Cat",
        },
      ],
      periodStart: "2026-01-01",
      periodEnd: "2026-01-31",
    });
    expect(bytes.length).toBeGreaterThan(200);
    expect(isPdf(bytes)).toBe(true);
  });

  it("gera PDF de resumo", async () => {
    const bytes = await renderSummaryByCategoryPdf({
      rows: [{ categoryId: null, categoryName: "Sem categoria", despesas: 5, receitas: 10, total: 5 }],
      periodStart: "2026-01-01",
      periodEnd: "2026-01-31",
    });
    expect(bytes.length).toBeGreaterThan(200);
    expect(isPdf(bytes)).toBe(true);
  });
});

