import { Separator } from "@/components/ui/separator";

export function LandingFooter() {
  return (
    <footer className="bg-[#0f172a]">
      <div className="mx-auto max-w-7xl px-4 py-12 md:px-6 lg:px-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div className="text-slate-200">
            <div className="text-sm font-semibold">SISGERP</div>
            <div className="mt-1 text-sm text-slate-400">
              Sistema de Gestão de Contas Públicas
            </div>
          </div>
          <div className="text-sm text-slate-400">
            <a href="mailto:rayhenrique@gmail.com" className="hover:text-slate-200">
              rayhenrique@gmail.com
            </a>
          </div>
        </div>
        <Separator className="my-8 bg-slate-800" />
        <div className="text-xs text-slate-500">
          © 2025 SISGERP. Todos os direitos reservados.
        </div>
      </div>
    </footer>
  );
}

