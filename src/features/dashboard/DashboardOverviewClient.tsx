"use client";

import * as React from "react";
import Link from "next/link";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Tag, TrendingDown, TrendingUp, Wallet } from "lucide-react";

import type { DashboardOverview } from "@/features/dashboard/types";
import { formatCurrencyBRL } from "@/features/dashboard/format";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

function formatDateBR(isoDate: string) {
  const date = new Date(isoDate);
  return new Intl.DateTimeFormat("pt-BR").format(date);
}

function barTooltipFormatter(value: unknown) {
  if (typeof value !== "number") return String(value);
  return formatCurrencyBRL(value);
}

export function DashboardOverviewClient({
  data,
}: {
  data: DashboardOverview;
}) {
  const [categoriesExpanded, setCategoriesExpanded] = React.useState(false);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="text-[color:var(--sis-success)]">
              Receitas
            </CardTitle>
            <TrendingUp className="h-5 w-5 text-[color:var(--sis-success)]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-[color:var(--sis-success)]">
              {formatCurrencyBRL(data.totals.receitas)}
            </div>
            <div className="mt-1 text-sm text-slate-600">Total no período</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="text-[color:var(--sis-danger)]">
              Despesas
            </CardTitle>
            <TrendingDown className="h-5 w-5 text-[color:var(--sis-danger)]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-[color:var(--sis-danger)]">
              {formatCurrencyBRL(data.totals.despesas)}
            </div>
            <div className="mt-1 text-sm text-slate-600">Total no período</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="text-[color:var(--sis-primary)]">
              Saldo
            </CardTitle>
            <Wallet className="h-5 w-5 text-[color:var(--sis-primary)]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-[color:var(--sis-primary)]">
              {formatCurrencyBRL(data.totals.saldo)}
            </div>
            <div className="mt-1 text-sm text-slate-600">Receitas - despesas</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Receitas vs Despesas</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={data.monthly} margin={{ left: 8, right: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                <YAxis
                  stroke="#64748b"
                  fontSize={12}
                  tickFormatter={(v) =>
                    new Intl.NumberFormat("pt-BR", {
                      notation: "compact",
                      maximumFractionDigits: 1,
                    }).format(v)
                  }
                />
                <Tooltip
                  formatter={barTooltipFormatter}
                  contentStyle={{
                    borderRadius: 12,
                    borderColor: "#e2e8f0",
                  }}
                  labelStyle={{ color: "#0f172a" }}
                />
                <Legend />
                <Bar
                  name="Receitas"
                  dataKey="receitas"
                  fill="var(--sis-success)"
                  radius={[6, 6, 0, 0]}
                />
                <Bar
                  name="Despesas"
                  dataKey="despesas"
                  fill="var(--sis-danger)"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <CardTitle>Classificação de Despesas</CardTitle>
              <button
                type="button"
                className="text-xs font-medium text-[color:var(--sis-primary)] hover:underline"
                aria-expanded={categoriesExpanded}
                aria-controls="dashboard-expense-classification-legend"
                onClick={() => setCategoriesExpanded((v) => !v)}
              >
                {categoriesExpanded ? "Ocultar legenda" : "Ver legenda"}
              </button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <button
                type="button"
                className="w-full rounded-lg"
                aria-label="Abrir legenda da classificação de despesas"
                onClick={() => setCategoriesExpanded(true)}
              >
                <ResponsiveContainer width="100%" height={320}>
                  <PieChart>
                    <Tooltip formatter={barTooltipFormatter} />
                    <Pie
                      data={data.categories}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={70}
                      outerRadius={110}
                      paddingAngle={2}
                      stroke="#ffffff"
                      strokeWidth={2}
                    >
                      {data.categories.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </button>

              {categoriesExpanded ? (
                <div id="dashboard-expense-classification-legend" className="space-y-2">
                  {data.categories.map((c) => (
                    <div
                      key={c.name}
                      className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2"
                    >
                      <div className="flex min-w-0 items-center gap-2">
                        <span
                          className="h-2.5 w-2.5 shrink-0 rounded-full"
                          style={{ backgroundColor: c.color }}
                        />
                        <div className="min-w-0 whitespace-normal break-words text-sm font-medium text-slate-800">
                          {c.name}
                        </div>
                      </div>
                      <div className="shrink-0 whitespace-nowrap text-sm text-slate-700">
                        {formatCurrencyBRL(c.value)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-600">
                  Clique no gráfico ou em “Ver legenda” para abrir a legenda completa.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex-col items-start justify-between gap-2 space-y-0 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2">
            <Tag className="h-4 w-4 text-slate-700" />
            <CardTitle>Últimas Transações</CardTitle>
          </div>
          <Link
            href="/transacoes"
            className="text-sm font-medium text-[color:var(--sis-primary)] hover:underline"
          >
            Ver todas
          </Link>
        </CardHeader>

        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.recentTransactions.map((tx) => (
                  <TableRow key={tx.id}>
                    <TableCell className="whitespace-nowrap text-slate-700">
                      {formatDateBR(tx.date)}
                    </TableCell>
                    <TableCell className="min-w-0 font-medium text-slate-900">
                      <div className="truncate">{tx.description}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={tx.type === "receita" ? "success" : "danger"}>
                        {tx.type === "receita" ? "Receita" : "Despesa"}
                      </Badge>
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-right font-semibold">
                      {formatCurrencyBRL(tx.amount)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

