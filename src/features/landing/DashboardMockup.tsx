import { Card } from "@/components/ui/card";

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/25 bg-white/55 p-3 backdrop-blur-md">
      <div className="text-[11px] font-medium text-slate-700">{label}</div>
      <div className="mt-1 text-sm font-semibold text-slate-900">{value}</div>
    </div>
  );
}

export function DashboardMockup() {
  return (
    <Card className="w-full max-w-xl rounded-2xl border border-white/25 bg-white/60 p-5 shadow-2xl shadow-blue-950/25 backdrop-blur-md">
      <div className="grid gap-3 sm:grid-cols-3">
        <Stat label="Total Previsto" value="R$ 50.000" />
        <Stat label="Total Executado" value="R$ 30.000" />
        <Stat label="Saldo" value="R$ 20.000" />
      </div>

      <div className="mt-5 rounded-xl border border-white/25 bg-white/50 p-4 backdrop-blur-md">
        <div className="text-xs font-semibold text-slate-900">
          Evolução Financeira
        </div>
        <div className="mt-3">
          <svg
            viewBox="0 0 600 180"
            className="h-36 w-full"
            role="img"
            aria-label="Gráfico de área"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="area" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#60a5fa" stopOpacity="0.55" />
                <stop offset="0.55" stopColor="#2563EB" stopOpacity="0.22" />
                <stop offset="1" stopColor="#2563EB" stopOpacity="0.04" />
              </linearGradient>
              <filter id="soft" x="-10%" y="-10%" width="120%" height="120%">
                <feGaussianBlur stdDeviation="0.7" />
              </filter>
            </defs>
            <path
              d="M0,140 C80,120 110,80 180,90 C250,100 280,40 340,55 C410,74 420,30 470,48 C520,64 560,80 600,66 L600,180 L0,180 Z"
              fill="url(#area)"
            />
            <path
              d="M0,140 C80,120 110,80 180,90 C250,100 280,40 340,55 C410,74 420,30 470,48 C520,64 560,80 600,66"
              fill="none"
              stroke="#2563EB"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <line x1="0" y1="180" x2="600" y2="180" stroke="#e2e8f0" />
            <path
              d="M0,140 C80,120 110,80 180,90 C250,100 280,40 340,55 C410,74 420,30 470,48 C520,64 560,80 600,66"
              fill="none"
              stroke="#93c5fd"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              filter="url(#soft)"
              opacity="0.8"
            />
          </svg>
        </div>
      </div>

      <div className="mt-5 rounded-xl border border-white/25 bg-white/55 p-4 backdrop-blur-md">
        <div className="text-xs font-semibold text-slate-900">
          Últimas Execuções
        </div>
        <div className="mt-3 space-y-2">
          {["Empenho — Material", "Pagamento — Serviço", "Receita — Repasse"].map(
            (label) => (
              <div
                key={label}
                className="flex items-center justify-between rounded-lg border border-white/25 bg-white/50 px-3 py-2"
              >
                <div className="text-xs font-medium text-slate-900">{label}</div>
                <div className="text-[11px] text-slate-500">Hoje</div>
              </div>
            )
          )}
        </div>
      </div>
    </Card>
  );
}

