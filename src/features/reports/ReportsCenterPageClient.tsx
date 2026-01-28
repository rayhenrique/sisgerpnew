"use client";

import * as React from "react";
import Link from "next/link";

import { fetchCategories } from "@/features/categories/api";
import type { Category } from "@/features/categories/types";
import {
  createReportJob,
  fetchReportCatalog,
  listReportJobs,
  runReportJob,
} from "@/features/reports/api";
import type { ReportDefinition, ReportFormat, ReportJob } from "@/features/reports/types";
import { ReportCatalogCard } from "@/features/reports/components/ReportCatalogCard";
import { ReportJobsCard } from "@/features/reports/components/ReportJobsCard";
import { ReportParametersCard } from "@/features/reports/components/ReportParametersCard";
import { guessRangePreset } from "@/features/reports/utils";

export function ReportsCenterPageClient() {
  const [catalog, setCatalog] = React.useState<ReportDefinition[]>([]);
  const [catalogLoading, setCatalogLoading] = React.useState(true);
  const [catalogError, setCatalogError] = React.useState<string | null>(null);
  const [selectedKey, setSelectedKey] = React.useState<string>("transactions");
  const selected = catalog.find((c) => c.key === selectedKey) ?? null;

  const [categories, setCategories] = React.useState<Category[]>([]);
  const [categoriesError, setCategoriesError] = React.useState<string | null>(null);

  const [periodStart, setPeriodStart] = React.useState(() => guessRangePreset("month").start);
  const [periodEnd, setPeriodEnd] = React.useState(() => guessRangePreset("month").end);
  const [categoryId, setCategoryId] = React.useState<string | null>(null);
  const [format, setFormat] = React.useState<ReportFormat>("PDF");
  const [useCache, setUseCache] = React.useState(true);

  const [jobs, setJobs] = React.useState<ReportJob[]>([]);
  const [jobsLoading, setJobsLoading] = React.useState(true);
  const [jobsError, setJobsError] = React.useState<string | null>(null);
  const [creating, setCreating] = React.useState(false);

  const refreshJobs = React.useCallback(async () => {
    setJobsLoading(true);
    setJobsError(null);
    try {
      const items = await listReportJobs(30);
      setJobs(items);
    } catch (e) {
      setJobsError(e instanceof Error ? e.message : "Erro ao listar execuções");
    } finally {
      setJobsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    let cancelled = false;
    setCatalogLoading(true);
    setCatalogError(null);
    void (async () => {
      try {
        const items = await fetchReportCatalog();
        if (cancelled) return;
        setCatalog(items);
        if (!items.some((i) => i.key === selectedKey) && items[0]) setSelectedKey(items[0].key);
      } catch (e) {
        if (cancelled) return;
        setCatalogError(e instanceof Error ? e.message : "Erro ao carregar catálogo");
      } finally {
        if (cancelled) return;
        setCatalogLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [selectedKey]);

  React.useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const cats = await fetchCategories();
        if (cancelled) return;
        setCategories(cats.filter((c) => c.active && !c.deleted_at));
      } catch (e) {
        if (cancelled) return;
        setCategoriesError(e instanceof Error ? e.message : "Erro ao carregar categorias");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  React.useEffect(() => {
    void refreshJobs();
  }, [refreshJobs]);

  React.useEffect(() => {
    const hasActive = jobs.some((j) => j.status === "QUEUED" || j.status === "RUNNING");
    if (!hasActive) return;
    const id = setInterval(() => {
      void refreshJobs();
    }, 2000);
    return () => clearInterval(id);
  }, [jobs, refreshJobs]);

  const canUseCategoryFilter = selected?.supportsCategoryFilter ?? false;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <div className="text-lg font-semibold text-slate-900">Relatórios</div>
          <div className="text-sm text-slate-600">Gere arquivos em PDF, XLSX ou CSV com filtros.</div>
        </div>
        <Link
          href="/relatorios/agendamentos"
          className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm hover:bg-slate-50"
        >
          Agendamentos
        </Link>
      </div>

      <div className="grid gap-4 lg:grid-cols-[360px_1fr]">
        <ReportCatalogCard
          loading={catalogLoading}
          error={catalogError}
          items={catalog}
          selectedKey={selectedKey}
          onSelect={setSelectedKey}
        />

        <div className="space-y-4">
          <ReportParametersCard
            selected={selected}
            categories={categories}
            categoriesError={categoriesError}
            periodStart={periodStart}
            periodEnd={periodEnd}
            categoryId={categoryId}
            format={format}
            useCache={useCache}
            creating={creating}
            onChange={(next) => {
              if (typeof next.periodStart === "string") setPeriodStart(next.periodStart);
              if (typeof next.periodEnd === "string") setPeriodEnd(next.periodEnd);
              if ("categoryId" in next) setCategoryId(next.categoryId ?? null);
              if (next.format) setFormat(next.format);
              if (typeof next.useCache === "boolean") setUseCache(next.useCache);
            }}
            onCreate={() => {
              if (!selected) return;
              setCreating(true);
              void (async () => {
                try {
                  const job = await createReportJob({
                    reportKey: selected.key,
                    category: selected.category,
                    periodStart,
                    periodEnd,
                    format,
                    categoryId: canUseCategoryFilter ? categoryId : null,
                    useCache,
                  });
                  await runReportJob(job.id, {
                    useCache,
                    categoryId: canUseCategoryFilter ? categoryId : null,
                  });
                  await refreshJobs();
                } catch (e) {
                  setJobsError(e instanceof Error ? e.message : "Erro ao gerar relatório");
                } finally {
                  setCreating(false);
                }
              })();
            }}
          />

          <ReportJobsCard loading={jobsLoading} error={jobsError} items={jobs} onRefresh={() => void refreshJobs()} />
        </div>
      </div>
    </div>
  );
}

