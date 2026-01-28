import { NextResponse } from "next/server";

import { getActorFromRequest, listUsers, createUser } from "@/server/admin/usersService";
import { CreateUserBodySchema, ListUsersQuerySchema } from "@/server/admin/validation";

export async function GET(req: Request) {
  const actor = await getActorFromRequest(req);
  if (!actor) return NextResponse.json({ message: "Não autenticado" }, { status: 401 });

  const url = new URL(req.url);
  const parsed = ListUsersQuerySchema.safeParse({
    search: url.searchParams.get("search") ?? undefined,
    role: url.searchParams.get("role") ?? undefined,
    status: url.searchParams.get("status") ?? undefined,
    page: url.searchParams.get("page") ?? undefined,
    pageSize: url.searchParams.get("pageSize") ?? undefined,
  });

  if (!parsed.success) {
    return NextResponse.json(
      { message: "Parâmetros inválidos", issues: parsed.error.issues },
      { status: 400 }
    );
  }

  try {
    const result = await listUsers({ actor, ...parsed.data });
    return NextResponse.json(result);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Erro";
    const status = message === "Sem permissão" ? 403 : 500;
    return NextResponse.json({ message }, { status });
  }
}

export async function POST(req: Request) {
  const actor = await getActorFromRequest(req);
  if (!actor) return NextResponse.json({ message: "Não autenticado" }, { status: 401 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ message: "JSON inválido" }, { status: 400 });
  }

  const parsed = CreateUserBodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { message: "Dados inválidos", issues: parsed.error.issues },
      { status: 400 }
    );
  }

  try {
    const user = await createUser({ actor, ...parsed.data });
    return NextResponse.json(user, { status: 201 });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Erro";
    const status =
      message === "Sem permissão" || message.includes("Sem permissão") ? 403 : 500;
    return NextResponse.json({ message }, { status });
  }
}

