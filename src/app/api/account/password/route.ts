import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

import { getActorFromRequest } from "@/server/admin/usersService";
import { ChangeMyPasswordBodySchema } from "@/server/account/validation";
import { getSupabaseServiceRoleClient } from "@/lib/supabase/server";

export async function PATCH(req: Request) {
  const actor = await getActorFromRequest(req);
  if (!actor) return NextResponse.json({ message: "Não autenticado" }, { status: 401 });
  if (!actor.active) return NextResponse.json({ message: "Usuário inativo" }, { status: 403 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ message: "JSON inválido" }, { status: 400 });
  }

  const parsed = ChangeMyPasswordBodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { message: "Dados inválidos", issues: parsed.error.issues },
      { status: 400 }
    );
  }

  if (!actor.email) {
    return NextResponse.json(
      { message: "Email do usuário autenticado não encontrado" },
      { status: 400 }
    );
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    return NextResponse.json({ message: "Supabase não configurado" }, { status: 500 });
  }

  const reauth = createClient(url, anonKey, { auth: { persistSession: false } });
  const { error: signInErr } = await reauth.auth.signInWithPassword({
    email: actor.email,
    password: parsed.data.currentPassword,
  });
  if (signInErr) {
    return NextResponse.json({ message: "Senha atual inválida" }, { status: 403 });
  }

  const service = getSupabaseServiceRoleClient();
  if (!service) {
    return NextResponse.json(
      { message: "SUPABASE_SERVICE_ROLE_KEY não configurado" },
      { status: 500 }
    );
  }

  const { error: authPwdErr } = await service.auth.admin.updateUserById(actor.id, {
    password: parsed.data.newPassword,
  });
  if (authPwdErr) {
    return NextResponse.json({ message: authPwdErr.message }, { status: 500 });
  }

  return new NextResponse(null, { status: 204 });
}
