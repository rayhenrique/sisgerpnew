import type { Category } from "@/features/categories/types";

function normalizeText(value: string) {
  return value.trim().toLocaleLowerCase("pt-BR");
}

export function validateCategoryUniqueness(input: {
  categories: Category[];
  idToIgnore?: string | null;
  name: string;
  code: string | null;
}) {
  const normalizedName = normalizeText(input.name);
  const normalizedCode = input.code ? normalizeText(input.code) : null;
  const filtered = input.categories.filter((c) => c.id !== input.idToIgnore);

  const nameConflict = filtered.find(
    (c) => normalizeText(c.name) === normalizedName
  );

  const codeConflict =
    normalizedCode === null
      ? null
      : filtered.find(
          (c) => (c.code ? normalizeText(c.code) : null) === normalizedCode
        );

  return {
    name: nameConflict ? "Já existe uma categoria com o mesmo nome" : null,
    code: codeConflict ? "Já existe uma categoria com o mesmo código" : null,
  };
}

export function formatCategoryDuplicateError(e: unknown) {
  const msg = e instanceof Error ? e.message : "Erro ao salvar categoria";
  const anyErr = e as unknown as { code?: string; details?: string | null; hint?: string | null };
  const code = anyErr?.code;
  const full = [msg, anyErr?.details ?? "", anyErr?.hint ?? ""].join(" ");

  if (code === "23505" || msg.toLowerCase().includes("duplicate") || msg.toLowerCase().includes("duplic")) {
    if (full.includes("categories_name_ci_unique") || full.toLowerCase().includes("lower(name)")) {
      return "Já existe uma categoria com o mesmo nome";
    }
    if (full.includes("categories_code_ci_unique") || full.toLowerCase().includes("lower(code)")) {
      return "Já existe uma categoria com o mesmo código";
    }
    return "Já existe uma categoria com o mesmo nome ou código";
  }

  return msg;
}

