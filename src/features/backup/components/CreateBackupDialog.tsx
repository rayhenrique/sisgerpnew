"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import type { CreateBackupOptions, TableInfo } from "../types";

/**
 * CreateBackupDialog Component
 * 
 * Dialog for creating new database backups with options for full or selective backup.
 * 
 * Requirements: 12.1, 12.2, 12.3, 12.4, 12.5, 12.6, 12.7
 */

interface CreateBackupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (options: CreateBackupOptions) => Promise<void>;
  availableTables: TableInfo[];
  isSubmitting: boolean;
}

export function CreateBackupDialog({
  open,
  onOpenChange,
  onSubmit,
  availableTables,
  isSubmitting,
}: CreateBackupDialogProps) {
  // State for backup type selection
  const [backupType, setBackupType] = React.useState<'full' | 'selective'>('full');
  
  // State for selected tables (for selective backup)
  const [selectedTables, setSelectedTables] = React.useState<string[]>([]);
  
  // State for validation error
  const [error, setError] = React.useState<string | null>(null);

  // Reset form when dialog opens
  React.useEffect(() => {
    if (open) {
      setBackupType('full');
      setSelectedTables([]);
      setError(null);
    }
  }, [open]);

  // Handle table selection toggle
  const handleTableToggle = (tableName: string) => {
    setSelectedTables((prev) => {
      if (prev.includes(tableName)) {
        return prev.filter((t) => t !== tableName);
      } else {
        return [...prev, tableName];
      }
    });
    // Clear error when user makes a selection
    if (error) {
      setError(null);
    }
  };

  // Handle form submission
  const handleSubmit = async () => {
    // Validate selective backup has at least one table selected
    if (backupType === 'selective' && selectedTables.length === 0) {
      setError('Selecione pelo menos uma tabela para backup seletivo');
      return;
    }

    setError(null);

    try {
      const options: CreateBackupOptions = {
        backupType,
        ...(backupType === 'selective' && { tables: selectedTables }),
      };

      await onSubmit(options);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar backup');
    }
  };

  // Group tables by module for better organization
  const tablesByModule = React.useMemo(() => {
    const grouped: Record<string, TableInfo[]> = {};
    
    availableTables.forEach((table) => {
      if (!grouped[table.module]) {
        grouped[table.module] = [];
      }
      grouped[table.module].push(table);
    });

    return grouped;
  }, [availableTables]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Criar Backup</DialogTitle>
          <DialogDescription>
            Escolha o tipo de backup e as tabelas a serem incluídas
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Backup Type Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-slate-900">
              Tipo de Backup
            </Label>
            <RadioGroup
              value={backupType}
              onValueChange={(value: string) => {
                setBackupType(value as 'full' | 'selective');
                setError(null);
              }}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="full" id="full" />
                <Label
                  htmlFor="full"
                  className="font-normal cursor-pointer"
                >
                  Backup Completo
                  <span className="block text-xs text-slate-500">
                    Inclui todas as tabelas da organização
                  </span>
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="selective" id="selective" />
                <Label
                  htmlFor="selective"
                  className="font-normal cursor-pointer"
                >
                  Backup Seletivo
                  <span className="block text-xs text-slate-500">
                    Escolha quais tabelas incluir no backup
                  </span>
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Table Selection (only for selective backup) */}
          {backupType === 'selective' && (
            <div className="space-y-3">
              <Label className="text-sm font-medium text-slate-900">
                Selecionar Tabelas
              </Label>
              
              {Object.keys(tablesByModule).length === 0 ? (
                <div className="text-sm text-slate-500 py-4">
                  Nenhuma tabela disponível
                </div>
              ) : (
                <div className="space-y-4 border border-slate-200 rounded-lg p-4 max-h-[300px] overflow-y-auto">
                  {Object.entries(tablesByModule).map(([module, tables]) => (
                    <div key={module} className="space-y-2">
                      <div className="text-xs font-semibold text-slate-700 uppercase tracking-wide">
                        {module}
                      </div>
                      <div className="space-y-2 pl-2">
                        {tables.map((table) => (
                          <div
                            key={table.name}
                            className="flex items-start space-x-2"
                          >
                            <Checkbox
                              id={table.name}
                              checked={selectedTables.includes(table.name)}
                              onCheckedChange={() => handleTableToggle(table.name)}
                            />
                            <Label
                              htmlFor={table.name}
                              className="font-normal cursor-pointer flex-1"
                            >
                              <span className="block text-sm text-slate-900">
                                {table.displayName}
                              </span>
                              <span className="block text-xs text-slate-500">
                                {table.rowCount.toLocaleString('pt-BR')} registros
                              </span>
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {selectedTables.length > 0 && (
                <div className="text-xs text-slate-600">
                  {selectedTables.length} {selectedTables.length === 1 ? 'tabela selecionada' : 'tabelas selecionadas'}
                </div>
              )}
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-3">
              {error}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="secondary"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Criando...
              </>
            ) : (
              'Criar Backup'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
