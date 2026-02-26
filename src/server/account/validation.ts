import { z } from "zod";

export const ChangeMyPasswordBodySchema = z.object({
  currentPassword: z.string().min(1, "Informe sua senha atual").max(200),
  newPassword: z
    .string()
    .min(8, "A senha deve ter pelo menos 8 caracteres")
    .max(200)
    .regex(/[a-z]/, "A senha deve conter ao menos uma letra minúscula")
    .regex(/[A-Z]/, "A senha deve conter ao menos uma letra maiúscula")
    .regex(/\d/, "A senha deve conter ao menos um número")
    .regex(/[^A-Za-z0-9]/, "A senha deve conter ao menos um caractere especial"),
});
