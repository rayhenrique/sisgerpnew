import { NextRequest, NextResponse } from "next/server";

import { getActorFromRequest } from "@/server/admin/usersService";
import { getSupabaseServiceRoleClient } from "@/lib/supabase/server";
import { getDownloadUrl } from "@/server/reports/controllers/jobsController";

export async function GET(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const actor = await getActorFromRequest(req);
  if (!actor) return NextResponse.json({ message: "Não autenticado" }, { status: 401 });
  if (!actor.active) return NextResponse.json({ message: "Usuário desativado" }, { status: 403 });

  const service = getSupabaseServiceRoleClient();
  if (!service) return NextResponse.json({ message: "Supabase não configurado" }, { status: 500 });

  const { id } = await ctx.params;
  try {
    const res = await getDownloadUrl({ supabase: service, actorId: actor.id, jobId: id });
    return NextResponse.json(res);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Erro ao gerar link";
    return NextResponse.json({ message: msg }, { status: 400 });
  }
}

