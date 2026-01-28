"use client";

import * as React from "react";
import { RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { AuditLogItem } from "@/features/adminUsers/types";
import { fetchAuditLogs } from "@/features/adminUsers/api";
import { formatDateBR } from "@/features/adminUsers/format";

export function AuditTab() {
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);
  const [action, setAction] = React.useState("");

  const [rows, setRows] = React.useState<AuditLogItem[]>([]);
  const [total, setTotal] = React.useState(0);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAuditLogs({
        page,
        pageSize,
        action: action.trim() ? action.trim() : undefined,
      });
      setRows(data.items);
      setTotal(data.total);
    } catch (e) {
      setRows([]);
      setTotal(0);
      setError(e instanceof Error ? e.message : "Erro ao carregar auditoria");
    } finally {
      setLoading(false);
    }
  }, [action, page, pageSize]);

  React.useEffect(() => {
    load();
  }, [load]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle>Auditoria</CardTitle>
          <div className="flex flex-wrap items-center gap-2">
            <Button type="button" variant="secondary" onClick={() => void load()}>
              <RefreshCw className="h-4 w-4" />
              Atualizar
            </Button>

            <select
              className="h-9 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm"
              value={action}
              onChange={(e) => {
                setAction(e.target.value);
                setPage(1);
              }}
            >
              <option value="">Todas ações</option>
              <option value="user.create">user.create</option>
              <option value="user.update">user.update</option>
              <option value="user.disable">user.disable</option>
              <option value="user.enable">user.enable</option>
              <option value="user.role.change">user.role.change</option>
            </select>

            <div className="flex items-center gap-2">
              <div className="text-sm text-slate-600">Por página</div>
              <select
                className="h-9 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm"
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setPage(1);
                }}
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {error ? (
          <div className="mb-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {error}
          </div>
        ) : null}

        <div className="mb-3 text-sm text-slate-600">
          Total: <span className="font-semibold text-slate-900">{total}</span>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Ação</TableHead>
                <TableHead>Ator</TableHead>
                <TableHead>Alvo</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-slate-600">
                    {loading ? "Carregando..." : "Nenhum log."}
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((l) => (
                  <TableRow key={l.id}>
                    <TableCell className="text-slate-700">{formatDateBR(l.createdAt)}</TableCell>
                    <TableCell className="font-medium text-slate-900">{l.action}</TableCell>
                    <TableCell className="text-slate-700">{l.actorEmail ?? l.actorUserId}</TableCell>
                    <TableCell className="text-slate-700">{l.targetEmail ?? l.targetUserId ?? "-"}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-slate-600">
            Página <span className="font-semibold text-slate-900">{page}</span> de{" "}
            <span className="font-semibold text-slate-900">{totalPages}</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="secondary"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Anterior
            </Button>
            <Button
              type="button"
              variant="secondary"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              Próxima
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

