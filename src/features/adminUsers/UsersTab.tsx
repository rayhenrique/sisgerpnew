"use client";

import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Role, UserStatus, UserSummary } from "@/features/adminUsers/types";
import { canManageUsers } from "@/features/adminUsers/rbac";
import { createUser, disableUser, fetchUsers, updateUser } from "@/features/adminUsers/api";
import { UserUpsertDialog } from "@/features/adminUsers/UserUpsertDialog";
import { UsersFiltersCard } from "@/features/adminUsers/UsersFiltersCard";
import { UsersTableCard } from "@/features/adminUsers/UsersTableCard";

function readInt(raw: string | null, fallback: number) {
  const n = Number(raw);
  if (!Number.isFinite(n)) return fallback;
  if (!Number.isInteger(n)) return fallback;
  return n;
}

function readPageSize(raw: string | null, fallback: number) {
  const n = readInt(raw, fallback);
  if (n === 10 || n === 25 || n === 50) return n;
  return fallback;
}

export function UsersTab({
  actorRole,
  actorUserId,
}: {
  actorRole: Role;
  actorUserId: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const urlState = React.useMemo(() => {
    const s = searchParams.get("search") ?? "";
    const r = (searchParams.get("role") ?? "") as Role | "";
    const st = (searchParams.get("status") ?? "") as UserStatus | "";
    const p = Math.max(1, readInt(searchParams.get("page"), 1));
    const ps = readPageSize(searchParams.get("pageSize"), 10);
    return { search: s, role: r, status: st, page: p, pageSize: ps };
  }, [searchParams]);

  const [search, setSearch] = React.useState(urlState.search);
  const [role, setRole] = React.useState<Role | "">(urlState.role);
  const [status, setStatus] = React.useState<UserStatus | "">(urlState.status);
  const [page, setPage] = React.useState(urlState.page);
  const [pageSize, setPageSize] = React.useState(urlState.pageSize);

  const [rows, setRows] = React.useState<UserSummary[]>([]);
  const [total, setTotal] = React.useState(0);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const [upsertOpen, setUpsertOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<UserSummary | null>(null);
  const [confirmDisable, setConfirmDisable] = React.useState<UserSummary | null>(null);

  const canWrite = canManageUsers(actorRole);

  const skipUrlWriteRef = React.useRef(false);

  React.useEffect(() => {
    const next = urlState;
    const needsUpdate =
      next.search !== search ||
      next.role !== role ||
      next.status !== status ||
      next.page !== page ||
      next.pageSize !== pageSize;

    if (!needsUpdate) return;
    skipUrlWriteRef.current = true;
    if (next.search !== search) setSearch(next.search);
    if (next.role !== role) setRole(next.role);
    if (next.status !== status) setStatus(next.status);
    if (next.page !== page) setPage(next.page);
    if (next.pageSize !== pageSize) setPageSize(next.pageSize);
  }, [page, pageSize, role, search, status, urlState]);

  React.useEffect(() => {
    if (skipUrlWriteRef.current) {
      skipUrlWriteRef.current = false;
      return;
    }

    const t = window.setTimeout(() => {
      const sp = new URLSearchParams(searchParams.toString());

      const nextSearch = search.trim();
      if (nextSearch) sp.set("search", nextSearch);
      else sp.delete("search");

      if (role) sp.set("role", role);
      else sp.delete("role");

      if (status) sp.set("status", status);
      else sp.delete("status");

      sp.set("page", String(page));
      sp.set("pageSize", String(pageSize));

      const differs =
        (searchParams.get("search") ?? "") !== (nextSearch ? nextSearch : "") ||
        (searchParams.get("role") ?? "") !== (role ? role : "") ||
        (searchParams.get("status") ?? "") !== (status ? status : "") ||
        (searchParams.get("page") ?? "") !== String(page) ||
        (searchParams.get("pageSize") ?? "") !== String(pageSize);

      if (differs) {
        router.replace(`${pathname}?${sp.toString()}`);
      }
    }, 250);

    return () => window.clearTimeout(t);
  }, [page, pageSize, pathname, role, router, search, searchParams, status]);

  const load = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchUsers({
        search,
        role,
        status,
        page,
        pageSize,
      });
      setRows(data.items);
      setTotal(data.total);
    } catch (e) {
      setRows([]);
      setTotal(0);
      setError(e instanceof Error ? e.message : "Erro ao carregar usuários");
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, role, search, status]);

  React.useEffect(() => {
    load();
  }, [load]);

  const clearFilters = () => {
    setSearch("");
    setRole("");
    setStatus("");
    setPage(1);
  };

  const openCreate = () => {
    setEditing(null);
    setUpsertOpen(true);
  };

  const openEdit = (u: UserSummary) => {
    setEditing(u);
    setUpsertOpen(true);
  };

  const onCreate = async (payload: {
    email: string;
    name: string;
    role: Role;
    password: string;
  }) => {
    await createUser(payload);
    setPage(1);
    await load();
  };

  const onUpdate = async (payload: {
    id: string;
    name: string;
    role: Role;
    status: UserStatus;
    passwordChange?: { currentPassword: string; newPassword: string };
  }) => {
    await updateUser(payload.id, {
      name: payload.name,
      role: payload.role,
      status: payload.status,
      currentPassword: payload.passwordChange?.currentPassword,
      newPassword: payload.passwordChange?.newPassword,
    });
    await load();
  };

  const onDisable = async (u: UserSummary) => {
    await disableUser(u.id);
    await load();
  };

  const onEnable = async (u: UserSummary) => {
    await updateUser(u.id, { status: "active" });
    await load();
  };

  return (
    <div className="space-y-4">
      <UsersFiltersCard
        canWrite={canWrite}
        loading={loading}
        search={search}
        role={role}
        status={status}
        setSearch={(v) => {
          setSearch(v);
          setPage(1);
        }}
        setRole={(v) => {
          setRole(v);
          setPage(1);
        }}
        setStatus={(v) => {
          setStatus(v);
          setPage(1);
        }}
        onFilter={() => void load()}
        onClear={clearFilters}
        onCreate={openCreate}
      />

      {error ? (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      <UsersTableCard
        actorRole={actorRole}
        actorUserId={actorUserId}
        rows={rows}
        total={total}
        loading={loading}
        page={page}
        setPage={setPage}
        pageSize={pageSize}
        setPageSize={setPageSize}
        onOpen={openEdit}
        onDisable={setConfirmDisable}
        onEnable={(u) => void onEnable(u)}
      />

      <UserUpsertDialog
        open={upsertOpen}
        onOpenChange={setUpsertOpen}
        actorRole={actorRole}
        user={editing}
        onCreate={onCreate}
        onUpdate={onUpdate}
      />

      {confirmDisable ? (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Confirmar desativação</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-slate-700">
              Desativar <span className="font-semibold">{confirmDisable.email}</span>?
            </div>
            <div className="mt-3 flex items-center justify-end gap-2">
              <Button type="button" variant="secondary" onClick={() => setConfirmDisable(null)}>
                Cancelar
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={() => {
                  const u = confirmDisable;
                  setConfirmDisable(null);
                  void onDisable(u);
                }}
              >
                Desativar
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}

