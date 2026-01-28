import { describe, expect, it } from "vitest";

import { mergeYearOptions, normalizeYearRange } from "./DashboardFilters";

describe("normalizeYearRange", () => {
  it("corrige min/max invertidos e ajusta ano", () => {
    expect(
      normalizeYearRange({ year: 2024, minYear: 2026, maxYear: 2020 })
    ).toEqual({ year: 2024, minYear: 2020, maxYear: 2026 });
  });

  it("clampa ano dentro do intervalo", () => {
    expect(
      normalizeYearRange({ year: 2030, minYear: 2020, maxYear: 2026 })
    ).toEqual({ year: 2026, minYear: 2020, maxYear: 2026 });
  });
});

describe("mergeYearOptions", () => {
  it("inclui ano atual ao trocar o ano", () => {
    expect(
      mergeYearOptions({ years: [2025, 2026], selectedYear: 2025, currentYear: 2027 })
    ).toEqual([2025, 2026, 2027]);
  });
});

