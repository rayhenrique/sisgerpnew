import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import type { Category } from "@/features/categories/types";

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
      model_type: "categories",
      model_id: input.modelId,
      old_values: input.oldValues ?? null,
      new_values: input.newValues ?? null,
    };

    await supabase.from("audit_logs").insert(payload);
  } catch {
    return;
  }
}

export async function fetchCategories(): Promise<Category[]> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    throw new Error(
      "Supabase não configurado. Defina NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY."
    );
  }

  const { data, error } = await supabase
    .from("categories")
    .select("id, name, type, parent_id, code, description, active, deleted_at")
    .is("deleted_at", null)
    .order("name", { ascending: true });

  if (error) throw new Error(error.message);

  const rows = (data ?? []) as Array<Record<string, unknown>>;
  return rows.map((r) => {
    const parent = r.parent_id;
    return {
      id: String(r.id),
      name: String(r.name ?? ""),
      type: r.type as Category["type"],
      parent_id: parent === null || parent === undefined ? null : String(parent),
      code: (r.code as string | null | undefined) ?? null,
      description: (r.description as string | null | undefined) ?? null,
      active: (r.active as boolean | null | undefined) ?? true,
      deleted_at: (r.deleted_at as string | null | undefined) ?? null,
    } satisfies Category;
  });
}

export async function createCategory(input: {
  name: string;
  type: Category["type"];
  parentId: string | null;
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
    type: input.type,
    parent_id: input.parentId,
    code: input.code ?? null,
    description: input.description ?? null,
    active: typeof input.active === "boolean" ? input.active : true,
  };

  const { data, error } = await supabase
    .from("categories")
    .insert(payload)
    .select("id, name, type, parent_id, code, description, active, deleted_at")
    .single();
  if (error) throw wrapSupabaseError(error);

  await insertAuditLog({
    action: "category.create",
    modelId: String((data as Record<string, unknown>).id),
    newValues: data as Record<string, unknown>,
  });
}

export async function updateCategory(id: string, input: {
  name: string;
  type: Category["type"];
  parentId: string | null;
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
    type: input.type,
    parent_id: input.parentId,
    code: input.code ?? null,
    description: input.description ?? null,
    active: typeof input.active === "boolean" ? input.active : true,
  };

  const { data: oldRow, error: oldErr } = await supabase
    .from("categories")
    .select("id, name, type, parent_id, code, description, active, deleted_at")
    .eq("id", id)
    .maybeSingle();
  if (oldErr) throw wrapSupabaseError(oldErr);

  const { data: newRow, error } = await supabase
    .from("categories")
    .update(payload)
    .eq("id", id)
    .select("id, name, type, parent_id, code, description, active, deleted_at")
    .single();
  if (error) throw wrapSupabaseError(error);

  await insertAuditLog({
    action: "category.update",
    modelId: id,
    oldValues: (oldRow ?? null) as Record<string, unknown> | null,
    newValues: newRow as Record<string, unknown>,
  });
}

export async function setCategoryActive(id: string, active: boolean): Promise<void> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    throw new Error(
      "Supabase não configurado. Defina NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY."
    );
  }

  const { data: oldRow, error: oldErr } = await supabase
    .from("categories")
    .select("id, name, type, parent_id, code, description, active, deleted_at")
    .eq("id", id)
    .maybeSingle();
  if (oldErr) throw wrapSupabaseError(oldErr);

  const { data: newRow, error } = await supabase
    .from("categories")
    .update({ active })
    .eq("id", id)
    .select("id, name, type, parent_id, code, description, active, deleted_at")
    .single();
  if (error) throw wrapSupabaseError(error);

  await insertAuditLog({
    action: active ? "category.enable" : "category.disable",
    modelId: id,
    oldValues: (oldRow ?? null) as Record<string, unknown> | null,
    newValues: newRow as Record<string, unknown>,
  });
}

export async function deleteCategory(id: string): Promise<void> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    throw new Error(
      "Supabase não configurado. Defina NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY."
    );
  }

  const { data: oldRow, error: oldErr } = await supabase
    .from("categories")
    .select("id, name, type, parent_id, code, description, active, deleted_at")
    .eq("id", id)
    .maybeSingle();
  if (oldErr) throw wrapSupabaseError(oldErr);

  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) throw wrapSupabaseError(error);

  await insertAuditLog({
    action: "category.delete",
    modelId: id,
    oldValues: (oldRow ?? null) as Record<string, unknown> | null,
    newValues: null,
  });
}

export async function isCategoryInUse(id: string): Promise<boolean> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    throw new Error(
      "Supabase não configurado. Defina NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY."
    );
  }

  const cols = ["source_id", "category_id", "fonte_id", "bloco_id", "grupo_id", "acao_id"];
  const or = cols.map((c) => `${c}.eq.${id}`).join(",");

  const { count: revCount, error: revErr } = await supabase
    .from("revenues")
    .select("id", { count: "exact", head: true })
    .or(or);
  if (revErr) throw new Error(revErr.message);
  if ((revCount ?? 0) > 0) return true;

  const { count: expCount, error: expErr } = await supabase
    .from("expenses")
    .select("id", { count: "exact", head: true })
    .or(or);
  if (expErr) throw new Error(expErr.message);
  return (expCount ?? 0) > 0;
}

