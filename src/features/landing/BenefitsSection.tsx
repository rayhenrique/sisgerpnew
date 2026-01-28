"use client";

import { LineChart, MessageCircle, ShieldCheck, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

function BenefitItem({
  title,
  text,
  icon,
}: {
  title: string;
  text: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="flex gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-900/5 transition-all duration-300 hover:-translate-y-[2px] hover:shadow-md hover:shadow-slate-900/10 will-change-transform">
      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-blue-600 text-white">
        {icon}
      </div>
      <div>
        <div className="text-sm font-semibold text-slate-900">{title}</div>
        <div className="mt-1 text-sm text-slate-600">{text}</div>
      </div>
    </div>
  );
}

export function BenefitsSection() {
  return (
    <motion.section
      id="benefits"
      className="bg-white py-16"
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">
            Por que escolher o SISGERP - Sistema de Gestão de Recursos Públicos?
          </h2>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-2">
          <BenefitItem
            icon={<Sparkles className="h-5 w-5" />}
            title="Interface Intuitiva"
            text="Design moderno e fácil de usar."
          />
          <BenefitItem
            icon={<ShieldCheck className="h-5 w-5" />}
            title="Segurança Avançada"
            text="Dados protegidos com recursos recentes."
          />
          <BenefitItem
            icon={<LineChart className="h-5 w-5" />}
            title="Atualizações Constantes"
            text="Sempre atualizado com a legislação."
          />
          <BenefitItem
            icon={<MessageCircle className="h-5 w-5" />}
            title="Suporte Especializado"
            text="Equipe técnica pronta para ajudar."
          />
        </div>
      </div>
    </motion.section>
  );
}

