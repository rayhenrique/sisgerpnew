import React from 'react';

export function PainelGestorHeader() {
  return (
    <header className="bg-[#fffdf9] border-b border-line">
      <div className="flex h-[6px]">
        <i className="flex-1 bg-river block"></i>
        <i className="flex-1 bg-land block"></i>
        <i className="flex-1 bg-sun block"></i>
        <i className="flex-1 bg-brick block"></i>
      </div>
      <div className="flex items-center gap-[26px] py-[20px] px-[22px] flex-wrap w-full max-w-[1220px] mx-auto">
        {/* Placeholder for the Logo. You can replace the src with the actual logo image path */}
        <div className="h-[62px] w-[62px] rounded-full bg-line flex items-center justify-center text-ink font-bold shrink-0">
          Logo
        </div>
        
        <div className="border-l-0 md:border-l-2 border-line pl-0 md:pl-[24px]">
          <h1 className="font-archivo font-extrabold text-[20px] m-0 tracking-[-0.01em] leading-[1.15] text-ink">
            Painel Gestor Financeiro
          </h1>
          <p className="mt-[3px] text-[13px] text-ink-soft">
            Sistema de Gestão ERP
          </p>
        </div>
        
        <div className="md:ml-auto text-left md:text-right text-[12px] text-muted w-full md:w-auto mt-4 md:mt-0">
          <p>
            Última atualização: <b className="text-ink font-semibold">Hoje, 08:30</b>
          </p>
        </div>
      </div>
    </header>
  );
}
