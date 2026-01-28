"use client";

import { ChevronDown } from "lucide-react";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { DashboardMockup } from "@/features/landing/DashboardMockup";
import { LandingNavbar } from "@/features/landing/LandingNavbar";

function HeroAngle() {
  return (
    <svg
      className="pointer-events-none absolute -bottom-px left-0 block h-20 w-full fill-[#f8fafc]"
      viewBox="0 0 1440 120"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path
        d="M0,64 C240,96 420,112 720,96 C1020,80 1200,48 1440,64 L1440,120 L0,120 Z"
        shapeRendering="geometricPrecision"
      />
    </svg>
  );
}

export function HeroSection({
  sections,
}: {
  sections: Array<{ href: string; label: string }>;
}) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#1d4ed8] via-[#2563eb] to-[#3b82f6]">
      <LandingNavbar sections={sections} />

      <div
        id="main"
        className="mx-auto grid max-w-7xl gap-10 px-4 pb-24 pt-32 md:px-6 md:pt-28 lg:grid-cols-2 lg:items-center lg:px-8"
      >
        <div className="max-w-xl">
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
            Gestão de Contas Públicas Simplificada
          </h1>
          <p className="mt-5 text-base leading-7 text-white/90 sm:text-lg sm:leading-8">
            Uma solução completa para administração e controle financeiro de órgãos
            públicos, oferecendo transparência, eficiência e conformidade.
          </p>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Button
              asChild
              className="bg-white text-blue-700 hover:bg-white/90 transition-transform duration-200 hover:scale-[1.05]"
            >
              <a href="/login">Começar Agora</a>
            </Button>
            <Button
              asChild
              className="border border-white/70 bg-transparent text-white hover:bg-white/10 transition-transform duration-200 hover:scale-[1.05]"
            >
              <a href="#cta">Solicitar Demonstração</a>
            </Button>
          </div>

          <a
            href="#features"
            className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-white/90 transition-colors hover:text-white"
          >
            Saiba mais
            <ChevronDown className="h-4 w-4" />
          </a>
        </div>

        <div className="relative mt-6 lg:mt-0">
          <div className="absolute -inset-6 rounded-3xl bg-white/10 blur-2xl" />
          <motion.div
            className="relative will-change-transform"
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 9, ease: "easeInOut", repeat: Infinity }}
          >
            <DashboardMockup />
          </motion.div>
        </div>
      </div>

      <HeroAngle />
    </section>
  );
}

