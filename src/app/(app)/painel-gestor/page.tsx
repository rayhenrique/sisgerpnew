import React from 'react';
import { PainelGestorHeader } from '@/features/painelGestor/PainelGestorHeader';
import { PainelGestorFilters } from '@/features/painelGestor/PainelGestorFilters';
import { PainelGestorKPIs } from '@/features/painelGestor/PainelGestorKPIs';
import { PainelGestorExecutionHero } from '@/features/painelGestor/PainelGestorExecutionHero';
import { PainelGestorCharts } from '@/features/painelGestor/PainelGestorCharts';
import { PainelGestorTable } from '@/features/painelGestor/PainelGestorTable';

export const metadata = {
  title: 'Painel Gestor | Sistema de Gestão ERP',
};

export default function PainelGestorPage() {
  return (
    <div className="min-h-screen bg-[var(--paper)] text-ink font-inter antialiased pb-[40px]">
      <PainelGestorHeader />
      <PainelGestorFilters />
      <PainelGestorKPIs />
      <PainelGestorExecutionHero />
      <PainelGestorCharts />
      <PainelGestorTable />
    </div>
  );
}
