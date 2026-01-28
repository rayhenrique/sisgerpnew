import type { Metadata } from "next";

import { PageShell } from "@/components/app/PageShell";
import { ReportsSchedulesPageClient } from "@/features/reports/ReportsSchedulesPageClient";

export const metadata: Metadata = {
  title: "Agendamentos de Relatórios",
  description: "Agendamentos recorrentes de relatórios do SISGERP",
};

export default function RelatoriosAgendamentosPage() {
  return (
    <PageShell title="" subtitle={null}>
      <ReportsSchedulesPageClient />
    </PageShell>
  );
}

