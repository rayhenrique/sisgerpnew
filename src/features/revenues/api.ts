import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import type { Category, Revenue, RevenueRow } from "@/features/revenues/types";

function friendlySupabaseMessage(error: {
  message: string;
  code?: string;
  details?: string | null;
  hint?: string | null;
}) {
  const raw = error.message ?? "Erro ao comunicar com o banco de dados";
  const code = error.code ?? "";

  if (code === "23502") return "Campos obrigatórios não preenchidos.";
  if (code === "23503") return "Referência inválida (categoria).";
  if (code === "23505") return "Registro duplicado.";
  if (code === "22P02") return "Formato inválido em um dos campos.";
  if (code === "22007") return "Data inválida.";

  const lower = raw.toLowerCase();
  if (lower.includes("row-level security") || lower.includes("violates row level security")) {
    return "Sem permissão para executar esta operação.";
  }

  return raw;
}

function wrapSupabaseError(error: { message: string; code?: string; details?: string | null; hint?: string | null }) {
  const err = new Error(friendlySupabaseMessage(error));
  (err as unknown as { code?: string }).code = error.code;
  (err as unknown as { details?: string | null }).details = error.details ?? null;
  (err as unknown as { hint?: string | null }).hint = error.hint ?? null;
  return err;
}

async function insertAuditLog(input: {
  action: string;
  modelId: string;
  oldValues?: Record<string, unknown> | null;
  newValues?: Record<string, unknown> | null;
}) {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return;
  try {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id;
    if (!userId) return;

    const payload = {
      user_id: userId,
      action: input.action,
      model_type: "revenues",
      model_id: input.modelId,
      old_values: input.oldValues ?? null,
      new_values: input.newValues ?? null,
    };

    await supabase.from("audit_logs").insert(payload);
  } catch {
    return;
  }
}

export type RevenuesQuery = {
  search?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  pageSize?: number;
};

export type RevenuesPageResult = {
  rows: RevenueRow[];
  totalCount: number;
};

export async function fetchRevenues(query: RevenuesQuery): Promise<RevenuesPageResult> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    throw new Error(
      "Supabase não configurado. Defina NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY."
    );
  }

  const pageSize = Math.min(Math.max(query.pageSize ?? 20, 1), 200);
  const page = Math.max(query.page ?? 1, 1);
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let q = supabase
    .from("revenues")
    .select("id, description, amount, date, source_id, category_id, type", {
      count: "exact",
    })
    .order("date", { ascending: false });

  if (query.search && query.search.trim().length > 0) {
    q = q.ilike("description", `%${query.search.trim()}%`);
  }

  if (query.startDate) {
    q = q.gte("date", query.startDate);
  }

  if (query.endDate) {
    q = q.lte("date", query.endDate);
  }

  const { data, error, count } = await q.range(from, to);
  if (error) throw wrapSupabaseError(error);

  const revenues = (data ?? []) as Revenue[];
  const sourceIds = Array.from(
    new Set(revenues.map((r) => r.source_id).filter(Boolean))
  ) as string[];

  let sourceById = new Map<string, Category>();
  if (sourceIds.length > 0) {
    const { data: sourcesData, error: sourcesError } = await supabase
      .from("categories")
      .select("id, name, type, parent_id")
      .in("id", sourceIds);

    if (sourcesError) throw wrapSupabaseError(sourcesError);
    const sources = (sourcesData ?? []) as Category[];
    sourceById = new Map(sources.map((s) => [s.id, s]));
  }

  const rows = revenues.map((r) => ({
    ...r,
    sourceName: r.source_id ? sourceById.get(r.source_id)?.name ?? null : null,
  }));

  return {
    rows,
    totalCount: count ?? 0,
  };
}

export async function createRevenue(input: {
  description: string;
  amount: number;
  date: string;
  fonteId: string;
  blocoId: string;
  grupoId: string;
  acaoId: string;
}): Promise<void> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    throw new Error(
      "Supabase não configurado. Defina NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY."
    );
  }

  const description = input.description.trim();
  if (description.length < 2) throw new Error("Informe a descrição");
  if (!Number.isFinite(input.amount) || input.amount <= 0) throw new Error("Valor inválido");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.date)) throw new Error("Data inválida");
  if (!input.fonteId) throw new Error("Selecione a fonte");
  if (!input.blocoId) throw new Error("Selecione o bloco");
  if (!input.grupoId) throw new Error("Selecione o grupo");
  if (!input.acaoId) throw new Error("Selecione a ação");

  const payload = {
    description,
    amount: input.amount,
    date: input.date,
    source_id: input.fonteId,
    category_id: input.acaoId,
    fonte_id: input.fonteId,
    bloco_id: input.blocoId,
    grupo_id: input.grupoId,
    acao_id: input.acaoId,
  };

  const { data, error } = await supabase
    .from("revenues")
    .insert(payload)
    .select("id, description, amount, date, source_id, category_id, type")
    .single();
  if (error) throw wrapSupabaseError(error);

  await insertAuditLog({
    action: "revenue.create",
    modelId: String((data as Record<string, unknown>).id),
    newValues: data as Record<string, unknown>,
  });
}

export async function updateRevenue(
  id: string,
  input: {
    description: string;
    amount: number;
    date: string;
    fonteId: string;
    blocoId: string;
    grupoId: string;
    acaoId: string;
  }
): Promise<void> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    throw new Error(
      "Supabase não configurado. Defina NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY."
    );
  }

  const description = input.description.trim();
  if (description.length < 2) throw new Error("Informe a descrição");
  if (!Number.isFinite(input.amount) || input.amount <= 0) throw new Error("Valor inválido");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.date)) throw new Error("Data inválida");
  if (!input.fonteId) throw new Error("Selecione a fonte");
  if (!input.blocoId) throw new Error("Selecione o bloco");
  if (!input.grupoId) throw new Error("Selecione o grupo");
  if (!input.acaoId) throw new Error("Selecione a ação");

  const payload = {
    description,
    amount: input.amount,
    date: input.date,
    source_id: input.fonteId,
    category_id: input.acaoId,
    fonte_id: input.fonteId,
    bloco_id: input.blocoId,
    grupo_id: input.grupoId,
    acao_id: input.acaoId,
  };

  const { data: oldRow, error: oldErr } = await supabase
    .from("revenues")
    .select("id, description, amount, date, source_id, category_id, type")
    .eq("id", id)
    .maybeSingle();
  if (oldErr) throw wrapSupabaseError(oldErr);

  const { data: newRow, error } = await supabase
    .from("revenues")
    .update(payload)
    .eq("id", id)
    .select("id, description, amount, date, source_id, category_id, type")
    .single();
  if (error) throw wrapSupabaseError(error);

  await insertAuditLog({
    action: "revenue.update",
    modelId: id,
    oldValues: (oldRow ?? null) as Record<string, unknown> | null,
    newValues: newRow as Record<string, unknown>,
  });
}

export async function deleteRevenue(id: string): Promise<void> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    throw new Error(
      "Supabase não configurado. Defina NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY."
    );
  }

  const { data: oldRow, error: oldErr } = await supabase
    .from("revenues")
    .select("id, description, amount, date, source_id, category_id, type")
    .eq("id", id)
    .maybeSingle();
  if (oldErr) throw wrapSupabaseError(oldErr);

  const { error } = await supabase.from("revenues").delete().eq("id", id);
  if (error) throw wrapSupabaseError(error);

  await insertAuditLog({
    action: "revenue.delete",
    modelId: id,
    oldValues: (oldRow ?? null) as Record<string, unknown> | null,
    newValues: null,
  });
}

