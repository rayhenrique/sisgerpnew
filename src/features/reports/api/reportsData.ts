import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import type { ReceitaReportRow } from "@/features/reports/types/receitas";
import { compareIsoDateOnlyAsc } from "@/lib/dates";

export type ReportFilters = {
  startDate?: string;
  endDate?: string;
  fonteId?: string | null;
  blocoId?: string | null;
  grupoId?: string | null;
  acaoId?: string | null;
  classificationId?: string | null;
};

export async function fetchReceitasReport(filters: ReportFilters): Promise<ReceitaReportRow[]> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    throw new Error("Supabase não configurado");
  }

  let query = supabase
    .from("revenues")
    .select(`
      id,
      description,
      amount,
      date,
      fonte_id,
      bloco_id,
      grupo_id,
      acao_id,
      observation,
      fonte:fonte_id(name),
      bloco:bloco_id(name),
      grupo:grupo_id(name),
      acao:acao_id(name)
    `)
    .order("date", { ascending: false });

  // Apply date filters
  if (filters.startDate) {
    query = query.gte("date", filters.startDate);
  }
  if (filters.endDate) {
    query = query.lte("date", filters.endDate);
  }

  // Apply category filters
  if (filters.fonteId) {
    query = query.eq("fonte_id", filters.fonteId);
  }
  if (filters.blocoId) {
    query = query.eq("bloco_id", filters.blocoId);
  }
  if (filters.grupoId) {
    query = query.eq("grupo_id", filters.grupoId);
  }
  if (filters.acaoId) {
    query = query.eq("acao_id", filters.acaoId);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Erro ao buscar receitas: ${error.message}`);
  }

  return (data || []).map((row: any) => ({
    id: String(row.id),
    data: row.date,
    descricao: row.description,
    fonte: row.fonte?.name || "—",
    bloco: row.bloco?.name || "—",
    grupo: row.grupo?.name || "—",
    acao: row.acao?.name || "—",
    fonteId: row.fonte_id ? String(row.fonte_id) : null,
    blocoId: row.bloco_id ? String(row.bloco_id) : null,
    grupoId: row.grupo_id ? String(row.grupo_id) : null,
    acaoId: row.acao_id ? String(row.acao_id) : null,
    valor: parseFloat(row.amount),
    observacao: row.observation,
  }));
}

export type DespesaReportRow = {
  id: string;
  data: string;
  descricao: string;
  classificacao: string;
  classificacaoId: string | null;
  fonte: string;
  bloco: string;
  grupo: string;
  acao: string;
  fonteId: string | null;
  blocoId: string | null;
  grupoId: string | null;
  acaoId: string | null;
  valor: number;
  observacao: string | null;
};

export async function fetchDespesasReport(filters: ReportFilters): Promise<DespesaReportRow[]> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    throw new Error("Supabase não configurado");
  }

  let query = supabase
    .from("expenses")
    .select(`
      id,
      description,
      amount,
      date,
      fonte_id,
      bloco_id,
      grupo_id,
      acao_id,
      expense_classification_id,
      observation,
      fonte:fonte_id(name),
      bloco:bloco_id(name),
      grupo:grupo_id(name),
      acao:acao_id(name),
      classificacao:expense_classification_id(name)
    `)
    .order("date", { ascending: false });

  // Apply date filters
  if (filters.startDate) {
    query = query.gte("date", filters.startDate);
  }
  if (filters.endDate) {
    query = query.lte("date", filters.endDate);
  }

  // Apply category filters
  if (filters.fonteId) {
    query = query.eq("fonte_id", filters.fonteId);
  }
  if (filters.blocoId) {
    query = query.eq("bloco_id", filters.blocoId);
  }
  if (filters.grupoId) {
    query = query.eq("grupo_id", filters.grupoId);
  }
  if (filters.acaoId) {
    query = query.eq("acao_id", filters.acaoId);
  }

  // Apply classification filter
  if (filters.classificationId) {
    query = query.eq("expense_classification_id", filters.classificationId);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Erro ao buscar despesas: ${error.message}`);
  }

  return (data || []).map((row: any) => ({
    id: String(row.id),
    data: row.date,
    descricao: row.description,
    classificacao: row.classificacao?.name || "—",
    classificacaoId: row.expense_classification_id ? String(row.expense_classification_id) : null,
    fonte: row.fonte?.name || "—",
    bloco: row.bloco?.name || "—",
    grupo: row.grupo?.name || "—",
    acao: row.acao?.name || "—",
    fonteId: row.fonte_id ? String(row.fonte_id) : null,
    blocoId: row.bloco_id ? String(row.bloco_id) : null,
    grupoId: row.grupo_id ? String(row.grupo_id) : null,
    acaoId: row.acao_id ? String(row.acao_id) : null,
    valor: parseFloat(row.amount),
    observacao: row.observation,
  }));
}

export type BalancoReportRow = {
  tipo: "Receita" | "Despesa";
  data: string;
  descricao: string;
  fonte: string;
  bloco: string;
  grupo: string;
  acao: string;
  valor: number;
  saldo: number;
};

