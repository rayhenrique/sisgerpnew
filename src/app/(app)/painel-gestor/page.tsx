"use client";

import React, { useEffect, useState } from 'react';
import { PainelGestorHeader } from '@/features/painelGestor/PainelGestorHeader';
import { PainelGestorFilters } from '@/features/painelGestor/PainelGestorFilters';
import { PainelGestorKPIs } from '@/features/painelGestor/PainelGestorKPIs';
import { PainelGestorExecutionHero } from '@/features/painelGestor/PainelGestorExecutionHero';
import { PainelGestorCharts } from '@/features/painelGestor/PainelGestorCharts';
import { PainelGestorTable } from '@/features/painelGestor/PainelGestorTable';
import { fetchDashboardOverview } from '@/features/dashboard/api';
import type { DashboardOverview } from '@/features/dashboard/types';

export default function PainelGestorPage() {
  const [data, setData] = useState<DashboardOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    
    async function load() {
      try {
        const d = await fetchDashboardOverview();
        if (!cancelled) {
          setData(d);
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Erro ao carregar os dados');
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--paper)] text-ink font-inter antialiased flex items-center justify-center">
        <p className="text-xl font-bold">Carregando painel gestor...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-[var(--paper)] text-ink font-inter antialiased flex items-center justify-center">
        <p className="text-xl font-bold text-[var(--brick)]">Erro: {error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--paper)] text-ink font-inter antialiased pb-[40px]">
      <PainelGestorHeader />
      <PainelGestorFilters />
      <PainelGestorKPIs totals={data.totals} totalTransactions={data.recentTransactions.length} />
      <PainelGestorExecutionHero totals={data.totals} />
      <PainelGestorCharts categories={data.categories} monthly={data.monthly} />
      <PainelGestorTable transactions={data.recentTransactions} />
    </div>
  );
}
