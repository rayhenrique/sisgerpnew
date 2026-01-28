import { NextRequest, NextResponse } from "next/server";

import { disableUser, getActorFromRequest, updateUser } from "@/server/admin/usersService";
import { UpdateUserBodySchema } from "@/server/admin/validation";

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const actor = await getActorFromRequest(req);
  if (!actor) return NextResponse.json({ message: "Não autenticado" }, { status: 401 });

  const { id } = await ctx.params;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ message: "JSON inválido" }, { status: 400 });
  }

  const parsed = UpdateUserBodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { message: "Dados inválidos", issues: parsed.error.issues },
      { status: 400 }
    );
  }

  try {
    const user = await updateUser({ actor, targetId: id, ...parsed.data });
    return NextResponse.json(user);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Erro";
    const status =
      message === "Sem permissão" || message.includes("Sem permissão")
        ? 403
        : message === "Senha atual inválida"
          ? 403
          : message === "Informe sua senha atual" || message.includes("Informe sua senha atual")
            ? 400
            : 500;
    return NextResponse.json({ message }, { status });
  }
}

export async function DELETE(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const actor = await getActorFromRequest(req);
  if (!actor) return NextResponse.json({ message: "Não autenticado" }, { status: 401 });

  const { id } = await ctx.params;

  try {
    await disableUser({ actor, targetId: id });
    return new NextResponse(null, { status: 204 });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Erro";
    const status =
      message === "Sem permissão" || message.includes("Sem permissão") ? 403 : 500;
    return NextResponse.json({ message }, { status });
  }
}

