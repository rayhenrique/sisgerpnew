export function parseBRLCurrencyToNumber(input: string) {
  const normalized = input
    .replace(/\s/g, "")
    .replace(/R\$/g, "")
    .replace(/\./g, "")
    .replace(/,/g, ".")
    .replace(/[^0-9.-]/g, "");

  const value = Number(normalized);
  return Number.isFinite(value) ? value : NaN;
}

export function formatBRLCurrencyInput(value: number) {
  if (!Number.isFinite(value)) return "";

  return new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export const MAX_BRL_AMOUNT = 9_999_999_999_999.99;
export const MAX_BRL_CENTS = 999_999_999_999_999;

function formatBRLIntegerPart(value: string) {
  const normalized = value.replace(/^0+(?=\d)/, "");
  const intValue = normalized.length === 0 ? 0 : Number(normalized);
  return new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 0 }).format(intValue);
}

function clampIntegerDigits(value: string, maxDigits: number) {
  const normalized = value.replace(/^0+(?=\d)/, "");
  if (normalized.length <= maxDigits) return normalized;
  return normalized.slice(0, maxDigits);
}

export function formatBRLCurrencyTextFromUserInput(input: string) {
  const cleaned = input.replace(/\s/g, "").replace(/R\$/g, "");
  if (cleaned.length === 0) return "";

  const lastComma = cleaned.lastIndexOf(",");
  const lastDot = cleaned.lastIndexOf(".");
  const sepIndex = Math.max(lastComma, lastDot);

  const digitsOnly = cleaned.replace(/[^\d]/g, "");
  if (digitsOnly.length === 0) return "";

  let integerDigits = digitsOnly;
  let centsDigits = "00";

  if (sepIndex !== -1) {
    const rawAfter = cleaned.slice(sepIndex + 1).replace(/[^\d]/g, "");
    const rawBefore = cleaned.slice(0, sepIndex).replace(/[^\d]/g, "");

    if (rawAfter.length >= 1 && rawAfter.length <= 2) {
      integerDigits = rawBefore.length > 0 ? rawBefore : "0";
      centsDigits = (rawAfter + "00").slice(0, 2);
    }
  }

  integerDigits = clampIntegerDigits(integerDigits, 13);
  const integerFormatted = formatBRLIntegerPart(integerDigits);
  const result = `R$ ${integerFormatted},${centsDigits}`;

  const parsed = parseBRLCurrencyToNumber(result);
  if (Number.isFinite(parsed) && parsed > MAX_BRL_AMOUNT) {
    return `R$ ${formatBRLCurrencyInput(MAX_BRL_AMOUNT)}`;
  }

  return result;
}

function clampCentsDigits(digits: string) {
  const normalized = digits.replace(/^0+(?=\d)/, "");
  const asNumber = normalized.length === 0 ? 0 : Number(normalized);
  if (!Number.isFinite(asNumber)) return String(MAX_BRL_CENTS);
  if (asNumber > MAX_BRL_CENTS) return String(MAX_BRL_CENTS);
  return normalized;
}

export function formatBRLCurrencyTextFromCentsInput(input: string) {
  const digitsRaw = input.replace(/[^\d]/g, "");
  if (digitsRaw.length === 0) return "";

  const digits = clampCentsDigits(digitsRaw);
  const padded = digits.padStart(3, "0");
  const cents = padded.slice(-2);
  const integerDigits = padded.slice(0, -2);
  const integerFormatted = formatBRLIntegerPart(integerDigits);
  return `R$ ${integerFormatted},${cents}`;
}

