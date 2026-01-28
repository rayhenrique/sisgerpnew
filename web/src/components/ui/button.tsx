import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--sis-primary)] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ring-offset-white",
  {
    variants: {
      variant: {
        default:
          "bg-[color:var(--sis-primary)] text-white hover:bg-[color:color-mix(in_srgb,var(--sis-primary)_88%,black)]",
        secondary:
          "bg-white text-slate-900 border border-slate-200 hover:bg-slate-50",
        ghost: "bg-transparent text-slate-900 hover:bg-slate-100",
      },
      size: {
        default: "h-9 px-3",
        sm: "h-8 px-2",
        lg: "h-10 px-4",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

