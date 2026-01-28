"use client";

import * as React from "react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { fetchCategories } from "@/features/categories/api";
import type { Category } from "@/features/categories/types";
import {
  createReportSchedule,
  deleteReportSchedule,
  fetchReportCatalog,
  listReportSchedules,
  runReportScheduleNow,
  updateReportSchedule,
} from "@/features/reports/api";
import type { ReportDefinition, ReportSchedule } from "@/features/reports/types";
import { ScheduleUpsertDialog } from "@/features/reports/components/ScheduleUpsertDialog";

function formatDateTimeBR(iso: string | null) {
  if (!iso) return "-";
  const d = new Date(iso);
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(d);
}

export function ReportsSchedulesPageClient() {
  const [catalog, setCatalog] = React.useState<ReportDefinition[]>([]);
  const [categories, setCategories] = React.useState<Category[]>([]);

  const [items, setItems] = React.useState<ReportSchedule[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [open, setOpen] = React.useState(false);

  const refresh = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [cat, sch] = await Promise.all([fetchReportCatalog(), listReportSchedules()]);
      setCatalog(cat);
      setItems(sch);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao carregar agendamentos");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void refresh();
    void (async () => {
      try {
        const cats = await fetchCategories();
        setCategories(cats.filter((c) => c.active && !c.deleted_at));
      } catch {
        return;
      }
    })();
  }, [refresh]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <div className="text-lg font-semibold text-slate-900">Agendamentos</div>
          <div className="text-sm text-slate-600">Crie relatórios recorrentes e execute quando precisar.</div>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/relatorios"
            className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm hover:bg-slate-50"
          >
            Voltar
          </Link>
          <button
            type="button"
            className="rounded-md bg-[color:var(--sis-primary)] px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-[color:color-mix(in_srgb,var(--sis-primary)_90%,black)]"
            onClick={() => setOpen(true)}
          >
            Novo agendamento
          </button>
        </div>
      </div>

      <ScheduleUpsertDialog
        open={open}
        onOpenChange={setOpen}
        catalog={catalog}
        categories={categories}
        onSubmit={async (payload) => {
          await createReportSchedule(payload);
          await refresh();
        }}
      />

      <Card>
        <CardHeader className="pb-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <CardTitle>Meus agendamentos</CardTitle>
            <button
              type="button"
              className="rounded-md border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 shadow-sm hover:bg-slate-50"
              onClick={() => void refresh()}
            >
              Atualizar
            </button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-sm text-slate-600">Carregando...</div>
          ) : error ? (
            <div className="text-sm text-rose-700">{error}</div>
          ) : items.length === 0 ? (
            <div className="text-sm text-slate-600">Nenhum agendamento criado ainda.</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Relatório</TableHead>
                    <TableHead>Formato</TableHead>
                    <TableHead>Próxima execução</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell className="min-w-[220px] font-medium text-slate-900">
                        <div className="truncate">{s.name}</div>
                      </TableCell>
                      <TableCell className="text-slate-700">{s.report_key}</TableCell>
                      <TableCell className="text-slate-700">{s.format}</TableCell>
                      <TableCell className="whitespace-nowrap text-slate-700">
                        {formatDateTimeBR(s.next_run_at)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={s.is_paused ? "outline" : "success"}>
                          {s.is_paused ? "Pausado" : "Ativo"}
                        </Badge>
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800 shadow-sm hover:bg-slate-50"
                            onClick={() => {
                              void (async () => {
                                try {
                                  const job = await runReportScheduleNow(s.id);
                                  window.location.href = `/relatorios/execucoes/${job.id}`;
                                } catch (e) {
                                  setError(e instanceof Error ? e.message : "Erro ao executar");
                                }
                              })();
                            }}
                          >
                            Executar agora
                          </button>

                          <button
                            type="button"
                            className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800 shadow-sm hover:bg-slate-50"
                            onClick={() => {
                              void (async () => {
                                try {
                                  await updateReportSchedule(s.id, { isPaused: !s.is_paused });
                                  await refresh();
                                } catch (e) {
                                  setError(e instanceof Error ? e.message : "Erro ao atualizar");
                                }
                              })();
                            }}
                          >
                            {s.is_paused ? "Retomar" : "Pausar"}
                          </button>

                          <button
                            type="button"
                            className="rounded-md border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs text-rose-800 shadow-sm hover:bg-rose-100"
                            onClick={() => {
                              const ok = window.confirm("Excluir este agendamento?");
                              if (!ok) return;
                              void (async () => {
                                try {
                                  await deleteReportSchedule(s.id);
                                  await refresh();
                                } catch (e) {
                                  setError(e instanceof Error ? e.message : "Erro ao excluir");
                                }
                              })();
                            }}
                          >
                            Excluir
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

