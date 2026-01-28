import * as React from "react";

import { cn } from "@/lib/utils";

export function Input({
  className,
  type,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      data-slot="input"
      type={type}
      className={cn(
        "flex h-9 w-full rounded-md border border-slate-200 bg-white px-3 py-1 text-sm text-slate-900 shadow-sm transition-colors placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--sis-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
}

