import { cn } from "@/lib/utils";

export function PageShell({
  title,
  children,
  className,
}: {
  title: string;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mx-auto w-full max-w-6xl", className)}>
      <div className="mb-6">
        <h1 className="text-lg font-semibold text-slate-900">{title}</h1>
        <p className="mt-1 text-sm text-slate-600">Overview</p>
      </div>
      {children}
    </div>
  );
}

