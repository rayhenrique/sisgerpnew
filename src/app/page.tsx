import type { Metadata } from "next";

import { LandingPageClient } from "@/features/landing/LandingPageClient";

export const metadata: Metadata = {
  title: "SISGERP - Sistema de Gestão de Recursos Públicos",
  description:
    "Gestão de contas públicas simplificada, com transparência, eficiência e conformidade.",
};

export default function Home() {
  return <LandingPageClient />;
}
