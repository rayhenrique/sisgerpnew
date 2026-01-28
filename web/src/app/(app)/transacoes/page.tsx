import type { Metadata } from "next";

import { PageShell } from "@/components/app/PageShell";

export const metadata: Metadata = {
  title: "Transações",
  description: "SISGERP transações",
};

export default function TransactionsPage() {
  return (
    <PageShell title="Transações">
      <div className="rounded-xl border border-slate-200 bg-white p-8">
        <div className="text-sm text-slate-600">
          Página em construção. Aqui ficará a listagem completa de transações.
        </div>
      </div>
    </PageShell>
  );
}

