import type { SupabaseClient } from "@supabase/supabase-js";

import type { CreateReportJobInput, ReportJobRow } from "@/server/reports/models/types";
import { findReportDefinition } from "@/server/reports/services/catalog";
import { sha256Hex, stableJson } from "@/server/reports/services/hash";
import { uploadReportFile, createSignedDownloadUrl } from "@/server/reports/services/storage";
import { fetchSummaryByCategory, fetchTransactions, fetchBalanceByCategoryLevel } from "@/server/reports/services/reportData";
import {
  renderSummaryByCategoryCsv,
  renderTransactionsCsv,
  renderBalanceByCategoryLevelCsv,
} from "@/server/reports/views/renderCsv";
import {
  renderSummaryByCategoryXlsx,
  renderTransactionsXlsx,
  renderBalanceByCategoryLevelXlsx,
} from "@/server/reports/views/renderXlsx";
import {
  renderSummaryByCategoryPdf,
  renderTransactionsPdf,
  renderBalanceByCategoryLevelPdf,
} from "@/server/reports/views/renderPdf";


function toDateOnly(iso: string) {
  return iso.slice(0, 10);
}

function contentType(format: CreateReportJobInput["format"]) {
  if (format === "CSV") return "text/csv";
  if (format === "XLSX") return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
  return "application/pdf";
}

function fileExt(format: CreateReportJobInput["format"]) {
  if (format === "CSV") return "csv";
  if (format === "XLSX") return "xlsx";
  return "pdf";
}

function buildCacheKey(input: {
  reportKey: string;
  periodStart: string;
  periodEnd: string;
  format: CreateReportJobInput["format"]; 
  categoryId?: string | null;
}) {
  return sha256Hex(
    stableJson({
      reportKey: input.reportKey,
      periodStart: toDateOnly(input.periodStart),
      periodEnd: toDateOnly(input.periodEnd),
      format: input.format,
      categoryId: input.categoryId ?? null,
    })
  );
}

export async function createJob(input: {
  supabase: SupabaseClient;
  actorId: string;
  payload: CreateReportJobInput;
}) {
  const def = findReportDefinition(input.payload.reportKey);
  if (!def) throw new Error("Relatório inválido");

  const insertPayload = {
    user_id: input.actorId,
    report_key: input.payload.reportKey,
    category: input.payload.category,
    period_start: toDateOnly(input.payload.periodStart),
    period_end: toDateOnly(input.payload.periodEnd),
    category_id: input.payload.categoryId ?? null,
    format: input.payload.format,
    status: "QUEUED" as const,
  };

  const { data, error } = await input.supabase
    .from("report_jobs")
    .insert(insertPayload)
    .select(
      "id, user_id, schedule_id, report_key, category, period_start, period_end, category_id, format, status, cache_key, storage_path, error_message, queued_at, started_at, finished_at"
    )
    .single();
  if (error) throw new Error(error.message);
  return data as unknown as ReportJobRow;
}

export async function listJobs(input: {
  supabase: SupabaseClient;
  actorId: string;
  limit: number;
}) {
  const { data, error } = await input.supabase
    .from("report_jobs")
    .select(
      "id, user_id, schedule_id, report_key, category, period_start, period_end, category_id, format, status, cache_key, storage_path, error_message, queued_at, started_at, finished_at"
    )
    .eq("user_id", input.actorId)
    .order("queued_at", { ascending: false })
    .limit(input.limit);
  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as ReportJobRow[];
}

