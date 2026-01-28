import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export function PageShell({
  title,
  subtitle = "Overview",
  headerActions,
  children,
  className,
}: {
  title: string;
  subtitle?: string | null;
  headerActions?: ReactNode;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mx-auto w-full max-w-6xl min-w-0", className)}>
      <div className="mb-4 flex flex-col gap-2 md:mb-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h1 className="truncate text-base font-semibold text-slate-900 sm:text-lg">
            {title}
          </h1>
          {subtitle ? (
            <p className="mt-1 text-sm text-slate-600">{subtitle}</p>
          ) : null}
        </div>
        {headerActions ? (
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            {headerActions}
          </div>
        ) : null}
      </div>
      {children}
    </div>
  );
}

