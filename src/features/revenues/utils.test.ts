import { describe, expect, it } from "vitest";

import { sumRevenueAmounts } from "./utils";

describe("sumRevenueAmounts", () => {
  it("soma valores numéricos", () => {
    const total = sumRevenueAmounts([
      { id: "1", description: "A", amount: 10, date: "2026-01-01", source_id: null, category_id: null, type: null, sourceName: null },
      { id: "2", description: "B", amount: 5.5, date: "2026-01-02", source_id: null, category_id: null, type: null, sourceName: null },
    ]);
    expect(total).toBe(15.5);
  });
});

