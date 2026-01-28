"use client";

import * as React from "react";
import { ChevronDown, ChevronRight, Pencil, Power, Search, Trash2 } from "lucide-react";
import {
  createCategory,
  deleteCategory,
  fetchCategories,
  isCategoryInUse,
  setCategoryActive,
  updateCategory,
} from "@/features/categories/api";
import type { Category, CategoryNode, CategoryType } from "@/features/categories/types";
import { buildCategoryTree, filterCategoryTree } from "@/features/categories/tree";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { CategoryUpsertDialog } from "@/features/categories/CategoryUpsertDialog";

const typeOptions: Array<{ value: CategoryType | "all"; label: string }> = [
  { value: "all", label: "Todos" },
  { value: "fonte", label: "Fonte" },
  { value: "bloco", label: "Bloco" },
  { value: "grupo", label: "Grupo" },
  { value: "acao", label: "Ação" },
];

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

function typeChipClass(type: CategoryType) {
  switch (type) {
    case "fonte":
      return "border-[color:color-mix(in_srgb,var(--sis-primary)_35%,white)] text-[color:var(--sis-primary)]";
    case "bloco":
      return "border-emerald-200 text-emerald-700";
    case "grupo":
      return "border-amber-200 text-amber-800";
    case "acao":
      return "border-rose-200 text-rose-700";
  }
}

function rowBgClass(type: CategoryType) {
  switch (type) {
    case "fonte":
      return "bg-[color:color-mix(in_srgb,var(--sis-primary)_12%,white)] border-[color:color-mix(in_srgb,var(--sis-primary)_22%,white)]";
    case "bloco":
      return "bg-emerald-50 border-emerald-200";
    case "grupo":
      return "bg-amber-50 border-amber-200";
    case "acao":
      return "bg-rose-50 border-rose-200";
  }
}

