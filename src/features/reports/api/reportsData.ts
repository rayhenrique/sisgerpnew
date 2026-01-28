import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import type { ReceitaReportRow } from "@/features/reports/types/receitas";

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
    (a, b) => new Date(a.data).getTime() - new Date(b.data).getTime()
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
