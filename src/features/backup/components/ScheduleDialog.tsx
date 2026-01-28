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
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type {
  BackupSchedule,
  CreateScheduleInput,
  UpdateScheduleInput,
  TableInfo,
  ScheduleDialogProps,
} from "../types";

/**
 * ScheduleDialog Component
 * 
 * Dialog for creating and editing backup schedules with validation.
 * 
 * Requirements: 2.1
 */

export function ScheduleDialog({
  open,
  onOpenChange,
  schedule,
  onSubmit,
  availableTables,
  isSubmitting,
}: ScheduleDialogProps) {
  // Determine if we're editing or creating
  const isEditing = schedule !== null;

  // Form state
  const [name, setName] = React.useState("");
  const [frequency, setFrequency] = React.useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [backupType, setBackupType] = React.useState<'full' | 'selective'>('full');
  const [selectedTables, setSelectedTables] = React.useState<string[]>([]);
  const [retentionDays, setRetentionDays] = React.useState("30");
  
  // Validation error state
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  // Initialize form when dialog opens or schedule changes
  React.useEffect(() => {
    if (open) {
      if (schedule) {
        // Editing existing schedule
        setName(schedule.name);
        setFrequency(schedule.frequency);
        setBackupType(schedule.backupType);
        setSelectedTables(schedule.tablesIncluded || []);
        setRetentionDays(schedule.retentionDays.toString());
      } else {
        // Creating new schedule
        setName("");
        setFrequency('daily');
        setBackupType('full');
        setSelectedTables([]);
        setRetentionDays("30");
      }
      setErrors({});
    }
  }, [open, schedule]);

  // Handle table selection toggle
  const handleTableToggle = (tableName: string) => {
    setSelectedTables((prev) => {
      if (prev.includes(tableName)) {
        return prev.filter((t) => t !== tableName);
      } else {
        return [...prev, tableName];
      }
    });
    // Clear table error when user makes a selection
    if (errors.tables) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.tables;
        return newErrors;
      });
    }
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validate name
    if (!name.trim()) {
      newErrors.name = "Nome é obrigatório";
    } else if (name.length > 255) {
      newErrors.name = "Nome deve ter no máximo 255 caracteres";
    }

    // Validate selective backup has tables
    if (backupType === 'selective' && selectedTables.length === 0) {
      newErrors.tables = "Selecione pelo menos uma tabela para backup seletivo";
    }

    // Validate retention days
    const retentionNum = parseInt(retentionDays, 10);
    if (isNaN(retentionNum) || retentionNum < 1 || retentionNum > 365) {
      newErrors.retentionDays = "Retenção deve ser entre 1 e 365 dias";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      const input: CreateScheduleInput | UpdateScheduleInput = {
        name: name.trim(),
        frequency,
        backupType,
        ...(backupType === 'selective' && { tables: selectedTables }),
        retentionDays: parseInt(retentionDays, 10),
      };

      await onSubmit(input);
    } catch (err) {
      setErrors({
        submit: err instanceof Error ? err.message : 'Erro ao salvar agendamento',
      });
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
          <DialogTitle>
            {isEditing ? "Editar Agendamento" : "Criar Agendamento"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Atualize as configurações do agendamento de backup"
              : "Configure um novo agendamento automático de backup"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Name Field */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium text-slate-900">
              Nome do Agendamento *
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errors.name) {
                  setErrors((prev) => {
                    const newErrors = { ...prev };
                    delete newErrors.name;
                    return newErrors;
                  });
                }
              }}
              placeholder="Ex: Backup Diário Completo"
              className={errors.name ? "border-red-500" : ""}
            />
            {errors.name && (
              <p className="text-sm text-red-600">{errors.name}</p>
            )}
          </div>

          {/* Frequency Field */}
          <div className="space-y-2">
            <Label htmlFor="frequency" className="text-sm font-medium text-slate-900">
              Frequência *
            </Label>
            <Select
              value={frequency}
              onValueChange={(value: string) => setFrequency(value as 'daily' | 'weekly' | 'monthly')}
            >
              <SelectTrigger id="frequency">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Diário</SelectItem>
                <SelectItem value="weekly">Semanal</SelectItem>
                <SelectItem value="monthly">Mensal</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Backup Type Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-slate-900">
              Tipo de Backup *
            </Label>
            <RadioGroup
              value={backupType}
              onValueChange={(value: string) => {
                setBackupType(value as 'full' | 'selective');
                if (errors.tables) {
                  setErrors((prev) => {
                    const newErrors = { ...prev };
                    delete newErrors.tables;
                    return newErrors;
                  });
                }
              }}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="full" id="schedule-full" />
                <Label
                  htmlFor="schedule-full"
                  className="font-normal cursor-pointer"
                >
                  Backup Completo
                  <span className="block text-xs text-slate-500">
                    Inclui todas as tabelas da organização
                  </span>
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="selective" id="schedule-selective" />
                <Label
                  htmlFor="schedule-selective"
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
                Selecionar Tabelas *
              </Label>
              
              {Object.keys(tablesByModule).length === 0 ? (
                <div className="text-sm text-slate-500 py-4">
                  Nenhuma tabela disponível
                </div>
              ) : (
                <div className={`space-y-4 border rounded-lg p-4 max-h-[300px] overflow-y-auto ${
                  errors.tables ? "border-red-500" : "border-slate-200"
                }`}>
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
                              id={`schedule-${table.name}`}
                              checked={selectedTables.includes(table.name)}
                              onCheckedChange={() => handleTableToggle(table.name)}
                            />
                            <Label
                              htmlFor={`schedule-${table.name}`}
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
              
              {errors.tables && (
                <p className="text-sm text-red-600">{errors.tables}</p>
              )}
            </div>
          )}

          {/* Retention Days Field */}
          <div className="space-y-2">
            <Label htmlFor="retentionDays" className="text-sm font-medium text-slate-900">
              Período de Retenção (dias) *
            </Label>
            <Input
              id="retentionDays"
              type="number"
              min="1"
              max="365"
              value={retentionDays}
              onChange={(e) => {
                setRetentionDays(e.target.value);
                if (errors.retentionDays) {
                  setErrors((prev) => {
                    const newErrors = { ...prev };
                    delete newErrors.retentionDays;
                    return newErrors;
                  });
                }
              }}
              placeholder="30"
              className={errors.retentionDays ? "border-red-500" : ""}
            />
            <p className="text-xs text-slate-500">
              Backups mais antigos que este período serão automaticamente excluídos
            </p>
            {errors.retentionDays && (
              <p className="text-sm text-red-600">{errors.retentionDays}</p>
            )}
          </div>

          {/* Submit Error Message */}
          {errors.submit && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-3">
              {errors.submit}
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
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Salvando...
              </>
            ) : (
              isEditing ? 'Salvar Alterações' : 'Criar Agendamento'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
