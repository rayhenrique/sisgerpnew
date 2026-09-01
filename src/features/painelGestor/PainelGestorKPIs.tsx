import React from 'react';

type KpiProps = {
  label: string;
  value: string;
  sub: string;
  colorClass: string;
};

const mockKpis: KpiProps[] = [
  { label: 'Total de Receitas', value: 'R$ 1.250.000', sub: 'Mês atual', colorClass: 'bg-brick' },
  { label: 'Total de Despesas', value: 'R$ 840.500', sub: 'Mês atual', colorClass: 'bg-river' },
  { label: 'Saldo Atual', value: 'R$ 409.500', sub: 'Em caixa', colorClass: 'bg-land' },
  { label: 'Despesas Empenhadas', value: 'R$ 120.000', sub: 'Aguardando pagamento', colorClass: 'bg-sun' },
  { label: 'Transações', value: '342', sub: 'Registradas no mês', colorClass: 'bg-ink' },
];

function KpiCard({ label, value, sub, colorClass }: KpiProps) {
  return (
    <div className="bg-card border border-line rounded-[14px] p-[16px_16px_15px] shadow-[var(--shadow-premium)] relative overflow-hidden">
      {/* Indicador de cor à esquerda */}
      <div className={`absolute left-0 top-0 bottom-0 w-[4px] ${colorClass}`}></div>
      
      <div className="text-[11.5px] font-bold tracking-[0.05em] uppercase text-muted">
        {label}
      </div>
      <div className="font-archivo font-extrabold text-[26px] mt-[8px] tracking-[-0.02em] tabular-nums text-ink">
        {value}
      </div>
      <div className="text-[12px] text-ink-soft mt-[3px]">
        {sub}
      </div>
    </div>
  );
}

export function PainelGestorKPIs() {
  return (
    <section className="py-[26px]">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-[14px] w-full max-w-[1220px] mx-auto px-[22px]">
        {mockKpis.map((kpi, index) => (
          <KpiCard key={index} {...kpi} />
        ))}
      </div>
    </section>
  );
}
