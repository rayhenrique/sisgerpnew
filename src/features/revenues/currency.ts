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

