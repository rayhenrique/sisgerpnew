import React from 'react';
import { formatCurrencyBRL } from '@/features/dashboard/format';

type KpiProps = {
  label: string;
  value: string | number;
  sub: string;
  colorClass: string;
};

function KpiCard({ label, value, sub, colorClass }: KpiProps) {
  return (
    <div className="bg-card border border-line rounded-[14px] p-[16px_16px_15px] shadow-[var(--shadow-premium)] relative overflow-hidden">
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

export function PainelGestorKPIs({ 
  totals, 
  totalTransactions 
}: { 
  totals: { receitas: number; despesas: number; saldo: number; }; 
  totalTransactions: number; 
}) {
  const kpis: KpiProps[] = [
    { label: 'Total de Receitas', value: formatCurrencyBRL(totals.receitas), sub: 'Acumulado', colorClass: 'bg-brick' },
    { label: 'Total de Despesas', value: formatCurrencyBRL(totals.despesas), sub: 'Acumulado', colorClass: 'bg-river' },
    { label: 'Saldo Atual', value: formatCurrencyBRL(totals.saldo), sub: 'Disponível', colorClass: 'bg-land' },
    { label: 'Despesas Recentes', value: 'Atualizado', sub: 'Monitoramento contínuo', colorClass: 'bg-sun' },
    { label: 'Transações Recentes', value: totalTransactions.toString(), sub: 'Registradas', colorClass: 'bg-ink' },
  ];

  return (
    <section className="py-[26px]">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-[14px] w-full max-w-[1220px] mx-auto px-[22px]">
        {kpis.map((kpi, index) => (
          <KpiCard key={index} {...kpi} />
        ))}
      </div>
    </section>
  );
}
