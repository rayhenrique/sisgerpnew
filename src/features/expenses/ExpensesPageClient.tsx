"use client";

import * as React from "react";
import { Pencil, Plus, Search, Trash2, TrendingDown } from "lucide-react";

import { deleteExpense, fetchExpenses } from "@/features/expenses/api";
import type { ExpenseRow } from "@/features/expenses/types";
import { formatCurrencyBRL, formatDateBR } from "@/features/expenses/format";
import { EmptyExpenses } from "@/features/expenses/EmptyExpenses";
import { ExpenseUpsertModal } from "@/features/expenses/ExpenseUpsertModal";
import { sumExpenseAmounts } from "@/features/expenses/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function ExpensesPageClient() {
  const [draftSearch, setDraftSearch] = React.useState("");
  const [draftStartDate, setDraftStartDate] = React.useState("");
  const [draftEndDate, setDraftEndDate] = React.useState("");
  const [query, setQuery] = React.useState({
    search: "",
    startDate: "",
    endDate: "",
  });

  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(20);
  const [totalCount, setTotalCount] = React.useState(0);
  const [rows, setRows] = React.useState<ExpenseRow[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [upsertOpen, setUpsertOpen] = React.useState(false);
  const [editingExpense, setEditingExpense] = React.useState<ExpenseRow | null>(null);
  const [confirmDelete, setConfirmDelete] = React.useState<ExpenseRow | null>(null);
  const [deleteError, setDeleteError] = React.useState<string | null>(null);

  const total = React.useMemo(() => sumExpenseAmounts(rows), [rows]);

  const load = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchExpenses({
        search: query.search,
        startDate: query.startDate || undefined,
        endDate: query.endDate || undefined,
        page,
        pageSize,
      });
      setRows(data.rows);
      setTotalCount(data.totalCount);
    } catch (e) {
      setRows([]);
      setTotalCount(0);
      setError(e instanceof Error ? e.message : "Erro ao carregar despesas.");
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, query.endDate, query.search, query.startDate]);

  React.useEffect(() => {
    void load();
  }, [load]);

  React.useEffect(() => {
    setDraftSearch(query.search);
    setDraftStartDate(query.startDate);
    setDraftEndDate(query.endDate);
  }, [query.endDate, query.search, query.startDate]);

  const applyFilters = () => {
    setPage(1);
    setQuery({
      search: draftSearch.trim(),
      startDate: draftStartDate,
      endDate: draftEndDate,
    });
  };

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const clampedPage = Math.min(page, totalPages);
  const startItem = totalCount === 0 ? 0 : (clampedPage - 1) * pageSize + 1;
  const endItem = Math.min(clampedPage * pageSize, totalCount);

  React.useEffect(() => {
    if (page !== clampedPage) setPage(clampedPage);
  }, [clampedPage, page]);

  const onConfirmDelete = async () => {
    if (!confirmDelete) return;
    const target = confirmDelete;
    setDeleteError(null);
    try {
      await deleteExpense(target.id);
      setConfirmDelete(null);
      const nextTotal = Math.max(totalCount - 1, 0);
      const nextTotalPages = Math.max(1, Math.ceil(nextTotal / pageSize));
      const nextPage = Math.min(page, nextTotalPages);
      if (nextPage !== page) {
        setPage(nextPage);
        return;
      }
      await load();
    } catch (e) {
      setDeleteError(e instanceof Error ? e.message : "Erro ao excluir despesa");
    }
  };

  return (
    <div className="space-y-4">
      <ExpenseUpsertModal
        open={upsertOpen}
        onOpenChange={(open) => {
          setUpsertOpen(open);
          if (!open) setEditingExpense(null);
        }}
        expense={editingExpense}
        onSaved={(action) => {
          if (action === "created") setPage(1);
          void load();
        }}
      />

      <Card>
        <CardHeader className="pb-2">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle>Filtros</CardTitle>
            <Button
              type="button"
              className="bg-[color:var(--sis-danger)] hover:bg-[color:color-mix(in_srgb,var(--sis-danger)_88%,black)]"
              onClick={() => {
                setEditingExpense(null);
                setUpsertOpen(true);
              }}
            >
              <Plus className="h-4 w-4" />
              Nova despesa
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 lg:grid-cols-[1fr_180px_180px_auto]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                value={draftSearch}
                onChange={(e) => setDraftSearch(e.target.value)}
                placeholder="Buscar por descrição"
                className="pl-9"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    applyFilters();
                  }
                }}
              />
            </div>

            <Input
              type="date"
              value={draftStartDate}
              onChange={(e) => setDraftStartDate(e.target.value)}
              aria-label="Data inicial"
            />

            <Input
              type="date"
              value={draftEndDate}
              onChange={(e) => setDraftEndDate(e.target.value)}
              aria-label="Data final"
            />

            <Button
              type="button"
              variant="secondary"
              onClick={applyFilters}
              disabled={loading}
            >
              Filtrar
            </Button>
          </div>

          {error ? (
            <div className="mt-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {error}
            </div>
          ) : null}
        </CardContent>
      </Card>

      {rows.length === 0 && !loading && !error ? (
        <EmptyExpenses onCreate={() => setUpsertOpen(true)} />
      ) : (
        <Card>
          <CardHeader className="pb-2">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2">
                <TrendingDown className="h-5 w-5 text-[color:var(--sis-danger)]" />
                <CardTitle>Despesas</CardTitle>
              </div>
              <div className="text-sm text-slate-600">
                Total (página): <span className="font-semibold text-[color:var(--sis-danger)]">{formatCurrencyBRL(total)}</span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Fonte</TableHead>
                  <TableHead>Classificação</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-slate-600">
                      Carregando...
                    </TableCell>
                  </TableRow>
                ) : (
                  rows.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="whitespace-nowrap text-slate-700">
                        {formatDateBR(r.date)}
                      </TableCell>
                      <TableCell className="font-medium text-slate-900">
                        {r.description}
                      </TableCell>
                      <TableCell className="text-slate-700">
                        {r.sourceName ?? "-"}
                      </TableCell>
                      <TableCell className="text-slate-700">
                        {r.classificationCode || r.classificationName ? (
                          <span className="text-sm">
                            <span className="font-semibold text-slate-900">
                              {r.classificationCode ?? ""}
                            </span>
                            <span className="text-slate-500">
                              {r.classificationCode ? " · " : ""}
                              {r.classificationName ?? ""}
                            </span>
                          </span>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell className="text-right font-semibold text-[color:var(--sis-danger)]">
                        {formatCurrencyBRL(r.amount)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="inline-flex items-center gap-2">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            aria-label="Editar"
                          onClick={() => {
                            setEditingExpense(r);
                            setUpsertOpen(true);
                          }}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            aria-label="Excluir"
                          onClick={() => {
                            setDeleteError(null);
                            setConfirmDelete(r);
                          }}
                          >
                            <Trash2 className="h-4 w-4 text-[color:var(--sis-danger)]" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-slate-600">
              {totalCount === 0
                ? "0 resultados"
                : `Mostrando ${startItem}–${endItem} de ${totalCount}`}
            </div>

            <div className="flex flex-wrap items-center justify-end gap-2">
              <select
                value={String(pageSize)}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setPage(1);
                }}
                className="h-9 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--sis-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                aria-label="Itens por página"
              >
                <option value="10">10 / página</option>
                <option value="20">20 / página</option>
                <option value="50">50 / página</option>
              </select>

              <div className="text-sm text-slate-700">
                Página {clampedPage} de {totalPages}
              </div>

              <Button
                type="button"
                variant="secondary"
                disabled={loading || clampedPage <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Anterior
              </Button>
              <Button
                type="button"
                variant="secondary"
                disabled={loading || clampedPage >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                Próxima
              </Button>
            </div>
          </div>
          </CardContent>
        </Card>
      )}

      <Dialog
        open={!!confirmDelete}
        onOpenChange={(open) => {
          if (!open) {
            setConfirmDelete(null);
            setDeleteError(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Confirmar exclusão</DialogTitle>
            <DialogDescription>
              Esta ação remove a despesa permanentemente.
            </DialogDescription>
          </DialogHeader>

          <div className="text-sm text-slate-700">
            Excluir <span className="font-semibold">{confirmDelete?.description}</span>?
          </div>

          {deleteError ? (
            <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {deleteError}
            </div>
          ) : null}

          <div className="flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setConfirmDelete(null);
                setDeleteError(null);
              }}
            >
              Cancelar
            </Button>
            <Button type="button" variant="destructive" onClick={() => void onConfirmDelete()}>
              Excluir
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

