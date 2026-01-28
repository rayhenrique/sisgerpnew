"use client";

import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Role } from "@/features/adminUsers/types";
import { RoleBadge } from "@/features/adminUsers/Badges";
import { UsersTab } from "@/features/adminUsers/UsersTab";
import { AuditTab } from "@/features/adminUsers/AuditTab";
import { useMyProfile } from "@/features/adminUsers/useMyProfile";
import { roleRank } from "@/features/adminUsers/rbac";

type Tab = "users" | "audit";

export function AdminUsersPageClient() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { loading, profile, error } = useMyProfile();
  const [tab, setTab] = React.useState<Tab>("users");

  const actorRole: Role = (profile?.role ?? "operator") as Role;
  const canSeeAudit = !!profile && roleRank(actorRole) >= 2;

  React.useEffect(() => {
    if (!profile) return;
    const raw = searchParams.get("tab");
    const next: Tab = raw === "audit" ? "audit" : "users";
    if (next === "audit" && !canSeeAudit) {
      if (tab !== "users") setTab("users");
      const sp = new URLSearchParams(searchParams.toString());
      sp.set("tab", "users");
      router.replace(`${pathname}?${sp.toString()}`);
      return;
    }

    if (next !== tab) setTab(next);
  }, [canSeeAudit, pathname, profile, router, searchParams, tab]);

  const setTabAndSync = React.useCallback(
    (next: Tab) => {
      setTab(next);
      const sp = new URLSearchParams(searchParams.toString());
      sp.set("tab", next);
      router.replace(`${pathname}?${sp.toString()}`);
    },
    [pathname, router, searchParams]
  );

  if (loading) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
        Carregando...
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="rounded-xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">
        {error ?? "Não autenticado"}
      </div>
    );
  }

  if (!profile.active) {
    return (
      <div className="rounded-xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">
        Seu usuário está desativado.
      </div>
    );
  }

  const actorRoleFromProfile: Role = profile.role;
  const canSeeAuditFromProfile = roleRank(actorRoleFromProfile) >= 2;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex-col items-start justify-between gap-2 space-y-0 sm:flex-row sm:items-center">
          <CardTitle>Administração</CardTitle>
          <div className="flex flex-wrap items-center gap-2">
            <RoleBadge role={actorRole} />
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant={tab === "users" ? "default" : "secondary"}
              onClick={() => setTabAndSync("users")}
            >
              Usuários
            </Button>
            {canSeeAuditFromProfile ? (
              <Button
                type="button"
                variant={tab === "audit" ? "default" : "secondary"}
                onClick={() => setTabAndSync("audit")}
              >
                Auditoria
              </Button>
            ) : null}
          </div>
        </CardContent>
      </Card>

      {tab === "users" ? (
        <UsersTab actorRole={actorRoleFromProfile} actorUserId={profile.id} />
      ) : canSeeAuditFromProfile ? (
        <AuditTab />
      ) : null}
    </div>
  );
}

