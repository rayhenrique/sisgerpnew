import { ReceiptText } from "lucide-react";

import { Button } from "@/components/ui/button";

export function EmptyExpenses({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-10">
      <div className="mx-auto max-w-xl text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[color:color-mix(in_srgb,var(--sis-danger)_12%,white)]">
          <ReceiptText className="h-8 w-8 text-[color:var(--sis-danger)]" />
        </div>

        <div className="mt-6 text-lg font-semibold text-slate-900">
          Nenhuma despesa encontrada
        </div>
        <div className="mt-2 text-sm text-slate-600">
          Comece registrando sua primeira despesa para acompanhar a execução
          financeira.
        </div>

        <div className="mt-6">
          <Button
            type="button"
            onClick={onCreate}
            className="h-11 px-5 bg-[color:var(--sis-danger)] hover:bg-[color:color-mix(in_srgb,var(--sis-danger)_88%,black)]"
          >
            Criar primeira despesa
          </Button>
        </div>

        <div className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
          <svg
            viewBox="0 0 900 220"
            className="h-[140px] w-full"
            role="img"
            aria-label="Ilustração"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="bg" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0" stopColor="#fff1f2" />
                <stop offset="0.6" stopColor="#f8fafc" />
                <stop offset="1" stopColor="#eff6ff" />
              </linearGradient>
              <linearGradient id="line" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#e11d48" stopOpacity="0.7" />
                <stop offset="1" stopColor="#e11d48" stopOpacity="0.15" />
              </linearGradient>
            </defs>

            <rect width="900" height="220" fill="url(#bg)" />

            <path
              d="M0 150 C 120 120, 240 170, 360 140 S 600 120, 720 150 S 840 185, 900 160"
              fill="none"
              stroke="url(#line)"
              strokeWidth="4"
            />

            <path
              d="M0 150 C 120 120, 240 170, 360 140 S 600 120, 720 150 S 840 185, 900 160 L 900 220 L 0 220 Z"
              fill="#e11d48"
              opacity="0.06"
            />

            <circle cx="170" cy="130" r="6" fill="#e11d48" opacity="0.75" />
            <circle cx="360" cy="140" r="6" fill="#e11d48" opacity="0.75" />
            <circle cx="540" cy="128" r="6" fill="#e11d48" opacity="0.75" />
            <circle cx="720" cy="150" r="6" fill="#e11d48" opacity="0.75" />
          </svg>
        </div>
      </div>
    </div>
  );
}

