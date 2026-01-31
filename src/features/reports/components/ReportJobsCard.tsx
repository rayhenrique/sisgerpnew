import * as React from "react";
import Link from "next/link";
import { RefreshCw } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { ReportJob } from "@/features/reports/types";
import { formatDateBR, statusLabel, statusVariant } from "@/features/reports/utils";

export function ReportJobsCard(props: {
  loading: boolean;
  error: string | null;
  items: ReportJob[];
  onRefresh: () => void;
}) {
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle>Execuções recentes</CardTitle>
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 shadow-sm hover:bg-slate-50"
          onClick={props.onRefresh}
        >
          <RefreshCw className="h-4 w-4" />
          Atualizar
        </button>
      </CardHeader>
      <CardContent>
        {props.loading ? (
          <div className="text-sm text-slate-600">Carregando...</div>
        ) : props.error ? (
          <div className="text-sm text-rose-700">{props.error}</div>
        ) : props.items.length === 0 ? (
          <div className="text-sm text-slate-600">Nenhuma execução ainda.</div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Relatório</TableHead>
                  <TableHead>Período</TableHead>
                  <TableHead>Formato</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {props.items.map((j) => (
                  <TableRow key={j.id}>
                    <TableCell className="whitespace-nowrap text-slate-700">
                      {formatDateBR(j.queued_at)}
                    </TableCell>
                    <TableCell className="min-w-[220px] font-medium text-slate-900">
                      <div className="truncate">{j.report_key}</div>
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-slate-700">
                      {formatDateBR(j.period_start)} → {formatDateBR(j.period_end)}
                    </TableCell>
                    <TableCell className="text-slate-700">{j.format}</TableCell>
                    <TableCell>
                      <Badge variant={statusVariant(j.status)}>{statusLabel(j.status)}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Link
                        href={`/relatorios/execucoes/${j.id}`}
                        className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800 shadow-sm hover:bg-slate-50"
                      >
                        Ver
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

