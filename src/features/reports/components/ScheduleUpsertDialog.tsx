"use client";

import * as React from "react";

import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { Category } from "@/features/categories/types";
import type { ReportDefinition, ReportFormat, ReportSchedule } from "@/features/reports/types";

export function ScheduleUpsertDialog(props: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  catalog: ReportDefinition[];
  categories: Category[];
  onSubmit: (payload: {
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
  }) => Promise<void>;
}) {
  const first = props.catalog[0] ?? null;

  const [name, setName] = React.useState("Relatório recorrente");
  const [reportKey, setReportKey] = React.useState(first?.key ?? "transactions");
  const selected = props.catalog.find((c) => c.key === reportKey) ?? first;
  const [format, setFormat] = React.useState<ReportFormat>("PDF");
  const [useCache, setUseCache] = React.useState(true);
  const [categoryId, setCategoryId] = React.useState<string | null>(null);
  const [periodWindow, setPeriodWindow] = React.useState<ReportSchedule["period_window"]>("last30d");
  const [recurrence, setRecurrence] = React.useState<"daily" | "weekly" | "monthly">("weekly");
  const [time, setTime] = React.useState("08:00");
  const [weekday, setWeekday] = React.useState(1);
  const [dayOfMonth, setDayOfMonth] = React.useState(1);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!props.open) return;
    setError(null);
  }, [props.open]);

  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Novo agendamento</DialogTitle>
        </DialogHeader>

        <div className="grid gap-3">
          <div className="space-y-1">
            <div className="text-xs font-medium text-slate-700">Nome</div>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm"
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <div className="text-xs font-medium text-slate-700">Relatório</div>
              <select
                value={reportKey}
                onChange={(e) => setReportKey(e.target.value)}
                className="h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm"
              >
                {props.catalog.map((r) => (
                  <option key={r.key} value={r.key}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <div className="text-xs font-medium text-slate-700">Formato</div>
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value as ReportFormat)}
                className="h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm"
              >
                <option value="PDF">PDF</option>
                <option value="XLSX">XLSX</option>
                <option value="CSV">CSV</option>
              </select>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <div className="text-xs font-medium text-slate-700">Janela do período</div>
              <select
                value={periodWindow}
                onChange={(e) => setPeriodWindow(e.target.value as ReportSchedule["period_window"])}
                className="h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm"
              >
                <option value="last7d">Últimos 7 dias</option>
                <option value="last30d">Últimos 30 dias</option>
                <option value="monthToDate">Mês até hoje</option>
                <option value="yearToDate">Ano até hoje</option>
              </select>
            </div>

            <div className="space-y-1">
              <div className="text-xs font-medium text-slate-700">Categoria</div>
              <select
                value={categoryId ?? ""}
                onChange={(e) => setCategoryId(e.target.value ? e.target.value : null)}
                disabled={!(selected?.supportsCategoryFilter ?? false)}
                className="h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm disabled:opacity-60"
              >
                <option value="">Todas</option>
                {props.categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <div className="text-xs font-medium text-slate-700">Recorrência</div>
              <select
                value={recurrence}
              onChange={(e) => {
                const v = e.target.value;
                if (v === "daily" || v === "weekly" || v === "monthly") setRecurrence(v);
              }}
                className="h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm"
              >
                <option value="daily">Diária</option>
                <option value="weekly">Semanal</option>
                <option value="monthly">Mensal</option>
              </select>
            </div>
            <div className="space-y-1">
              <div className="text-xs font-medium text-slate-700">Horário</div>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm"
              />
            </div>
          </div>

          {recurrence === "weekly" ? (
            <div className="space-y-1">
              <div className="text-xs font-medium text-slate-700">Dia da semana</div>
              <select
                value={weekday}
                onChange={(e) => setWeekday(Number(e.target.value))}
                className="h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm"
              >
                <option value={1}>Segunda</option>
                <option value={2}>Terça</option>
                <option value={3}>Quarta</option>
                <option value={4}>Quinta</option>
                <option value={5}>Sexta</option>
                <option value={6}>Sábado</option>
                <option value={0}>Domingo</option>
              </select>
            </div>
          ) : null}

          {recurrence === "monthly" ? (
            <div className="space-y-1">
              <div className="text-xs font-medium text-slate-700">Dia do mês (1–28)</div>
              <input
                type="number"
                min={1}
                max={28}
                value={dayOfMonth}
                onChange={(e) => setDayOfMonth(Number(e.target.value))}
                className="h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm"
              />
            </div>
          ) : null}

          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={useCache}
              onChange={(e) => setUseCache(e.target.checked)}
              className="h-4 w-4"
            />
            Usar cache (se disponível)
          </label>

          {error ? <div className="text-sm text-rose-700">{error}</div> : null}
        </div>

        <DialogFooter>
          <button
            type="button"
            className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm hover:bg-slate-50"
            onClick={() => props.onOpenChange(false)}
            disabled={saving}
          >
            Cancelar
          </button>
          <button
            type="button"
            className="rounded-md bg-[color:var(--sis-primary)] px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-[color:color-mix(in_srgb,var(--sis-primary)_90%,black)] disabled:opacity-60"
            disabled={saving || name.trim().length < 2 || !selected}
            onClick={() => {
              if (!selected) return;
              setSaving(true);
              setError(null);
              void (async () => {
                try {
                  await props.onSubmit({
                    name: name.trim(),
                    reportKey: selected.key,
                    category: selected.category,
                    format,
                    useCache,
                    categoryId,
                    periodWindow,
                    recurrence,
                    time,
                    weekday: recurrence === "weekly" ? weekday : undefined,
                    dayOfMonth: recurrence === "monthly" ? dayOfMonth : undefined,
                  });
                  props.onOpenChange(false);
                } catch (e) {
                  setError(e instanceof Error ? e.message : "Erro ao salvar");
                } finally {
                  setSaving(false);
                }
              })();
            }}
          >
            {saving ? "Salvando..." : "Salvar"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