export async function getJob(input: {
  supabase: SupabaseClient;
  actorId: string;
  jobId: string;
}) {
  const { data, error } = await input.supabase
    .from("report_jobs")
    .select(
      "id, user_id, schedule_id, report_key, category, period_start, period_end, category_id, format, status, cache_key, storage_path, error_message, queued_at, started_at, finished_at"
    )
    .eq("id", input.jobId)
    .eq("user_id", input.actorId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Execução não encontrada");
  return data as unknown as ReportJobRow;
}

async function getCacheHit(input: {
  supabase: SupabaseClient;
  cacheKey: string;
}) {
  const { data, error } = await input.supabase
    .from("report_cache")
    .select("cache_key, storage_path, expires_at")
    .eq("cache_key", input.cacheKey)
    .gt("expires_at", new Date().toISOString())
    .maybeSingle();
  if (error) return null;
  if (!data) return null;
  return {
    cache_key: String((data as Record<string, unknown>).cache_key),
    storage_path: String((data as Record<string, unknown>).storage_path),
  };
}

async function upsertCache(input: {
  supabase: SupabaseClient;
  cacheKey: string;
  storagePath: string;
  ttlSeconds: number;
}) {
  const expiresAt = new Date(Date.now() + input.ttlSeconds * 1000).toISOString();
  await input.supabase.from("report_cache").upsert({
    cache_key: input.cacheKey,
    storage_path: input.storagePath,
    expires_at: expiresAt,
  });
}

export async function runJob(input: {
  supabase: SupabaseClient;
  actorId: string;
  jobId: string;
  useCache: boolean;
  categoryId?: string | null;
}) {
  const job = await getJob({ supabase: input.supabase, actorId: input.actorId, jobId: input.jobId });
  if (job.status === "RUNNING") return job;
  if (job.status === "READY") return job;

  const def = findReportDefinition(job.report_key);
  if (!def) throw new Error("Relatório inválido");

  const { error: startErr } = await input.supabase
    .from("report_jobs")
    .update({ status: "RUNNING", started_at: new Date().toISOString(), error_message: null })
    .eq("id", input.jobId)
    .eq("user_id", input.actorId);
  if (startErr) throw new Error(startErr.message);

  const cacheKey = buildCacheKey({
    reportKey: job.report_key,
    periodStart: job.period_start,
    periodEnd: job.period_end,
    format: job.format,
    categoryId: input.categoryId ?? job.category_id ?? null,
  });

  try {
    if (input.useCache) {
      const hit = await getCacheHit({ supabase: input.supabase, cacheKey });
      if (hit) {
        const { error: updErr } = await input.supabase
          .from("report_jobs")
          .update({
            status: "READY",
            finished_at: new Date().toISOString(),
            cache_key: hit.cache_key,
            storage_path: hit.storage_path,
          })
          .eq("id", input.jobId)
          .eq("user_id", input.actorId);
        if (updErr) throw new Error(updErr.message);
        return await getJob({ supabase: input.supabase, actorId: input.actorId, jobId: input.jobId });
      }
    }

    const now = new Date();
    const stamp = now.toISOString().replace(/[:.]/g, "-");
    const path = `users/${input.actorId}/reports/${job.report_key}/${job.id}-${stamp}.${fileExt(job.format)}`;

    if (job.report_key === "transactions") {
      const rows = await fetchTransactions({
        supabase: input.supabase,
        periodStart: job.period_start,
        periodEnd: job.period_end,
        categoryId: input.categoryId ?? job.category_id ?? null,
      });
      const bytes =
        job.format === "CSV"
          ? new TextEncoder().encode(renderTransactionsCsv(rows))
          : job.format === "XLSX"
            ? renderTransactionsXlsx(rows)
            : await renderTransactionsPdf({
                rows,
                periodStart: job.period_start,
                periodEnd: job.period_end,
              });
      await uploadReportFile({
        supabase: input.supabase,
        path,
        contentType: contentType(job.format),
        bytes,
      });
    } else if (job.report_key === "summary_by_category") {
      const rows = await fetchSummaryByCategory({
        supabase: input.supabase,
        periodStart: job.period_start,
        periodEnd: job.period_end,
        categoryId: input.categoryId ?? job.category_id ?? null,
      });
      const bytes =
        job.format === "CSV"
          ? new TextEncoder().encode(renderSummaryByCategoryCsv(rows))
          : job.format === "XLSX"
            ? renderSummaryByCategoryXlsx(rows)
            : await renderSummaryByCategoryPdf({
                rows,
                periodStart: job.period_start,
                periodEnd: job.period_end,
              });
      await uploadReportFile({
        supabase: input.supabase,
        path,
        contentType: contentType(job.format),
        bytes,
      });
    } else if (job.report_key === "balance_by_category_level") {
      // Parse levels from job params stored in category field (comma-separated) or use all
      const levels = job.category && job.category !== "Financeiro"
        ? (job.category.split(",").map((l) => l.trim()) as Array<"fonte" | "bloco" | "grupo" | "acao">)
        : null;
      const rows = await fetchBalanceByCategoryLevel({
        supabase: input.supabase,
        periodStart: job.period_start || null,
        periodEnd: job.period_end || null,
        levels,
        categoryId: input.categoryId ?? job.category_id ?? null,
      });
      const bytes =
        job.format === "CSV"
          ? new TextEncoder().encode(renderBalanceByCategoryLevelCsv(rows))
          : job.format === "XLSX"
            ? renderBalanceByCategoryLevelXlsx(rows)
            : await renderBalanceByCategoryLevelPdf({
                rows,
                periodStart: job.period_start || null,
                periodEnd: job.period_end || null,
              });
      await uploadReportFile({
        supabase: input.supabase,
        path,
        contentType: contentType(job.format),
        bytes,
      });
    } else {
      throw new Error("Relatório não suportado");
    }

    await upsertCache({
      supabase: input.supabase,
      cacheKey,
      storagePath: path,
      ttlSeconds: 60 * 60,
    });

    const { error: doneErr } = await input.supabase
      .from("report_jobs")
      .update({
        status: "READY",
        finished_at: new Date().toISOString(),
        cache_key: cacheKey,
        storage_path: path,
      })
      .eq("id", input.jobId)
      .eq("user_id", input.actorId);
    if (doneErr) throw new Error(doneErr.message);

    return await getJob({ supabase: input.supabase, actorId: input.actorId, jobId: input.jobId });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Falha ao gerar relatório";
    await input.supabase
      .from("report_jobs")
      .update({ status: "FAILED", finished_at: new Date().toISOString(), error_message: msg })
      .eq("id", input.jobId)
      .eq("user_id", input.actorId);
    throw new Error(msg);
  }
}

export async function getDownloadUrl(input: {
  supabase: SupabaseClient;
  actorId: string;
  jobId: string;
}) {
  const job = await getJob({ supabase: input.supabase, actorId: input.actorId, jobId: input.jobId });
  if (job.status !== "READY" || !job.storage_path) throw new Error("Relatório ainda não está pronto");
  const url = await createSignedDownloadUrl({
    supabase: input.supabase,
    path: job.storage_path,
    expiresInSeconds: 60 * 5,
  });
  return { url, expiresInSeconds: 300 };
}

export const __test__ = { stableJson, sha256Hex, buildCacheKey };

