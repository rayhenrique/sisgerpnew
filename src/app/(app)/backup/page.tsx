import type { Metadata } from "next";

import { PageShell } from "@/components/app/PageShell";
import { BackupPageClient } from "@/features/backup/BackupPageClient";

export const metadata: Metadata = {
  title: "Backups",
  description: "Gerenciamento de backups do banco de dados",
};

/**
 * Backup management page
 * 
 * Server component that renders the backup management interface.
 * Authentication is handled by AuthGate in the layout.
 * 
 * Requirements: 11.1
 */
export default function BackupPage() {
  // Note: Initial data fetching will be added in future enhancement
  // Currently, BackupPageClient fetches data on mount
  // User session and role are obtained client-side via Supabase auth
  
  return (
    <PageShell title="Backups" subtitle="Gerenciamento de backups do banco de dados">
      <BackupPageClient />
    </PageShell>
  );
}
