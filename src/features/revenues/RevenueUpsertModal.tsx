"use client";

import * as React from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";

import { fetchCategories } from "@/features/categories/api";
import type { Category, CategoryType } from "@/features/categories/types";
import { createRevenue, updateRevenue } from "@/features/revenues/api";
import { parseBRLCurrencyToNumber } from "@/features/revenues/currency";
import type { Revenue, RevenueRow } from "@/features/revenues/types";
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
});

type FormValues = z.infer<typeof schema>;

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
  options: Array<{ value: string; label: string }>;
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
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error ? <div className="text-xs text-rose-700">{error}</div> : null}
    </div>
  );
}

export function RevenueUpsertModal({
  open,
  onOpenChange,
  revenue,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  revenue?: RevenueRow | Revenue | null;
  onSaved?: () => void;
}) {
  const mode: Mode = revenue?.id ? "edit" : "create";

  const {
    control,
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      description: revenue?.description ?? "",
      amountText:
        revenue?.amount != null
          ? new Intl.NumberFormat("pt-BR", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }).format(revenue.amount)
          : "",
      date: revenue?.date ? revenue.date.slice(0, 10) : "",
      fonteId: revenue?.source_id ?? "",
      blocoId: "",
      grupoId: "",
      acaoId: revenue?.category_id ?? "",
    },
  });

  const [categories, setCategories] = React.useState<Category[]>([]);
  const [categoriesError, setCategoriesError] = React.useState<string | null>(
    null
  );
  const [saveError, setSaveError] = React.useState<string | null>(null);

  const categoriesById = React.useMemo(() => {
    return new Map(categories.map((c) => [c.id, c]));
  }, [categories]);

  const fonteId = watch("fonteId");
  const blocoId = watch("blocoId");
  const grupoId = watch("grupoId");
  const acaoId = watch("acaoId");

  React.useEffect(() => {
    if (!open) return;
    setSaveError(null);
    setCategoriesError(null);

    (async () => {
      try {
        const data = await fetchCategories();
        setCategories(data);
      } catch (e) {
        setCategories([]);
        setCategoriesError(
          e instanceof Error ? e.message : "Erro ao carregar categorias."
        );
      }
    })();
  }, [open]);

  React.useEffect(() => {
    if (!open) return;

    reset({
      description: revenue?.description ?? "",
      amountText:
        revenue?.amount != null
          ? new Intl.NumberFormat("pt-BR", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }).format(revenue.amount)
          : "",
      date: revenue?.date ? revenue.date.slice(0, 10) : "",
      fonteId: revenue?.source_id ?? "",
      blocoId: "",
      grupoId: "",
      acaoId: revenue?.category_id ?? "",
    });
  }, [open, reset, revenue?.amount, revenue?.category_id, revenue?.date, revenue?.description, revenue?.id, revenue?.source_id]);

  React.useEffect(() => {
    if (!open) return;
    if (categories.length === 0) return;
    if (!acaoId) return;

    const ancestors = getAncestorsByType(categoriesById, acaoId);
    const inferredFonteId = ancestors.fonte;
    const inferredBlocoId = ancestors.bloco;
    const inferredGrupoId = ancestors.grupo;

    if (inferredFonteId && inferredFonteId !== fonteId) {
      setValue("fonteId", inferredFonteId, { shouldValidate: true });
    }
    if (inferredBlocoId) {
      setValue("blocoId", inferredBlocoId, { shouldValidate: true });
    }
    if (inferredGrupoId) {
      setValue("grupoId", inferredGrupoId, { shouldValidate: true });
    }
  }, [acaoId, categories.length, categoriesById, fonteId, open, setValue]);

  const fontes = React.useMemo(
    () => categories.filter((c) => c.type === "fonte"),
    [categories]
  );
  const blocos = React.useMemo(
    () =>
      categories.filter(
        (c) => c.type === "bloco" && !!fonteId && c.parent_id === fonteId
      ),
    [categories, fonteId]
  );
  const grupos = React.useMemo(
    () =>
      categories.filter(
        (c) => c.type === "grupo" && !!blocoId && c.parent_id === blocoId
      ),
    [categories, blocoId]
  );
  const acoes = React.useMemo(
    () =>
      categories.filter(
        (c) => c.type === "acao" && !!grupoId && c.parent_id === grupoId
      ),
    [categories, grupoId]
  );

  const onSubmit = async (values: FormValues) => {
    setSaveError(null);

    const amount = parseBRLCurrencyToNumber(values.amountText);
    if (!Number.isFinite(amount) || amount <= 0) {
      setSaveError("Valor inválido");
      return;
    }

    if (mode === "edit" && revenue?.id) {
      try {
        await updateRevenue(revenue.id, {
          description: values.description,
          amount,
          date: values.date,
          fonteId: values.fonteId,
          blocoId: values.blocoId,
          grupoId: values.grupoId,
          acaoId: values.acaoId,
        });
      } catch (e) {
        setSaveError(e instanceof Error ? e.message : "Erro ao salvar receita");
        return;
      }
    } else {
      try {
        await createRevenue({
          description: values.description,
          amount,
          date: values.date,
          fonteId: values.fonteId,
          blocoId: values.blocoId,
          grupoId: values.grupoId,
          acaoId: values.acaoId,
        });
      } catch (e) {
        setSaveError(e instanceof Error ? e.message : "Erro ao salvar receita");
        return;
      }
    }

    onSaved?.();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {mode === "edit" ? "Editar Receita" : "Nova Receita"}
          </DialogTitle>
          <DialogDescription>
            Preencha os dados e selecione a hierarquia de categorias.
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1 sm:col-span-2">
              <div className="text-sm font-medium text-slate-900">
                Descrição
              </div>
              <Input
                placeholder="Ex: Repasse Fundo X"
                {...register("description")}
              />
              {errors.description ? (
                <div className="text-xs text-rose-700">
                  {errors.description.message}
                </div>
              ) : null}
            </div>

            <div className="space-y-1">
              <div className="text-sm font-medium text-slate-900">Valor</div>
              <Controller
                control={control}
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
              {errors.amountText ? (
                <div className="text-xs text-rose-700">
                  {errors.amountText.message}
                </div>
              ) : null}
            </div>

            <div className="space-y-1">
              <div className="text-sm font-medium text-slate-900">Data</div>
              <Input type="date" {...register("date")} />
              {errors.date ? (
                <div className="text-xs text-rose-700">{errors.date.message}</div>
              ) : null}
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="mb-3 text-sm font-semibold text-slate-900">
              Categoria (Hierarquia)
            </div>

            {categoriesError ? (
              <div className="mb-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                {categoriesError}
              </div>
            ) : null}

            <div className="grid gap-3 sm:grid-cols-2">
              <Controller
                control={control}
                name="fonteId"
                render={({ field }) => (
                  <SelectField
                    label="Fonte"
                    value={field.value}
                    onChange={(value) => {
                      field.onChange(value);
                      setValue("blocoId", "", { shouldValidate: true });
                      setValue("grupoId", "", { shouldValidate: true });
                      setValue("acaoId", "", { shouldValidate: true });
                    }}
                    placeholder="Selecione a fonte"
                    options={fontes.map((c) => ({
                      value: c.id,
                      label: c.name,
                    }))}
                    error={errors.fonteId?.message}
                    disabled={categories.length === 0}
                  />
                )}
              />

              <Controller
                control={control}
                name="blocoId"
                render={({ field }) => (
                  <SelectField
                    label="Bloco"
                    value={field.value}
                    onChange={(value) => {
                      field.onChange(value);
                      setValue("grupoId", "", { shouldValidate: true });
                      setValue("acaoId", "", { shouldValidate: true });
                    }}
                    placeholder={
                      fonteId ? "Selecione o bloco" : "Selecione uma fonte"
                    }
                    options={blocos.map((c) => ({
                      value: c.id,
                      label: c.name,
                    }))}
                    error={errors.blocoId?.message}
                    disabled={!fonteId}
                  />
                )}
              />

              <Controller
                control={control}
                name="grupoId"
                render={({ field }) => (
                  <SelectField
                    label="Grupo"
                    value={field.value}
                    onChange={(value) => {
                      field.onChange(value);
                      setValue("acaoId", "", { shouldValidate: true });
                    }}
                    placeholder={
                      blocoId ? "Selecione o grupo" : "Selecione um bloco"
                    }
                    options={grupos.map((c) => ({
                      value: c.id,
                      label: c.name,
                    }))}
                    error={errors.grupoId?.message}
                    disabled={!blocoId}
                  />
                )}
              />

              <Controller
                control={control}
                name="acaoId"
                render={({ field }) => (
                  <SelectField
                    label="Ação"
                    value={field.value}
                    onChange={field.onChange}
                    placeholder={
                      grupoId ? "Selecione a ação" : "Selecione um grupo"
                    }
                    options={acoes.map((c) => ({
                      value: c.id,
                      label: c.name,
                    }))}
                    error={errors.acaoId?.message}
                    disabled={!grupoId}
                  />
                )}
              />
            </div>
          </div>

          {saveError ? (
            <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {saveError}
            </div>
          ) : null}

          <div className="flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? "Salvando..."
                : mode === "edit"
                  ? "Salvar"
                  : "Criar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

