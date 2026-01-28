"use client";

import * as React from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import type { Category, CategoryType } from "@/features/categories/types";
import { formatCategoryDuplicateError, validateCategoryUniqueness } from "@/features/categories/validation";
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

const schema = z
  .object({
    name: z.string().trim().min(2, "Informe o nome").max(120),
    type: z.enum(["fonte", "bloco", "grupo", "acao"]),
    parentId: z.string().nullable(),
    code: z.string().trim().max(50).optional(),
    description: z.string().trim().max(500).optional(),
    active: z.boolean(),
  })
  .refine(
    (v) => {
      if (v.type === "fonte") return v.parentId === null;
      return v.parentId !== null;
    },
    { message: "Selecione uma categoria pai válida", path: ["parentId"] }
  );

function parentTypeFor(type: CategoryType): CategoryType | null {
  switch (type) {
    case "fonte":
      return null;
    case "bloco":
      return "fonte";
    case "grupo":
      return "bloco";
    case "acao":
      return "grupo";
  }
}

function typeLabel(type: CategoryType) {
  switch (type) {
    case "fonte":
      return "Fonte";
    case "bloco":
      return "Bloco";
    case "grupo":
      return "Grupo";
    case "acao":
      return "Ação";
  }
}

function descendantIds(categories: Category[], rootId: string) {
  const childrenByParent = new Map<string, string[]>();
  for (const c of categories) {
    if (!c.parent_id) continue;
    const arr = childrenByParent.get(c.parent_id) ?? [];
    arr.push(c.id);
    childrenByParent.set(c.parent_id, arr);
  }

  const visited = new Set<string>();
  const stack = [rootId];
  while (stack.length) {
    const cur = stack.pop() as string;
    const kids = childrenByParent.get(cur) ?? [];
    for (const k of kids) {
      if (visited.has(k)) continue;
      visited.add(k);
      stack.push(k);
    }
  }
  return visited;
}

