import { NextResponse } from "next/server";

import { getSupabaseServiceRoleClient } from "@/lib/supabase/server";
import { getActorFromRequest } from "@/server/admin/usersService";
import { roleRank } from "@/server/admin/authz";

export async function GET(req: Request) {
  const actor = await getActorFromRequest(req);
  if (!actor) return NextResponse.json({ message: "Não autenticado" }, { status: 401 });
  if (!actor.active || roleRank(actor.role) < 2) {
    return NextResponse.json({ message: "Sem permissão" }, { status: 403 });
  }

  const service = getSupabaseServiceRoleClient();
  if (!service) {
    return NextResponse.json(
      { message: "SUPABASE_SERVICE_ROLE_KEY não configurado" },
      { status: 500 }
    );
  }

  const url = new URL(req.url);
  const page = Math.max(1, Number(url.searchParams.get("page") ?? 1));
  const pageSize = Math.min(100, Math.max(1, Number(url.searchParams.get("pageSize") ?? 10)));
  const action = url.searchParams.get("action") ?? undefined;

  let q = service
    .from("audit_logs")
    .select("id, user_id, action, model_type, model_id, old_values, new_values, created_at", { count: "exact" })
    .order("created_at", { ascending: false });

  if (action) q = q.eq("action", action);

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  const { data, error, count } = await q.range(from, to);
  if (error) return NextResponse.json({ message: error.message }, { status: 500 });

  const asRecord = (v: unknown): Record<string, unknown> | null => {
    if (!v || typeof v !== "object") return null;
    if (Array.isArray(v)) return null;
    return v as Record<string, unknown>;
  };

  const items = (data ?? []).map((row) => {
    const r = row as unknown as Record<string, unknown>;
    const nv = asRecord(r.new_values) ?? {};
    const actorEmail = typeof nv.actorEmail === "string" ? nv.actorEmail : null;
    const actorRole = typeof nv.actorRole === "string" ? nv.actorRole : null;
    const targetUserId = typeof nv.targetUserId === "string" ? nv.targetUserId : null;
    const targetEmail = typeof nv.targetEmail === "string" ? nv.targetEmail : null;

    return {
      id: String(r.id ?? ""),
      createdAt: typeof r.created_at === "string" ? r.created_at : "",
      action: typeof r.action === "string" ? r.action : "",
      actorUserId: typeof r.user_id === "string" ? r.user_id : null,
      actorEmail,
      actorRole,
      targetUserId,
      targetEmail,
      oldValues: asRecord(r.old_values),
      newValues: asRecord(r.new_values),
    };
  });

  return NextResponse.json({
    items,
    total: count ?? 0,
    page,
    pageSize,
  });
}

