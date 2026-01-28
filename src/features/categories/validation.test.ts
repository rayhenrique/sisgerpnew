import { describe, expect, it } from "vitest";

import { formatCategoryDuplicateError, validateCategoryUniqueness } from "./validation";

describe("validateCategoryUniqueness", () => {
  it("detecta nome duplicado (case-insensitive)", () => {
    const res = validateCategoryUniqueness({
      categories: [
        { id: "1", name: "Fonte A", type: "fonte", parent_id: null, code: null },
      ],
      name: "fonte a",
      code: null,
    });
    expect(res.name).toBeTruthy();
    expect(res.code).toBeNull();
  });

  it("detecta código duplicado (case-insensitive)", () => {
    const res = validateCategoryUniqueness({
      categories: [
        { id: "1", name: "Fonte A", type: "fonte", parent_id: null, code: "ABC" },
      ],
      name: "Outra",
      code: "abc",
    });
    expect(res.name).toBeNull();
    expect(res.code).toBeTruthy();
  });

  it("permite atualizar mantendo o mesmo nome/código no próprio registro", () => {
    const res = validateCategoryUniqueness({
      categories: [
        { id: "1", name: "Fonte A", type: "fonte", parent_id: null, code: "ABC" },
      ],
      idToIgnore: "1",
      name: "Fonte A",
      code: "ABC",
    });
    expect(res.name).toBeNull();
    expect(res.code).toBeNull();
  });
});

describe("formatCategoryDuplicateError", () => {
  it("mapeia erro de duplicidade por nome", () => {
    const e = Object.assign(new Error("duplicate key"), { code: "23505", details: "categories_name_ci_unique" });
    expect(formatCategoryDuplicateError(e)).toContain("mesmo nome");
  });

  it("mapeia erro de duplicidade por código", () => {
    const e = Object.assign(new Error("duplicate key"), { code: "23505", details: "categories_code_ci_unique" });
    expect(formatCategoryDuplicateError(e)).toContain("mesmo código");
  });
});

