import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import type { BalancoReportRow } from "@/features/reports/api/reportsData";

export const balancoColumns: ColumnDef<BalancoReportRow>[] = [
  {
    accessorKey: "data",
    header: "Data",
    cell: ({ row }) => {
      const date = new Date(row.getValue("data"));
      return date.toLocaleDateString("pt-BR");
    },
    enableSorting: true,
  },
  {
    accessorKey: "tipo",
    header: "Tipo",
    cell: ({ row }) => {
      const tipo = row.getValue("tipo") as string;
      const isReceita = tipo === "Receita";
      return (
        <Badge
          variant="outline"
          className={
            isReceita
              ? "bg-green-50 text-green-700 border-green-200"
              : "bg-red-50 text-red-700 border-red-200"
          }
        >
          {tipo}
        </Badge>
      );
    },
    enableSorting: true,
  },
  {
    accessorKey: "descricao",
    header: "Descrição",
    cell: ({ row }) => {
      return <div className="max-w-[300px]">{row.getValue("descricao")}</div>;
    },
    enableSorting: true,
  },
  {
    accessorKey: "fonte",
    header: "Fonte",
    cell: ({ row }) => {
      const fonte = row.getValue("fonte") as string;
      return (
        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
          {fonte}
        </Badge>
      );
    },
    enableSorting: true,
  },
  {
    accessorKey: "bloco",
    header: "Bloco",
    cell: ({ row }) => {
      const bloco = row.getValue("bloco") as string;
      return (
        <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200">
          {bloco}
        </Badge>
      );
    },
    enableSorting: true,
    enableHiding: true,
  },
  {
    accessorKey: "grupo",
    header: "Grupo",
    cell: ({ row }) => {
      const grupo = row.getValue("grupo") as string;
      return (
        <Badge variant="outline" className="bg-violet-50 text-violet-700 border-violet-200">
          {grupo}
        </Badge>
      );
    },
    enableSorting: true,
    enableHiding: true,
  },
  {
    accessorKey: "acao",
    header: "Ação",
    cell: ({ row }) => {
      const acao = row.getValue("acao") as string;
      return (
        <Badge variant="outline" className="bg-cyan-50 text-cyan-700 border-cyan-200">
          {acao}
        </Badge>
      );
    },
    enableSorting: true,
    enableHiding: true,
  },
  {
    accessorKey: "valor",
    header: "Valor",
    cell: ({ row }) => {
      const valor = parseFloat(row.getValue("valor"));
      const tipo = row.getValue("tipo") as string;
      const isReceita = tipo === "Receita";
      const formatted = new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
      }).format(valor);
      return (
        <div className={`text-right font-medium ${isReceita ? "text-green-600" : "text-red-600"}`}>
          {isReceita ? "+" : "-"} {formatted}
        </div>
      );
    },
    enableSorting: true,
  },
  {
    accessorKey: "saldo",
    header: "Saldo Acumulado",
    cell: ({ row }) => {
      const saldo = parseFloat(row.getValue("saldo"));
      const formatted = new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
      }).format(Math.abs(saldo));
      const isPositive = saldo >= 0;
      return (
        <div className={`text-right font-semibold ${isPositive ? "text-blue-600" : "text-red-600"}`}>
          {formatted}
        </div>
      );
    },
    enableSorting: true,
  },
];
