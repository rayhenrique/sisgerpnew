"use client";

import * as React from "react";
import Link from "next/link";
import { Copy, Download, RefreshCw } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getReportDownloadUrl, getReportJob, runReportJob } from "@/features/reports/api";
import type { ReportJob } from "@/features/reports/types";
import { formatDateBR, statusLabel, statusVariant } from "@/features/reports/utils";

function formatDateTimeBR(iso: string | null) {
  if (!iso) return "-";
  const d = new Date(iso);
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(d);
}

export function ReportExecutionPageClient(props: { id: string }) {
  const [job, setJob] = React.useState<ReportJob | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);
  const [downloadUrl, setDownloadUrl] = React.useState<string | null>(null);

  const refresh = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const j = await getReportJob(props.id);
      setJob(j);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao carregar execução");
    } finally {
      setLoading(false);
    }
  }, [props.id]);

  React.useEffect(() => {
    void refresh();
  }, [refresh]);

  React.useEffect(() => {
    if (!job) return;
    if (job.status !== "QUEUED" && job.status !== "RUNNING") return;
    const id = setInterval(() => {
      void refresh();
    }, 2000);
    return () => clearInterval(id);
  }, [job, refresh]);

  if (loading) {
    return <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-600">Carregando...</div>;
  }

  if (!job) {
    return (
      <div className="rounded-xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">
        {error ?? "Execução não encontrada"}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <div className="text-lg font-semibold text-slate-900">Execução</div>
          <div className="text-sm text-slate-600">ID: {job.id}</div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/relatorios"
            className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm hover:bg-slate-50"
          >
            Voltar
          </Link>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm hover:bg-slate-50"
            onClick={() => void refresh()}
          >
            <RefreshCw className="h-4 w-4" />
            Atualizar
          </button>
        </div>
      </div>

      {error ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          {error}
        </div>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Resumo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <div className="text-sm text-slate-600">Status</div>
              <Badge variant={statusVariant(job.status)}>{statusLabel(job.status)}</Badge>
            </div>
            <div className="flex items-center justify-between gap-2">
              <div className="text-sm text-slate-600">Relatório</div>
              <div className="text-sm font-medium text-slate-900">{job.report_key}</div>
            </div>
            <div className="flex items-center justify-between gap-2">
              <div className="text-sm text-slate-600">Período</div>
              <div className="text-sm font-medium text-slate-900">
                {job.period_start} → {job.period_end}
              </div>
            </div>
            <div className="flex items-center justify-between gap-2">
              <div className="text-sm text-slate-600">Formato</div>
              <div className="text-sm font-medium text-slate-900">{job.format}</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Linha do tempo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <div className="text-sm text-slate-600">Enfileirado</div>
              <div className="text-sm font-medium text-slate-900">{formatDateBR(job.queued_at)}</div>
            </div>
            <div className="flex items-center justify-between gap-2">
              <div className="text-sm text-slate-600">Início</div>
              <div className="text-sm font-medium text-slate-900">{formatDateTimeBR(job.started_at)}</div>
            </div>
            <div className="flex items-center justify-between gap-2">
              <div className="text-sm text-slate-600">Fim</div>
              <div className="text-sm font-medium text-slate-900">{formatDateTimeBR(job.finished_at)}</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Ações</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              className="rounded-md bg-[color:var(--sis-primary)] px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-[color:color-mix(in_srgb,var(--sis-primary)_90%,black)] disabled:opacity-60"
              disabled={busy || job.status === "RUNNING"}
              onClick={() => {
                setBusy(true);
                setError(null);
                void (async () => {
                  try {
                    const j = await runReportJob(job.id, { useCache: true, categoryId: job.category_id });
                    setJob(j);
                  } catch (e) {
                    setError(e instanceof Error ? e.message : "Erro ao reprocessar");
                  } finally {
                    setBusy(false);
                  }
                })();
              }}
            >
              {busy ? "Processando..." : "Reprocessar"}
            </button>

            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm hover:bg-slate-50 disabled:opacity-60"
              disabled={busy || job.status !== "READY"}
              onClick={() => {
                setBusy(true);
                setError(null);
                void (async () => {
                  try {
                    const res = await getReportDownloadUrl(job.id);
                    setDownloadUrl(res.url);
                    window.open(res.url, "_blank", "noopener,noreferrer");
                  } catch (e) {
                    setError(e instanceof Error ? e.message : "Erro ao baixar");
                  } finally {
                    setBusy(false);
                  }
                })();
              }}
            >
              <Download className="h-4 w-4" />
              Baixar
            </button>

            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm hover:bg-slate-50 disabled:opacity-60"
              disabled={busy || !downloadUrl}
              onClick={() => {
                if (!downloadUrl) return;
                void navigator.clipboard.writeText(downloadUrl);
              }}
            >
              <Copy className="h-4 w-4" />
              Copiar link
            </button>
          </div>

          {job.status === "FAILED" ? (
            <div className="mt-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800">
              {job.error_message ?? "Falha ao gerar relatório"}
            </div>
          ) : null}

          {downloadUrl ? (
            <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700">
              Link: {downloadUrl}
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}

