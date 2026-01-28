"use client";

import * as React from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import type { Role, UserSummary, UserStatus } from "@/features/adminUsers/types";
import { canSetRole, roleRank } from "@/features/adminUsers/rbac";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

type Mode = "create" | "edit";

const createSchema = z
  .object({
    email: z.string().trim().email("Email inválido"),
    name: z.string().trim().min(2, "Informe o nome").max(120),
    role: z.enum(["operator", "admin", "superadmin"]),
    password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
    passwordConfirm: z.string(),
  })
  .refine((v) => v.password === v.passwordConfirm, {
    message: "As senhas não conferem",
    path: ["passwordConfirm"],
  });

const editSchema = z.object({
  name: z.string().trim().min(2, "Informe o nome").max(120),
  role: z.enum(["operator", "admin", "superadmin"]),
  status: z.enum(["active", "disabled"]),
});

const passwordChangeSchema = z
  .object({
    currentPassword: z.string().min(1, "Informe sua senha atual").max(200),
    newPassword: z
      .string()
      .min(8, "A senha deve ter pelo menos 8 caracteres")
      .max(200)
      .regex(/[a-z]/, "A senha deve conter ao menos uma letra minúscula")
      .regex(/[A-Z]/, "A senha deve conter ao menos uma letra maiúscula")
      .regex(/\d/, "A senha deve conter ao menos um número")
      .regex(/[^A-Za-z0-9]/, "A senha deve conter ao menos um caractere especial"),
    newPasswordConfirm: z.string(),
  })
  .refine((v) => v.newPassword === v.newPasswordConfirm, {
    message: "As senhas não conferem",
    path: ["newPasswordConfirm"],
  });