export async function fetchBalancoReport(filters: ReportFilters): Promise<BalancoReportRow[]> {
  const [receitas, despesas] = await Promise.all([
    fetchReceitasReport(filters),
    fetchDespesasReport(filters),
  ]);

  // Combine and sort by date
  const combined: BalancoReportRow[] = [];
  let saldoAcumulado = 0;

  // Convert to common format
  const receitasFormatted = receitas.map((r) => ({
    tipo: "Receita" as const,
    data: r.data,
    descricao: r.descricao,
    fonte: r.fonte,
    bloco: r.bloco,
    grupo: r.grupo,
    acao: r.acao,
    valor: r.valor,
    saldo: 0,
  }));

  const despesasFormatted = despesas.map((d) => ({
    tipo: "Despesa" as const,
    data: d.data,
    descricao: d.descricao,
    fonte: d.fonte,
    bloco: d.bloco,
    grupo: d.grupo,
    acao: d.acao,
    valor: d.valor,
    saldo: 0,
  }));

  // Combine and sort
  const allTransactions = [...receitasFormatted, ...despesasFormatted].sort(
    (a, b) => compareIsoDateOnlyAsc(a.data, b.data)
  );

  // Calculate running balance
  allTransactions.forEach((transaction) => {
    if (transaction.tipo === "Receita") {
      saldoAcumulado += transaction.valor;
    } else {
      saldoAcumulado -= transaction.valor;
    }
    transaction.saldo = saldoAcumulado;
    combined.push(transaction);
  });

  return combined;
}

export type SaldoReportRow = {
  nivel: "fonte" | "bloco" | "grupo" | "acao";
  categoriaId: string;
  categoria: string;
  receitas: number;
  despesas: number;
  saldo: number;
};

export async function fetchSaldosReport(filters: ReportFilters): Promise<SaldoReportRow[]> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    throw new Error("Supabase não configurado");
  }

  // Determine allowed levels
  // In the UI, the user selects a specific category from the cascading dropdowns.
  // We'll calculate the balance for all categories that match the filter.
  // To keep it simple and powerful, we will fetch all categories, then apply the hierarchy filter.
  const { data: catData, error: catErr } = await supabase
    .from("categories")
    .select("id, name, type, parent_id")
    .is("deleted_at", null);
  
  if (catErr) throw new Error(catErr.message);

  const allCats = (catData || []).map((c: any) => ({
    id: String(c.id),
    name: String(c.name || ""),
    type: String(c.type || ""),
    parent_id: c.parent_id ? String(c.parent_id) : null,
  }));

  // Figure out the lowest level filter selected
  let filterId = filters.acaoId || filters.grupoId || filters.blocoId || filters.fonteId || null;
  
  let allowedIds: Set<string> | null = null;
  if (filterId) {
    allowedIds = new Set<string>();
    const queue = [filterId];
    while (queue.length > 0) {
      const cur = queue.shift()!;
      allowedIds.add(cur);
      for (const c of allCats) {
        if (c.parent_id === cur) queue.push(c.id);
      }
    }
  }

  const result: SaldoReportRow[] = [];
  const levels = ["fonte", "bloco", "grupo", "acao"] as const;

  for (const level of levels) {
    const levelCats = allCats.filter(
      (c) => c.type === level && (allowedIds === null || allowedIds.has(c.id))
    );
    if (levelCats.length === 0) continue;

    const ids = levelCats.map((c) => c.id);
    const field = `${level}_id`;

    let revQ = supabase.from("revenues").select(`${field}, amount`).in(field, ids);
    if (filters.startDate) revQ = revQ.gte("date", filters.startDate);
    if (filters.endDate) revQ = revQ.lte("date", filters.endDate);

    let expQ = supabase.from("expenses").select(`${field}, amount`).in(field, ids);
    if (filters.startDate) expQ = expQ.gte("date", filters.startDate);
    if (filters.endDate) expQ = expQ.lte("date", filters.endDate);

    const [{ data: revData, error: revErr }, { data: expData, error: expErr }] = await Promise.all([
      revQ,
      expQ,
    ]);

    if (revErr) throw new Error(`Erro ao buscar receitas para ${level}: ${revErr.message}`);
    if (expErr) throw new Error(`Erro ao buscar despesas para ${level}: ${expErr.message}`);

    const receitasByCat = new Map<string, number>();
    for (const r of (revData || []) as any[]) {
      const cid = r[field] == null ? null : String(r[field]);
      if (!cid) continue;
      receitasByCat.set(cid, (receitasByCat.get(cid) ?? 0) + parseFloat(r.amount));
    }

    const despesasByCat = new Map<string, number>();
    for (const r of (expData || []) as any[]) {
      const cid = r[field] == null ? null : String(r[field]);
      if (!cid) continue;
      despesasByCat.set(cid, (despesasByCat.get(cid) ?? 0) + parseFloat(r.amount));
    }

    for (const cat of levelCats) {
      const receitas = receitasByCat.get(cat.id) ?? 0;
      const despesas = despesasByCat.get(cat.id) ?? 0;

      result.push({
        nivel: level,
        categoriaId: cat.id,
        categoria: cat.name,
        receitas,
        despesas,
        saldo: receitas - despesas,
      });
    }
  }

  // Sort by level order, then name
  const levelOrder = { fonte: 0, bloco: 1, grupo: 2, acao: 3 };
  result.sort((a, b) => {
    const lo = levelOrder[a.nivel] - levelOrder[b.nivel];
    if (lo !== 0) return lo;
    return a.categoria.localeCompare(b.categoria, "pt-BR");
  });

  return result;
}
