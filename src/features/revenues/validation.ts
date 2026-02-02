import { z } from "zod";

import {
  formatBRLCurrencyInput,
  MAX_BRL_AMOUNT,
  parseBRLCurrencyToNumber,
} from "@/features/revenues/currency";

export const MAX_AMOUNT_LABEL = `R$ ${formatBRLCurrencyInput(MAX_BRL_AMOUNT)}`;

export const revenueUpsertSchema = z.object({
  description: z.string().trim().min(2, "Informe a descrição"),
  amountText: z
    .string()
    .trim()
    .min(1, "Informe o valor")
    .refine((v) => {
      const parsed = parseBRLCurrencyToNumber(v);
      return Number.isFinite(parsed) && parsed > 0;
    }, "Valor inválido")
    .refine((v) => {
      const parsed = parseBRLCurrencyToNumber(v);
      return Number.isFinite(parsed) && parsed <= MAX_BRL_AMOUNT;
    }, `Valor máximo é ${MAX_AMOUNT_LABEL}`),
  date: z
    .string()
    .min(1, "Informe a data")
    .refine((v) => /^\d{4}-\d{2}-\d{2}$/.test(v), "Data inválida"),
  fonteId: z.string().min(1, "Selecione a fonte"),
  blocoId: z.string().min(1, "Selecione o bloco"),
  grupoId: z.string().min(1, "Selecione o grupo"),
  acaoId: z.string().min(1, "Selecione a ação"),
});

export type RevenueUpsertFormValues = z.infer<typeof revenueUpsertSchema>;

