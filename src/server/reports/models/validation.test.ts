import { describe, expect, it } from "vitest";

import { createReportJobSchema, scheduleSchema } from "./validation";

describe("createReportJobSchema", () => {
  it("valida período", () => {
    const res = createReportJobSchema.safeParse({
      reportKey: "transactions",
      category: "Financeiro",
      periodStart: "2026-01-10",
      periodEnd: "2026-01-01",
      format: "PDF",
      useCache: true,
    });
    expect(res.success).toBe(false);
  });
});

describe("scheduleSchema", () => {
  it("aceita um agendamento semanal", () => {
    const res = scheduleSchema.safeParse({
      name: "Meu agendamento",
      reportKey: "transactions",
      category: "Financeiro",
      format: "CSV",
      useCache: true,
      categoryId: null,
      periodWindow: "last30d",
      recurrence: "weekly",
      time: "08:00",
      weekday: 1,
    });
    expect(res.success).toBe(true);
  });
});

