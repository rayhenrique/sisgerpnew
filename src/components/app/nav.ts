import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  BookOpen,
  Database,
  FileText,
  Home,
  Settings,
  Tag,
  TrendingDown,
  TrendingUp,
  Users,
  ShieldCheck,
} from "lucide-react";

export type NavItem = {
  label: string;
  href: string;
  Icon: LucideIcon;
  tone?: "default" | "success" | "danger";
};

export const primaryNav: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", Icon: Home },
  { label: "Categorias", href: "/categorias", Icon: Tag },
  {
    label: "Classificação de Despesas",
    href: "/classificacao-despesas",
    Icon: FileText,
  },
  { label: "Receitas", href: "/receitas", Icon: TrendingUp, tone: "success" },
  { label: "Despesas", href: "/despesas", Icon: TrendingDown, tone: "danger" },
  { label: "Relatórios", href: "/relatorios", Icon: BarChart3 },
  { label: "Configurações", href: "/configuracoes", Icon: Settings },
  { label: "Manual do Usuário", href: "/manual", Icon: BookOpen },
];

export const adminNav: NavItem[] = [
  { label: "Usuários", href: "/admin/usuarios", Icon: Users },
  { label: "Auditoria", href: "/admin/auditoria", Icon: ShieldCheck },
  { label: "Backups", href: "/backup", Icon: Database },
];

export function getPageTitle(pathname: string) {
  const all = [...primaryNav, ...adminNav];

  const direct = all.find((i) => i.href === pathname);
  if (direct) return direct.label;

  const prefixMatch = all
    .filter((i) => i.href !== "/dashboard")
    .find((i) => pathname.startsWith(i.href + "/"));
  if (prefixMatch) return prefixMatch.label;

  if (pathname === "/" || pathname === "/dashboard") return "";
  if (pathname === "/minha-conta" || pathname.startsWith("/minha-conta/")) return "Minha Conta";
  if (pathname.startsWith("/admin")) return "Administração";

  return "SISGERP";
}

