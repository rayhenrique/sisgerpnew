import { NextRequest, NextResponse } from "next/server";

import { getActorFromRequest } from "@/server/admin/usersService";
import { getSupabaseServiceRoleClient } from "@/lib/supabase/server";
import { createReportJobSchema, listJobsQuerySchema, parseBody } from "@/server/reports/models/validation";
import { createJob, listJobs } from "@/server/reports/controllers/jobsController";

export async function GET(req: NextRequest) {
  const actor = await getActorFromRequest(req);
  if (!actor) return NextResponse.json({ message: "Não autenticado" }, { status: 401 });
  if (!actor.active) return NextResponse.json({ message: "Usuário desativado" }, { status: 403 });

  const service = getSupabaseServiceRoleClient();
  if (!service) return NextResponse.json({ message: "Supabase não configurado" }, { status: 500 });

  try {
    const parsed = listJobsQuerySchema.parse(Object.fromEntries(new URL(req.url).searchParams.entries()));
    const items = await listJobs({ supabase: service, actorId: actor.id, limit: parsed.limit });
    return NextResponse.json({ items });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Erro ao listar execuções";
    return NextResponse.json({ message: msg }, { status: 400 });
  }
}

export async function POST(req: NextRequest) {
  const actor = await getActorFromRequest(req);
  if (!actor) return NextResponse.json({ message: "Não autenticado" }, { status: 401 });
  if (!actor.active) return NextResponse.json({ message: "Usuário desativado" }, { status: 403 });

  const service = getSupabaseServiceRoleClient();
  if (!service) return NextResponse.json({ message: "Supabase não configurado" }, { status: 500 });

  try {
    const body = await req.json();
    const payload = parseBody(createReportJobSchema, body);
    const job = await createJob({ supabase: service, actorId: actor.id, payload });
    return NextResponse.json({ job });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Erro ao criar execução";
    return NextResponse.json({ message: msg }, { status: 400 });
  }
}

