"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { RoleBadge, StatusBadge } from "@/features/adminUsers/Badges";
import { formatDateBR } from "@/features/adminUsers/format";
import type { Role, UserSummary } from "@/features/adminUsers/types";
import { roleRank } from "@/features/adminUsers/rbac";

export function UsersTableCard({
  actorRole,
  actorUserId,
  rows,
  total,
  loading,
  page,
  setPage,
  pageSize,
  setPageSize,
  onOpen,
  onDisable,
  onEnable,
}: {
  actorRole: Role;
  actorUserId: string;
  rows: UserSummary[];
  total: number;
  loading: boolean;
  page: number;
  setPage: (page: number) => void;
  pageSize: number;
  setPageSize: (pageSize: number) => void;
  onOpen: (u: UserSummary) => void;
  onDisable: (u: UserSummary) => void;
  onEnable: (u: UserSummary) => void;
}) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const actorRank = roleRank(actorRole);
  const canWrite = actorRank >= 2;

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-slate-600">
            Total: <span className="font-semibold text-slate-900">{total}</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
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

        <div className="mt-4 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Papel</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Criado em</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-slate-600">
                    {loading ? "Carregando..." : "Nenhum usuário encontrado."}
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((u) => {
                  const isSelf = u.id === actorUserId;
                  const targetRank = roleRank(u.role);
                  const allowManageTarget =
                    canWrite && (actorRole === "superadmin" || actorRank > targetRank || isSelf);

                  const allowDisable =
                    allowManageTarget && !isSelf && u.status !== "disabled";
                  const allowEnable =
                    allowManageTarget && !isSelf && u.status === "disabled";

                  return (
                    <TableRow key={u.id}>
                      <TableCell className="font-medium text-slate-900">
                        {u.name ?? "(sem nome)"}
                      </TableCell>
                      <TableCell className="text-slate-700">{u.email}</TableCell>
                      <TableCell>
                        <RoleBadge role={u.role} />
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={u.status} />
                      </TableCell>
                      <TableCell className="text-slate-700">{formatDateBR(u.createdAt)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button type="button" variant="secondary" onClick={() => onOpen(u)}>
                            {allowManageTarget ? "Editar" : "Ver"}
                          </Button>
                          {allowDisable ? (
                            <Button type="button" variant="destructive" onClick={() => onDisable(u)}>
                              Desativar
                            </Button>
                          ) : allowEnable ? (
                            <Button type="button" variant="secondary" onClick={() => onEnable(u)}>
                              Reativar
                            </Button>
                          ) : null}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-slate-600">
            Página <span className="font-semibold text-slate-900">{page}</span> de{" "}
            <span className="font-semibold text-slate-900">{totalPages}</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="secondary"
              disabled={page <= 1}
              onClick={() => setPage(Math.max(1, page - 1))}
            >
              Anterior
            </Button>
            <Button
              type="button"
              variant="secondary"
              disabled={page >= totalPages}
              onClick={() => setPage(Math.min(totalPages, page + 1))}
            >
              Próxima
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

