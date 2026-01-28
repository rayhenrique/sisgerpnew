import type { ReportJob } from "@/features/reports/types";

export function formatDateBR(isoDate: string) {
  const date = new Date(isoDate);
  return new Intl.DateTimeFormat("pt-BR").format(date);
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
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const today = `${yyyy}-${mm}-${dd}`;
  const toIso = (d: Date) => d.toISOString().slice(0, 10);

  if (preset === "today") return { start: today, end: today };
  if (preset === "7d") {
    const start = new Date(now.getTime());
    start.setDate(start.getDate() - 6);
    return { start: toIso(start), end: today };
  }
  if (preset === "month") {
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    return { start: toIso(start), end: today };
  }
  const prevStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const prevEnd = new Date(now.getFullYear(), now.getMonth(), 0);
  return { start: toIso(prevStart), end: toIso(prevEnd) };
}

