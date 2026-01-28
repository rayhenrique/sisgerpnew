import type { Metadata } from "next";

import { PageShell } from "@/components/app/PageShell";
import { ReportsPageClient } from "@/features/reports/ReportsPageClient";

export const metadata: Metadata = {
  title: "Relatórios",
  description: "Central de relatórios do SISGERP",
};

export default function RelatoriosPage() {
  return (
    <PageShell title="" subtitle={null}>
      <ReportsPageClient />
    </PageShell>
  );
}

