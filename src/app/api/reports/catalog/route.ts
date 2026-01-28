import { NextRequest, NextResponse } from "next/server";

import { getActorFromRequest } from "@/server/admin/usersService";
import { REPORT_DEFINITIONS } from "@/server/reports/services/catalog";

export async function GET(req: NextRequest) {
  const actor = await getActorFromRequest(req);
  if (!actor) return NextResponse.json({ message: "Não autenticado" }, { status: 401 });
  if (!actor.active) return NextResponse.json({ message: "Usuário desativado" }, { status: 403 });

  return NextResponse.json({ items: REPORT_DEFINITIONS });
}

