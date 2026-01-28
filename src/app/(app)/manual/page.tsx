import type { Metadata } from "next";

import { PageShell } from "@/components/app/PageShell";
import { ManualPageClient } from "@/features/manual/ManualPageClient";

export const metadata: Metadata = {
  title: "Manual do Usuário",
  description: "Guia completo de uso do SISGERP",
};

export default function ManualPage() {
  return (
    <PageShell title="" subtitle={null}>
      <ManualPageClient />
    </PageShell>
  );
}
