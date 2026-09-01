import React from 'react';

export function PainelGestorFilters() {
  return (
    <div className="sticky top-0 z-20 bg-[rgba(246,242,234,0.92)] backdrop-blur-[8px] border-b border-line">
      <div className="flex gap-[22px] items-end py-[14px] px-[22px] flex-wrap w-full max-w-[1220px] mx-auto">
        <div className="flex flex-col gap-[6px]">
          <span className="text-[11px] font-bold tracking-[0.06em] uppercase text-muted">
            Status da execução
          </span>
          <div className="flex gap-[6px] flex-wrap">
            <div className="border border-ink bg-ink text-white font-semibold text-[13px] font-inter py-[7px] px-[13px] rounded-full cursor-pointer transition-colors duration-150">
              Todas
            </div>
            <div className="border border-line bg-white text-ink-soft font-semibold text-[13px] font-inter py-[7px] px-[13px] rounded-full cursor-pointer transition-colors duration-150 hover:border-brick">
              Paga
            </div>
            <div className="border border-line bg-white text-ink-soft font-semibold text-[13px] font-inter py-[7px] px-[13px] rounded-full cursor-pointer transition-colors duration-150 hover:border-brick">
              Empenhada
            </div>
            <div className="border border-line bg-white text-ink-soft font-semibold text-[13px] font-inter py-[7px] px-[13px] rounded-full cursor-pointer transition-colors duration-150 hover:border-brick">
              Enviada
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-[6px]">
          <span className="text-[11px] font-bold tracking-[0.06em] uppercase text-muted">
            Tipo da despesa
          </span>
          <select className="border border-line bg-white text-ink font-medium text-[13px] font-inter py-[8px] px-[12px] rounded-[9px] min-w-[180px] outline-none">
            <option>Todas</option>
            <option>Custeio</option>
            <option>Investimento</option>
          </select>
        </div>

        <div className="flex flex-col gap-[6px]">
          <span className="text-[11px] font-bold tracking-[0.06em] uppercase text-muted">
            Buscar
          </span>
          <input
            type="text"
            className="border border-line bg-white text-ink font-medium text-[13px] font-inter py-[8px] px-[12px] rounded-[9px] min-w-[210px] outline-none"
            placeholder="Número, autor ou objeto..."
          />
        </div>

        <button className="ml-auto self-end border-0 bg-transparent text-brick font-semibold text-[13px] font-inter cursor-pointer py-[8px] px-[4px] hover:underline">
          Limpar filtros
        </button>
      </div>
    </div>
  );
}
