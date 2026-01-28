import { NextRequest, NextResponse } from "next/server";

import { getActorFromRequest } from "@/server/admin/usersService";
import { getSupabaseServiceRoleClient } from "@/lib/supabase/server";

function asNumber(value: unknown) {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const n = Number(value);
    if (Number.isFinite(n)) return n;
  }
  return 0;
}

function monthLabels() {
  return ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
}

function palette() {
  return [
    "#0f4c81",
    "#10b981",
    "#3b82f6",
    "#f59e0b",
    "#64748b",
    "#8b5cf6",
    "#ef4444",
    "#14b8a6",
  ];
}

function parseYear(raw: string | null) {
  if (!raw) return new Date().getFullYear();
  const year = Number(raw);
  if (!Number.isInteger(year)) return new Date().getFullYear();
  if (year < 2000 || year > 2100) return new Date().getFullYear();
  return year;
}

export async function GET(req: NextRequest) {
  const actor = await getActorFromRequest(req);
  if (!actor) return NextResponse.json({ message: "Não autenticado" }, { status: 401 });
  if (!actor.active) return NextResponse.json({ message: "Usuário desativado" }, { status: 403 });

  const service = getSupabaseServiceRoleClient();
  if (!service) return NextResponse.json({ message: "Supabase não configurado" }, { status: 500 });

  const year = parseYear(new URL(req.url).searchParams.get("year"));
  const start = `${year}-01-01`;
  const end = `${year}-12-31`;

  const [revRes, expRes] = await Promise.all([
    service
      .from("revenues")
      .select("id, date, description, amount, category_id")
      .gte("date", start)
      .lte("date", end),
    service
      .from("expenses")
      .select("id, date, description, amount, category_id")
      .gte("date", start)
      .lte("date", end),
  ]);

  if (revRes.error) return NextResponse.json({ message: revRes.error.message }, { status: 500 });
  if (expRes.error) return NextResponse.json({ message: expRes.error.message }, { status: 500 });

  const revenues = (revRes.data ?? []).map((r) => ({
    id: String(r.id),
    date: String(r.date),
    description: String(r.description ?? ""),
    amount: asNumber(r.amount),
    categoryId: r.category_id == null ? null : Number(r.category_id),
  }));

  const expenses = (expRes.data ?? []).map((r) => ({
    id: String(r.id),
    date: String(r.date),
    description: String(r.description ?? ""),
    amount: asNumber(r.amount),
    categoryId: r.category_id == null ? null : Number(r.category_id),
  }));

  const totalReceitas = revenues.reduce((acc, r) => acc + r.amount, 0);
  const totalDespesas = expenses.reduce((acc, r) => acc + r.amount, 0);

  const labels = monthLabels();
  const monthly = labels.map((m, idx) => {
    const monthIndex = idx + 1;
    const mm = monthIndex < 10 ? `0${monthIndex}` : String(monthIndex);
    const prefix = `${year}-${mm}-`;
    const receitas = revenues
      .filter((r) => r.date.startsWith(prefix))
      .reduce((acc, r) => acc + r.amount, 0);
    const despesas = expenses
      .filter((r) => r.date.startsWith(prefix))
      .reduce((acc, r) => acc + r.amount, 0);
    return { month: m, receitas, despesas };
  });

  const catTotals = new Map<number, number>();
  for (const r of revenues) {
    if (r.categoryId == null) continue;
    catTotals.set(r.categoryId, (catTotals.get(r.categoryId) ?? 0) + r.amount);
  }
  for (const r of expenses) {
    if (r.categoryId == null) continue;
    catTotals.set(r.categoryId, (catTotals.get(r.categoryId) ?? 0) + r.amount);
  }

  const catIds = Array.from(catTotals.keys());
  const catNames = new Map<number, string>();
  if (catIds.length > 0) {
    const catRes = await service
      .from("categories")
      .select("id, name")
      .in("id", catIds);
    if (!catRes.error) {
      for (const c of catRes.data ?? []) {
        catNames.set(Number(c.id), String(c.name));
      }
    }
  }

  const sortedCats = catIds
    .map((id) => ({ id, value: catTotals.get(id) ?? 0, name: catNames.get(id) ?? `Categoria ${id}` }))
    .filter((c) => c.value > 0)
    .sort((a, b) => b.value - a.value);

  const top = sortedCats.slice(0, 5);
  const rest = sortedCats.slice(5);
  const restTotal = rest.reduce((acc, c) => acc + c.value, 0);

  const colors = palette();
  const categories = top.map((c, i) => ({
    name: c.name,
    value: c.value,
    color: colors[i % colors.length],
  }));
  if (restTotal > 0) {
    categories.push({
      name: "Outros",
      value: restTotal,
      color: "#64748b",
    });
  }

  const recent = [
    ...revenues.map((r) => ({
      id: `rev_${r.id}`,
      date: r.date,
      description: r.description,
      type: "receita" as const,
      amount: r.amount,
    })),
    ...expenses.map((r) => ({
      id: `exp_${r.id}`,
      date: r.date,
      description: r.description,
      type: "despesa" as const,
      amount: r.amount,
    })),
  ]
    .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0))
    .slice(0, 10);

  return NextResponse.json({
    totals: {
      receitas: totalReceitas,
      despesas: totalDespesas,
      saldo: totalReceitas - totalDespesas,
    },
    monthly,
    categories,
    recentTransactions: recent,
  });
}

