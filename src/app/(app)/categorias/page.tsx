import { PageShell } from "@/components/app/PageShell";
import { CategoriesPageClient } from "@/features/categories/CategoriesPageClient";

export default function CategoriasPage() {
  return (
    <PageShell title="" subtitle={null}>
      <CategoriesPageClient />
    </PageShell>
  );
}

