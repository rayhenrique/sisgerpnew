import * as React from "react";
import { FileSpreadsheet, FileText } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Category } from "@/features/categories/types";
import type { ReportDefinition, ReportFormat } from "@/features/reports/types";
import { guessRangePreset } from "@/features/reports/utils";

export function ReportParametersCard(props: {
  selected: ReportDefinition | null;
  categories: Category[];
  categoriesError: string | null;
  periodStart: string;
  periodEnd: string;
  categoryId: string | null;
  format: ReportFormat;
  useCache: boolean;
  creating: boolean;
  onChange: (next: {
    periodStart?: string;
    periodEnd?: string;
    categoryId?: string | null;
    format?: ReportFormat;
    useCache?: boolean;
  }) => void;
  onCreate: () => void;
}) {
  const canUseCategoryFilter = props.selected?.supportsCategoryFilter ?? false;
  const invalidRange = props.periodStart > props.periodEnd;
  const selectedCategory = props.categoryId
    ? props.categories.find((c) => c.id === props.categoryId) ?? null
    : null;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>Parâmetros</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 md:grid-cols-2">
          <div className="space-y-1">
            <div className="text-xs font-medium text-slate-700">Início</div>
            <input
              type="date"
              value={props.periodStart}
              onChange={(e) => props.onChange({ periodStart: e.target.value })}
              className="h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm"
            />
          </div>
          <div className="space-y-1">
            <div className="text-xs font-medium text-slate-700">Fim</div>
            <input
              type="date"
              value={props.periodEnd}
              onChange={(e) => props.onChange({ periodEnd: e.target.value })}
              className="h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm"
            />
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {[
            { key: "today", label: "Hoje" },
            { key: "7d", label: "7 dias" },
            { key: "month", label: "Mês" },
            { key: "prev", label: "Mês anterior" },
          ].map((p) => (
            <button
              key={p.key}
              type="button"
              className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700 shadow-sm hover:bg-slate-50"
              onClick={() => {
                const r = guessRangePreset(p.key);
                props.onChange({ periodStart: r.start, periodEnd: r.end });
              }}
            >
              {p.label}
            </button>
          ))}
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <div className="space-y-1">
            <div className="text-xs font-medium text-slate-700">Formato</div>
            <div className="flex items-center gap-2">
              {([
                { v: "PDF", icon: FileText },
                { v: "XLSX", icon: FileSpreadsheet },
                { v: "CSV", icon: FileText },
              ] as const).map((f) => {
                const Icon = f.icon;
                const active = props.format === f.v;
                return (
                  <button
                    key={f.v}
                    type="button"
                    onClick={() => props.onChange({ format: f.v })}
                    className={
                      active
                        ? "inline-flex items-center gap-2 rounded-md bg-[color:var(--sis-primary)] px-3 py-2 text-xs font-medium text-white shadow-sm"
                        : "inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-800 shadow-sm hover:bg-slate-50"
                    }
                  >
                    <Icon className="h-4 w-4" />
                    {f.v}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-xs font-medium text-slate-700">Categoria</div>
            <select
              value={props.categoryId ?? ""}
              onChange={(e) => props.onChange({ categoryId: e.target.value ? e.target.value : null })}
              disabled={!canUseCategoryFilter}
              className="h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm disabled:opacity-60"
            >
              <option value="">Todas</option>
              {props.categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            {props.categoriesError ? (
              <div className="text-xs text-rose-700">{props.categoriesError}</div>
            ) : null}
            {selectedCategory ? (
              <div className="text-xs text-slate-600">Selecionada: {selectedCategory.name}</div>
            ) : null}
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={props.useCache}
              onChange={(e) => props.onChange({ useCache: e.target.checked })}
              className="h-4 w-4"
            />
            Usar cache (se disponível)
          </label>

          <button
            type="button"
            disabled={!props.selected || props.creating || invalidRange}
            className="rounded-md bg-[color:var(--sis-primary)] px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-[color:color-mix(in_srgb,var(--sis-primary)_90%,black)] disabled:opacity-60"
            onClick={props.onCreate}
          >
            {props.creating ? "Gerando..." : "Gerar relatório"}
          </button>
        </div>

        {invalidRange ? (
          <div className="mt-2 text-xs text-rose-700">O início deve ser menor ou igual ao fim.</div>
        ) : null}
      </CardContent>
    </Card>
  );
}

