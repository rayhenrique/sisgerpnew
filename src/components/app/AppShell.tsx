"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import * as React from "react";
import { ChevronDown, ChevronRight, Building2, Menu } from "lucide-react";

import { cn } from "@/lib/utils";
import { adminNav, getPageTitle, primaryNav, type NavItem } from "@/components/app/nav";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import { useMyProfile } from "@/features/adminUsers/useMyProfile";
import { canManageUsers } from "@/features/adminUsers/rbac";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

function toneClass(tone: NavItem["tone"]) {
  if (tone === "success") return "text-[color:var(--sis-success)]";
  if (tone === "danger") return "text-[color:var(--sis-danger)]";
  return "text-white";
}

function isActive(pathname: string, href: string) {
  if (href === "/dashboard") return pathname === "/dashboard" || pathname === "/";
  return pathname === href || pathname.startsWith(href + "/");
}

function initialsFromName(value: string) {
  const parts = value
    .split(/\s+/)
    .map((p) => p.trim())
    .filter(Boolean);
  if (parts.length === 0) return "U";
  const first = parts[0]?.[0] ?? "U";
  const last = parts.length > 1 ? parts[parts.length - 1]?.[0] ?? "" : "";
  return (first + last).toUpperCase();
}

function SidebarLink({
  item,
  pathname,
  inset,
}: {
  item: NavItem;
  pathname: string;
  inset?: boolean;
}) {
  const active = isActive(pathname, item.href);

  return (
    <Link
      href={item.href}
      className={cn(
        "group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
        inset ? "pl-9" : "pl-3",
        active
          ? "bg-white/10 text-white"
          : "text-[color:var(--sis-sidebar-text)] hover:bg-white/10 hover:text-white"
      )}
    >
      {active ? (
        <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r bg-white" />
      ) : null}
      <item.Icon className={cn("h-4 w-4 shrink-0", toneClass(item.tone))} />
      <span className={cn("truncate", inset && "text-[color:var(--sis-sidebar-text-muted)]")}>
        {item.label}
      </span>
    </Link>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const title = getPageTitle(pathname);
  const adminActive = pathname.startsWith("/admin");
  const [adminOpen, setAdminOpen] = React.useState(adminActive);
  const [mobileNavOpen, setMobileNavOpen] = React.useState(false);

  const { profile } = useMyProfile();
  const showAdmin = profile ? canManageUsers(profile.role) : false;
  const displayName = profile?.name ?? profile?.email ?? "Usuário";
  const displayEmail = profile?.email ?? "";
  const displayRole =
    profile?.role === "superadmin"
      ? "Superadmin"
      : profile?.role === "admin"
        ? "Admin"
        : "Operador";

  React.useEffect(() => {
    if (adminActive) setAdminOpen(true);
  }, [adminActive]);

  React.useEffect(() => {
    setMobileNavOpen(false);
  }, [pathname]);

  const SidebarContent = (
    <>
      <div className="flex h-14 items-center gap-3 px-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10">
          <Building2 className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold leading-5">SISGERP</div>
          <div className="truncate text-xs text-white/70">Gestão de recursos públicos</div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-4 py-4">
        <div className="space-y-1">
          {primaryNav.map((item) => (
            <SidebarLink key={item.href} item={item} pathname={pathname} />
          ))}
        </div>

        {showAdmin ? (
          <>
            <div className="my-4">
              <Separator className="bg-white/15" />
            </div>

            <Collapsible open={adminOpen} onOpenChange={setAdminOpen}>
              <CollapsibleTrigger asChild>
                <button
                  type="button"
                  className={cn(
                    "flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors",
                    adminOpen
                      ? "bg-white/10 text-white"
                      : "text-white/80 hover:bg-white/10 hover:text-white"
                  )}
                  aria-expanded={adminOpen}
                >
                  <span className="flex items-center gap-3">
                    {adminOpen ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                    <span className="truncate">Administração</span>
                  </span>
                  <span className="text-xs text-white/60">Admin</span>
                </button>
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-1 space-y-1">
                {adminNav.map((item) => (
                  <SidebarLink key={item.href} item={item} pathname={pathname} inset />
                ))}
              </CollapsibleContent>
            </Collapsible>
          </>
        ) : null}
      </nav>

      <div className="px-4 pb-4">
        <div className="rounded-lg bg-white/10 p-3">
          <div className="text-xs font-medium text-white/80">Environment</div>
          <div className="mt-1 text-xs text-white/70">Development</div>
        </div>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-[color:var(--sis-bg)]">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-white focus:px-3 focus:py-2 focus:text-sm focus:font-medium focus:text-slate-900 focus:shadow"
      >
        Pular para o conteúdo
      </a>

      <Dialog open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
        <DialogContent
          id="mobile-nav"
          className="left-0 top-0 h-full w-[85vw] max-w-[320px] -translate-x-0 -translate-y-0 rounded-none border-r border-white/10 bg-[color:var(--sis-primary)] p-0 text-white shadow-xl lg:hidden"
        >
          <DialogTitle className="sr-only">Navegação principal</DialogTitle>
          <div className="flex h-full flex-col">{SidebarContent}</div>
        </DialogContent>
      </Dialog>

      <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-40 lg:flex lg:w-72 lg:flex-col lg:bg-[color:var(--sis-primary)] lg:text-white xl:lg:w-80">
        {SidebarContent}
      </aside>

      <div className="lg:pl-72 xl:lg:pl-80">
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between bg-white px-4 shadow-sm md:px-6">
          <div className="min-w-0">
            {title ? (
              <div className="truncate text-sm font-semibold text-slate-900">
                {title}
              </div>
            ) : null}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              className="inline-flex h-9 w-9 items-center justify-center rounded-md text-slate-700 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--sis-primary)] lg:hidden"
              onClick={() => setMobileNavOpen(true)}
              aria-label="Abrir menu"
              aria-controls="mobile-nav"
              aria-expanded={mobileNavOpen}
            >
              <Menu className="h-5 w-5" />
            </button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="flex items-center gap-3 rounded-lg px-2 py-1.5 transition-colors hover:bg-slate-100"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-slate-200 text-slate-800">
                      {initialsFromName(displayName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden min-w-0 text-left sm:block">
                    <div className="truncate text-sm font-medium text-slate-900">
                      {displayName}
                    </div>
                    <div className="truncate text-xs text-slate-500">{displayRole}</div>
                  </div>
                </button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-72">
                <DropdownMenuLabel>
                  <div className="py-1">
                    <div className="text-sm font-semibold text-slate-900">
                      {displayName}
                    </div>
                    <div className="text-xs text-slate-500">{displayEmail}</div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem disabled>My account</DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/configuracoes">Settings</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onSelect={async () => {
                    const supabase = getSupabaseBrowserClient();
                    await supabase?.auth.signOut();
                    router.replace("/login");
                  }}
                >
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main id="main-content" className="min-w-0 p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