export function CategoryUpsertDialog({
  open,
  onOpenChange,
  categories,
  category,
  onCreate,
  onUpdate,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: Category[];
  category?: Category | null;
  onCreate: (payload: {
    name: string;
    type: CategoryType;
    parentId: string | null;
    code?: string | null;
    description?: string | null;
    active: boolean;
  }) => Promise<void>;
  onUpdate: (payload: {
    id: string;
    name: string;
    type: CategoryType;
    parentId: string | null;
    code?: string | null;
    description?: string | null;
    active: boolean;
  }) => Promise<void>;
}) {
  const mode: Mode = category?.id ? "edit" : "create";
  const [submitError, setSubmitError] = React.useState<string | null>(null);

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: category?.name ?? "",
      type: (category?.type ?? "fonte") as CategoryType,
      parentId: category?.parent_id ?? null,
      code: (category?.code ?? "") as string,
      description: (category?.description ?? "") as string,
      active: category?.active ?? true,
    },
  });

  const type = form.watch("type") as CategoryType;
  const parentId = form.watch("parentId");

  React.useEffect(() => {
    if (!open) return;
    setSubmitError(null);
    form.reset({
      name: category?.name ?? "",
      type: (category?.type ?? "fonte") as CategoryType,
      parentId: category?.parent_id ?? null,
      code: (category?.code ?? "") as string,
      description: (category?.description ?? "") as string,
      active: category?.active ?? true,
    });
  }, [category?.active, category?.code, category?.description, category?.id, category?.name, category?.parent_id, category?.type, form, open]);

  const forbiddenParentIds = React.useMemo(() => {
    if (mode !== "edit" || !category?.id) return new Set<string>();
    const set = descendantIds(categories, category.id);
    set.add(category.id);
    return set;
  }, [categories, category?.id, mode]);

  const allowedParents = React.useMemo(() => {
    const parentType = parentTypeFor(type);
    if (!parentType) return [];
    return categories
      .filter((c) => c.type === parentType)
      .filter((c) => c.active !== false)
      .filter((c) => !forbiddenParentIds.has(c.id))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [categories, forbiddenParentIds, type]);

  React.useEffect(() => {
    const expectedParentType = parentTypeFor(type);
    if (!expectedParentType) {
      if (parentId !== null) form.setValue("parentId", null, { shouldValidate: false });
      return;
    }

    if (parentId === null) return;
    const exists = allowedParents.some((p) => p.id === parentId);
    if (!exists) form.setValue("parentId", null, { shouldValidate: false });
  }, [allowedParents, form, parentId, type]);

  const submit = async (values: z.infer<typeof schema>) => {
    setSubmitError(null);

    const payload = {
      name: values.name,
      type: values.type as CategoryType,
      parentId: values.parentId,
      code: values.code?.trim() ? values.code.trim() : null,
      description: values.description?.trim() ? values.description.trim() : null,
      active: values.active,
    };

    const duplicates = validateCategoryUniqueness({
      categories,
      idToIgnore: category?.id ?? null,
      name: payload.name,
      code: payload.code,
    });
    if (duplicates.name) {
      form.setError("name", { type: "validate", message: duplicates.name });
    }
    if (duplicates.code) {
      form.setError("code", { type: "validate", message: duplicates.code });
    }
    if (duplicates.name || duplicates.code) return;

    try {
      if (mode === "edit" && category?.id) {
        await onUpdate({ id: category.id, ...payload });
      } else {
        await onCreate(payload);
      }
      onOpenChange(false);
    } catch (e) {
      setSubmitError(formatCategoryDuplicateError(e));
    }
  };

  const expectedParentType = parentTypeFor(type);
  const parentErrorMessage = form.formState.errors.parentId?.message;
  const showParentError =
    (form.formState.isSubmitted || (form.formState.touchedFields as Record<string, unknown>).parentId) &&
    !!parentErrorMessage;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{mode === "edit" ? "Editar categoria" : "Nova categoria"}</DialogTitle>
          <DialogDescription>
            {mode === "edit" ? "Atualize os dados da categoria." : "Cadastre uma nova categoria."}
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
              <Input placeholder="Ex: Transferências" {...form.register("name")} />
              {form.formState.errors.name ? (
                <div className="text-xs text-rose-700">{form.formState.errors.name.message}</div>
              ) : null}
            </div>

            <div className="space-y-1">
              <div className="text-sm font-medium text-slate-900">Tipo</div>
              <select
                className="h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm"
                {...form.register("type")}
              >
                {(Array.from(["fonte", "bloco", "grupo", "acao"]) as CategoryType[]).map((t) => (
                  <option key={t} value={t}>
                    {typeLabel(t)}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <div className="text-sm font-medium text-slate-900">Ativo</div>
              <select
                className="h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm"
                value={form.watch("active") ? "true" : "false"}
                onChange={(e) => form.setValue("active", e.target.value === "true", { shouldValidate: true })}
              >
                <option value="true">Sim</option>
                <option value="false">Não</option>
              </select>
            </div>

            <div className="space-y-1 sm:col-span-2">
              <div className="text-sm font-medium text-slate-900">Categoria pai</div>
              <select
                className="h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm"
                value={form.watch("parentId") ?? ""}
                disabled={!expectedParentType}
                onChange={(e) => {
                  const v = e.target.value;
                  form.setValue("parentId", v ? v : null, { shouldValidate: true });
                }}
                onBlur={() => {
                  form.trigger("parentId");
                }}
              >
                <option value="">{expectedParentType ? `Selecione (${typeLabel(expectedParentType)})` : "Sem pai"}</option>
                {allowedParents.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
              {showParentError ? (
                <div className="text-xs text-rose-700">{String(parentErrorMessage)}</div>
              ) : null}
            </div>

            <div className="space-y-1">
              <div className="text-sm font-medium text-slate-900">Código (opcional)</div>
              <Input placeholder="Ex: 01" {...form.register("code")} />
              {form.formState.errors.code ? (
                <div className="text-xs text-rose-700">{form.formState.errors.code.message}</div>
              ) : null}
            </div>

            <div className="space-y-1 sm:col-span-2">
              <div className="text-sm font-medium text-slate-900">Descrição (opcional)</div>
              <Input placeholder="Descrição" {...form.register("description")} />
              {form.formState.errors.description ? (
                <div className="text-xs text-rose-700">{form.formState.errors.description.message}</div>
              ) : null}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={form.formState.isSubmitting}>
              Salvar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

