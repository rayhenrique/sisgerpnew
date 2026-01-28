import { NextRequest, NextResponse } from "next/server";

import { getActorFromRequest } from "@/server/admin/usersService";
import { getSupabaseServiceRoleClient } from "@/lib/supabase/server";
import { updateSchedule, deleteSchedule } from "@/server/reports/controllers/schedulesController";

type ReportFormat = "PDF" | "XLSX" | "CSV";
type Recurrence = "daily" | "weekly" | "monthly";
type PeriodWindow = "last7d" | "last30d" | "monthToDate" | "yearToDate";

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const actor = await getActorFromRequest(req);
  if (!actor) return NextResponse.json({ message: "Não autenticado" }, { status: 401 });
  if (!actor.active) return NextResponse.json({ message: "Usuário desativado" }, { status: 403 });

  const service = getSupabaseServiceRoleClient();
  if (!service) return NextResponse.json({ message: "Supabase não configurado" }, { status: 500 });

  const { id } = await ctx.params;

  try {
    const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
    const format: ReportFormat | undefined =
      body.format === "PDF" || body.format === "XLSX" || body.format === "CSV" ? body.format : undefined;
    const recurrence: Recurrence | undefined =
      body.recurrence === "daily" || body.recurrence === "weekly" || body.recurrence === "monthly"
        ? body.recurrence
        : undefined;
    const periodWindow: PeriodWindow | undefined =
      body.periodWindow === "last7d" ||
      body.periodWindow === "last30d" ||
      body.periodWindow === "monthToDate" ||
      body.periodWindow === "yearToDate"
        ? body.periodWindow
        : undefined;

    const schedule = await updateSchedule({
      supabase: service,
      actorId: actor.id,
      scheduleId: id,
      patch: {
        name: typeof body.name === "string" ? body.name : undefined,
        reportKey: typeof body.reportKey === "string" ? body.reportKey : undefined,
        category: typeof body.category === "string" ? body.category : undefined,
        format,
        useCache: typeof body.useCache === "boolean" ? body.useCache : undefined,
        periodWindow,
        recurrence,
        time: typeof body.time === "string" ? body.time : undefined,
        weekday: typeof body.weekday === "number" ? body.weekday : undefined,
        dayOfMonth: typeof body.dayOfMonth === "number" ? body.dayOfMonth : undefined,
        categoryId:
          typeof body.categoryId === "string" ? body.categoryId : body.categoryId === null ? null : undefined,
        isPaused: typeof body.isPaused === "boolean" ? body.isPaused : undefined,
      },
    });
    return NextResponse.json({ schedule });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Erro ao atualizar agendamento";
    return NextResponse.json({ message: msg }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const actor = await getActorFromRequest(req);
  if (!actor) return NextResponse.json({ message: "Não autenticado" }, { status: 401 });
  if (!actor.active) return NextResponse.json({ message: "Usuário desativado" }, { status: 403 });

  const service = getSupabaseServiceRoleClient();
  if (!service) return NextResponse.json({ message: "Supabase não configurado" }, { status: 500 });

  const { id } = await ctx.params;
  try {
    await deleteSchedule({ supabase: service, actorId: actor.id, scheduleId: id });
    return NextResponse.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Erro ao excluir agendamento";
    return NextResponse.json({ message: msg }, { status: 400 });
  }
}

