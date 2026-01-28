import { PageShell } from "@/components/app/PageShell";
import { AdminUsersPageClient } from "@/features/adminUsers/AdminUsersPageClient";

export default function UsuariosPage() {
  return (
    <PageShell title="Usuários">
      <AdminUsersPageClient />
    </PageShell>
  );
}

