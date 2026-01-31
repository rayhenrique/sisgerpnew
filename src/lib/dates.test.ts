import { describe, expect, it } from "vitest";

import {
  addDaysToIsoDateOnly,
  formatDateBR,
  isoDateFromDateInTimeZone,
  isoDateFromPartsInTimeZone,
  isIsoDateOnly,
} from "./dates";

describe("dates", () => {
  it("detecta ISO date-only", () => {
    expect(isIsoDateOnly("2026-01-01")).toBe(true);
    expect(isIsoDateOnly("2026-01-01T00:00:00Z")).toBe(false);
    expect(isIsoDateOnly("01/01/2026")).toBe(false);
  });

  it("formata date-only sem depender de timezone", () => {
    expect(formatDateBR("2026-01-01")).toBe("01/01/2026");
    expect(formatDateBR("2025-12-31")).toBe("31/12/2025");
  });

  it("soma dias em ISO date-only", () => {
    expect(addDaysToIsoDateOnly("2026-01-01", -1)).toBe("2025-12-31");
    expect(addDaysToIsoDateOnly("2026-01-31", 1)).toBe("2026-02-01");
  });

  it("gera ISO date a partir de partes no fuso de negócio", () => {
    expect(isoDateFromPartsInTimeZone({ year: 2026, month: 1, day: 1 })).toBe("2026-01-01");
  });

  it("resolve date-only corretamente perto da virada do dia no fuso de negócio", () => {
    expect(isoDateFromDateInTimeZone(new Date("2026-01-01T02:00:00.000Z"))).toBe("2025-12-31");
    expect(isoDateFromDateInTimeZone(new Date("2026-01-01T04:00:00.000Z"))).toBe("2026-01-01");
  });

  it("respeita timeZone explícito em timezone com DST", () => {
    expect(isoDateFromDateInTimeZone(new Date("2026-03-08T04:30:00.000Z"), "America/New_York")).toBe(
      "2026-03-07"
    );
    expect(isoDateFromDateInTimeZone(new Date("2026-03-08T06:30:00.000Z"), "America/New_York")).toBe(
      "2026-03-08"
    );
  });
});
