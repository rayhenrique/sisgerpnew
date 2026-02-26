import type { Metadata } from "next";

import { PageShell } from "@/components/app/PageShell";
import { AccountPageClient } from "@/features/account/AccountPageClient";

export const metadata: Metadata = {
  title: "Minha Conta",
  description: "Gerencie os dados da sua conta",
};

export default function MinhaContaPage() {
  return (
    <PageShell title="Minha Conta" subtitle="Gerencie sua senha de acesso">
      <AccountPageClient />
    </PageShell>
  );
}
