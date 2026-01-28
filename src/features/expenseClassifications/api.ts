import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import type {
  ExpenseClassification,
  StatusFilter,
} from "@/features/expenseClassifications/types";

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
      model_type: "expense_classifications",
      model_id: input.modelId,
      old_values: input.oldValues ?? null,
      new_values: input.newValues ?? null,
    };

    await supabase.from("audit_logs").insert(payload);
  } catch {
    return;
  }
}

export type ExpenseClassificationsQuery = {
  search?: string;
  status?: StatusFilter;
  page?: number;
  pageSize?: number;
};

export type ExpenseClassificationsPageResult = {
  rows: ExpenseClassification[];
  totalCount: number;
};

export async function fetchExpenseClassifications(
  query: ExpenseClassificationsQuery
): Promise<ExpenseClassificationsPageResult> {
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
    .from("expense_classifications")
    .select("id, name, code, description, active", { count: "exact" })
    .order("name", { ascending: true });

  const status = query.status ?? "all";
  if (status === "active") q = q.eq("active", true);
  if (status === "inactive") q = q.eq("active", false);

  const search = (query.search ?? "").trim();
  if (search.length > 0) {
    const escaped = search.replaceAll(",", " ");
    q = q.or(`name.ilike.%${escaped}%,code.ilike.%${escaped}%`);
  }

  const { data, error, count } = await q.range(from, to);
  if (error) throw wrapSupabaseError(error);

  const rows = (data ?? []) as Array<Record<string, unknown>>;

  return {
    rows: rows.map((r) => {
      return {
        id: String(r.id),
        name: String(r.name ?? ""),
        code: r.code == null ? null : String(r.code),
        description: r.description == null ? null : String(r.description),
        active: Boolean(r.active),
      } satisfies ExpenseClassification;
    }),
    totalCount: count ?? 0,
  };
}

export async function createExpenseClassification(input: {
  name: string;
  code?: string | null;
  description?: string | null;
  active?: boolean;
}): Promise<void> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    throw new Error(
      "Supabase não configurado. Defina NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY."
    );
  }

  const payload = {
    name: input.name,
    code: input.code ?? null,
    description: input.description ?? null,
    active: typeof input.active === "boolean" ? input.active : true,
  };

  const { data, error } = await supabase
    .from("expense_classifications")
    .insert(payload)
    .select("id, name, code, description, active")
    .single();
  if (error) throw wrapSupabaseError(error);

  await insertAuditLog({
    action: "expense_classification.create",
    modelId: String((data as Record<string, unknown>).id),
    newValues: data as Record<string, unknown>,
  });
}

export async function updateExpenseClassification(
  id: string,
  input: {
    name: string;
    code?: string | null;
    description?: string | null;
    active?: boolean;
  }
): Promise<void> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    throw new Error(
      "Supabase não configurado. Defina NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY."
    );
  }

  const payload = {
    name: input.name,
    code: input.code ?? null,
    description: input.description ?? null,
    active: typeof input.active === "boolean" ? input.active : true,
  };

  const { data: oldRow, error: oldErr } = await supabase
    .from("expense_classifications")
    .select("id, name, code, description, active")
    .eq("id", id)
    .maybeSingle();
  if (oldErr) throw wrapSupabaseError(oldErr);

  const { data: newRow, error } = await supabase
    .from("expense_classifications")
    .update(payload)
    .eq("id", id)
    .select("id, name, code, description, active")
    .single();
  if (error) throw wrapSupabaseError(error);

  await insertAuditLog({
    action: "expense_classification.update",
    modelId: id,
    oldValues: (oldRow ?? null) as Record<string, unknown> | null,
    newValues: newRow as Record<string, unknown>,
  });
}

export async function setExpenseClassificationActive(
  id: string,
  active: boolean
): Promise<void> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    throw new Error(
      "Supabase não configurado. Defina NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY."
    );
  }

  const { data: oldRow, error: oldErr } = await supabase
    .from("expense_classifications")
    .select("id, name, code, description, active")
    .eq("id", id)
    .maybeSingle();
  if (oldErr) throw wrapSupabaseError(oldErr);

  const { data: newRow, error } = await supabase
    .from("expense_classifications")
    .update({ active })
    .eq("id", id)
    .select("id, name, code, description, active")
    .single();
  if (error) throw wrapSupabaseError(error);

  await insertAuditLog({
    action: active ? "expense_classification.enable" : "expense_classification.disable",
    modelId: id,
    oldValues: (oldRow ?? null) as Record<string, unknown> | null,
    newValues: newRow as Record<string, unknown>,
  });
}

export async function deleteExpenseClassification(id: string): Promise<void> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    throw new Error(
      "Supabase não configurado. Defina NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY."
    );
  }

  const { data: oldRow, error: oldErr } = await supabase
    .from("expense_classifications")
    .select("id, name, code, description, active")
    .eq("id", id)
    .maybeSingle();
  if (oldErr) throw wrapSupabaseError(oldErr);

  const { error } = await supabase.from("expense_classifications").delete().eq("id", id);
  if (error) throw wrapSupabaseError(error);

  await insertAuditLog({
    action: "expense_classification.delete",
    modelId: id,
    oldValues: (oldRow ?? null) as Record<string, unknown> | null,
    newValues: null,
  });
}

export async function isExpenseClassificationInUse(id: string): Promise<boolean> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    throw new Error(
      "Supabase não configurado. Defina NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY."
    );
  }

  const { count, error } = await supabase
    .from("expenses")
    .select("id", { count: "exact", head: true })
    .or(`classification_id.eq.${id},expense_classification_id.eq.${id}`);
  if (error) throw new Error(error.message);
  return (count ?? 0) > 0;
}
