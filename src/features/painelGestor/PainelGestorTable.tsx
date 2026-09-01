import React from 'react';

const mockData = [
  {
    numero: '2024001',
    autor: 'Dep. Exemplo Silva',
    objeto: 'Aquisição de ambulância',
    status: 'PAGA',
    valor: '250.000,00',
    progresso: 100
  },
  {
    numero: '2024002',
    autor: 'Senador Fulano',
    objeto: 'Reforma do hospital municipal',
    status: 'EMPENHADA',
    valor: '1.500.000,00',
    progresso: 45
  },
  {
    numero: '2024003',
    autor: 'Dep. Cicrano',
    objeto: 'Equipamentos de raio-x',
    status: 'ENVIADA',
    valor: '300.000,00',
    progresso: 10
  }
];

export function PainelGestorTable() {
  return (
    <div className="w-full max-w-[1220px] mx-auto px-[22px] mb-[40px] mt-[16px]">
      <div className="bg-card border border-line rounded-[16px] shadow-[var(--shadow-premium)] overflow-hidden">
        
        <div className="flex justify-between items-center p-[16px_18px] border-b border-line flex-wrap gap-[8px]">
          <h3 className="font-archivo font-extrabold text-[14px] m-0 text-ink">Lista de Transações</h3>
          <span className="text-[12px] text-muted">3 registros</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-[13px] min-w-[820px] text-ink">
            <thead>
              <tr>
                <th className="sticky top-0 bg-[#faf6f0] text-left font-inter font-bold text-[11px] tracking-[0.05em] uppercase text-muted p-[11px_14px] border-b border-line cursor-pointer whitespace-nowrap select-none hover:text-ink transition-colors">Número</th>
                <th className="sticky top-0 bg-[#faf6f0] text-left font-inter font-bold text-[11px] tracking-[0.05em] uppercase text-muted p-[11px_14px] border-b border-line cursor-pointer whitespace-nowrap select-none hover:text-ink transition-colors">Autor / Entidade</th>
                <th className="sticky top-0 bg-[#faf6f0] text-left font-inter font-bold text-[11px] tracking-[0.05em] uppercase text-muted p-[11px_14px] border-b border-line cursor-pointer whitespace-nowrap select-none hover:text-ink transition-colors">Objeto</th>
                <th className="sticky top-0 bg-[#faf6f0] text-left font-inter font-bold text-[11px] tracking-[0.05em] uppercase text-muted p-[11px_14px] border-b border-line cursor-pointer whitespace-nowrap select-none hover:text-ink transition-colors">Status</th>
                <th className="sticky top-0 bg-[#faf6f0] text-right font-inter font-bold text-[11px] tracking-[0.05em] uppercase text-muted p-[11px_14px] border-b border-line cursor-pointer whitespace-nowrap select-none hover:text-ink transition-colors tabular-nums">Valor (R$)</th>
                <th className="sticky top-0 bg-[#faf6f0] text-right font-inter font-bold text-[11px] tracking-[0.05em] uppercase text-muted p-[11px_14px] border-b border-line cursor-pointer whitespace-nowrap select-none hover:text-ink transition-colors tabular-nums">Progresso</th>
              </tr>
            </thead>
            <tbody>
              {mockData.map((row, idx) => (
                <tr key={idx} className="hover:bg-[#fbf8f3] group">
                  <td className="p-[11px_14px] border-b border-[#f1e9dd] align-middle group-last:border-b-0">
                    <b className="font-semibold">{row.numero}</b>
                  </td>
                  <td className="p-[11px_14px] border-b border-[#f1e9dd] align-middle group-last:border-b-0">
                    {row.autor}
                  </td>
                  <td className="p-[11px_14px] border-b border-[#f1e9dd] align-middle group-last:border-b-0">
                    {row.objeto}
                  </td>
                  <td className="p-[11px_14px] border-b border-[#f1e9dd] align-middle group-last:border-b-0">
                    {row.status === 'PAGA' && (
                      <span className="inline-block font-inter font-bold text-[11px] p-[3px_9px] rounded-full whitespace-nowrap bg-[#e7f3e3] text-[#2e6b26]">PAGA</span>
                    )}
                    {row.status === 'EMPENHADA' && (
                      <span className="inline-block font-inter font-bold text-[11px] p-[3px_9px] rounded-full whitespace-nowrap bg-[#fdefd7] text-[#a35f10]">EMPENHADA</span>
                    )}
                    {row.status === 'ENVIADA' && (
                      <span className="inline-block font-inter font-bold text-[11px] p-[3px_9px] rounded-full whitespace-nowrap bg-[#e3eef7] text-[#175a94]">ENVIADA</span>
                    )}
                  </td>
                  <td className="p-[11px_14px] border-b border-[#f1e9dd] align-middle text-right tabular-nums group-last:border-b-0">
                    {row.valor}
                  </td>
                  <td className="p-[11px_14px] border-b border-[#f1e9dd] align-middle group-last:border-b-0">
                    <div className="flex items-center gap-[8px] justify-end">
                      <div className="w-[74px] h-[7px] rounded-full bg-[#efe7db] overflow-hidden flex-none">
                        <i 
                          className="block h-full bg-land rounded-full transition-all duration-1000"
                          style={{ width: `${row.progresso}%` }}
                        ></i>
                      </div>
                      <span className="tabular-nums min-w-[44px] text-right">{row.progresso}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}
