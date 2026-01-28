import { NextRequest, NextResponse } from "next/server";

import { getActorFromRequest } from "@/server/admin/usersService";
import { getSupabaseServiceRoleClient } from "@/lib/supabase/server";
import { parseBody, scheduleSchema } from "@/server/reports/models/validation";
import { createSchedule, listSchedules } from "@/server/reports/controllers/schedulesController";

export async function GET(req: NextRequest) {
  const actor = await getActorFromRequest(req);
  if (!actor) return NextResponse.json({ message: "Não autenticado" }, { status: 401 });
  if (!actor.active) return NextResponse.json({ message: "Usuário desativado" }, { status: 403 });

  const service = getSupabaseServiceRoleClient();
  if (!service) return NextResponse.json({ message: "Supabase não configurado" }, { status: 500 });

  try {
    const items = await listSchedules({ supabase: service, actorId: actor.id });
    return NextResponse.json({ items });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Erro ao listar agendamentos";
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
    const payload = parseBody(scheduleSchema, body);
    const schedule = await createSchedule({ supabase: service, actorId: actor.id, payload });
    return NextResponse.json({ schedule });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Erro ao criar agendamento";
    return NextResponse.json({ message: msg }, { status: 400 });
  }
}

