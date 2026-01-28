import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import type {
  Category,
  Expense,
  ExpenseClassification,
  ExpenseRow,
} from "@/features/expenses/types";

function wrapSupabaseError(error: { message: string; code?: string; details?: string | null; hint?: string | null }) {
  const err = new Error(error.message);
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
      model_type: "expenses",
      model_id: input.modelId,
      old_values: input.oldValues ?? null,
      new_values: input.newValues ?? null,
    };

    await supabase.from("audit_logs").insert(payload);
  } catch {
    return;
  }
}

export type ExpensesQuery = {
  search?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  pageSize?: number;
};

export type ExpensesPageResult = {
  rows: ExpenseRow[];
  totalCount: number;
};

export async function fetchExpenses(query: ExpensesQuery): Promise<ExpensesPageResult> {
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
    .from("expenses")
    .select(
      "id, description, amount, date, source_id, category_id, classification_id, type",
      { count: "exact" }
    )
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

  const expenses = (data ?? []) as Expense[];

  const sourceIds = Array.from(
    new Set(expenses.map((r) => r.source_id).filter(Boolean))
  ) as string[];
  const classificationIds = Array.from(
    new Set(expenses.map((r) => r.classification_id).filter(Boolean))
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

  let classificationById = new Map<string, ExpenseClassification>();
  if (classificationIds.length > 0) {
    const { data: classificationsData, error: classificationsError } =
      await supabase
        .from("expense_classifications")
        .select("id, name, code")
        .in("id", classificationIds);

    if (classificationsError) throw wrapSupabaseError(classificationsError);
    const classifications =
      (classificationsData ?? []) as ExpenseClassification[];
    classificationById = new Map(classifications.map((c) => [c.id, c]));
  }

  const rows = expenses.map((r) => {
    const classification = r.classification_id
      ? classificationById.get(r.classification_id)
      : undefined;

    return {
      ...r,
      sourceName: r.source_id ? sourceById.get(r.source_id)?.name ?? null : null,
      classificationCode: classification?.code ?? null,
      classificationName: classification?.name ?? null,
    };
  });

  return {
    rows,
    totalCount: count ?? 0,
  };
}

export async function fetchExpenseClassificationsForSelect(input?: {
  includeIds?: string[];
}): Promise<Array<{ id: string; name: string; code: string | null; active: boolean }>> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    throw new Error(
      "Supabase não configurado. Defina NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY."
    );
  }

  const includeIds = input?.includeIds ?? [];
  let q = supabase
    .from("expense_classifications")
    .select("id, name, code, active")
    .order("name", { ascending: true });

  if (includeIds.length > 0) {
    const ids = includeIds.join(",");
    q = q.or(`active.eq.true,id.in.(${ids})`);
  } else {
    q = q.eq("active", true);
  }

  const { data, error } = await q;
  if (error) throw wrapSupabaseError(error);
  const rows = (data ?? []) as Array<Record<string, unknown>>;
  return rows.map((r) => ({
    id: String(r.id),
    name: String(r.name ?? ""),
    code: r.code == null ? null : String(r.code),
    active: Boolean(r.active),
  }));
}

export async function createExpense(input: {
  description: string;
  amount: number;
  date: string;
  fonteId: string;
  blocoId: string;
  grupoId: string;
  acaoId: string;
  classificationId: string;
}): Promise<void> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    throw new Error(
      "Supabase não configurado. Defina NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY."
    );
  }

  const payload = {
    description: input.description,
    amount: input.amount,
    date: input.date,
    source_id: input.fonteId,
    category_id: input.acaoId,
    classification_id: input.classificationId,

    fonte_id: input.fonteId,
    bloco_id: input.blocoId,
    grupo_id: input.grupoId,
    acao_id: input.acaoId,
    expense_classification_id: input.classificationId,
  };

  const { data, error } = await supabase
    .from("expenses")
    .insert(payload)
    .select("id, description, amount, date, source_id, category_id, classification_id, type")
    .single();
  if (error) throw wrapSupabaseError(error);

  await insertAuditLog({
    action: "expense.create",
    modelId: String((data as Record<string, unknown>).id),
    newValues: data as Record<string, unknown>,
  });
}

export async function updateExpense(
  id: string,
  input: {
    description: string;
    amount: number;
    date: string;
    fonteId: string;
    blocoId: string;
    grupoId: string;
    acaoId: string;
    classificationId: string;
  }
): Promise<void> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    throw new Error(
      "Supabase não configurado. Defina NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY."
    );
  }

  const payload = {
    description: input.description,
    amount: input.amount,
    date: input.date,
    source_id: input.fonteId,
    category_id: input.acaoId,
    classification_id: input.classificationId,

    fonte_id: input.fonteId,
    bloco_id: input.blocoId,
    grupo_id: input.grupoId,
    acao_id: input.acaoId,
    expense_classification_id: input.classificationId,
  };

  const { data: oldRow, error: oldErr } = await supabase
    .from("expenses")
    .select("id, description, amount, date, source_id, category_id, classification_id, type")
    .eq("id", id)
    .maybeSingle();
  if (oldErr) throw wrapSupabaseError(oldErr);

  const { data: newRow, error } = await supabase
    .from("expenses")
    .update(payload)
    .eq("id", id)
    .select("id, description, amount, date, source_id, category_id, classification_id, type")
    .single();
  if (error) throw wrapSupabaseError(error);

  await insertAuditLog({
    action: "expense.update",
    modelId: id,
    oldValues: (oldRow ?? null) as Record<string, unknown> | null,
    newValues: newRow as Record<string, unknown>,
  });
}

export async function deleteExpense(id: string): Promise<void> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    throw new Error(
      "Supabase não configurado. Defina NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY."
    );
  }

  const { data: oldRow, error: oldErr } = await supabase
    .from("expenses")
    .select("id, description, amount, date, source_id, category_id, classification_id, type")
    .eq("id", id)
    .maybeSingle();
  if (oldErr) throw wrapSupabaseError(oldErr);

  const { error } = await supabase.from("expenses").delete().eq("id", id);
  if (error) throw wrapSupabaseError(error);

  await insertAuditLog({
    action: "expense.delete",
    modelId: id,
    oldValues: (oldRow ?? null) as Record<string, unknown> | null,
    newValues: null,
  });
}

