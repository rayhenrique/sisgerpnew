import { describe, expect, it } from "vitest";

import { buildCron, nextRunAtFromCron, resolvePeriodWindow } from "./schedule";

describe("buildCron", () => {
  it("cria cron diário", () => {
    expect(buildCron({ recurrence: "daily", time: "08:30" })).toEqual("30 8 * * *");
  });

  it("cria cron semanal", () => {
    expect(buildCron({ recurrence: "weekly", time: "08:00", weekday: 2 })).toEqual("0 8 * * 2");
  });

  it("cria cron mensal", () => {
    expect(buildCron({ recurrence: "monthly", time: "08:00", dayOfMonth: 10 })).toEqual("0 8 10 * *");
  });
});

describe("nextRunAtFromCron", () => {
  it("retorna próxima execução diária", () => {
    const now = new Date("2026-01-18T12:00:00.000Z");
    const next = nextRunAtFromCron("0 8 * * *", now);
    expect(next?.toISOString()).toEqual("2026-01-19T08:00:00.000Z");
  });

  it("retorna próxima execução semanal", () => {
    const now = new Date("2026-01-18T12:00:00.000Z");
    const next = nextRunAtFromCron("0 8 * * 1", now);
    expect(next?.toISOString()).toEqual("2026-01-19T08:00:00.000Z");
  });

  it("retorna próxima execução mensal", () => {
    const now = new Date("2026-01-18T12:00:00.000Z");
    const next = nextRunAtFromCron("0 8 20 * *", now);
    expect(next?.toISOString()).toEqual("2026-01-20T08:00:00.000Z");
  });

  it("retorna null para cron inválido", () => {
    const now = new Date("2026-01-18T12:00:00.000Z");
    expect(nextRunAtFromCron("invalid", now)).toBeNull();
  });
});

describe("resolvePeriodWindow", () => {
  it("resolve last7d", () => {
    const now = new Date("2026-01-18T12:00:00.000Z");
    const r = resolvePeriodWindow({ window: "last7d", now });
    expect(r.periodEnd).toEqual("2026-01-18");
    expect(r.periodStart).toEqual("2026-01-12");
  });

  it("resolve yearToDate", () => {
    const now = new Date("2026-07-18T12:00:00.000Z");
    const r = resolvePeriodWindow({ window: "yearToDate", now });
    expect(r.periodStart).toEqual("2026-01-01");
    expect(r.periodEnd).toEqual("2026-07-18");
  });
});

