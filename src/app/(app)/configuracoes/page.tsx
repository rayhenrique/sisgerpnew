import type { Metadata } from "next";

import { PageShell } from "@/components/app/PageShell";
import { SettingsPageClient } from "@/features/settings/SettingsPageClient";

export const metadata: Metadata = {
  title: "Configurações",
  description: "Configurações do sistema SISGERP",
};

export default function ConfiguracoesPage() {
  return (
    <PageShell title="" subtitle={null}>
      <SettingsPageClient />
    </PageShell>
  );
}

