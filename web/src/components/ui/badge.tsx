import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium",
  {
    variants: {
      variant: {
        default: "bg-slate-100 text-slate-900",
        success:
          "bg-[color:color-mix(in_srgb,var(--sis-success)_14%,white)] text-[color:var(--sis-success)]",
        danger:
          "bg-[color:color-mix(in_srgb,var(--sis-danger)_14%,white)] text-[color:var(--sis-danger)]",
        outline: "border border-slate-200 bg-white text-slate-700",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  );
}

