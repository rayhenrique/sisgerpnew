import type { Metadata } from "next";

import { PageShell } from "@/components/app/PageShell";
import { DashboardOverviewClient } from "@/features/dashboard/DashboardOverviewClient";
import { getDashboardMock } from "@/features/dashboard/mock";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "SISGERP dashboard",
};

export default function DashboardPage() {
  const data = getDashboardMock();

  return (
    <PageShell title="Dashboard">
      <DashboardOverviewClient data={data} />
    </PageShell>
  );
}

