import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { SaldoReportRow } from "@/features/reports/api/reportsData";

const LEVEL_LABEL: Record<string, string> = {
  fonte: "Fonte",
  bloco: "Bloco",
  grupo: "Grupo",
  acao: "Ação",
};

export const saldosColumns: ColumnDef<SaldoReportRow>[] = [
  {
    accessorKey: "nivel",
    header: "Nível",
    cell: ({ row }) => {
      const nivel = row.getValue("nivel") as string;
      const label = LEVEL_LABEL[nivel] || nivel;
      return (
        <Badge variant="outline" className="bg-slate-50 text-slate-700 border-slate-200">
          {label}
        </Badge>
      );
    },
    enableSorting: true,
  },
  {
    accessorKey: "categoria",
    header: "Categoria",
    cell: ({ row }) => {
      return <div className="max-w-[400px] font-medium">{row.getValue("categoria")}</div>;
    },
    enableSorting: true,
  },
  {
    accessorKey: "receitas",
    header: "Receitas",
    cell: ({ row }) => {
      const valor = parseFloat(row.getValue("receitas"));
      const formatted = new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
      }).format(valor);
      return <div className="text-right font-medium text-green-600">{formatted}</div>;
    },
    enableSorting: true,
  },
  {
    accessorKey: "despesas",
    header: "Despesas",
    cell: ({ row }) => {
      const valor = parseFloat(row.getValue("despesas"));
      const formatted = new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
      }).format(valor);
      return <div className="text-right font-medium text-red-600">{formatted}</div>;
    },
    enableSorting: true,
  },
  {
    accessorKey: "saldo",
    header: "Saldo",
    cell: ({ row }) => {
      const valor = parseFloat(row.getValue("saldo"));
      const formatted = new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
      }).format(valor);
      return (
        <div className={`text-right font-bold ${valor >= 0 ? "text-blue-600" : "text-red-600"}`}>
          {formatted}
        </div>
      );
    },
    enableSorting: true,
  },
];
