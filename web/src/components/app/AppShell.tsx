"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import * as React from "react";
import { ChevronDown, ChevronRight, Building2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { adminNav, getPageTitle, primaryNav, type NavItem } from "@/components/app/nav";
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

function toneClass(tone: NavItem["tone"]) {
  if (tone === "success") return "text-[color:var(--sis-success)]";
  if (tone === "danger") return "text-[color:var(--sis-danger)]";
  return "text-white";
}

function isActive(pathname: string, href: string) {
  if (href === "/dashboard") return pathname === "/dashboard" || pathname === "/";
  return pathname === href || pathname.startsWith(href + "/");
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
  const pathname = usePathname();
  const title = getPageTitle(pathname);
  const adminActive = pathname.startsWith("/admin");
  const [adminOpen, setAdminOpen] = React.useState(adminActive);

  React.useEffect(() => {
    if (adminActive) setAdminOpen(true);
  }, [adminActive]);

  return (
    <div className="min-h-screen bg-[color:var(--sis-bg)]">
      <aside className="fixed inset-y-0 left-0 z-40 flex w-72 flex-col bg-[color:var(--sis-primary)] text-white">
        <div className="flex h-14 items-center gap-3 px-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10">
            <Building2 className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold leading-5">SISGERP</div>
            <div className="truncate text-xs text-white/70">
              Public resource management
            </div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-4 py-4">
          <div className="space-y-1">
            {primaryNav.map((item) => (
              <SidebarLink key={item.href} item={item} pathname={pathname} />
            ))}
          </div>

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
                <SidebarLink
                  key={item.href}
                  item={item}
                  pathname={pathname}
                  inset
                />
              ))}
            </CollapsibleContent>
          </Collapsible>
        </nav>

        <div className="px-4 pb-4">
          <div className="rounded-lg bg-white/10 p-3">
            <div className="text-xs font-medium text-white/80">Environment</div>
            <div className="mt-1 text-xs text-white/70">Development</div>
          </div>
        </div>
      </aside>

      <div className="pl-72">
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between bg-white px-6 shadow-sm">
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold text-slate-900">
              {title}
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="flex items-center gap-3 rounded-lg px-2 py-1.5 transition-colors hover:bg-slate-100"
              >
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-slate-200 text-slate-800">
                    RH
                  </AvatarFallback>
                </Avatar>
                <div className="hidden min-w-0 text-left sm:block">
                  <div className="truncate text-sm font-medium text-slate-900">
                    Ray Henrique
                  </div>
                  <div className="truncate text-xs text-slate-500">Admin</div>
                </div>
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-72">
              <DropdownMenuLabel>
                <div className="py-1">
                  <div className="text-sm font-semibold text-slate-900">
                    Ray Henrique
                  </div>
                  <div className="text-xs text-slate-500">
                    ray.henrique@example.com
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem disabled>My account</DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/configuracoes">Settings</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Sign out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}

