import type { SupabaseClient } from "@supabase/supabase-js";
import type { CategoryLevel, BalanceByCategoryLevelRow } from "@/server/reports/models/types";


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

// ---------------------------------------------------------------------------
// Relatório: Saldo por Nível de Categoria
// ---------------------------------------------------------------------------

const LEVEL_FIELD: Record<CategoryLevel, string> = {
  fonte: "fonte_id",
  bloco: "bloco_id",
  grupo: "grupo_id",
  acao: "acao_id",
};

const ALL_LEVELS: CategoryLevel[] = ["fonte", "bloco", "grupo", "acao"];

/**
 * Fetches balance (receitas − despesas) aggregated by category hierarchy level.
 *
 * @param levels       - which levels to include; defaults to all 4
 * @param periodStart  - optional ISO date string (inclusive)
 * @param periodEnd    - optional ISO date string (inclusive)
 * @param categoryId   - optional: restrict to a specific category and its descendants
 */
export async function fetchBalanceByCategoryLevel(input: {
  supabase: SupabaseClient;
  periodStart?: string | null;
  periodEnd?: string | null;
  levels?: CategoryLevel[] | null;
  categoryId?: string | null;
}): Promise<BalanceByCategoryLevelRow[]> {
  const { supabase } = input;
  const levels = input.levels && input.levels.length > 0 ? input.levels : ALL_LEVELS;

  // Load all non-deleted categories
  const { data: catData, error: catErr } = await supabase
    .from("categories")
    .select("id, name, type, parent_id")
    .is("deleted_at", null);
  if (catErr) throw new Error(catErr.message);

  type CatRow = { id: string; name: string; type: string; parent_id: string | null };
  const allCats = ((catData ?? []) as Array<Record<string, unknown>>).map((r) => ({
    id: String(r.id),
    name: String(r.name ?? ""),
    type: String(r.type ?? ""),
    parent_id: r.parent_id == null ? null : String(r.parent_id),
  })) as CatRow[];

  // Build set of descendant IDs when filtering by a specific category
  let allowedIds: Set<string> | null = null;
  if (input.categoryId) {
    allowedIds = new Set<string>();
    const queue = [input.categoryId];
    while (queue.length > 0) {
      const cur = queue.shift()!;
      allowedIds.add(cur);
      for (const c of allCats) {
        if (c.parent_id === cur) queue.push(c.id);
      }
    }
  }

  const result: BalanceByCategoryLevelRow[] = [];

  for (const level of levels) {
    const field = LEVEL_FIELD[level];

    // Filter categories of this level
    const levelCats = allCats.filter(
      (c) => c.type === level && (allowedIds === null || allowedIds.has(c.id))
    );
    if (levelCats.length === 0) continue;

    const ids = levelCats.map((c) => c.id);

    // Build queries
    let revQ = supabase.from("revenues").select(`${field}, amount`).in(field, ids);
    if (input.periodStart) revQ = revQ.gte("date", input.periodStart);
    if (input.periodEnd) revQ = revQ.lte("date", input.periodEnd);

    let expQ = supabase.from("expenses").select(`${field}, amount`).in(field, ids);
    if (input.periodStart) expQ = expQ.gte("date", input.periodStart);
    if (input.periodEnd) expQ = expQ.lte("date", input.periodEnd);

    const [{ data: revData, error: revErr }, { data: expData, error: expErr }] =
      await Promise.all([revQ, expQ]);
    if (revErr) throw new Error(revErr.message);
    if (expErr) throw new Error(expErr.message);

    // Aggregate per category
    const receitasByCat = new Map<string, number>();
    for (const r of (revData ?? []) as unknown as Array<Record<string, unknown>>) {
      const cid = r[field] == null ? null : String(r[field]);
      if (!cid) continue;
      receitasByCat.set(cid, (receitasByCat.get(cid) ?? 0) + asNumber(r.amount));
    }

    const despesasByCat = new Map<string, number>();
    for (const r of (expData ?? []) as unknown as Array<Record<string, unknown>>) {
      const cid = r[field] == null ? null : String(r[field]);
      if (!cid) continue;
      despesasByCat.set(cid, (despesasByCat.get(cid) ?? 0) + asNumber(r.amount));
    }

    for (const cat of levelCats) {
      const receitas = receitasByCat.get(cat.id) ?? 0;
      const despesas = despesasByCat.get(cat.id) ?? 0;
      // Only include categories that have at least some movement
      if (receitas === 0 && despesas === 0) continue;
      result.push({
        level,
        categoryId: cat.id,
        categoryName: cat.name,
        receitas,
        despesas,
        saldo: receitas - despesas,
      });
    }
  }

  // Sort by level order, then alphabetically
  const levelOrder: Record<CategoryLevel, number> = { fonte: 0, bloco: 1, grupo: 2, acao: 3 };
  result.sort((a, b) => {
    const lo = levelOrder[a.level] - levelOrder[b.level];
    if (lo !== 0) return lo;
    return a.categoryName.localeCompare(b.categoryName, "pt-BR");
  });

  return result;
}
