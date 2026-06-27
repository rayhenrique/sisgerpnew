import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

import type { TransactionRow, SummaryByCategoryRow } from "@/server/reports/services/reportData";
import type { BalanceByCategoryLevelRow } from "@/server/reports/models/types";

function formatMoney(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

const LEVEL_LABEL: Record<string, string> = {
  fonte: "Fonte",
  bloco: "Bloco",
  grupo: "Grupo",
  acao: "Ação",
};

async function renderSimpleTable(input: {
  title: string;
  subtitle: string;
  columns: string[];
  rows: string[][];
}) {
  const pdf = await PDFDocument.create();
  const page = pdf.addPage([595.28, 841.89]);
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdf.embedFont(StandardFonts.HelveticaBold);

  const margin = 48;
  const lineH = 14;
  let y = page.getHeight() - margin;

  page.drawText(input.title, { x: margin, y, size: 16, font: fontBold, color: rgb(0.07, 0.09, 0.13) });
  y -= 20;
  page.drawText(input.subtitle, { x: margin, y, size: 10, font, color: rgb(0.4, 0.45, 0.55) });
  y -= 24;

  const colText = input.columns.join("  |  ");
  page.drawText(colText, { x: margin, y, size: 10, font: fontBold, color: rgb(0.07, 0.09, 0.13) });
  y -= 12;
  page.drawLine({ start: { x: margin, y }, end: { x: page.getWidth() - margin, y }, thickness: 1, color: rgb(0.9, 0.91, 0.93) });
  y -= 10;

  for (const row of input.rows.slice(0, 45)) {
    const text = row.join("  |  ");
    page.drawText(text, { x: margin, y, size: 9, font, color: rgb(0.07, 0.09, 0.13) });
    y -= lineH;
    if (y <= margin + 20) break;
  }

  const bytes = await pdf.save();
  return new Uint8Array(bytes);
}

export async function renderTransactionsPdf(input: {
  rows: TransactionRow[];
  periodStart: string;
  periodEnd: string;
}) {
  return renderSimpleTable({
    title: "Relatório: Transações",
    subtitle: `Período: ${input.periodStart} a ${input.periodEnd}`,
    columns: ["Data", "Tipo", "Categoria", "Valor"],
    rows: input.rows.map((r) => [
      r.date,
      r.type,
      r.categoryName ?? "",
      formatMoney(r.amount),
    ]),
  });
}

export async function renderSummaryByCategoryPdf(input: {
  rows: SummaryByCategoryRow[];
  periodStart: string;
  periodEnd: string;
}) {
  return renderSimpleTable({
    title: "Relatório: Resumo por Categoria",
    subtitle: `Período: ${input.periodStart} a ${input.periodEnd}`,
    columns: ["Categoria", "Receitas", "Despesas", "Saldo"],
    rows: input.rows.map((r) => [
      r.categoryName,
      formatMoney(r.receitas),
      formatMoney(r.despesas),
      formatMoney(r.total),
    ]),
  });
}

export async function renderBalanceByCategoryLevelPdf(input: {
  rows: BalanceByCategoryLevelRow[];
  periodStart?: string | null;
  periodEnd?: string | null;
}) {
  const subtitle =
    input.periodStart && input.periodEnd
      ? `Período: ${input.periodStart} a ${input.periodEnd}`
      : "Saldo acumulado (todos os períodos)";

  return renderSimpleTable({
    title: "Relatório: Saldo por Nível de Categoria",
    subtitle,
    columns: ["Nível", "Categoria", "Receitas", "Despesas", "Saldo"],
    rows: input.rows.map((r) => [
      LEVEL_LABEL[r.level] ?? r.level,
      r.categoryName,
      formatMoney(r.receitas),
      formatMoney(r.despesas),
      formatMoney(r.saldo),
    ]),
  });
}
