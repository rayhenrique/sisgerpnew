"use client";

import * as React from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Building2,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

const schema = z.object({
  email: z.string().trim().min(1, "Informe o email").email("Email inválido"),
  password: z
    .string()
    .min(6, "A senha deve ter pelo menos 6 caracteres"),
  keepSignedIn: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

function BottomWave() {
  return (
    <svg
      className="pointer-events-none absolute -bottom-px left-0 block h-28 w-full fill-white/10"
      viewBox="0 0 1440 120"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path d="M0,64 C240,96 420,112 720,96 C1020,80 1200,48 1440,64 L1440,120 L0,120 Z" />
    </svg>
  );
}

export function LoginPageClient() {
  const router = useRouter();
  const [showPassword, setShowPassword] = React.useState(false);
  const [authError, setAuthError] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: "",
      password: "",
      keepSignedIn: true,
    },
  });

  const keepSignedIn = watch("keepSignedIn");

  const onSubmit = async (values: FormValues) => {
    setAuthError(null);
    const supabase = getSupabaseBrowserClient({
      persistSession: values.keepSignedIn,
    });
    if (!supabase) {
      setAuthError(
        "Supabase não configurado. Defina NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY."
      );
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email: values.email,
      password: values.password,
    });

    if (error) {
      setAuthError("Email ou senha inválidos.");
      return;
    }

    router.push("/dashboard");
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#1d4ed8] via-[#2563eb] to-[#3b82f6]">
      <BottomWave />

      <div className="absolute left-0 top-0 h-full w-full">
        <div className="absolute -left-40 -top-40 h-[520px] w-[520px] rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-56 -right-40 h-[620px] w-[620px] rounded-full bg-white/10 blur-3xl" />
      </div>

      <div className="relative mx-auto flex min-h-screen max-w-7xl flex-col px-4 py-6 md:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            asChild
            className="text-white transition-transform duration-200 hover:scale-[1.03] hover:bg-white/10"
          >
            <Link href="/">
              <ArrowLeft className="h-4 w-4" />
              Voltar para Home
            </Link>
          </Button>
        </div>

        <div className="flex flex-1 items-center justify-center py-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="w-full max-w-md"
          >
            <Card className="rounded-2xl border border-white/25 bg-white/95 p-6 shadow-2xl shadow-blue-950/30 backdrop-blur-sm">
              <div className="text-center">
                <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-blue-50">
                  <Building2 className="h-8 w-8 text-blue-600" />
                </div>
                <h1 className="mt-4 text-2xl font-bold text-slate-900">
                  Bem-vindo de volta
                </h1>
                <p className="mt-1 text-sm text-slate-500">
                  Sistema de Gestão de Contas Públicas
                </p>
              </div>

              <form
                className="mt-6 space-y-4"
                onSubmit={handleSubmit(onSubmit)}
              >
                <div className="space-y-2">
                  <Label htmlFor="email">Email Institucional</Label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="seu.email@orgao.gov.br"
                      className="pl-9 focus-visible:ring-blue-600"
                      {...register("email")}
                    />
                  </div>
                  {errors.email ? (
                    <div className="text-xs text-rose-700">
                      {errors.email.message}
                    </div>
                  ) : null}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Senha</Label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className="pl-9 pr-10 focus-visible:ring-blue-600"
                      {...register("password")}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                      aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {errors.password ? (
                    <div className="text-xs text-rose-700">
                      {errors.password.message}
                    </div>
                  ) : null}
                </div>

                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="keepSignedIn"
                      checked={keepSignedIn}
                      onCheckedChange={(checked) =>
                        setValue("keepSignedIn", checked === true)
                      }
                    />
                    <Label
                      htmlFor="keepSignedIn"
                      className="text-sm text-slate-700"
                    >
                      Manter conectado
                    </Label>
                  </div>

                  <a
                    href="#"
                    className="text-sm font-medium text-blue-700 hover:underline"
                  >
                    Esqueceu sua senha?
                  </a>
                </div>

                {authError ? (
                  <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                    {authError}
                  </div>
                ) : null}

                <Button
                  type="submit"
                  size="lg"
                  className="w-full bg-blue-600 text-white hover:bg-blue-700 transition-transform duration-200 hover:scale-[1.02]"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Acessando...
                    </>
                  ) : (
                    "Acessar Sistema"
                  )}
                </Button>

                <div className="pt-2 text-center text-xs text-slate-400">
                  <div>
                    Sistema em conformidade com a Lei de Responsabilidade Fiscal
                  </div>
                  <div className="mt-2">© 2026 SISGERP</div>
                </div>
              </form>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

