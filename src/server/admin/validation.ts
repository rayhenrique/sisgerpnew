import { z } from "zod";

export const RoleSchema = z.enum(["operator", "admin", "superadmin"]);

export const StatusSchema = z.enum(["active", "disabled"]);

export const ListUsersQuerySchema = z.object({
  search: z.string().trim().optional(),
  role: RoleSchema.optional(),
  status: StatusSchema.optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(10),
});

export const CreateUserBodySchema = z.object({
  email: z.string().trim().email(),
  name: z.string().trim().min(2).max(120).optional(),
  role: RoleSchema.default("operator"),
  password: z.string().min(6).max(200),
});

export const UpdateUserBodySchema = z
  .object({
    name: z.string().trim().min(2).max(120).optional(),
    role: RoleSchema.optional(),
    status: StatusSchema.optional(),
    currentPassword: z.string().min(1).max(200).optional(),
    newPassword: z
      .string()
      .min(8)
      .max(200)
      .regex(/[a-z]/, "A senha deve conter ao menos uma letra minúscula")
      .regex(/[A-Z]/, "A senha deve conter ao menos uma letra maiúscula")
      .regex(/\d/, "A senha deve conter ao menos um número")
      .regex(/[^A-Za-z0-9]/, "A senha deve conter ao menos um caractere especial")
      .optional(),
  })
  .refine(
    (v) => {
      const hasAny =
        typeof v.name === "string" ||
        typeof v.role === "string" ||
        typeof v.status === "string" ||
        typeof v.newPassword === "string";
      return hasAny;
    },
    { message: "Informe ao menos um campo" }
  )
  .refine(
    (v) => {
      if (typeof v.newPassword === "string") return typeof v.currentPassword === "string";
      return true;
    },
    { message: "Informe sua senha atual para alterar a senha", path: ["currentPassword"] }
  );

