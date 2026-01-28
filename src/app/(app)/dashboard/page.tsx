import type { Metadata } from "next";

import { PageShell } from "@/components/app/PageShell";
import { DashboardPageClient } from "@/features/dashboard/DashboardPageClient";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "SISGERP dashboard",
};

export default function DashboardPage() {
  return (
    <PageShell title="" subtitle={null}>
      <DashboardPageClient />
    </PageShell>
  );
}

