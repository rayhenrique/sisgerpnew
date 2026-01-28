"use client";

import * as React from "react";
import { LogIn, Menu, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";

type SectionLink = { href: string; label: string };

function NavLink({
  href,
  label,
  scrolled,
}: SectionLink & { scrolled: boolean }) {
  return (
    <a
      href={href}
      className={
        "text-sm font-medium transition-all duration-300 " +
        (scrolled
          ? "text-slate-700 hover:text-slate-900"
          : "text-white/90 hover:text-white")
      }
    >
      {label}
    </a>
  );
}

export function LandingNavbar({ sections }: { sections: SectionLink[] }) {
  const [scrolled, setScrolled] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={
        "fixed left-0 top-0 z-50 w-full transition-all duration-300 " +
        (scrolled
          ? "bg-white/70 shadow-sm shadow-slate-900/10 backdrop-blur-md"
          : "bg-transparent")
      }
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-6 lg:px-8">
        <div
          className={
            "flex items-center gap-3 " +
            (scrolled ? "text-slate-900" : "text-white")
          }
        >
          <div
            className={
              "grid h-9 w-9 place-items-center rounded-xl transition-colors " +
              (scrolled ? "bg-blue-600 text-white" : "bg-white/15")
            }
          >
            <Sparkles className="h-5 w-5" />
          </div>
          <div className="leading-tight">
            <div className="text-sm font-semibold">SISGERP</div>
            <div
              className={
                "text-xs " + (scrolled ? "text-slate-600" : "text-white/80")
              }
            >
              Sistema de Gestão de Recursos Públicos
            </div>
          </div>
        </div>

        <nav className="hidden items-center gap-6 lg:flex">
          {sections.map((s) => (
            <NavLink
              key={s.href}
              href={s.href}
              label={s.label}
              scrolled={scrolled}
            />
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Button
            asChild
            className={
              "hidden transition-transform duration-200 hover:scale-[1.05] lg:inline-flex " +
              (scrolled
                ? "border border-slate-200 bg-white text-slate-900 hover:bg-slate-50"
                : "border border-white/60 bg-transparent text-white hover:bg-white/10")
            }
          >
            <a href="/login">
              <LogIn className="h-4 w-4" />
              Login
            </a>
          </Button>

          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="secondary"
                size="icon"
                className={
                  "lg:hidden " +
                  (scrolled
                    ? "bg-slate-100 text-slate-900 hover:bg-slate-200"
                    : "bg-white/15 text-white hover:bg-white/25")
                }
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </DialogTrigger>
            <DialogContent className="w-[92vw] max-w-sm rounded-2xl p-0">
              <DialogHeader className="p-5">
                <DialogTitle>Menu</DialogTitle>
              </DialogHeader>
              <div className="px-5 pb-5">
                <div className="space-y-3">
                  {sections.map((s) => (
                    <DialogClose asChild key={s.href}>
                      <a
                        href={s.href}
                        className="block rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-900"
                      >
                        {s.label}
                      </a>
                    </DialogClose>
                  ))}
                </div>
                <Separator className="my-4" />
                <DialogClose asChild>
                  <Button asChild className="w-full">
                    <a href="/login">
                      <LogIn className="h-4 w-4" />
                      Login
                    </a>
                  </Button>
                </DialogClose>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </header>
  );
}

