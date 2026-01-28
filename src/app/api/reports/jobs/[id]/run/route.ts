import { NextRequest, NextResponse } from "next/server";

import { getActorFromRequest } from "@/server/admin/usersService";
import { getSupabaseServiceRoleClient } from "@/lib/supabase/server";
import { runJob } from "@/server/reports/controllers/jobsController";

export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const actor = await getActorFromRequest(req);
  if (!actor) return NextResponse.json({ message: "Não autenticado" }, { status: 401 });
  if (!actor.active) return NextResponse.json({ message: "Usuário desativado" }, { status: 403 });

  const service = getSupabaseServiceRoleClient();
  if (!service) return NextResponse.json({ message: "Supabase não configurado" }, { status: 500 });

  const { id } = await ctx.params;

  try {
    const body = (await req.json().catch(() => ({}))) as unknown;
    const obj = body && typeof body === "object" && !Array.isArray(body) ? (body as Record<string, unknown>) : {};
    const useCache = typeof obj.useCache === "boolean" ? obj.useCache : true;
    const categoryId =
      typeof obj.categoryId === "string" ? obj.categoryId : obj.categoryId === null ? null : undefined;

    const job = await runJob({ supabase: service, actorId: actor.id, jobId: id, useCache, categoryId });
    return NextResponse.json({ job });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Erro ao processar execução";
    return NextResponse.json({ message: msg }, { status: 400 });
  }
}

