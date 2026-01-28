"use client";

import * as React from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";

import { fetchCategories } from "@/features/categories/api";
import type { Category, CategoryType } from "@/features/categories/types";
import { parseBRLCurrencyToNumber } from "@/features/revenues/currency";
import {
  createExpense,
  fetchExpenseClassificationsForSelect,
  updateExpense,
} from "@/features/expenses/api";
import type { Expense, ExpenseRow } from "@/features/expenses/types";
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
  description: z.string().trim().min(2, "Informe a descrição"),
  amountText: z
    .string()
    .trim()
    .min(1, "Informe o valor")
    .refine((v) => {
      const parsed = parseBRLCurrencyToNumber(v);
      return Number.isFinite(parsed) && parsed > 0;
    }, "Valor inválido"),
  date: z.string().min(1, "Informe a data"),
  fonteId: z.string().min(1, "Selecione a fonte"),
  blocoId: z.string().min(1, "Selecione o bloco"),
  grupoId: z.string().min(1, "Selecione o grupo"),
  acaoId: z.string().min(1, "Selecione a ação"),
  classificationId: z.string().min(1, "Selecione a classificação"),
});

type FormValues = z.infer<typeof schema>;

function formatNumberToBRLCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function getAncestorsByType(
  categoriesById: Map<string, Category>,
  leafId: string
): Partial<Record<CategoryType, string>> {
  const result: Partial<Record<CategoryType, string>> = {};
  let current: Category | undefined = categoriesById.get(leafId);

  while (current) {
    result[current.type] = current.id;
    if (!current.parent_id) break;
    current = categoriesById.get(current.parent_id);
  }

  return result;
}

function SelectField({
  label,
  value,
  onChange,
  options,
  placeholder,
  error,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string; disabled?: boolean }>;
  placeholder: string;
  error?: string;
  disabled?: boolean;
}) {
  return (
    <div className="space-y-1">
      <div className="text-sm font-medium text-slate-900">{label}</div>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={
          "h-9 w-full rounded-md border bg-white px-3 text-sm text-slate-900 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--sis-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:cursor-not-allowed disabled:opacity-50 " +
          (error ? "border-rose-300" : "border-slate-200")
        }
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} disabled={opt.disabled}>
            {opt.label}
          </option>
        ))}
      </select>
      {error ? <div className="text-xs text-rose-700">{error}</div> : null}
    </div>
  );
}

