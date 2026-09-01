import React from 'react';
import type { Transaction } from '@/features/dashboard/types';
import { formatCurrencyBRL } from '@/features/dashboard/format';

function formatDateBR(isoDate: string) {
  const date = new Date(isoDate);
  return new Intl.DateTimeFormat("pt-BR").format(date);
}

export function PainelGestorTable({ transactions }: { transactions: Transaction[] }) {
  // Pega o valor máximo para criar a barrinha visual proporcional
  const maxAmount = transactions.reduce((acc, curr) => Math.max(acc, curr.amount), 1);

  return (
    <div className="w-full max-w-[1220px] mx-auto px-[22px] mb-[40px] mt-[16px]">
      <div className="bg-card border border-line rounded-[16px] shadow-[var(--shadow-premium)] overflow-hidden">
        
        <div className="flex justify-between items-center p-[16px_18px] border-b border-line flex-wrap gap-[8px]">
          <h3 className="font-archivo font-extrabold text-[14px] m-0 text-ink">Últimas Transações Registradas</h3>
          <span className="text-[12px] text-muted">{transactions.length} registros</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-[13px] min-w-[820px] text-ink">
            <thead>
              <tr>
                <th className="sticky top-0 bg-[#faf6f0] text-left font-inter font-bold text-[11px] tracking-[0.05em] uppercase text-muted p-[11px_14px] border-b border-line cursor-pointer whitespace-nowrap select-none hover:text-ink transition-colors">ID / Data</th>
                <th className="sticky top-0 bg-[#faf6f0] text-left font-inter font-bold text-[11px] tracking-[0.05em] uppercase text-muted p-[11px_14px] border-b border-line cursor-pointer whitespace-nowrap select-none hover:text-ink transition-colors">Descrição / Objeto</th>
                <th className="sticky top-0 bg-[#faf6f0] text-left font-inter font-bold text-[11px] tracking-[0.05em] uppercase text-muted p-[11px_14px] border-b border-line cursor-pointer whitespace-nowrap select-none hover:text-ink transition-colors">Status (Tipo)</th>
                <th className="sticky top-0 bg-[#faf6f0] text-right font-inter font-bold text-[11px] tracking-[0.05em] uppercase text-muted p-[11px_14px] border-b border-line cursor-pointer whitespace-nowrap select-none hover:text-ink transition-colors tabular-nums">Valor (R$)</th>
                <th className="sticky top-0 bg-[#faf6f0] text-right font-inter font-bold text-[11px] tracking-[0.05em] uppercase text-muted p-[11px_14px] border-b border-line cursor-pointer whitespace-nowrap select-none hover:text-ink transition-colors tabular-nums">Peso Relativo</th>
              </tr>
            </thead>
            <tbody>
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-[20px] text-center text-muted">
                    Nenhuma transação encontrada.
                  </td>
                </tr>
              ) : (
                transactions.map((row) => {
                  const percentage = Math.round((row.amount / maxAmount) * 100);
                  
                  return (
                    <tr key={row.id} className="hover:bg-[#fbf8f3] group">
                      <td className="p-[11px_14px] border-b border-[#f1e9dd] align-middle group-last:border-b-0">
                        <b className="font-semibold block">{row.id.split('-')[0].toUpperCase()}</b>
                        <span className="text-[11px] text-muted">{formatDateBR(row.date)}</span>
                      </td>
                      <td className="p-[11px_14px] border-b border-[#f1e9dd] align-middle group-last:border-b-0 max-w-[300px] truncate" title={row.description}>
                        {row.description}
                      </td>
                      <td className="p-[11px_14px] border-b border-[#f1e9dd] align-middle group-last:border-b-0">
                        {row.type === 'receita' && (
                          <span className="inline-block font-inter font-bold text-[11px] p-[3px_9px] rounded-full whitespace-nowrap bg-[#e7f3e3] text-[#2e6b26]">RECEITA</span>
                        )}
                        {row.type === 'despesa' && (
                          <span className="inline-block font-inter font-bold text-[11px] p-[3px_9px] rounded-full whitespace-nowrap bg-[#fdefd7] text-[#a35f10]">DESPESA</span>
                        )}
                      </td>
                      <td className="p-[11px_14px] border-b border-[#f1e9dd] align-middle text-right tabular-nums group-last:border-b-0 font-medium">
                        {formatCurrencyBRL(row.amount)}
                      </td>
                      <td className="p-[11px_14px] border-b border-[#f1e9dd] align-middle group-last:border-b-0">
                        <div className="flex items-center gap-[8px] justify-end">
                          <div className="w-[74px] h-[7px] rounded-full bg-[#efe7db] overflow-hidden flex-none">
                            <i 
                              className={`block h-full rounded-full transition-all duration-1000 ${row.type === 'receita' ? 'bg-land' : 'bg-sun'}`}
                              style={{ width: `${percentage}%` }}
                            ></i>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}
