"use client";

import * as React from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Check, Loader2 } from "lucide-react";

import { useMyProfile } from "@/features/adminUsers/useMyProfile";
import { changeMyPassword } from "@/features/account/api";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

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

function roleLabel(role: "operator" | "admin" | "superadmin") {
  if (role === "superadmin") return "Superadmin";
  if (role === "admin") return "Admin";
  return "Operador";
}

export function AccountPageClient() {
  const { loading, profile, error: profileError } = useMyProfile();
  const [submitError, setSubmitError] = React.useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = React.useState<string | null>(null);

  const form = useForm<z.infer<typeof passwordChangeSchema>>({
    resolver: zodResolver(passwordChangeSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      newPasswordConfirm: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof passwordChangeSchema>) => {
    setSubmitError(null);
    setSubmitSuccess(null);

    try {
      await changeMyPassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });

      form.reset({
        currentPassword: "",
        newPassword: "",
        newPasswordConfirm: "",
      });
      setSubmitSuccess("Senha alterada com sucesso.");
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : "Erro ao alterar senha");
    }
  };

  if (loading) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
        Carregando...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {profileError ? (
        <Card className="border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          {profileError}
        </Card>
      ) : null}

      <Card className="border border-slate-200 bg-white p-6">
        <h2 className="text-base font-semibold text-slate-900">Dados da conta</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div>
            <div className="text-xs text-slate-500">Nome</div>
            <div className="text-sm font-medium text-slate-900">
              {profile?.name ?? "Não informado"}
            </div>
          </div>
          <div>
            <div className="text-xs text-slate-500">Email</div>
            <div className="text-sm font-medium text-slate-900">
              {profile?.email ?? "Não informado"}
            </div>
          </div>
          <div>
            <div className="text-xs text-slate-500">Papel</div>
            <div className="text-sm font-medium text-slate-900">
              {profile ? roleLabel(profile.role) : "-"}
            </div>
          </div>
        </div>
      </Card>

      {submitSuccess ? (
        <Card className="border-green-200 bg-green-50 p-4 text-sm text-green-700">
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4" />
            <span>{submitSuccess}</span>
          </div>
        </Card>
      ) : null}

      {submitError ? (
        <Card className="border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          {submitError}
        </Card>
      ) : null}

      <Card className="border border-slate-200 bg-white p-6">
        <h2 className="text-base font-semibold text-slate-900">Trocar senha</h2>
        <p className="mt-1 text-sm text-slate-600">
          Informe sua senha atual e defina uma nova senha segura.
        </p>

        <form className="mt-5 space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Senha atual</Label>
            <Input id="currentPassword" type="password" {...form.register("currentPassword")} />
            {form.formState.errors.currentPassword ? (
              <div className="text-xs text-rose-700">
                {form.formState.errors.currentPassword.message}
              </div>
            ) : null}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="newPassword">Nova senha</Label>
              <Input id="newPassword" type="password" {...form.register("newPassword")} />
              {form.formState.errors.newPassword ? (
                <div className="text-xs text-rose-700">
                  {form.formState.errors.newPassword.message}
                </div>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPasswordConfirm">Confirmar nova senha</Label>
              <Input
                id="newPasswordConfirm"
                type="password"
                {...form.register("newPasswordConfirm")}
              />
              {form.formState.errors.newPasswordConfirm ? (
                <div className="text-xs text-rose-700">
                  {form.formState.errors.newPasswordConfirm.message}
                </div>
              ) : null}
            </div>
          </div>

          <div className="flex justify-end border-t border-slate-200 pt-4">
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                "Salvar nova senha"
              )}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
