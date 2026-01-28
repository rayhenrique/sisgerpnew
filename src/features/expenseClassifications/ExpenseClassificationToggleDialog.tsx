"use client";

import * as React from "react";

import type { ExpenseClassification } from "@/features/expenseClassifications/types";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export function ExpenseClassificationToggleDialog({
  item,
  error,
  onCancel,
  onConfirm,
}: {
  item: ExpenseClassification | null;
  error: string | null;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <Dialog open={!!item} onOpenChange={(open) => (open ? null : onCancel())}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {item?.active ? "Desativar" : "Ativar"} classificação
          </DialogTitle>
        </DialogHeader>

        <div className="text-sm text-slate-700">
          {item?.active ? "Desativar" : "Ativar"}{" "}
          <span className="font-semibold">{item?.name}</span>?
        </div>

        {error ? (
          <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {error}
          </div>
        ) : null}

        <div className="flex items-center justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onCancel}>
            Cancelar
          </Button>
          <Button
            type="button"
            variant={item?.active ? "destructive" : "default"}
            onClick={onConfirm}
          >
            Confirmar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
