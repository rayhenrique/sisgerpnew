import type { Metadata } from "next";

import { PageShell } from "@/components/app/PageShell";
import { ReportExecutionPageClient } from "@/features/reports/ReportExecutionPageClient";

export const metadata: Metadata = {
  title: "Detalhe da Execução",
  description: "Detalhe da execução de relatório",
};

export default async function ReportExecutionPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  return (
    <PageShell title="" subtitle={null}>
      <ReportExecutionPageClient id={id} />
    </PageShell>
  );
}

