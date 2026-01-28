export function formatCurrencyBRL(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export function formatDateBR(isoDate: string) {
  const date = new Date(isoDate);
  return new Intl.DateTimeFormat("pt-BR").format(date);
}

