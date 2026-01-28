"use client";

import * as React from "react";
import { AlertTriangle, Loader2 } from "lucide-react";

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
import type { Backup } from "../types";
import { formatDateTime, formatBackupType } from "../format";

/**
 * RestoreConfirmDialog Component
 * 
 * Confirmation dialog for restore operations with explicit user confirmation.
 * Requires user to type "RESTAURAR" to enable the restore button.
 * 
 * Requirements: 13.1, 13.2, 13.3, 13.4, 13.5, 13.6, 13.7, 13.8
 */

interface RestoreConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  backup: Backup | null;
  onConfirm: () => Promise<void>;
  isRestoring: boolean;
}

const CONFIRMATION_PHRASE = "RESTAURAR";

export function RestoreConfirmDialog({
  open,
  onOpenChange,
  backup,
  onConfirm,
  isRestoring,
}: RestoreConfirmDialogProps) {
  // State for confirmation text input
  const [confirmationText, setConfirmationText] = React.useState("");
  
  // State for error message
  const [error, setError] = React.useState<string | null>(null);

  // Reset form when dialog opens/closes
  React.useEffect(() => {
    if (open) {
      setConfirmationText("");
      setError(null);
    }
  }, [open]);

  // Check if confirmation phrase matches
  const isConfirmationValid = confirmationText.trim().toUpperCase() === CONFIRMATION_PHRASE;

  // Handle restore confirmation
  const handleConfirm = async () => {
    if (!isConfirmationValid) {
      setError(`Digite "${CONFIRMATION_PHRASE}" para confirmar`);
      return;
    }

    setError(null);

    try {
      await onConfirm();
      // Dialog will be closed by parent component on success
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao restaurar backup');
    }
  };

  // Don't render if no backup is selected
  if (!backup) {
    return null;
  }

  // Format tables list for display
  const tablesList = backup.backupType === 'full' 
    ? 'Todas as tabelas da organização'
    : backup.tablesIncluded.length > 0
      ? backup.tablesIncluded.join(', ')
      : 'Nenhuma tabela';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
            Confirmar Restauração
          </DialogTitle>
          <DialogDescription>
            Esta ação irá sobrescrever os dados atuais. Esta operação não pode ser desfeita.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Warning Banner */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-amber-900">
                  Atenção: Dados serão sobrescritos
                </p>
                <p className="text-sm text-amber-800">
                  Todos os dados atuais das tabelas incluídas neste backup serão 
                  substituídos pelos dados do backup. Certifique-se de que deseja 
                  prosseguir com esta operação.
                </p>
              </div>
            </div>
          </div>

          {/* Backup Details */}
          <div className="space-y-3 border border-slate-200 rounded-lg p-4 bg-slate-50">
            <h4 className="text-sm font-semibold text-slate-900">
              Detalhes do Backup
            </h4>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-600">Data:</span>
                <span className="font-medium text-slate-900">
                  {formatDateTime(backup.createdAt)}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-slate-600">Tipo:</span>
                <span className="font-medium text-slate-900">
                  {formatBackupType(backup.backupType)}
                </span>
              </div>
              
              <div className="flex flex-col gap-1">
                <span className="text-slate-600">Tabelas:</span>
                <span className="font-medium text-slate-900 text-xs break-words">
                  {tablesList}
                </span>
              </div>
            </div>
          </div>

          {/* Confirmation Input */}
          <div className="space-y-2">
            <Label htmlFor="confirmation" className="text-sm font-medium text-slate-900">
              Digite <span className="font-mono font-bold text-red-600">{CONFIRMATION_PHRASE}</span> para confirmar
            </Label>
            <Input
              id="confirmation"
              type="text"
              value={confirmationText}
              onChange={(e) => {
                setConfirmationText(e.target.value);
                if (error) setError(null);
              }}
              placeholder={CONFIRMATION_PHRASE}
              disabled={isRestoring}
              className="font-mono"
              autoComplete="off"
            />
            <p className="text-xs text-slate-500">
              Esta confirmação é necessária para prevenir restaurações acidentais
            </p>
          </div>

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
            disabled={isRestoring}
          >
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={!isConfirmationValid || isRestoring}
          >
            {isRestoring ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Restaurando...
              </>
            ) : (
              'Restaurar Backup'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