export function UserUpsertDialog({
  open,
  onOpenChange,
  actorRole,
  user,
  onCreate,
  onUpdate,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  actorRole: Role;
  user?: UserSummary | null;
  onCreate: (payload: { email: string; name: string; role: Role; password: string }) => Promise<void>;
  onUpdate: (payload: {
    id: string;
    name: string;
    role: Role;
    status: UserStatus;
    passwordChange?: { currentPassword: string; newPassword: string };
  }) => Promise<void>;
}) {
  const mode: Mode = user?.id ? "edit" : "create";
  const canWrite = roleRank(actorRole) >= 2;
  const readOnly =
    mode === "edit" &&
    (!canWrite || (user?.role ? (actorRole !== "superadmin" && roleRank(actorRole) <= roleRank(user.role)) : false));

  const createForm = useForm<z.infer<typeof createSchema>>({
    resolver: zodResolver(createSchema),
    defaultValues: {
      email: "",
      name: "",
      role: "operator",
      password: "",
      passwordConfirm: "",
    },
  });

  const editForm = useForm<z.infer<typeof editSchema>>({
    resolver: zodResolver(editSchema),
    defaultValues: {
      name: user?.name ?? "",
      role: user?.role ?? "operator",
      status: user?.status ?? "active",
    },
  });

  const [changePassword, setChangePassword] = React.useState(false);

  const passwordForm = useForm<z.infer<typeof passwordChangeSchema>>({
    resolver: zodResolver(passwordChangeSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      newPasswordConfirm: "",
    },
  });

  React.useEffect(() => {
    if (!open) return;
    setChangePassword(false);
    passwordForm.reset({
      currentPassword: "",
      newPassword: "",
      newPasswordConfirm: "",
    });
    if (mode === "create") {
      createForm.reset({
        email: "",
        name: "",
        role: "operator",
        password: "",
        passwordConfirm: "",
      });
    } else {
      editForm.reset({
        name: user?.name ?? "",
        role: user?.role ?? "operator",
        status: user?.status ?? "active",
      });
    }
  }, [createForm, editForm, mode, open, passwordForm, user?.id, user?.name, user?.role, user?.status]);

  const [submitError, setSubmitError] = React.useState<string | null>(null);

  const allRoles: Role[] = ["operator", "admin", "superadmin"];
  const allowedRoles: Role[] = allRoles.filter((r) => canSetRole(actorRole, r));

  const roleOptions = (() => {
    const base = allowedRoles.slice();
    if (mode === "edit" && user?.role && !base.includes(user.role)) {
      base.unshift(user.role);
    }
    return base;
  })();

  const submitCreate = async (values: z.infer<typeof createSchema>) => {
    setSubmitError(null);
    try {
      await onCreate({
        email: values.email,
        name: values.name,
        role: values.role as Role,
        password: values.password,
      });
      onOpenChange(false);
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : "Erro ao criar usuário");
    }
  };

  const submitEdit = async (values: z.infer<typeof editSchema>) => {
    if (!user?.id) return;
    setSubmitError(null);
    try {
      let passwordChange: { currentPassword: string; newPassword: string } | undefined;
      if (changePassword) {
        const ok = await passwordForm.trigger();
        if (!ok) return;
        const v = passwordForm.getValues();
        passwordChange = { currentPassword: v.currentPassword, newPassword: v.newPassword };
      }
      await onUpdate({
        id: user.id,
        name: values.name,
        role: values.role as Role,
        status: values.status as UserStatus,
        passwordChange,
      });
      onOpenChange(false);
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : "Erro ao atualizar usuário");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Novo usuário" : "Editar usuário"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Crie um usuário com papel e credenciais iniciais."
              : "Atualize dados, papel e status do usuário."}
          </DialogDescription>
        </DialogHeader>

        {submitError ? (
          <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {submitError}
          </div>
        ) : null}

        {mode === "create" ? (
          <form className="space-y-4" onSubmit={createForm.handleSubmit(submitCreate)}>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1 sm:col-span-2">
                <div className="text-sm font-medium text-slate-900">Email</div>
                <Input placeholder="email@dominio.com" {...createForm.register("email")} />
                {createForm.formState.errors.email ? (
                  <div className="text-xs text-rose-700">{createForm.formState.errors.email.message}</div>
                ) : null}
              </div>

              <div className="space-y-1 sm:col-span-2">
                <div className="text-sm font-medium text-slate-900">Nome</div>
                <Input placeholder="Nome do usuário" {...createForm.register("name")} />
                {createForm.formState.errors.name ? (
                  <div className="text-xs text-rose-700">{createForm.formState.errors.name.message}</div>
                ) : null}
              </div>

              <div className="space-y-1">
                <div className="text-sm font-medium text-slate-900">Papel</div>
                <select
                  className="h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm"
                  {...createForm.register("role")}
                >
                  {roleOptions.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1" />

              <div className="space-y-1">
                <div className="text-sm font-medium text-slate-900">Senha</div>
                <Input type="password" {...createForm.register("password")} />
                {createForm.formState.errors.password ? (
                  <div className="text-xs text-rose-700">{createForm.formState.errors.password.message}</div>
                ) : null}
              </div>

              <div className="space-y-1">
                <div className="text-sm font-medium text-slate-900">Confirmar senha</div>
                <Input type="password" {...createForm.register("passwordConfirm")} />
                {createForm.formState.errors.passwordConfirm ? (
                  <div className="text-xs text-rose-700">{createForm.formState.errors.passwordConfirm.message}</div>
                ) : null}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2">
              <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={createForm.formState.isSubmitting}>
                Salvar
              </Button>
            </div>
          </form>
        ) : (
          <form className="space-y-4" onSubmit={editForm.handleSubmit(submitEdit)}>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1 sm:col-span-2">
                <div className="text-sm font-medium text-slate-900">Email</div>
                <Input value={user?.email ?? ""} disabled />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <div className="text-sm font-medium text-slate-900">Nome</div>
                <Input placeholder="Nome do usuário" disabled={readOnly} {...editForm.register("name")} />
                {editForm.formState.errors.name ? (
                  <div className="text-xs text-rose-700">{editForm.formState.errors.name.message}</div>
                ) : null}
              </div>

              <div className="space-y-1">
                <div className="text-sm font-medium text-slate-900">Papel</div>
                <select
                  className="h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm"
                  disabled={readOnly}
                  {...editForm.register("role")}
                >
                  {roleOptions.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <div className="text-sm font-medium text-slate-900">Status</div>
                <select
                  className="h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm"
                  disabled={readOnly}
                  {...editForm.register("status")}
                >
                  <option value="active">active</option>
                  <option value="disabled">disabled</option>
                </select>
              </div>
            </div>

            {!readOnly ? (
              <div className="rounded-lg border border-slate-200 bg-white p-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-sm font-medium text-slate-900">Senha</div>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setChangePassword((v) => !v)}
                  >
                    {changePassword ? "Cancelar alteração" : "Alterar senha"}
                  </Button>
                </div>

                {changePassword ? (
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <div className="space-y-1 sm:col-span-2">
                      <div className="text-sm font-medium text-slate-900">Sua senha atual</div>
                      <Input type="password" {...passwordForm.register("currentPassword")} />
                      {passwordForm.formState.errors.currentPassword ? (
                        <div className="text-xs text-rose-700">
                          {passwordForm.formState.errors.currentPassword.message}
                        </div>
                      ) : null}
                    </div>

                    <div className="space-y-1">
                      <div className="text-sm font-medium text-slate-900">Nova senha</div>
                      <Input type="password" {...passwordForm.register("newPassword")} />
                      {passwordForm.formState.errors.newPassword ? (
                        <div className="text-xs text-rose-700">
                          {passwordForm.formState.errors.newPassword.message}
                        </div>
                      ) : null}
                    </div>

                    <div className="space-y-1">
                      <div className="text-sm font-medium text-slate-900">Confirmar nova senha</div>
                      <Input type="password" {...passwordForm.register("newPasswordConfirm")} />
                      {passwordForm.formState.errors.newPasswordConfirm ? (
                        <div className="text-xs text-rose-700">
                          {passwordForm.formState.errors.newPasswordConfirm.message}
                        </div>
                      ) : null}
                    </div>
                  </div>
                ) : null}
              </div>
            ) : null}

            <div className="flex items-center justify-end gap-2">
              <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              {!readOnly ? (
                <Button type="submit" disabled={editForm.formState.isSubmitting}>
                  Salvar
                </Button>
              ) : null}
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

