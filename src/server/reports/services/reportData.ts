import type { SupabaseClient } from "@supabase/supabase-js";

export type TransactionRow = {
  date: string;
  type: "receita" | "despesa";
  description: string;
  amount: number;
  categoryId: string | null;
  categoryName: string | null;
};

export type SummaryByCategoryRow = {
  categoryId: string | null;
  categoryName: string;
  despesas: number;
  receitas: number;
  total: number;
};

function asNumber(v: unknown) {
  if (typeof v === "number") return v;
  if (typeof v === "string") {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  }
  return 0;
}

export async function fetchCategoryNames(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from("categories")
    .select("id, name")
    .is("deleted_at", null);
  if (error) throw new Error(error.message);
  const map = new Map<string, string>();
  for (const row of (data ?? []) as Array<Record<string, unknown>>) {
    const id = row.id;
    const name = row.name;
    if (id == null || name == null) continue;
    map.set(String(id), String(name));
  }
  return map;
}

export async function fetchTransactions(input: {
  supabase: SupabaseClient;
  periodStart: string;
  periodEnd: string;
  categoryId?: string | null;
}) {
  const categories = await fetchCategoryNames(input.supabase);

  const revQ = input.supabase
    .from("revenues")
    .select("id, date, description, amount, category_id")
    .gte("date", input.periodStart)
    .lte("date", input.periodEnd);
  const expQ = input.supabase
    .from("expenses")
    .select("id, date, description, amount, category_id")
    .gte("date", input.periodStart)
    .lte("date", input.periodEnd);

  if (input.categoryId) {
    revQ.eq("category_id", input.categoryId);
    expQ.eq("category_id", input.categoryId);
  }

  const [{ data: revenues, error: revErr }, { data: expenses, error: expErr }] = await Promise.all([
    revQ,
    expQ,
  ]);
  if (revErr) throw new Error(revErr.message);
  if (expErr) throw new Error(expErr.message);

  const rows: TransactionRow[] = [];
  for (const r of (revenues ?? []) as Array<Record<string, unknown>>) {
    const cid = r.category_id == null ? null : String(r.category_id);
    rows.push({
      date: String(r.date),
      type: "receita",
      description: String(r.description ?? ""),
      amount: asNumber(r.amount),
      categoryId: cid,
      categoryName: cid ? categories.get(cid) ?? null : null,
    });
  }
  for (const r of (expenses ?? []) as Array<Record<string, unknown>>) {
    const cid = r.category_id == null ? null : String(r.category_id);
    rows.push({
      date: String(r.date),
      type: "despesa",
      description: String(r.description ?? ""),
      amount: asNumber(r.amount),
      categoryId: cid,
      categoryName: cid ? categories.get(cid) ?? null : null,
    });
  }

  rows.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
  return rows;
}

export async function fetchSummaryByCategory(input: {
  supabase: SupabaseClient;
  periodStart: string;
  periodEnd: string;
  categoryId?: string | null;
}) {
  const tx = await fetchTransactions(input);
  const map = new Map<string, SummaryByCategoryRow>();
  for (const row of tx) {
    const key = row.categoryId ?? "__sem_categoria__";
    const current = map.get(key) ?? {
      categoryId: row.categoryId,
      categoryName: row.categoryName ?? "Sem categoria",
      despesas: 0,
      receitas: 0,
      total: 0,
    };
    if (row.type === "receita") current.receitas += row.amount;
    else current.despesas += row.amount;
    current.total = current.receitas - current.despesas;
    map.set(key, current);
  }

  return Array.from(map.values()).sort((a, b) => Math.abs(b.despesas) - Math.abs(a.despesas));
}

