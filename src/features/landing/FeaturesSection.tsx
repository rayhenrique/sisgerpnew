"use client";

import { FileText, LineChart, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function FeatureCard({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <Card className="rounded-xl border-slate-200 bg-white shadow-md transition-all duration-300 hover:-translate-y-[5px] hover:shadow-xl hover:shadow-slate-900/10 will-change-transform">
      <CardHeader className="pb-2">
        <div className="flex flex-col items-start gap-3">
          <div className="grid h-14 w-14 place-items-center rounded-2xl bg-blue-50">
            {icon}
          </div>
          <CardTitle className="text-base text-slate-900">{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="text-sm leading-relaxed text-slate-600">
        {text}
      </CardContent>
    </Card>
  );
}

export function FeaturesSection() {
  return (
    <motion.section
      id="features"
      className="bg-[#f8fafc] py-16"
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">
            Recursos Principais
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-slate-600 sm:text-base">
            Uma plataforma pensada para rotinas públicas, com foco em clareza,
            rastreabilidade e resultados.
          </p>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <FeatureCard
            icon={<LineChart className="h-12 w-12 text-blue-600" />}
            title="Controle Financeiro"
            text="Gerencie despesas e receitas com facilidade, garantindo visão consolidada e acompanhamento contínuo."
          />
          <FeatureCard
            icon={<FileText className="h-12 w-12 text-blue-600" />}
            title="Relatórios Detalhados"
            text="Gere relatórios completos e personalizados para auditorias, transparência e tomada de decisão."
          />
          <FeatureCard
            icon={<ShieldCheck className="h-12 w-12 text-blue-600" />}
            title="Conformidade Legal"
            text="Mantenha-se em conformidade com as legislações e boas práticas, com processos padronizados."
          />
        </div>
      </div>
    </motion.section>
  );
}

