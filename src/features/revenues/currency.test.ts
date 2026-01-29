import { describe, expect, it } from "vitest";

import {
  formatBRLCurrencyTextFromCentsInput,
  MAX_BRL_AMOUNT,
  parseBRLCurrencyToNumber,
} from "./currency";

describe("formatBRLCurrencyTextFromCentsInput", () => {
  it("trata os 2 últimos dígitos como centavos", () => {
    expect(formatBRLCurrencyTextFromCentsInput("1")).toBe("R$ 0,01");
    expect(formatBRLCurrencyTextFromCentsInput("10")).toBe("R$ 0,10");
    expect(formatBRLCurrencyTextFromCentsInput("100")).toBe("R$ 1,00");
  });

  it("formata milhares e milhões", () => {
    expect(formatBRLCurrencyTextFromCentsInput("1000")).toBe("R$ 10,00");
    expect(formatBRLCurrencyTextFromCentsInput("100000000")).toBe("R$ 1.000.000,00");
  });

  it("ignora caracteres não numéricos (paste/typing)", () => {
    expect(formatBRLCurrencyTextFromCentsInput("abcR$ 1x2y")).toBe("R$ 0,12");
    expect(formatBRLCurrencyTextFromCentsInput("R$ 1.000.000,00")).toBe(
      "R$ 1.000.000,00"
    );
  });

  it("clampa ao valor máximo", () => {
    const over = formatBRLCurrencyTextFromCentsInput("999999999999999999");
    const parsed = parseBRLCurrencyToNumber(over);
    expect(parsed).toBeLessThanOrEqual(MAX_BRL_AMOUNT);
  });
});

describe("parseBRLCurrencyToNumber", () => {
  it("interpreta valor formatado com R$", () => {
    expect(parseBRLCurrencyToNumber("R$ 1.000.000,00")).toBe(1_000_000);
    expect(parseBRLCurrencyToNumber("R$ 12,34")).toBe(12.34);
  });
});

