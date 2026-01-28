"use client";

import * as React from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import type { ExpenseClassification } from "@/features/expenseClassifications/types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

type Mode = "create" | "edit";

const schema = z.object({
  name: z.string().trim().min(2, "Informe o nome").max(160),
  code: z
    .string()
    .trim()
    .max(50, "Código muito longo")
    .optional()
    .or(z.literal("")),
  description: z
    .string()
    .trim()
    .max(500, "Descrição muito longa")
    .optional()
    .or(z.literal("")),
  active: z.boolean(),
});

export function ExpenseClassificationUpsertDialog({
  open,
  onOpenChange,
  classification,
  onCreate,
  onUpdate,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  classification?: ExpenseClassification | null;
  onCreate: (payload: {
    name: string;
    code: string | null;
    description: string | null;
    active: boolean;
  }) => Promise<void>;
  onUpdate: (payload: {
    id: string;
    name: string;
    code: string | null;
    description: string | null;
    active: boolean;
  }) => Promise<void>;
}) {
  const mode: Mode = classification?.id ? "edit" : "create";
  const [submitError, setSubmitError] = React.useState<string | null>(null);

  const formatSubmitError = (e: unknown) => {
    const msg = e instanceof Error ? e.message : "Erro ao salvar classificação";
    const anyErr = e as unknown as { code?: string; details?: string | null; hint?: string | null };
    const code = anyErr?.code;
    const full = [msg, anyErr?.details ?? "", anyErr?.hint ?? ""].join(" ");

    if (code === "23505" || msg.toLowerCase().includes("duplicate") || msg.toLowerCase().includes("duplic")) {
      if (
        full.includes("expense_classifications_name_ci_unique") ||
        full.toLowerCase().includes("lower(name)")
      ) {
        return "Já existe uma classificação com o mesmo nome";
      }
      if (
        full.includes("expense_classifications_code_ci_unique") ||
        full.includes("expense_classifications_code_key") ||
        full.toLowerCase().includes("lower(code)")
      ) {
        return "Já existe uma classificação com o mesmo código";
      }

      return "Já existe uma classificação com o mesmo nome ou código";
    }

    return msg;
  };

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: classification?.name ?? "",
      code: classification?.code ?? "",
      description: classification?.description ?? "",
      active: classification?.active ?? true,
    },
  });

  React.useEffect(() => {
    if (!open) return;
    setSubmitError(null);
    form.reset({
      name: classification?.name ?? "",
      code: classification?.code ?? "",
      description: classification?.description ?? "",
      active: classification?.active ?? true,
    });
  }, [classification?.active, classification?.code, classification?.description, classification?.id, classification?.name, form, open]);

  const submit = async (values: z.infer<typeof schema>) => {
    setSubmitError(null);
    const payload = {
      name: values.name,
      code: values.code?.trim() ? values.code.trim() : null,
      description: values.description?.trim() ? values.description.trim() : null,
      active: values.active,
    };

    try {
      if (mode === "edit" && classification?.id) {
        await onUpdate({ id: classification.id, ...payload });
      } else {
        await onCreate(payload);
      }
      onOpenChange(false);
    } catch (e) {
      setSubmitError(formatSubmitError(e));
    }
  };

  const active = form.watch("active");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {mode === "edit" ? "Editar classificação" : "Nova classificação"}
          </DialogTitle>
          <DialogDescription>
            {mode === "edit"
              ? "Atualize os dados da classificação."
              : "Cadastre uma nova classificação de despesas."}
          </DialogDescription>
        </DialogHeader>

        {submitError ? (
          <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {submitError}
          </div>
        ) : null}

        <form className="space-y-4" onSubmit={form.handleSubmit(submit)}>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1 sm:col-span-2">
              <div className="text-sm font-medium text-slate-900">Nome</div>
              <Input placeholder="Ex: Material de consumo" {...form.register("name")} />
              {form.formState.errors.name ? (
                <div className="text-xs text-rose-700">{form.formState.errors.name.message}</div>
              ) : null}
            </div>

            <div className="space-y-1">
              <div className="text-sm font-medium text-slate-900">Código</div>
              <Input placeholder="Ex: 3.3.90.30" {...form.register("code")} />
              {form.formState.errors.code ? (
                <div className="text-xs text-rose-700">{form.formState.errors.code.message}</div>
              ) : null}
            </div>

            <div className="space-y-1">
              <div className="text-sm font-medium text-slate-900">Ativo</div>
              <select
                className="h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm"
                value={active ? "true" : "false"}
                onChange={(e) =>
                  form.setValue("active", e.target.value === "true", {
                    shouldValidate: true,
                  })
                }
              >
                <option value="true">Sim</option>
                <option value="false">Não</option>
              </select>
            </div>

            <div className="space-y-1 sm:col-span-2">
              <div className="text-sm font-medium text-slate-900">Descrição</div>
              <Input placeholder="Descrição (opcional)" {...form.register("description")} />
              {form.formState.errors.description ? (
                <div className="text-xs text-rose-700">
                  {form.formState.errors.description.message}
                </div>
              ) : null}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
