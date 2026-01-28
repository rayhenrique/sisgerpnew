import { PageShell } from "@/components/app/PageShell";
import { RevenuesPageClient } from "@/features/revenues/RevenuesPageClient";

export default function ReceitasPage() {
  return (
    <PageShell title="" subtitle={null}>
      <RevenuesPageClient />
    </PageShell>
  );
}

