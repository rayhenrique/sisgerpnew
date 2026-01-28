import { MessageCircle } from "lucide-react";

import { Button } from "@/components/ui/button";

function CtaAngle() {
  return (
    <svg
      className="pointer-events-none absolute -top-px left-0 block h-16 w-full fill-white"
      viewBox="0 0 1440 120"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path
        d="M0,56 C240,28 420,16 720,28 C1020,40 1200,72 1440,56 L1440,0 L0,0 Z"
        shapeRendering="geometricPrecision"
      />
    </svg>
  );
}

export function CtaSection() {
  return (
    <section
      id="cta"
      className="relative overflow-hidden bg-gradient-to-br from-[#1d4ed8] via-[#2563eb] to-[#3b82f6] py-16"
    >
      <CtaAngle />
      <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold text-white">Pronto para começar?</h2>
          <p className="mt-3 text-base text-white/90">
            Simplifique a gestão das contas públicas do seu município hoje mesmo.
          </p>
          <div className="mt-7 flex justify-center">
            <Button
              asChild
              size="lg"
              className="h-12 bg-white px-6 text-blue-700 hover:bg-white/90 transition-transform duration-200 hover:scale-[1.05]"
            >
              <a
                href="https://wa.me/?text=Ol%C3%A1%21%20Quero%20solicitar%20uma%20demonstra%C3%A7%C3%A3o%20do%20SISGERP."
                target="_blank"
                rel="noreferrer"
              >
                <MessageCircle className="h-5 w-5" />
                Solicitar Demonstração
              </a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

