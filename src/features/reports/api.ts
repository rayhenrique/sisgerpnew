import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

import type { ReportDefinition, ReportFormat, ReportJob, ReportSchedule } from "@/features/reports/types";

async function getAccessToken() {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) throw new Error("Supabase não configurado");

  const { data, error } = await supabase.auth.getSession();
  if (error) throw new Error(error.message);
  const token = data.session?.access_token;
  if (!token) throw new Error("Sessão expirada. Faça login novamente.");
  return token;
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const token = await getAccessToken();
  const res = await fetch(path, {
    ...init,
    headers: {
      ...(init?.headers ?? {}),
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  const json = (await res.json().catch(() => null)) as unknown;
  if (!res.ok) {
    const msg =
      json &&
      typeof json === "object" &&
      !Array.isArray(json) &&
      "message" in json &&
      typeof (json as Record<string, unknown>).message === "string"
        ? ((json as Record<string, unknown>).message as string)
        : "Erro na API";
    throw new Error(msg);
  }
  return json as T;
}

export async function fetchReportCatalog() {
  const res = await apiFetch<{ items: ReportDefinition[] }>("/api/reports/catalog");
  return res.items;
}

export async function listReportJobs(limit = 20) {
  const res = await apiFetch<{ items: ReportJob[] }>(`/api/reports/jobs?limit=${limit}`);
  return res.items;
}

export async function createReportJob(input: {
  reportKey: string;
  category: string;
  periodStart: string;
  periodEnd: string;
  format: ReportFormat;
  categoryId: string | null;
  useCache: boolean;
}) {
  const res = await apiFetch<{ job: ReportJob }>("/api/reports/jobs", {
    method: "POST",
    body: JSON.stringify({
      reportKey: input.reportKey,
      category: input.category,
      periodStart: input.periodStart,
      periodEnd: input.periodEnd,
      format: input.format,
      categoryId: input.categoryId,
      useCache: input.useCache,
    }),
  });
  return res.job;
}

export async function getReportJob(id: string) {
  const res = await apiFetch<{ job: ReportJob }>(`/api/reports/jobs/${id}`);
  return res.job;
}

export async function runReportJob(id: string, input: { useCache: boolean; categoryId: string | null }) {
  const res = await apiFetch<{ job: ReportJob }>(`/api/reports/jobs/${id}/run`, {
    method: "POST",
    body: JSON.stringify({ useCache: input.useCache, categoryId: input.categoryId }),
  });
  return res.job;
}

export async function getReportDownloadUrl(id: string) {
  return apiFetch<{ url: string; expiresInSeconds: number }>(`/api/reports/jobs/${id}/download`);
}

export async function listReportSchedules() {
  const res = await apiFetch<{ items: ReportSchedule[] }>("/api/reports/schedules");
  return res.items;
}

export async function createReportSchedule(input: {
  name: string;
  reportKey: string;
  category: string;
  format: ReportFormat;
  useCache: boolean;
  categoryId: string | null;
  periodWindow: ReportSchedule["period_window"];
  recurrence: "daily" | "weekly" | "monthly";
  time: string;
  weekday?: number;
  dayOfMonth?: number;
}) {
  const res = await apiFetch<{ schedule: ReportSchedule }>("/api/reports/schedules", {
    method: "POST",
    body: JSON.stringify(input),
  });
  return res.schedule;
}

export async function updateReportSchedule(id: string, patch: Partial<Record<string, unknown>>) {
  const res = await apiFetch<{ schedule: ReportSchedule }>(`/api/reports/schedules/${id}`, {
    method: "PATCH",
    body: JSON.stringify(patch),
  });
  return res.schedule;
}

export async function deleteReportSchedule(id: string) {
  await apiFetch<{ ok: true }>(`/api/reports/schedules/${id}`, { method: "DELETE" });
}

export async function runReportScheduleNow(id: string) {
  const res = await apiFetch<{ job: ReportJob }>(`/api/reports/schedules/${id}/run`, { method: "POST" });
  return res.job;
}

