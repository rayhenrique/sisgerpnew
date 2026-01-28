import type { SupabaseClient } from "@supabase/supabase-js";

import type { CreateReportJobInput, CreateScheduleInput, ReportScheduleRow } from "@/server/reports/models/types";
import { findReportDefinition } from "@/server/reports/services/catalog";
import { buildCron, nextRunAtFromCron, resolvePeriodWindow } from "@/server/reports/services/schedule";
import { getJob, runJob } from "@/server/reports/controllers/jobsController";

function toDateOnly(iso: string) {
  return iso.slice(0, 10);
}

export async function listSchedules(input: {
  supabase: SupabaseClient;
  actorId: string;
}) {
  const { data, error } = await input.supabase
    .from("report_schedules")
    .select(
      "id, user_id, name, report_key, category, category_id, format, use_cache, period_window, cron, is_paused, next_run_at, created_at, updated_at"
    )
    .eq("user_id", input.actorId)
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as ReportScheduleRow[];
}

export async function createSchedule(input: {
  supabase: SupabaseClient;
  actorId: string;
  payload: CreateScheduleInput;
}) {
  const def = findReportDefinition(input.payload.reportKey);
  if (!def) throw new Error("Relatório inválido");

  const cron = buildCron({
    recurrence: input.payload.recurrence,
    time: input.payload.time,
    weekday: input.payload.weekday,
    dayOfMonth: input.payload.dayOfMonth,
  });

  const nextRun = nextRunAtFromCron(cron, new Date());

  const insertPayload = {
    user_id: input.actorId,
    name: input.payload.name,
    report_key: input.payload.reportKey,
    category: input.payload.category,
    category_id: input.payload.categoryId ?? null,
    format: input.payload.format,
    use_cache: input.payload.useCache,
    period_window: input.payload.periodWindow,
    cron,
    is_paused: false,
    next_run_at: nextRun ? nextRun.toISOString() : null,
  };

  const { data, error } = await input.supabase
    .from("report_schedules")
    .insert(insertPayload)
    .select(
      "id, user_id, name, report_key, category, category_id, format, use_cache, period_window, cron, is_paused, next_run_at, created_at, updated_at"
    )
    .single();
  if (error) throw new Error(error.message);
  return data as unknown as ReportScheduleRow;
}

export async function updateSchedule(input: {
  supabase: SupabaseClient;
  actorId: string;
  scheduleId: string;
  patch: Partial<CreateScheduleInput> & { isPaused?: boolean };
}) {
  const { data: oldRow, error: oldErr } = await input.supabase
    .from("report_schedules")
    .select(
      "id, user_id, name, report_key, category, category_id, format, use_cache, period_window, cron, is_paused, next_run_at, created_at, updated_at"
    )
    .eq("id", input.scheduleId)
    .eq("user_id", input.actorId)
    .maybeSingle();
  if (oldErr) throw new Error(oldErr.message);
  if (!oldRow) throw new Error("Agendamento não encontrado");

  const current = oldRow as unknown as ReportScheduleRow;
  const recurrence = input.patch.recurrence ?? "daily";
  const time = input.patch.time ?? "08:00";
  const weekday = input.patch.weekday;
  const dayOfMonth = input.patch.dayOfMonth;

  const cron = input.patch.recurrence || input.patch.time || weekday != null || dayOfMonth != null
    ? buildCron({ recurrence, time, weekday, dayOfMonth })
    : current.cron;

  const isPaused = typeof input.patch.isPaused === "boolean" ? input.patch.isPaused : current.is_paused;
  const nextRun = isPaused ? null : nextRunAtFromCron(cron, new Date());

  const payload = {
    name: input.patch.name ?? current.name,
    report_key: input.patch.reportKey ?? current.report_key,
    category: input.patch.category ?? current.category,
    category_id: input.patch.categoryId ?? current.category_id,
    format: input.patch.format ?? current.format,
    use_cache: typeof input.patch.useCache === "boolean" ? input.patch.useCache : current.use_cache,
    period_window: input.patch.periodWindow ?? current.period_window,
    cron,
    is_paused: isPaused,
    next_run_at: nextRun ? nextRun.toISOString() : null,
  };

  const { data, error } = await input.supabase
    .from("report_schedules")
    .update(payload)
    .eq("id", input.scheduleId)
    .eq("user_id", input.actorId)
    .select(
      "id, user_id, name, report_key, category, category_id, format, use_cache, period_window, cron, is_paused, next_run_at, created_at, updated_at"
    )
    .single();
  if (error) throw new Error(error.message);
  return data as unknown as ReportScheduleRow;
}

export async function deleteSchedule(input: {
  supabase: SupabaseClient;
  actorId: string;
  scheduleId: string;
}) {
  const { error } = await input.supabase
    .from("report_schedules")
    .delete()
    .eq("id", input.scheduleId)
    .eq("user_id", input.actorId);
  if (error) throw new Error(error.message);
}

export async function runScheduleNow(input: {
  supabase: SupabaseClient;
  actorId: string;
  scheduleId: string;
}) {
  const { data, error } = await input.supabase
    .from("report_schedules")
    .select(
      "id, user_id, name, report_key, category, category_id, format, use_cache, period_window, cron, is_paused, next_run_at, created_at, updated_at"
    )
    .eq("id", input.scheduleId)
    .eq("user_id", input.actorId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Agendamento não encontrado");
  const row = data as unknown as ReportScheduleRow;
  if (row.is_paused) throw new Error("Agendamento está pausado");

  const now = new Date();
  const window = resolvePeriodWindow({ window: row.period_window, now });

  const jobInput: CreateReportJobInput = {
    reportKey: row.report_key,
    category: row.category,
    periodStart: toDateOnly(window.periodStart),
    periodEnd: toDateOnly(window.periodEnd),
    format: row.format,
    categoryId: row.category_id,
    useCache: row.use_cache,
  };

  const { data: insertedJob, error: insertErr } = await input.supabase
    .from("report_jobs")
    .insert({
      user_id: input.actorId,
      schedule_id: input.scheduleId,
      report_key: jobInput.reportKey,
      category: jobInput.category,
      period_start: toDateOnly(jobInput.periodStart),
      period_end: toDateOnly(jobInput.periodEnd),
      category_id: jobInput.categoryId ?? null,
      format: jobInput.format,
      status: "QUEUED",
    })
    .select(
      "id, user_id, schedule_id, report_key, category, period_start, period_end, format, status, cache_key, storage_path, error_message, queued_at, started_at, finished_at"
    )
    .single();
  if (insertErr) throw new Error(insertErr.message);

  const jobId = String((insertedJob as Record<string, unknown>).id);
  await runJob({
    supabase: input.supabase,
    actorId: input.actorId,
    jobId,
    useCache: jobInput.useCache,
    categoryId: jobInput.categoryId ?? null,
  });
  return await getJob({ supabase: input.supabase, actorId: input.actorId, jobId });
}

