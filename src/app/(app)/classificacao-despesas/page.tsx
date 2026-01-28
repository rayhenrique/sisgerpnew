import { PageShell } from "@/components/app/PageShell";
import { ExpenseClassificationsPageClient } from "@/features/expenseClassifications/ExpenseClassificationsPageClient";

export default function ClassificacaoDespesasPage() {
  return (
    <PageShell title="" subtitle={null}>
      <ExpenseClassificationsPageClient />
    </PageShell>
  );
}

