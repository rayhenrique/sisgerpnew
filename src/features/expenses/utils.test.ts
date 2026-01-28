import { describe, expect, it } from "vitest";

import { sumExpenseAmounts } from "./utils";

describe("sumExpenseAmounts", () => {
  it("soma valores numéricos", () => {
    const total = sumExpenseAmounts([
      {
        id: "1",
        description: "A",
        amount: 10,
        date: "2026-01-01",
        source_id: null,
        category_id: null,
        classification_id: null,
        type: null,
        sourceName: null,
        classificationCode: null,
        classificationName: null,
      },
      {
        id: "2",
        description: "B",
        amount: 5.5,
        date: "2026-01-02",
        source_id: null,
        category_id: null,
        classification_id: null,
        type: null,
        sourceName: null,
        classificationCode: null,
        classificationName: null,
      },
    ]);
    expect(total).toBe(15.5);
  });
});

