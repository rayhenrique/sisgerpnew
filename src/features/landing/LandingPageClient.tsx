"use client";

import { BenefitsSection } from "@/features/landing/BenefitsSection";
import { CtaSection } from "@/features/landing/CtaSection";
import { FeaturesSection } from "@/features/landing/FeaturesSection";
import { HeroSection } from "@/features/landing/HeroSection";
import { LandingFooter } from "@/features/landing/LandingFooter";

export function LandingPageClient() {
  const sections = [
    { href: "#features", label: "Recursos" },
    { href: "#benefits", label: "Benefícios" },
    { href: "#cta", label: "Demonstração" },
  ];

  return (
    <div className="bg-white">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-white focus:px-3 focus:py-2 focus:text-sm focus:font-semibold focus:text-slate-900 focus:shadow"
      >
        Skip to content
      </a>

      <HeroSection sections={sections} />
      <FeaturesSection />
      <BenefitsSection />
      <CtaSection />
      <LandingFooter />
    </div>
  );
}

