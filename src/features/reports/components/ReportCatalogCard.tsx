import * as React from "react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ReportDefinition } from "@/features/reports/types";

export function ReportCatalogCard(props: {
  loading: boolean;
  error: string | null;
  items: ReportDefinition[];
  selectedKey: string;
  onSelect: (key: string) => void;
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>Catálogo</CardTitle>
      </CardHeader>
      <CardContent>
        {props.loading ? (
          <div className="text-sm text-slate-600">Carregando...</div>
        ) : props.error ? (
          <div className="text-sm text-rose-700">{props.error}</div>
        ) : (
          <div className="space-y-2">
            {props.items.map((r) => (
              <button
                key={r.key}
                type="button"
                onClick={() => props.onSelect(r.key)}
                className={
                  r.key === props.selectedKey
                    ? "w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-left"
                    : "w-full rounded-lg border border-transparent bg-white px-3 py-2 text-left hover:border-slate-200 hover:bg-slate-50"
                }
              >
                <div className="text-sm font-medium text-slate-900">{r.name}</div>
                <div className="mt-0.5 text-xs text-slate-600">{r.description}</div>
                <div className="mt-2">
                  <Badge variant="outline">{r.category}</Badge>
                </div>
              </button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

