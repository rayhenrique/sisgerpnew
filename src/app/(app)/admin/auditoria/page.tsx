"use client";

import { PageShell } from "@/components/app/PageShell";
import { AuditTab } from "@/features/adminUsers/AuditTab";
import { useMyProfile } from "@/features/adminUsers/useMyProfile";
import { roleRank } from "@/features/adminUsers/rbac";

export default function AuditoriaPage() {
  const { loading, profile, error } = useMyProfile();

  return (
    <PageShell title="Auditoria">
      {loading ? (
        <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
          Carregando...
        </div>
      ) : error || !profile ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">
          {error ?? "Não autenticado"}
        </div>
      ) : !profile.active ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">
          Seu usuário está desativado.
        </div>
      ) : roleRank(profile.role) < 2 ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">
          Sem permissão.
        </div>
      ) : (
        <AuditTab />
      )}
    </PageShell>
  );
}

