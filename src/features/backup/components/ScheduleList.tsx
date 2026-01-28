"use client";

import * as React from "react";
import {
  ColumnDef,
  SortingState,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Edit, Trash2, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import type { BackupSchedule, ScheduleListProps } from "@/features/backup/types";
import {
  formatBackupType,
  formatFrequency,
  formatDateTime,
} from "@/features/backup/format";

/**
 * ScheduleList component displays a list of backup schedules with management actions
 * 
 * Features:
 * - Sortable columns
 * - Enable/disable toggle for each schedule
 * - Edit and delete actions
 * - Loading states during operations
 * - Brazilian Portuguese formatting
 * 
 * Requirements: 2.1, 2.5
 */
export function ScheduleList({
  schedules,
  onEdit,
  onDelete,
  onToggleEnabled,
  isLoading = false,
}: ScheduleListProps) {
  const [sorting, setSorting] = React.useState<SortingState>([
    { id: "name", desc: false }, // Default sort by name ascending
  ]);
  const [loadingScheduleId, setLoadingScheduleId] = React.useState<string | null>(null);
  const [operationType, setOperationType] = React.useState<"toggle" | "edit" | "delete" | null>(null);

  // Handle action with loading state
  const handleAction = async (
    schedule: BackupSchedule,
    action: () => void,
    type: "toggle" | "edit" | "delete"
  ) => {
    setLoadingScheduleId(schedule.id);
    setOperationType(type);
    try {
      action();
    } finally {
      // Reset loading state after a short delay to show feedback
      setTimeout(() => {
        setLoadingScheduleId(null);
        setOperationType(null);
      }, 500);
    }
  };

  // Define table columns
  const columns: ColumnDef<BackupSchedule>[] = [
    {
      accessorKey: "name",
      header: "Nome",
      cell: ({ row }) => (
        <div className="font-medium text-slate-900">
          {row.original.name}
        </div>
      ),
    },
    {
      accessorKey: "frequency",
      header: "Frequência",
      cell: ({ row }) => (
        <span className="text-slate-700">
          {formatFrequency(row.original.frequency)}
        </span>
      ),
    },
    {
      accessorKey: "backupType",
      header: "Tipo",
      cell: ({ row }) => (
        <span className="text-slate-700">
          {formatBackupType(row.original.backupType)}
        </span>
      ),
    },
    {
      accessorKey: "lastRunAt",
      header: "Última Execução",
      cell: ({ row }) => (
        <span className="text-slate-700">
          {formatDateTime(row.original.lastRunAt)}
        </span>
      ),
    },
    {
      accessorKey: "nextRunAt",
      header: "Próxima Execução",
      cell: ({ row }) => (
        <span className="text-slate-700">
          {formatDateTime(row.original.nextRunAt)}
        </span>
      ),
    },
    {
      accessorKey: "enabled",
      header: "Status",
      cell: ({ row }) => (
        <Badge variant={row.original.enabled ? "success" : "outline"}>
          {row.original.enabled ? "Ativo" : "Inativo"}
        </Badge>
      ),
    },
    {
      id: "toggle",
      header: "Ativar/Desativar",
      cell: ({ row }) => {
        const schedule = row.original;
        const isLoadingThis = loadingScheduleId === schedule.id && operationType === "toggle";

        return (
          <div className="flex items-center gap-2">
            <Checkbox
              id={`toggle-${schedule.id}`}
              checked={schedule.enabled}
              onCheckedChange={() => handleAction(schedule, () => onToggleEnabled(schedule), "toggle")}
              disabled={isLoadingThis}
            />
            <Label
              htmlFor={`toggle-${schedule.id}`}
              className="text-sm text-slate-600 cursor-pointer"
            >
              {isLoadingThis ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                schedule.enabled ? "Desativar" : "Ativar"
              )}
            </Label>
          </div>
        );
      },
    },
    {
      id: "actions",
      header: "Ações",
      cell: ({ row }) => {
        const schedule = row.original;
        const isLoadingThis = loadingScheduleId === schedule.id;

        return (
          <div className="flex items-center gap-2">
            {/* Edit button */}
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleAction(schedule, () => onEdit(schedule), "edit")}
              disabled={isLoadingThis}
              title="Editar agendamento"
            >
              {isLoadingThis && operationType === "edit" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Edit className="h-4 w-4" />
              )}
            </Button>

            {/* Delete button */}
            <Button
              variant="destructive"
              size="sm"
              onClick={() => handleAction(schedule, () => onDelete(schedule), "delete")}
              disabled={isLoadingThis}
              title="Excluir agendamento"
            >
              {isLoadingThis && operationType === "delete" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
            </Button>
          </div>
        );
      },
    },
  ];

  const table = useReactTable({
    data: schedules,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    state: {
      sorting,
    },
  });

  return (
    <div className="rounded-lg border border-slate-200 bg-white">
      <Table>
        <TableHeader className="bg-slate-50">
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead key={header.id}>
                    {header.isPlaceholder ? null : (
                      <div
                        className={
                          header.column.getCanSort()
                            ? "flex items-center cursor-pointer select-none hover:text-slate-900"
                            : ""
                        }
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {header.column.getIsSorted() === "asc" && (
                          <span className="ml-2 text-xs">↑</span>
                        )}
                        {header.column.getIsSorted() === "desc" && (
                          <span className="ml-2 text-xs">↓</span>
                        )}
                      </div>
                    )}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                <div className="flex items-center justify-center gap-2 text-slate-600">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Carregando agendamentos...</span>
                </div>
              </TableCell>
            </TableRow>
          ) : table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                className="hover:bg-blue-50"
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center text-slate-500">
                Nenhum agendamento encontrado.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
