import { formatDateBR as formatDateBRLib } from "@/lib/dates";

export function formatCurrencyBRL(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export function formatDateBR(isoDate: string) {
  return formatDateBRLib(isoDate);
}

