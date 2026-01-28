import { describe, expect, it } from "vitest";

import type { SupabaseClient } from "@supabase/supabase-js";

import { fetchSummaryByCategory, fetchTransactions } from "./reportData";

type Builder = {
  select: (cols: string) => Builder;
  gte: (field: string, v: unknown) => Builder;
  lte: (field: string, v: unknown) => Builder;
  eq: (field: string, v: unknown) => Builder;
  is: (field: string, v: unknown) => Builder;
  then: (
    onFulfilled?: ((value: unknown) => unknown) | null,
    onRejected?: ((reason: unknown) => unknown) | null
  ) => Promise<unknown>;
};

function makeSupabaseMock(input: {
  categories: Array<{ id: number; name: string }>;
  revenues: Array<{ id: number; date: string; description: string; amount: unknown; category_id: number | null }>;
  expenses: Array<{ id: number; date: string; description: string; amount: unknown; category_id: number | null }>;
}) {
  return {
    from: (table: string) => {
      const filters = new Map<string, unknown>();

      function execute() {
        if (table === "categories") return { data: input.categories, error: null };
        if (table === "revenues") {
          const gte = filters.get("date_gte") as string | undefined;
          const lte = filters.get("date_lte") as string | undefined;
          const eqCat = filters.get("category_id_eq") as string | undefined;
          const rows = input.revenues.filter((r) => {
            if (gte && r.date < gte) return false;
            if (lte && r.date > lte) return false;
            if (eqCat && String(r.category_id) !== eqCat) return false;
            return true;
          });
          return { data: rows, error: null };
        }
        if (table === "expenses") {
          const gte = filters.get("date_gte") as string | undefined;
          const lte = filters.get("date_lte") as string | undefined;
          const eqCat = filters.get("category_id_eq") as string | undefined;
          const rows = input.expenses.filter((r) => {
            if (gte && r.date < gte) return false;
            if (lte && r.date > lte) return false;
            if (eqCat && String(r.category_id) !== eqCat) return false;
            return true;
          });
          return { data: rows, error: null };
        }
        return { data: [], error: null };
      }

      const builder = {} as Builder;
      Object.assign(builder, {
        select: (_cols: string) => builder,
        gte: (field: string, v: string) => {
          if (field === "date") filters.set("date_gte", v);
          return builder;
        },
        lte: (field: string, v: string) => {
          if (field === "date") filters.set("date_lte", v);
          return builder;
        },
        eq: (field: string, v: string) => {
          if (field === "category_id") filters.set("category_id_eq", v);
          return builder;
        },
        is: (_field: string, _v: null) => builder,
        then: (
          onFulfilled?: ((value: unknown) => unknown) | null,
          onRejected?: ((reason: unknown) => unknown) | null
        ) => Promise.resolve(execute()).then(onFulfilled ?? undefined, onRejected ?? undefined),
      });

      return builder;
    },
  };
}

describe("reportData", () => {
  it("mescla e ordena transações", async () => {
    const supabase = makeSupabaseMock({
      categories: [
        { id: 1, name: "Cat 1" },
        { id: 2, name: "Cat 2" },
      ],
      revenues: [{ id: 1, date: "2026-01-02", description: "R", amount: "10", category_id: 1 }],
      expenses: [{ id: 1, date: "2026-01-03", description: "E", amount: 4, category_id: 2 }],
    });

    const rows = await fetchTransactions({
      supabase: supabase as unknown as SupabaseClient,
      periodStart: "2026-01-01",
      periodEnd: "2026-01-31",
      categoryId: null,
    });

    expect(rows.length).toEqual(2);
    expect(rows[0]?.date).toEqual("2026-01-03");
    expect(rows[0]?.categoryName).toEqual("Cat 2");
    expect(rows[1]?.categoryName).toEqual("Cat 1");
  });

  it("agrega resumo por categoria", async () => {
    const supabase = makeSupabaseMock({
      categories: [{ id: 1, name: "Cat 1" }, { id: null as unknown as number, name: null as unknown as string }],
      revenues: [{ id: 1, date: "2026-01-02", description: "R", amount: 10, category_id: 1 }],
      expenses: [{ id: 1, date: "2026-01-03", description: "E", amount: 4, category_id: 1 }],
    });

    const rows = await fetchSummaryByCategory({
      supabase: supabase as unknown as SupabaseClient,
      periodStart: "2026-01-01",
      periodEnd: "2026-01-31",
      categoryId: null,
    });

    expect(rows.length).toEqual(1);
    expect(rows[0]?.categoryName).toEqual("Cat 1");
    expect(rows[0]?.receitas).toEqual(10);
    expect(rows[0]?.despesas).toEqual(4);
    expect(rows[0]?.total).toEqual(6);
  });
});

