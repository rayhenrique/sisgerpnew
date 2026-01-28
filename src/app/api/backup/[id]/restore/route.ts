import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { getActorFromRequest } from "@/server/admin/usersService";
import { getSupabaseServiceRoleClient } from "@/lib/supabase/server";
import { backupController, type Actor } from "@/server/backup/controllers/backupController";

/**
 * Schema for restore request body
 */
const restoreRequestSchema = z.object({
  confirmed: z.boolean(),
});

/**
 * POST /api/backup/[id]/restore
 * 
 * Restore data from a backup
 * 
 * Request body:
 * - confirmed: boolean (must be true)
 * 
 * Requirements: 5.1, 5.2
 */
export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  // Authenticate user
  const adminActor = await getActorFromRequest(req);
  if (!adminActor) {
    return NextResponse.json({ message: "Não autenticado" }, { status: 401 });
  }
  if (!adminActor.active) {
    return NextResponse.json({ message: "Usuário desativado" }, { status: 403 });
  }

  // Verify Supabase is configured
  const service = getSupabaseServiceRoleClient();
  if (!service) {
    return NextResponse.json({ message: "Supabase não configurado" }, { status: 500 });
  }

  try {
    // Get backup ID from params
    const { id } = await ctx.params;
    
    if (!id) {
      return NextResponse.json({ message: "ID do backup não fornecido" }, { status: 400 });
    }

    // Parse request body
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ message: "JSON inválido" }, { status: 400 });
    }

    // Validate confirmation
    const parsed = restoreRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { message: "Dados inválidos", issues: parsed.error.issues },
        { status: 400 }
      );
    }

    if (!parsed.data.confirmed) {
      return NextResponse.json(
        { message: "Confirmação necessária para restaurar backup" },
        { status: 400 }
      );
    }

    // Extend actor with organizationId (null for now, reserved for future multi-tenant support)
    const actor: Actor = {
      id: adminActor.id,
      email: adminActor.email,
      role: adminActor.role as 'superadmin' | 'admin' | 'user',
      organizationId: null,
    };

    // Restore backup
    await backupController.handleRestoreBackup(actor, id, parsed.data.confirmed);
    
    return NextResponse.json({ message: "Backup restaurado com sucesso" });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Erro ao restaurar backup";
    const status = msg.includes("não encontrado") ? 404 : msg.includes("permissão") ? 403 : 400;
    return NextResponse.json({ message: msg }, { status });
  }
}
