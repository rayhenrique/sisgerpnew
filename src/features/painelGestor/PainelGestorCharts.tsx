'use client';

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

const dataPie = [
  { name: 'Custeio', value: 70 },
  { name: 'Investimento', value: 30 },
];

const COLORS = ['var(--river)', 'var(--sun)'];

const dataBar = [
  { name: 'Jan', valor: 400000 },
  { name: 'Fev', valor: 300000 },
  { name: 'Mar', valor: 500000 },
  { name: 'Abr', valor: 450000 },
  { name: 'Mai', valor: 600000 },
  { name: 'Jun', valor: 800000 },
];

export function PainelGestorCharts() {
  return (
    <div className="w-full max-w-[1220px] mx-auto px-[22px] mt-[16px]">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-[16px]">
        
        {/* Painel 1 */}
        <div className="bg-card border border-line rounded-[16px] p-[18px_18px_8px] shadow-[var(--shadow-premium)]">
          <h3 className="font-archivo font-extrabold text-[14px] m-[0_0_2px] tracking-[0.01em] text-ink">
            Despesas por Categoria
          </h3>
          <p className="text-[12px] text-muted m-[0_0_12px]">
            Distribuição de Custeio vs Investimento
          </p>
          <div className="relative h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={dataPie}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                >
                  {dataPie.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: '1px solid var(--line)', backgroundColor: 'var(--card)', color: 'var(--ink)' }} 
                  itemStyle={{ color: 'var(--ink)' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', color: 'var(--ink-soft)' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Painel 2 */}
        <div className="bg-card border border-line rounded-[16px] p-[18px_18px_8px] shadow-[var(--shadow-premium)]">
          <h3 className="font-archivo font-extrabold text-[14px] m-[0_0_2px] tracking-[0.01em] text-ink">
            Evolução das Transferências
          </h3>
          <p className="text-[12px] text-muted m-[0_0_12px]">
            Valores repassados ao longo do ano
          </p>
          <div className="relative h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={dataBar}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--line)" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: 'var(--muted)' }} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: 'var(--muted)' }}
                  tickFormatter={(value) => `R$${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip 
                  cursor={{ fill: 'var(--paper)' }}
                  contentStyle={{ borderRadius: '8px', border: '1px solid var(--line)', backgroundColor: 'var(--card)', color: 'var(--ink)' }}
                />
                <Bar dataKey="valor" fill="var(--land)" radius={[4, 4, 0, 0]} barSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
}
