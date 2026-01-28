export function formatDateBR(iso: string) {
  const d = new Date(iso);
  return new Intl.DateTimeFormat("pt-BR").format(d);
}