export function ExpenseUpsertModal({
  open,
  onOpenChange,
  expense,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  expense?: ExpenseRow | Expense | null;
  onSaved?: (action: "created" | "updated") => void;
}) {
  const mode: Mode = expense?.id ? "edit" : "create";

  const [categories, setCategories] = React.useState<Category[]>([]);
  const [classifications, setClassifications] = React.useState<
    Array<{ id: string; name: string; code: string | null; active: boolean }>
  >([]);
  const [loadingRefs, setLoadingRefs] = React.useState(false);
  const [saveError, setSaveError] = React.useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      description: expense?.description ?? "",
      amountText:
        expense?.amount != null
          ? formatNumberToBRLCurrency(Number(expense.amount))
          : "",
      date: expense?.date ? expense.date.slice(0, 10) : "",
      fonteId: expense?.source_id ?? "",
      blocoId: "",
      grupoId: "",
      acaoId: expense?.category_id ?? "",
      classificationId: expense?.classification_id ?? "",
    },
  });

  const fonteId = form.watch("fonteId");
  const blocoId = form.watch("blocoId");
  const grupoId = form.watch("grupoId");
  const acaoId = form.watch("acaoId");

  const categoriesById = React.useMemo(() => {
    return new Map(categories.map((c) => [c.id, c]));
  }, [categories]);

  React.useEffect(() => {
    if (!open) return;
    setSaveError(null);

    form.reset({
      description: expense?.description ?? "",
      amountText:
        expense?.amount != null
          ? formatNumberToBRLCurrency(Number(expense.amount))
          : "",
      date: expense?.date ? expense.date.slice(0, 10) : "",
      fonteId: expense?.source_id ?? "",
      blocoId: "",
      grupoId: "",
      acaoId: expense?.category_id ?? "",
      classificationId: expense?.classification_id ?? "",
    });
  }, [expense?.amount, expense?.category_id, expense?.classification_id, expense?.date, expense?.description, expense?.id, expense?.source_id, form, open]);

  React.useEffect(() => {
    if (!open) return;
    let cancelled = false;

    setLoadingRefs(true);
    void (async () => {
      try {
        const [cats, classes] = await Promise.all([
          fetchCategories(),
          fetchExpenseClassificationsForSelect({
            includeIds: expense?.classification_id ? [expense.classification_id] : [],
          }),
        ]);

        if (cancelled) return;
        setCategories(cats);
        setClassifications(classes);
      } catch (e) {
        if (cancelled) return;
        setSaveError(
          e instanceof Error ? e.message : "Erro ao carregar dados auxiliares"
        );
      } finally {
        if (!cancelled) setLoadingRefs(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [expense?.classification_id, open]);

  React.useEffect(() => {
    if (!open) return;
    if (!acaoId) return;
    const ancestors = getAncestorsByType(categoriesById, acaoId);
    const inferredFonteId = ancestors.fonte;
    const inferredBlocoId = ancestors.bloco;
    const inferredGrupoId = ancestors.grupo;

    if (inferredFonteId && inferredFonteId !== fonteId) {
      form.setValue("fonteId", inferredFonteId, { shouldValidate: true });
    }
    if (inferredBlocoId && inferredBlocoId !== blocoId) {
      form.setValue("blocoId", inferredBlocoId, { shouldValidate: true });
    }
    if (inferredGrupoId && inferredGrupoId !== grupoId) {
      form.setValue("grupoId", inferredGrupoId, { shouldValidate: true });
    }
  }, [acaoId, blocoId, categoriesById, fonteId, form, grupoId, open]);

  const activeCategories = React.useMemo(() => {
    const selectedIds = new Set<string>();
    if (form.getValues("fonteId")) selectedIds.add(form.getValues("fonteId"));
    if (form.getValues("blocoId")) selectedIds.add(form.getValues("blocoId"));
    if (form.getValues("grupoId")) selectedIds.add(form.getValues("grupoId"));
    if (form.getValues("acaoId")) selectedIds.add(form.getValues("acaoId"));

    return categories.filter((c) => c.active !== false || selectedIds.has(c.id));
  }, [categories, form]);

  const fontes = React.useMemo(
    () =>
      activeCategories
        .filter((c) => c.type === "fonte" && c.parent_id == null)
        .map((c) => ({ value: c.id, label: c.name })),
    [activeCategories]
  );

  const blocos = React.useMemo(
    () =>
      activeCategories
        .filter((c) => c.type === "bloco" && !!fonteId && c.parent_id === fonteId)
        .map((c) => ({ value: c.id, label: c.name })),
    [activeCategories, fonteId]
  );

  const grupos = React.useMemo(
    () =>
      activeCategories
        .filter((c) => c.type === "grupo" && !!blocoId && c.parent_id === blocoId)
        .map((c) => ({ value: c.id, label: c.name })),
    [activeCategories, blocoId]
  );

  const acoes = React.useMemo(
    () =>
      activeCategories
        .filter((c) => c.type === "acao" && !!grupoId && c.parent_id === grupoId)
        .map((c) => ({ value: c.id, label: c.name })),
    [activeCategories, grupoId]
  );

  const classificationOptions = React.useMemo(() => {
    return classifications.map((c) => {
      const label = c.code ? `${c.code} · ${c.name}` : c.name;
      const disabled = c.active === false;
      return {
        value: c.id,
        label: disabled ? `${label} (inativa)` : label,
        disabled,
      };
    });
  }, [classifications]);

  const submit = async (values: FormValues) => {
    setSaveError(null);
    const amount = parseBRLCurrencyToNumber(values.amountText);
    if (!Number.isFinite(amount) || amount <= 0) {
      setSaveError("Valor inválido");
      return;
    }

    try {
      if (mode === "edit" && expense?.id) {
        await updateExpense(expense.id, {
          description: values.description,
          amount,
          date: values.date,
          fonteId: values.fonteId,
          blocoId: values.blocoId,
          grupoId: values.grupoId,
          acaoId: values.acaoId,
          classificationId: values.classificationId,
        });
        onSaved?.("updated");
      } else {
        await createExpense({
          description: values.description,
          amount,
          date: values.date,
          fonteId: values.fonteId,
          blocoId: values.blocoId,
          grupoId: values.grupoId,
          acaoId: values.acaoId,
          classificationId: values.classificationId,
        });
        onSaved?.("created");
      }

      onOpenChange(false);
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : "Erro ao salvar despesa");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {mode === "edit" ? "Editar Despesa" : "Nova Despesa"}
          </DialogTitle>
          <DialogDescription>
            Preencha os dados e selecione a hierarquia de categorias.
          </DialogDescription>
        </DialogHeader>

        {saveError ? (
          <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {saveError}
          </div>
        ) : null}

        <form className="space-y-4" onSubmit={form.handleSubmit(submit)}>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1 sm:col-span-2">
              <div className="text-sm font-medium text-slate-900">Descrição</div>
              <Input placeholder="Ex: Compra de material" {...form.register("description")} />
              {form.formState.errors.description ? (
                <div className="text-xs text-rose-700">
                  {form.formState.errors.description.message}
                </div>
              ) : null}
            </div>

            <div className="space-y-1">
              <div className="text-sm font-medium text-slate-900">Valor</div>
              <Controller
                control={form.control}
                name="amountText"
                render={({ field }) => (
                  <Input
                    inputMode="decimal"
                    placeholder="0,00"
                    value={field.value}
                    onChange={(e) => field.onChange(e.target.value)}
                  />
                )}
              />
              {form.formState.errors.amountText ? (
                <div className="text-xs text-rose-700">
                  {form.formState.errors.amountText.message}
                </div>
              ) : null}
            </div>

            <div className="space-y-1">
              <div className="text-sm font-medium text-slate-900">Data</div>
              <Input type="date" {...form.register("date")} />
              {form.formState.errors.date ? (
                <div className="text-xs text-rose-700">
                  {form.formState.errors.date.message}
                </div>
              ) : null}
            </div>

            <Controller
              control={form.control}
              name="fonteId"
              render={({ field }) => (
                <SelectField
                  label="Fonte"
                  value={field.value}
                  onChange={(value) => {
                    field.onChange(value);
                    form.setValue("blocoId", "", { shouldValidate: true });
                    form.setValue("grupoId", "", { shouldValidate: true });
                    form.setValue("acaoId", "", { shouldValidate: true });
                  }}
                  options={fontes}
                  placeholder="Selecione a fonte"
                  error={form.formState.errors.fonteId?.message}
                  disabled={loadingRefs}
                />
              )}
            />

            <Controller
              control={form.control}
              name="blocoId"
              render={({ field }) => (
                <SelectField
                  label="Bloco"
                  value={field.value}
                  onChange={(value) => {
                    field.onChange(value);
                    form.setValue("grupoId", "", { shouldValidate: true });
                    form.setValue("acaoId", "", { shouldValidate: true });
                  }}
                  options={blocos}
                  placeholder={fonteId ? "Selecione o bloco" : "Selecione uma fonte"}
                  error={form.formState.errors.blocoId?.message}
                  disabled={!fonteId || loadingRefs}
                />
              )}
            />

            <Controller
              control={form.control}
              name="grupoId"
              render={({ field }) => (
                <SelectField
                  label="Grupo"
                  value={field.value}
                  onChange={(value) => {
                    field.onChange(value);
                    form.setValue("acaoId", "", { shouldValidate: true });
                  }}
                  options={grupos}
                  placeholder={blocoId ? "Selecione o grupo" : "Selecione um bloco"}
                  error={form.formState.errors.grupoId?.message}
                  disabled={!blocoId || loadingRefs}
                />
              )}
            />

            <Controller
              control={form.control}
              name="acaoId"
              render={({ field }) => (
                <SelectField
                  label="Ação"
                  value={field.value}
                  onChange={field.onChange}
                  options={acoes}
                  placeholder={grupoId ? "Selecione a ação" : "Selecione um grupo"}
                  error={form.formState.errors.acaoId?.message}
                  disabled={!grupoId || loadingRefs}
                />
              )}
            />

            <Controller
              control={form.control}
              name="classificationId"
              render={({ field }) => (
                <SelectField
                  label="Classificação"
                  value={field.value}
                  onChange={field.onChange}
                  options={classificationOptions}
                  placeholder="Selecione a classificação"
                  error={form.formState.errors.classificationId?.message}
                  disabled={loadingRefs}
                />
              )}
            />
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

