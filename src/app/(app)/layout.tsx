import { AppShell } from "@/components/app/AppShell";
import { AuthGate } from "@/features/auth/AuthGate";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGate>
      <AppShell>{children}</AppShell>
    </AuthGate>
  );
}

