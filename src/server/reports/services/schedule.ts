export function buildCron(input: {
  recurrence: "daily" | "weekly" | "monthly";
  time: string;
  weekday?: number;
  dayOfMonth?: number;
}) {
  const [hh, mm] = input.time.split(":").map(Number);
  const minute = String(mm);
  const hour = String(hh);

  if (input.recurrence === "daily") {
    return `${minute} ${hour} * * *`;
  }

  if (input.recurrence === "weekly") {
    const dow = typeof input.weekday === "number" ? input.weekday : 1;
    return `${minute} ${hour} * * ${dow}`;
  }

  const dom = typeof input.dayOfMonth === "number" ? input.dayOfMonth : 1;
  return `${minute} ${hour} ${dom} * *`;
}

export function nextRunAtFromCron(cron: string, now: Date) {
  const parts = cron.trim().split(/\s+/);
  if (parts.length !== 5) return null;

  const [mmStr, hhStr, domStr, , dowStr] = parts;
  const minute = Number(mmStr);
  const hour = Number(hhStr);
  if (!Number.isFinite(minute) || !Number.isFinite(hour)) return null;

  const base = new Date(now.getTime());
  base.setUTCSeconds(0, 0);

  const isDaily = domStr === "*" && dowStr === "*";
  const isWeekly = domStr === "*" && dowStr !== "*";
  const isMonthly = domStr !== "*";

  if (isDaily) {
    const candidate = new Date(base.getTime());
    candidate.setUTCHours(hour, minute, 0, 0);
    if (candidate.getTime() <= now.getTime()) candidate.setUTCDate(candidate.getUTCDate() + 1);
    return candidate;
  }

  if (isWeekly) {
    const dow = Number(dowStr);
    if (!Number.isFinite(dow) || dow < 0 || dow > 6) return null;

    const candidate = new Date(base.getTime());
    candidate.setUTCHours(hour, minute, 0, 0);
    const diff = (dow - candidate.getUTCDay() + 7) % 7;
    candidate.setUTCDate(candidate.getUTCDate() + diff);
    if (candidate.getTime() <= now.getTime()) candidate.setUTCDate(candidate.getUTCDate() + 7);
    return candidate;
  }

  if (isMonthly) {
    const dom = Number(domStr);
    if (!Number.isFinite(dom) || dom < 1 || dom > 28) return null;

    const candidate = new Date(base.getTime());
    candidate.setUTCHours(hour, minute, 0, 0);
    candidate.setUTCDate(dom);
    if (candidate.getTime() <= now.getTime()) {
      candidate.setUTCMonth(candidate.getUTCMonth() + 1);
      candidate.setUTCDate(dom);
    }
    return candidate;
  }

  return null;
}

export function resolvePeriodWindow(input: {
  window: "last7d" | "last30d" | "monthToDate" | "yearToDate";
  now: Date;
}) {
  const end = new Date(Date.UTC(input.now.getUTCFullYear(), input.now.getUTCMonth(), input.now.getUTCDate()));
  const start = new Date(end.getTime());

  if (input.window === "last7d") start.setUTCDate(start.getUTCDate() - 6);
  if (input.window === "last30d") start.setUTCDate(start.getUTCDate() - 29);
  if (input.window === "monthToDate") start.setUTCDate(1);
  if (input.window === "yearToDate") {
    start.setUTCMonth(0);
    start.setUTCDate(1);
  }

  const toIso = (d: Date) => d.toISOString().slice(0, 10);
  return { periodStart: toIso(start), periodEnd: toIso(end) };
}