function CategoryRow({
  node,
  level,
  onEdit,
  onToggleActive,
  onDelete,
  inUseById,
}: {
  node: CategoryNode;
  level: number;
  onEdit: (c: Category) => void;
  onToggleActive: (c: Category) => void;
  onDelete: (c: Category) => void;
  inUseById: Record<string, boolean>;
}) {
  const [open, setOpen] = React.useState(level < 2);
  const hasChildren = node.children.length > 0;
  const inactive = node.active === false;
  const inUse = inUseById[node.id] === true;
  const canEdit = !inUse;
  const editTooltip = inUse ? "Edição bloqueada: possui receitas/despesas vinculadas" : undefined;
  const toggleDisabled = !inactive && hasChildren;
  const toggleTooltip = inactive
    ? "Ativar"
    : hasChildren
      ? "Não é possível inativar: possui filhos"
      : inUse
        ? "Possui movimentações: exclusão permanente bloqueada. Você pode inativar."
        : "Inativar";

  const deleteDisabled = hasChildren;
  const deleteTooltip = hasChildren
    ? "Exclusão bloqueada: possui filhos"
    : inUse
      ? "Exclusão permanente bloqueada por movimentações. Use para inativar."
      : "Excluir permanentemente";

  return (
    <div className="space-y-2">
      <div
        className={
          "flex items-center justify-between gap-3 rounded-lg border px-3 py-2 " +
          rowBgClass(node.type)
        }
        style={{ marginLeft: `${level * 16}px` }}
      >
        <div className="flex min-w-0 items-center gap-2">
          {hasChildren ? (
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              className="grid h-8 w-8 place-items-center rounded-md text-slate-700 hover:bg-white/70"
              aria-label={open ? "Recolher" : "Expandir"}
            >
              {open ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>
          ) : (
            <div className="h-8 w-8" />
          )}

          <div className="min-w-0">
            <div
              className={
                "truncate text-sm font-semibold " +
                (inactive ? "text-slate-500 line-through" : "text-slate-900")
              }
            >
              {node.name}
            </div>
            <div className="mt-0.5">
              <Badge variant="outline" className={typeChipClass(node.type)}>
                {typeLabel(node.type)}
              </Badge>
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Editar"
            disabled={!canEdit}
            title={editTooltip}
            onClick={() => (canEdit ? onEdit(node) : null)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={inactive ? "Ativar" : "Inativar"}
            disabled={toggleDisabled}
            title={toggleTooltip}
            onClick={() => onToggleActive(node)}
          >
            <Power
              className={
                "h-4 w-4 " +
                (inactive ? "text-emerald-700" : "text-[color:var(--sis-danger)]")
              }
            />
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Excluir"
            disabled={deleteDisabled}
            title={deleteTooltip}
            onClick={() => onDelete(node)}
          >
            <Trash2 className="h-4 w-4 text-[color:var(--sis-danger)]" />
          </Button>
        </div>
      </div>

      {hasChildren && open ? (
        <div className="space-y-2">
          {node.children.map((child) => (
            <CategoryRow
              key={child.id}
              node={child}
              level={level + 1}
              onEdit={onEdit}
              onToggleActive={onToggleActive}
              onDelete={onDelete}
              inUseById={inUseById}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function CategoriesPageClient() {
  const [search, setSearch] = React.useState("");
  const [type, setType] = React.useState<CategoryType | "all">("all");
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [nodes, setNodes] = React.useState<CategoryNode[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const [upsertOpen, setUpsertOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Category | null>(null);
  const [confirmToggle, setConfirmToggle] = React.useState<Category | null>(null);
  const [toggleError, setToggleError] = React.useState<string | null>(null);
  const [toggleInUse, setToggleInUse] = React.useState<boolean | null>(null);

  const [confirmDelete, setConfirmDelete] = React.useState<Category | null>(null);
  const [deleteError, setDeleteError] = React.useState<string | null>(null);
  const [deleteInUse, setDeleteInUse] = React.useState<boolean | null>(null);

  const [actionError, setActionError] = React.useState<string | null>(null);
  const [inUseById, setInUseById] = React.useState<Record<string, boolean>>({});

  const load = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchCategories();
      setCategories(data);
      setNodes(buildCategoryTree(data));
    } catch (e) {
      setCategories([]);
      setNodes([]);
      setError(
        e instanceof Error ? e.message : "Erro ao carregar categorias."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void load();
  }, [load]);

  const filtered = React.useMemo(
    () => filterCategoryTree(nodes, { search, type }),
    [nodes, search, type]
  );

  const openCreate = () => {
    setActionError(null);
    setEditing(null);
    setUpsertOpen(true);
  };

  const ensureInUse = async (id: string) => {
    if (typeof inUseById[id] === "boolean") return inUseById[id] as boolean;
    const inUse = await isCategoryInUse(id);
    setInUseById((prev) => ({ ...prev, [id]: inUse }));
    return inUse;
  };

  const openEdit = async (c: Category) => {
    setActionError(null);
    try {
      const inUse = await ensureInUse(c.id);
      if (inUse) {
        setActionError(
          "Não é possível editar: a categoria possui receitas/despesas vinculadas."
        );
        return;
      }
      setEditing(c);
      setUpsertOpen(true);
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "Erro ao validar categoria");
    }
  };

  const requestToggleActive = async (c: Category) => {
    setToggleError(null);
    setToggleInUse(null);
    setConfirmToggle(c);
    try {
      const inUse = await ensureInUse(c.id);
      setToggleInUse(inUse);
    } catch (e) {
      setToggleError(e instanceof Error ? e.message : "Erro ao verificar vínculos");
      setToggleInUse(false);
    }
  };

  const requestDelete = async (c: Category) => {
    setDeleteError(null);
    setDeleteInUse(null);
    setConfirmDelete(c);
    try {
      const inUse = await ensureInUse(c.id);
      setDeleteInUse(inUse);
    } catch (e) {
      setDeleteError(e instanceof Error ? e.message : "Erro ao verificar vínculos");
      setDeleteInUse(false);
    }
  };

  const onCreate = async (payload: {
    name: string;
    type: CategoryType;
    parentId: string | null;
    code?: string | null;
    description?: string | null;
    active: boolean;
  }) => {
    await createCategory(payload);
    await load();
  };

  const onUpdate = async (payload: {
    id: string;
    name: string;
    type: CategoryType;
    parentId: string | null;
    code?: string | null;
    description?: string | null;
    active: boolean;
  }) => {
    const { id, ...rest } = payload;
    await updateCategory(id, rest);
    await load();
  };

  const onConfirmToggle = async () => {
    if (!confirmToggle) return;
    setToggleError(null);

    const hasChildren = categories.some((c) => c.parent_id === confirmToggle.id);
    const nextActive = confirmToggle.active === false;
    if (!nextActive && hasChildren) {
      setToggleError("Não é possível inativar: a categoria possui filhos.");
      return;
    }

    try {
      await setCategoryActive(confirmToggle.id, nextActive);
      setConfirmToggle(null);
      setToggleInUse(null);
      await load();
    } catch (e) {
      setToggleError(e instanceof Error ? e.message : "Erro ao atualizar categoria");
    }
  };

  const onConfirmDelete = async () => {
    if (!confirmDelete) return;
    const target = confirmDelete;
    setDeleteError(null);

    const hasChildren = categories.some((c) => c.parent_id === target.id);
    if (hasChildren) {
      setDeleteError("Não é possível excluir: a categoria possui filhos.");
      return;
    }

    try {
      const inUse = typeof deleteInUse === "boolean" ? deleteInUse : await ensureInUse(target.id);
      if (inUse) {
        await setCategoryActive(target.id, false);
      } else {
        await deleteCategory(target.id);
      }
      setConfirmDelete(null);
      setDeleteInUse(null);
      await load();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Erro ao excluir categoria";
      if (msg.includes("vinculada a receitas") || msg.includes("vinculada a despesas") || msg.includes("vinculada a receitas/despesas")) {
        try {
          await setCategoryActive(target.id, false);
          setConfirmDelete(null);
          setDeleteInUse(null);
          await load();
          return;
        } catch (e2) {
          setDeleteError(e2 instanceof Error ? e2.message : msg);
          return;
        }
      }
      setDeleteError(msg);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 lg:grid-cols-[1fr_220px_auto_auto]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por nome"
                className="pl-9"
              />
            </div>

            <select
              value={type}
              onChange={(e) => setType(e.target.value as CategoryType | "all")}
              className="h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--sis-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-white"
              aria-label="Tipo"
            >
              {typeOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>

            <Button type="button" variant="secondary" onClick={() => void load()}>
              Atualizar
            </Button>

            <Button type="button" onClick={openCreate}>
              + Nova categoria
            </Button>
          </div>

          {error ? (
            <div className="mt-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {error}
            </div>
          ) : null}

          {actionError ? (
            <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
              {actionError}
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Hierarquia Completa</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-sm text-slate-600">Carregando...</div>
          ) : filtered.length === 0 ? (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-10 text-center">
              <div className="text-sm font-semibold text-slate-900">
                Nenhuma categoria encontrada
              </div>
              <div className="mt-2 text-sm text-slate-600">
                Ajuste os filtros para ver os resultados.
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {filtered.map((node) => (
                <CategoryRow
                  key={node.id}
                  node={node}
                  level={0}
                  onEdit={(c) => void openEdit(c)}
                  onToggleActive={(c) => void requestToggleActive(c)}
                  onDelete={(c) => void requestDelete(c)}
                  inUseById={inUseById}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <CategoryUpsertDialog
        open={upsertOpen}
        onOpenChange={setUpsertOpen}
        categories={categories}
        category={editing}
        onCreate={onCreate}
        onUpdate={onUpdate}
      />

      <Dialog
        open={!!confirmToggle}
        onOpenChange={(open) => {
          if (!open) {
            setConfirmToggle(null);
            setToggleError(null);
            setToggleInUse(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {confirmToggle?.active === false ? "Ativar" : "Inativar"} categoria
            </DialogTitle>
          </DialogHeader>

          <div className="text-sm text-slate-700">
            {confirmToggle?.active === false ? "Ativar" : "Inativar"}{" "}
            <span className="font-semibold">{confirmToggle?.name}</span>?
          </div>

          {toggleInUse ? (
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
              Esta categoria possui movimentações financeiras. A exclusão permanente é bloqueada e o histórico será mantido.
            </div>
          ) : null}

          {toggleError ? (
            <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {toggleError}
            </div>
          ) : null}

          <div className="flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setConfirmToggle(null);
                setToggleError(null);
                setToggleInUse(null);
              }}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant={confirmToggle?.active === false ? "default" : "destructive"}
              onClick={() => void onConfirmToggle()}
            >
              Confirmar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!confirmDelete}
        onOpenChange={(open) => {
          if (!open) {
            setConfirmDelete(null);
            setDeleteError(null);
            setDeleteInUse(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Confirmar exclusão</DialogTitle>
          </DialogHeader>

          <div className="text-sm text-slate-700">
            Excluir <span className="font-semibold">{confirmDelete?.name}</span>?
          </div>

          {deleteInUse ? (
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
              Esta categoria possui movimentações financeiras. A exclusão permanente é bloqueada e será realizada apenas a inativação.
            </div>
          ) : null}

          {deleteError ? (
            <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {deleteError}
            </div>
          ) : null}

          <div className="flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setConfirmDelete(null);
                setDeleteError(null);
                setDeleteInUse(null);
              }}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={typeof deleteInUse !== "boolean" && !deleteError}
              onClick={() => void onConfirmDelete()}
            >
              {deleteInUse ? "Inativar" : "Excluir"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

