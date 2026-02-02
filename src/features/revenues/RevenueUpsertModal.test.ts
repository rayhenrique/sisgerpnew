import { describe, it, expect } from "vitest";

import { revenueUpsertSchema } from "@/features/revenues/validation";

describe("revenueUpsertSchema", () => {
  it("valida campos obrigatórios", () => {
    const result = revenueUpsertSchema.safeParse({
      description: "",
      amountText: "",
      date: "",
      fonteId: "",
      blocoId: "",
      grupoId: "",
      acaoId: "",
    });

    expect(result.success).toBe(false);
    if (result.success) return;

    const messages = result.error.issues.map((i) => i.message);
    expect(messages).toContain("Informe a descrição");
    expect(messages).toContain("Informe o valor");
    expect(messages).toContain("Informe a data");
    expect(messages).toContain("Selecione a fonte");
    expect(messages).toContain("Selecione o bloco");
    expect(messages).toContain("Selecione o grupo");
    expect(messages).toContain("Selecione a ação");
  });

  it("aceita valor em formato BRL", () => {
    const result = revenueUpsertSchema.safeParse({
      description: "receita teste",
      amountText: "R$ 1.234,56",
      date: "2026-02-02",
      fonteId: "fonte-1",
      blocoId: "bloco-1",
      grupoId: "grupo-1",
      acaoId: "acao-1",
    });

    expect(result.success).toBe(true);
  });

  it("rejeita data fora do formato ISO", () => {
    const result = revenueUpsertSchema.safeParse({
      description: "receita teste",
      amountText: "R$ 1,00",
      date: "02/02/2026",
      fonteId: "fonte-1",
      blocoId: "bloco-1",
      grupoId: "grupo-1",
      acaoId: "acao-1",
    });

    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.error.issues.some((i) => i.message === "Data inválida")).toBe(true);
  });
});

