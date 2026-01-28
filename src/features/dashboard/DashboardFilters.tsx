"use client";

import * as React from "react";

import type { Periodicity } from "./periods";
import { periodicityLabel } from "./periods";

export function PeriodicitySelect({
  value,
  onChange,
}: {
  value: Periodicity;
  onChange: (value: Periodicity) => void;
}) {
  const options: Periodicity[] = [
    "mensal",
    "bimestral",
    "trimestral",
    "quadrimestral",
    "semestral",
    "anual",
  ];

  return (
    <div className="space-y-1">
      <div className="text-xs font-medium text-slate-700">Periodicidade</div>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as Periodicity)}
        className="h-9 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--sis-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-white"
        aria-label="Periodicidade"
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {periodicityLabel(opt)}
          </option>
        ))}
      </select>
    </div>
  );
}

export function YearRangeSelector({
  year,
  minYear,
  maxYear,
  onChange,
}: {
  year: number;
  minYear: number;
  maxYear: number;
  onChange: (next: { year: number; minYear: number; maxYear: number }) => void;
}) {
  const years = React.useMemo(() => {
    const list: number[] = [];
    for (let y = minYear; y <= maxYear; y++) list.push(y);
    return list;
  }, [maxYear, minYear]);

  return (
    <div className="flex flex-wrap items-end gap-2">
      <div className="space-y-1">
        <div className="text-xs font-medium text-slate-700">Ano</div>
        <select
          value={String(year)}
          onChange={(e) => onChange({ year: Number(e.target.value), minYear, maxYear })}
          className="h-9 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--sis-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-white"
          aria-label="Ano"
        >
          {years.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

export function YearSelect({
  year,
  years,
  onChange,
}: {
  year: number;
  years: number[];
  onChange: (year: number) => void;
}) {
  const normalized = React.useMemo(() => {
    const unique = new Set<number>();
    for (const y of years) {
      if (Number.isFinite(y)) unique.add(Math.trunc(y));
    }
    unique.add(Math.trunc(year));
    return Array.from(unique).sort((a, b) => a - b);
  }, [year, years]);

  return (
    <div className="space-y-1">
      <div className="text-xs font-medium text-slate-700">Ano</div>
      <select
        value={String(year)}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-9 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--sis-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-white"
        aria-label="Ano"
      >
        {normalized.map((y) => (
          <option key={y} value={y}>
            {y}
          </option>
        ))}
      </select>
    </div>
  );
}

export function mergeYearOptions(input: {
  years: number[];
  selectedYear: number;
  currentYear: number;
}) {
  const unique = new Set<number>();
  for (const y of input.years) {
    if (Number.isFinite(y)) unique.add(Math.trunc(y));
  }
  unique.add(Math.trunc(input.selectedYear));
  unique.add(Math.trunc(input.currentYear));
  return Array.from(unique).sort((a, b) => a - b);
}

export function normalizeYearRange(input: {
  year: number;
  minYear: number;
  maxYear: number;
}) {
  const minYear = Math.trunc(input.minYear);
  const maxYear = Math.trunc(input.maxYear);

  const normalizedMin = Math.min(minYear, maxYear);
  const normalizedMax = Math.max(minYear, maxYear);
  const normalizedYear = Math.min(
    Math.max(Math.trunc(input.year), normalizedMin),
    normalizedMax
  );

  return { year: normalizedYear, minYear: normalizedMin, maxYear: normalizedMax };
}

