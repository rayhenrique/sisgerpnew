export const BUSINESS_TIME_ZONE = "America/Sao_Paulo";

export function isIsoDateOnly(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

export function formatIsoDateOnlyToBR(isoDate: string) {
  const [y, m, d] = isoDate.split("-");
  if (!y || !m || !d) return isoDate;
  return `${d}/${m}/${y}`;
}

export function formatDateBR(value: string) {
  if (isIsoDateOnly(value)) return formatIsoDateOnlyToBR(value);
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return value;
  return new Intl.DateTimeFormat("pt-BR").format(date);
}

export function isoDateFromDateInTimeZone(date: Date, timeZone = BUSINESS_TIME_ZONE) {
  const parts = new Intl.DateTimeFormat("en", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const year = parts.find((p) => p.type === "year")?.value;
  const month = parts.find((p) => p.type === "month")?.value;
  const day = parts.find((p) => p.type === "day")?.value;

  if (!year || !month || !day) {
    return new Intl.DateTimeFormat("en-CA", { timeZone }).format(date);
  }

  return `${year}-${month}-${day}`;
}

export function isoDateFromPartsInTimeZone(
  input: { year: number; month: number; day: number },
  timeZone = BUSINESS_TIME_ZONE
) {
  const safeUtcMidday = new Date(Date.UTC(input.year, input.month - 1, input.day, 12, 0, 0));
  return isoDateFromDateInTimeZone(safeUtcMidday, timeZone);
}

export function addDaysToIsoDateOnly(isoDate: string, days: number, timeZone = BUSINESS_TIME_ZONE) {
  if (!isIsoDateOnly(isoDate)) return isoDate;
  const [y, m, d] = isoDate.split("-").map((v) => Number(v));
  if (!Number.isFinite(y) || !Number.isFinite(m) || !Number.isFinite(d)) return isoDate;
  const base = new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
  base.setUTCDate(base.getUTCDate() + days);
  return isoDateFromDateInTimeZone(base, timeZone);
}

export function compareIsoDateOnlyAsc(a: string, b: string) {
  if (isIsoDateOnly(a) && isIsoDateOnly(b)) return a.localeCompare(b);
  return new Date(a).getTime() - new Date(b).getTime();
}
