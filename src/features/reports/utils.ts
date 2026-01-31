import type { ReportJob } from "@/features/reports/types";
import { addDaysToIsoDateOnly, formatDateBR as formatDateBRLib, isoDateFromDateInTimeZone, isoDateFromPartsInTimeZone } from "@/lib/dates";

export function formatDateBR(isoDate: string) {
  return formatDateBRLib(isoDate);
}

export function formatMoney(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

export function statusLabel(s: ReportJob["status"]) {
  if (s === "QUEUED") return "Fila";
  if (s === "RUNNING") return "Processando";
  if (s === "READY") return "Pronto";
  return "Erro";
}

export function statusVariant(s: ReportJob["status"]) {
  if (s === "READY") return "success" as const;
  if (s === "FAILED") return "danger" as const;
  return "outline" as const;
}

export function guessRangePreset(preset: string) {
  const today = isoDateFromDateInTimeZone(new Date());
  const [yearStr, monthStr] = today.split("-");
  const year = Number(yearStr);
  const month = Number(monthStr);

  if (preset === "today") return { start: today, end: today };
  if (preset === "7d") return { start: addDaysToIsoDateOnly(today, -6), end: today };
  if (preset === "month") return { start: isoDateFromPartsInTimeZone({ year, month, day: 1 }), end: today };

  const prevMonth = month === 1 ? 12 : month - 1;
  const prevYear = month === 1 ? year - 1 : year;
  const prevStart = isoDateFromPartsInTimeZone({ year: prevYear, month: prevMonth, day: 1 });
  const prevLastDayNumber = new Date(Date.UTC(prevYear, prevMonth, 0, 12, 0, 0)).getUTCDate();
  const prevEnd = isoDateFromPartsInTimeZone({ year: prevYear, month: prevMonth, day: prevLastDayNumber });
  return { start: prevStart, end: prevEnd };
}

