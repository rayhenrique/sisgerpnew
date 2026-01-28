"use client";

import * as React from "react";

import { DashboardOverviewClient } from "@/features/dashboard/DashboardOverviewClient";
import type { DashboardOverview } from "@/features/dashboard/types";
import { fetchDashboardOverview } from "@/features/dashboard/api";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import {
  groupMonthlyTotals,
  periodicityLabel,
  type Periodicity,
} from "@/features/dashboard/periods";
import {
  PeriodicitySelect,
  YearSelect,
  mergeYearOptions,
} from "@/features/dashboard/DashboardFilters";

export function DashboardPageClient() {
  const [data, setData] = React.useState<DashboardOverview | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [lastUpdatedAt, setLastUpdatedAt] = React.useState<number | null>(null);

  const currentYear = new Date().getFullYear();
  const [year, setYear] = React.useState(currentYear);
  const [years, setYears] = React.useState<number[]>(() => {
    return mergeYearOptions({
      years: [2025, 2026],
      selectedYear: currentYear,
      currentYear,
    });
  });
  const [periodicity, setPeriodicity] = React.useState<Periodicity>("mensal");

  const refresh = React.useCallback(
    async (opts?: { silent?: boolean }) => {
      const silent = opts?.silent === true;
      if (!silent) {
        setRefreshing(true);
        setError(null);
      }
      try {
        const d = await fetchDashboardOverview({ year });
        setData(d);
        setLastUpdatedAt(Date.now());
        setError(null);
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Erro ao carregar dashboard";
        setError(msg);
      } finally {
        if (!silent) setRefreshing(false);
      }
    },
    [year]
  );

  const viewData = React.useMemo(() => {
    if (!data) return null;
    return {
      ...data,
      monthly: groupMonthlyTotals(data.monthly, periodicity),
    } satisfies DashboardOverview;
  }, [data, periodicity]);

  React.useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    void (async () => {
      try {
        const d = await fetchDashboardOverview({ year });
        if (cancelled) return;
        setData(d);
        setLastUpdatedAt(Date.now());
      } catch (e) {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : "Erro ao carregar dashboard");
      } finally {
        if (cancelled) return;
        setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [year]);

  React.useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;

    let timer: ReturnType<typeof setTimeout> | null = null;
    const scheduleRefresh = () => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        void refresh({ silent: true });
      }, 600);
    };

    const channel = supabase
      .channel("dashboard:overview")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "revenues" },
        () => scheduleRefresh()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "expenses" },
        () => scheduleRefresh()
      )
      .subscribe();

    return () => {
      if (timer) clearTimeout(timer);
      void supabase.removeChannel(channel);
    };
  }, [refresh]);

  React.useEffect(() => {
    const interval = setInterval(() => {
      if (document.visibilityState !== "visible") return;
      void refresh({ silent: true });
    }, 30_000);
    return () => clearInterval(interval);
  }, [refresh]);

  if (loading) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
        Carregando...
      </div>
    );
  }

  if (!data) {
    return (
      <div className="rounded-xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">
        {error ?? "Erro ao carregar dashboard"}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {error ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          {error}
        </div>
      ) : null}

      <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="flex flex-wrap items-end gap-3">
            <YearSelect
              year={year}
              years={years}
              onChange={(nextYear) => {
                setYear(nextYear);
                setYears((prev) =>
                  mergeYearOptions({
                    years: prev,
                    selectedYear: nextYear,
                    currentYear,
                  })
                );
              }}
            />
            <PeriodicitySelect value={periodicity} onChange={setPeriodicity} />
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2">
            <div className="text-xs text-slate-500">
              {lastUpdatedAt ? `Atualizado: ${new Date(lastUpdatedAt).toLocaleTimeString("pt-BR")}` : null}
            </div>
            <button
              type="button"
              className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700 shadow-sm hover:bg-slate-50"
              onClick={() => void refresh()}
              disabled={refreshing}
            >
              {refreshing ? "Atualizando..." : "Atualizar"}
            </button>
          </div>
        </div>
      </div>

      <div id="dashboard-export" className="space-y-3">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="text-sm font-semibold text-slate-900">Dashboard</div>
          <div className="mt-1 text-xs text-slate-600">
            Ano {year} · {periodicityLabel(periodicity)}
          </div>
        </div>
        <DashboardOverviewClient data={viewData ?? data} />
      </div>
    </div>
  );
}

