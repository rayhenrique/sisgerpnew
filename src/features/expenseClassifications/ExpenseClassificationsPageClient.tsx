"use client";

import * as React from "react";
import { Pencil, Power, Search, Trash2 } from "lucide-react";

import {
  createExpenseClassification,
  deleteExpenseClassification,
  fetchExpenseClassifications,
  isExpenseClassificationInUse,
  setExpenseClassificationActive,
  updateExpenseClassification,
} from "@/features/expenseClassifications/api";
import type {
  ExpenseClassification,
  StatusFilter,
} from "@/features/expenseClassifications/types";
import { ExpenseClassificationUpsertDialog } from "@/features/expenseClassifications/ExpenseClassificationUpsertDialog";
import { ExpenseClassificationToggleDialog } from "@/features/expenseClassifications/ExpenseClassificationToggleDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

function statusLabel(active: boolean) {
  return active ? "Ativo" : "Inativo";
}

function statusBadgeClass(active: boolean) {
  return active
    ? "border-emerald-200 text-emerald-700"
    : "border-slate-200 text-slate-600";
}

export function ExpenseClassificationsPageClient() {
  const [search, setSearch] = React.useState("");
  const [status, setStatus] = React.useState<StatusFilter>("all");
  const [rows, setRows] = React.useState<ExpenseClassification[]>([]);
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(20);
  const [totalCount, setTotalCount] = React.useState(0);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const [upsertOpen, setUpsertOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<ExpenseClassification | null>(null);

  const [confirmToggle, setConfirmToggle] = React.useState<ExpenseClassification | null>(null);
  const [toggleError, setToggleError] = React.useState<string | null>(null);

  const [confirmDelete, setConfirmDelete] = React.useState<ExpenseClassification | null>(null);
  const [deleteError, setDeleteError] = React.useState<string | null>(null);
  const [deleteInUse, setDeleteInUse] = React.useState<boolean | null>(null);

  const load = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchExpenseClassifications({ search, status, page, pageSize });
      setRows(data.rows);
      setTotalCount(data.totalCount);
    } catch (e) {
      setRows([]);
      setTotalCount(0);
      setError(
        e instanceof Error ? e.message : "Erro ao carregar classificações."
      );
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search, status]);

  React.useEffect(() => {
    void load();
  }, [load]);

  React.useEffect(() => {
    setPage(1);
  }, [search, status, pageSize]);

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const clampedPage = Math.min(page, totalPages);
  const startItem = totalCount === 0 ? 0 : (clampedPage - 1) * pageSize + 1;
  const endItem = Math.min(clampedPage * pageSize, totalCount);

  React.useEffect(() => {
    if (page !== clampedPage) setPage(clampedPage);
  }, [clampedPage, page]);

  const openCreate = () => {
    setEditing(null);
    setUpsertOpen(true);
  };

  const openEdit = (c: ExpenseClassification) => {
    setEditing(c);
    setUpsertOpen(true);
  };

  const requestToggle = (c: ExpenseClassification) => {
    setToggleError(null);
    setConfirmToggle(c);
  };

  const requestDelete = (c: ExpenseClassification) => {
    setDeleteError(null);
    setConfirmDelete(c);
  };

  const onCreate = async (payload: {
    name: string;
    code: string | null;
    description: string | null;
    active: boolean;
  }) => {
    await createExpenseClassification(payload);
    await load();
  };

  const onUpdate = async (payload: {
    id: string;
    name: string;
    code: string | null;
    description: string | null;
    active: boolean;
  }) => {
    const { id, ...rest } = payload;
    await updateExpenseClassification(id, rest);
    await load();
  };

  const onConfirmToggle = async () => {
    if (!confirmToggle) return;
    setToggleError(null);

    const nextActive = !confirmToggle.active;
    try {
      await setExpenseClassificationActive(confirmToggle.id, nextActive);
      setConfirmToggle(null);
      await load();
    } catch (e) {
      setToggleError(
        e instanceof Error ? e.message : "Erro ao atualizar status."
      );
    }
  };

  React.useEffect(() => {
    if (!confirmDelete?.id) {
      setDeleteInUse(null);
      return;
    }
    let cancelled = false;
    setDeleteInUse(null);
    void (async () => {
      try {
        const inUse = await isExpenseClassificationInUse(confirmDelete.id);
        if (!cancelled) setDeleteInUse(inUse);
      } catch (e) {
        if (!cancelled) {
          setDeleteInUse(null);
          setDeleteError(e instanceof Error ? e.message : "Erro ao verificar vínculos.");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [confirmDelete?.id]);

  const onConfirmDelete = async () => {
    if (!confirmDelete) return;
    const target = confirmDelete;
    setDeleteError(null);

    try {
      const inUse = typeof deleteInUse === "boolean" ? deleteInUse : await isExpenseClassificationInUse(target.id);
      if (inUse) {
        await setExpenseClassificationActive(target.id, false);
      } else {
        await deleteExpenseClassification(target.id);
      }
      setConfirmDelete(null);
      setDeleteInUse(null);
      await load();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Erro ao excluir classificação";
      if (msg.includes("vinculada a despesas")) {
        try {
          await setExpenseClassificationActive(target.id, false);
          setConfirmDelete(null);
          setDeleteInUse(null);
          await load();
          return;
        } catch (e2) {
          setDeleteError(e2 instanceof Error ? e2.message : msg);
          return;
        }
      }
      setDeleteError(msg);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 lg:grid-cols-[1fr_220px_auto_auto]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por nome ou código"
                className="pl-9"
              />
            </div>

            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as StatusFilter)}
              className="h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--sis-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-white"
              aria-label="Status"
            >
              <option value="all">Todos</option>
              <option value="active">Ativos</option>
              <option value="inactive">Inativos</option>
            </select>

            <Button type="button" variant="secondary" onClick={() => void load()} disabled={loading}>
              Atualizar
            </Button>

            <Button type="button" onClick={openCreate}>
              + Nova classificação
            </Button>
          </div>

          {error ? (
            <div className="mt-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {error}
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Classificações</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-slate-600">
                    {loading ? "Carregando..." : "Nenhuma classificação encontrada."}
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="whitespace-nowrap text-slate-700">
                      {r.code ?? "-"}
                    </TableCell>
                    <TableCell className="font-medium text-slate-900">
                      {r.name}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={statusBadgeClass(r.active)}>
                        {statusLabel(r.active)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="inline-flex items-center gap-2">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          aria-label="Editar"
                          onClick={() => openEdit(r)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          aria-label={r.active ? "Desativar" : "Ativar"}
                          onClick={() => requestToggle(r)}
                        >
                          <Power
                            className={
                              "h-4 w-4 " +
                              (r.active
                                ? "text-[color:var(--sis-danger)]"
                                : "text-emerald-700")
                            }
                          />
                        </Button>

                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          aria-label="Excluir"
                          onClick={() => requestDelete(r)}
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

      <ExpenseClassificationUpsertDialog
        open={upsertOpen}
        onOpenChange={(open) => {
          setUpsertOpen(open);
          if (!open) setEditing(null);
        }}
        classification={editing}
        onCreate={onCreate}
        onUpdate={onUpdate}
      />

      <ExpenseClassificationToggleDialog
        item={confirmToggle}
        error={toggleError}
        onCancel={() => {
          setConfirmToggle(null);
          setToggleError(null);
        }}
        onConfirm={() => void onConfirmToggle()}
      />

      <Dialog
        open={!!confirmDelete}
        onOpenChange={(open) => {
          if (!open) {
            setConfirmDelete(null);
            setDeleteError(null);
            setDeleteInUse(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Confirmar exclusão</DialogTitle>
          </DialogHeader>

          <div className="text-sm text-slate-700">
            Excluir <span className="font-semibold">{confirmDelete?.name}</span>?
          </div>

          {deleteInUse ? (
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
              Existem despesas vinculadas. A exclusão física será bloqueada e a classificação será apenas desativada.
            </div>
          ) : null}

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
                setDeleteInUse(null);
              }}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={typeof deleteInUse !== "boolean" && !deleteError}
              onClick={() => void onConfirmDelete()}
            >
              {deleteInUse ? "Desativar" : "Excluir"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
