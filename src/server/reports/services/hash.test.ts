import { describe, expect, it } from "vitest";

import { sha256Hex, stableJson } from "./hash";

describe("stableJson", () => {
  it("ordena chaves de objeto", () => {
    const a = stableJson({ b: 1, a: 2 });
    const b = stableJson({ a: 2, b: 1 });
    expect(a).toEqual(b);
  });

  it("serializa arrays de forma estável", () => {
    expect(stableJson([1, "a", true, null])).toEqual("[1,\"a\",true,null]");
  });
});

describe("sha256Hex", () => {
  it("gera hash hex de 64 chars", () => {
    const h = sha256Hex("abc");
    expect(h).toMatch(/^[0-9a-f]{64}$/);
  });
});

