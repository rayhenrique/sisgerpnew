import { describe, it, expect } from "vitest";

import { expenseUpsertSchema } from "@/features/expenses/validation";

describe("expenseUpsertSchema", () => {
  it("valida campos obrigatórios", () => {
    const result = expenseUpsertSchema.safeParse({
      description: "",
      amountText: "",
      date: "",
      fonteId: "",
      blocoId: "",
      grupoId: "",
      acaoId: "",
      classificationId: "",
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
    expect(messages).toContain("Selecione a classificação");
  });

  it("aceita valor em formato BRL", () => {
    const result = expenseUpsertSchema.safeParse({
      description: "despesa teste",
      amountText: "R$ 1.500,00",
      date: "2026-02-02",
      fonteId: "fonte-1",
      blocoId: "bloco-1",
      grupoId: "grupo-1",
      acaoId: "acao-1",
      classificationId: "class-1",
    });

    expect(result.success).toBe(true);
  });

  it("rejeita data fora do formato ISO", () => {
    const result = expenseUpsertSchema.safeParse({
      description: "despesa teste",
      amountText: "R$ 1,00",
      date: "02/02/2026",
      fonteId: "fonte-1",
      blocoId: "bloco-1",
      grupoId: "grupo-1",
      acaoId: "acao-1",
      classificationId: "class-1",
    });

    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.error.issues.some((i) => i.message === "Data inválida")).toBe(true);
  });

  it("rejeita valor zero e valor acima do máximo", () => {
    const zero = expenseUpsertSchema.safeParse({
      description: "despesa teste",
      amountText: "R$ 0,00",
      date: "2026-02-02",
      fonteId: "fonte-1",
      blocoId: "bloco-1",
      grupoId: "grupo-1",
      acaoId: "acao-1",
      classificationId: "class-1",
    });
    expect(zero.success).toBe(false);
    if (!zero.success) {
      expect(zero.error.issues.some((i) => i.message === "Valor inválido")).toBe(true);
    }

    const aboveMax = expenseUpsertSchema.safeParse({
      description: "despesa teste",
      amountText: "R$ 10.000.000.000.000,00",
      date: "2026-02-02",
      fonteId: "fonte-1",
      blocoId: "bloco-1",
      grupoId: "grupo-1",
      acaoId: "acao-1",
      classificationId: "class-1",
    });
    expect(aboveMax.success).toBe(false);
    if (!aboveMax.success) {
      expect(aboveMax.error.issues.some((i) => i.message.includes("Valor máximo é"))).toBe(true);
    }
  });
});

