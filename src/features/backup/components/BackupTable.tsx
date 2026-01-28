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
import { Download, RotateCcw, Trash2, Loader2 } from "lucide-react";

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
import type { Backup, BackupTableProps, UserRole } from "@/features/backup/types";
import {
  formatBackupType,
  formatBackupStatus,
  formatFileSize,
  formatDateTime,
} from "@/features/backup/format";

/**
 * BackupTable component displays a list of backups with action buttons
 * 
 * Features:
 * - Sortable columns
 * - Status badges with color coding
 * - Role-based action buttons (download, restore, delete)
 * - Loading states during operations
 * - Brazilian Portuguese formatting
 * 
 * Requirements: 3.7, 11.2, 11.7, 11.8
 */
export function BackupTable({
  backups,
  onRestore,
  onDelete,
  onDownload,
  userRole,
  isLoading = false,
}: BackupTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([
    { id: "createdAt", desc: true }, // Default sort by date descending
  ]);
  const [loadingBackupId, setLoadingBackupId] = React.useState<string | null>(null);
  const [operationType, setOperationType] = React.useState<"download" | "restore" | "delete" | null>(null);

  // Check if user can perform admin operations
  const canPerformAdminOps = userRole === "admin" || userRole === "superadmin";

  // Handle action with loading state
  const handleAction = async (
    backup: Backup,
    action: () => void,
    type: "download" | "restore" | "delete"
  ) => {
    setLoadingBackupId(backup.id);
    setOperationType(type);
    try {
      action();
    } finally {
      // Reset loading state after a short delay to show feedback
      setTimeout(() => {
        setLoadingBackupId(null);
        setOperationType(null);
      }, 500);
    }
  };

  // Get status badge variant based on backup status
  const getStatusBadgeVariant = (status: Backup["status"]) => {
    switch (status) {
      case "completed":
        return "success";
      case "failed":
      case "corrupted":
      case "deleted":
        return "danger";
      case "in_progress":
      case "pending":
        return "default";
      default:
        return "outline";
    }
  };

  // Define table columns
  const columns: ColumnDef<Backup>[] = [
    {
      accessorKey: "createdAt",
      header: "Data/Hora",
      cell: ({ row }) => (
        <div className="font-medium text-slate-900">
          {formatDateTime(row.original.createdAt)}
        </div>
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
      accessorKey: "compressedSize",
      header: "Tamanho",
      cell: ({ row }) => (
        <span className="text-slate-700">
          {formatFileSize(row.original.compressedSize)}
        </span>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <Badge variant={getStatusBadgeVariant(row.original.status)}>
          {formatBackupStatus(row.original.status)}
        </Badge>
      ),
    },
    {
      accessorKey: "creatorName",
      header: "Criador",
      cell: ({ row }) => (
        <span className="text-slate-700">
          {row.original.creatorName || "-"}
        </span>
      ),
    },
    {
      id: "actions",
      header: "Ações",
      cell: ({ row }) => {
        const backup = row.original;
        const isLoadingThis = loadingBackupId === backup.id;
        const canDownload = backup.status === "completed" && canPerformAdminOps;
        const canRestore = backup.status === "completed" && canPerformAdminOps;
        const canDelete = canPerformAdminOps && backup.status !== "deleted";

        return (
          <div className="flex items-center gap-2">
            {/* Download button */}
            {canDownload && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleAction(backup, () => onDownload(backup), "download")}
                disabled={isLoadingThis}
                title="Baixar backup"
              >
                {isLoadingThis && operationType === "download" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
              </Button>
            )}

            {/* Restore button */}
            {canRestore && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleAction(backup, () => onRestore(backup), "restore")}
                disabled={isLoadingThis}
                title="Restaurar backup"
              >
                {isLoadingThis && operationType === "restore" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RotateCcw className="h-4 w-4" />
                )}
              </Button>
            )}

            {/* Delete button */}
            {canDelete && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleAction(backup, () => onDelete(backup), "delete")}
                disabled={isLoadingThis}
                title="Excluir backup"
              >
                {isLoadingThis && operationType === "delete" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
              </Button>
            )}

            {/* Show message if no actions available */}
            {!canDownload && !canRestore && !canDelete && (
              <span className="text-sm text-slate-500">-</span>
            )}
          </div>
        );
      },
    },
  ];

  const table = useReactTable({
    data: backups,
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
                  <span>Carregando backups...</span>
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
                Nenhum backup encontrado.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
