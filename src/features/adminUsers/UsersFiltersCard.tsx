"use client";

import * as React from "react";
import { Plus, RefreshCw, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { Role, UserStatus } from "@/features/adminUsers/types";

export function UsersFiltersCard({
  canWrite,
  loading,
  search,
  role,
  status,
  setSearch,
  setRole,
  setStatus,
  onFilter,
  onClear,
  onCreate,
}: {
  canWrite: boolean;
  loading: boolean;
  search: string;
  role: Role | "";
  status: UserStatus | "";
  setSearch: (v: string) => void;
  setRole: (v: Role | "") => void;
  setStatus: (v: UserStatus | "") => void;
  onFilter: () => void;
  onClear: () => void;
  onCreate: () => void;
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle>Usuários</CardTitle>
          <div className="flex flex-wrap items-center gap-2">
            <Button type="button" variant="secondary" onClick={onFilter} className="w-full sm:w-auto">
              <RefreshCw className="h-4 w-4" />
              Atualizar
            </Button>
            {canWrite ? (
              <Button type="button" onClick={onCreate} className="w-full sm:w-auto">
                <Plus className="h-4 w-4" />
                Novo usuário
              </Button>
            ) : null}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 lg:grid-cols-[1fr_200px_200px_auto]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nome ou e-mail"
              className="pl-9"
            />
          </div>

          <select
            className="h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm"
            value={role}
            onChange={(e) => setRole((e.target.value as Role) || "")}
          >
            <option value="">Todos papéis</option>
            <option value="operator">operator</option>
            <option value="admin">admin</option>
            <option value="superadmin">superadmin</option>
          </select>

          <select
            className="h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm"
            value={status}
            onChange={(e) => setStatus((e.target.value as UserStatus) || "")}
          >
            <option value="">Todos status</option>
            <option value="active">active</option>
            <option value="disabled">disabled</option>
          </select>

          <div className="flex items-center gap-2">
            <Button type="button" variant="secondary" onClick={onFilter} disabled={loading}>
              Filtrar
            </Button>
            <Button type="button" variant="ghost" onClick={onClear}>
              Limpar
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

