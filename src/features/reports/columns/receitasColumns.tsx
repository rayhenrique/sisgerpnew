import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { ReceitaReportRow } from "@/features/reports/types/receitas";
import { formatDateBR } from "@/lib/dates";

export const receitasColumns: ColumnDef<ReceitaReportRow>[] = [
  {
    accessorKey: "data",
    header: "Data",
    cell: ({ row }) => {
      return formatDateBR(String(row.getValue("data")));
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
      const formatted = new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
      }).format(valor);
      return <div className="text-right font-medium text-green-600">{formatted}</div>;
    },
    enableSorting: true,
  },
  {
    accessorKey: "observacao",
    header: "Observação",
    cell: ({ row }) => {
      const obs = row.getValue("observacao") as string | null;
      return (
        <div className="max-w-[250px] text-sm text-slate-600">
          {obs || <span className="text-slate-400">—</span>}
        </div>
      );
    },
    enableSorting: false,
    enableHiding: true,
  },
];
