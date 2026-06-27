import { z } from "zod";

const isoDate = z
  .string()
  .min(10)
  .max(10)
  .refine((v) => /^\d{4}-\d{2}-\d{2}$/.test(v), "Data inválida")
  .transform((v) => v);

export const reportFormatSchema = z.enum(["PDF", "XLSX", "CSV"]);

const categoryLevelSchema = z.enum(["fonte", "bloco", "grupo", "acao"]);

export const createReportJobSchema = z
  .object({
    reportKey: z.string().min(1),
    category: z.string().min(1),
    periodStart: isoDate,
    periodEnd: isoDate,
    format: reportFormatSchema,
    categoryId: z.string().nullable().optional(),
    useCache: z.boolean().default(true),
    levels: z.array(categoryLevelSchema).optional(),
  })
  .refine(
    (v) => v.periodStart <= v.periodEnd,
    "periodStart deve ser menor ou igual a periodEnd"
  );

export const listJobsQuerySchema = z.object({
  limit: z
    .string()
    .optional()
    .transform((v) => (v ? Number(v) : 20))
    .refine((n) => Number.isFinite(n) && n > 0 && n <= 100),
});

export const scheduleSchema = z.object({
  name: z.string().min(2).max(80),
  reportKey: z.string().min(1),
  category: z.string().min(1),
  format: reportFormatSchema,
  useCache: z.boolean().default(true),
  categoryId: z.string().nullable().optional(),
  periodWindow: z.enum(["last7d", "last30d", "monthToDate", "yearToDate"]),
  recurrence: z.enum(["daily", "weekly", "monthly"]),
  time: z
    .string()
    .refine((v) => /^\d{2}:\d{2}$/.test(v), "Hora inválida")
    .refine((v) => {
      const [hh, mm] = v.split(":").map(Number);
      return hh >= 0 && hh <= 23 && mm >= 0 && mm <= 59;
    }, "Hora inválida"),
  weekday: z.number().int().min(0).max(6).optional(),
  dayOfMonth: z.number().int().min(1).max(28).optional(),
});

export function parseBody<T extends z.ZodTypeAny>(schema: T, body: unknown) {
  const res = schema.safeParse(body);
  if (!res.success) {
    const msg = res.error.issues[0]?.message ?? "Payload inválido";
    throw new Error(msg);
  }
  return res.data as z.infer<T>;
}

