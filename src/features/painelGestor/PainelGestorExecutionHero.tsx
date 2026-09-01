'use client';

import React, { useEffect, useState } from 'react';
import { formatCurrencyBRL } from '@/features/dashboard/format';

export function PainelGestorExecutionHero({ totals }: { totals: { receitas: number; despesas: number; saldo: number; } }) {
  const [width, setWidth] = useState(0);

  const percentage = totals.receitas > 0 ? Math.round((totals.despesas / totals.receitas) * 100) : 0;
  const displayPercentage = Math.min(percentage, 100);

  // Animate the bar on load
  useEffect(() => {
    const timer = setTimeout(() => {
      setWidth(displayPercentage);
    }, 100);
    return () => clearTimeout(timer);
  }, [displayPercentage]);

  return (
    <div className="w-full max-w-[1220px] mx-auto px-[22px]">
      <div className="bg-card border border-line rounded-[16px] p-[22px] shadow-[var(--shadow-premium)] mt-[16px]">
        
        <div className="flex justify-between items-baseline flex-wrap gap-[8px]">
          <h3 className="font-archivo font-extrabold text-[15px] m-0 tracking-[0.01em] text-ink">
            Execução de Despesas sobre Receitas
          </h3>
          <div className="font-archivo font-black text-[30px] text-land tabular-nums">
            {width}%
          </div>
        </div>

        <div className="h-[22px] rounded-full bg-[#efe7db] mt-[14px] overflow-hidden relative">
          <i
            className="block h-full rounded-full bg-gradient-to-r from-[var(--land)] to-[var(--sun)] transition-all duration-1000 ease-[cubic-bezier(0.2,0.7,0.2,1)]"
            style={{ width: `${width}%` }}
          ></i>
        </div>

        <div className="flex gap-[22px] flex-wrap mt-[14px] text-[13px] text-ink">
          <span className="flex items-center">
            <i className="inline-block w-[10px] h-[10px] rounded-[3px] mr-[7px] align-baseline bg-brick"></i>
            Receitas: <b className="font-archivo font-extrabold tabular-nums ml-1">{formatCurrencyBRL(totals.receitas)}</b>
          </span>
          <span className="flex items-center">
            <i className="inline-block w-[10px] h-[10px] rounded-[3px] mr-[7px] align-baseline bg-river"></i>
            Despesas: <b className="font-archivo font-extrabold tabular-nums ml-1">{formatCurrencyBRL(totals.despesas)}</b>
          </span>
          <span className="flex items-center">
            <i className="inline-block w-[10px] h-[10px] rounded-[3px] mr-[7px] align-baseline bg-land"></i>
            Saldo: <b className="font-archivo font-extrabold tabular-nums ml-1">{formatCurrencyBRL(totals.saldo)}</b>
          </span>
        </div>

      </div>
    </div>
  );
}
