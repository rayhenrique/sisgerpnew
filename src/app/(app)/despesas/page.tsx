import { PageShell } from "@/components/app/PageShell";
import { ExpensesPageClient } from "@/features/expenses/ExpensesPageClient";

export default function DespesasPage() {
  return (
    <PageShell title="" subtitle={null}>
      <ExpensesPageClient />
    </PageShell>
  );
}

