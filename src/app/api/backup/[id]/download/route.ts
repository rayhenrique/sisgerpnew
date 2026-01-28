import { NextRequest, NextResponse } from "next/server";

import { getActorFromRequest } from "@/server/admin/usersService";
import { getSupabaseServiceRoleClient } from "@/lib/supabase/server";
import { backupController, type Actor } from "@/server/backup/controllers/backupController";

/**
 * GET /api/backup/[id]/download
 * 
 * Generate a signed download URL for a backup file
 * 
 * Returns:
 * - downloadUrl: string (signed URL with expiration)
 * 
 * Requirements: 4.1, 4.3
 */
export async function GET(
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

    // Extend actor with organizationId (null for now, reserved for future multi-tenant support)
    const actor: Actor = {
      id: adminActor.id,
      email: adminActor.email,
      role: adminActor.role as 'superadmin' | 'admin' | 'user',
      organizationId: null,
    };

    // Generate download URL
    const downloadUrl = await backupController.handleDownloadBackup(actor, id);
    
    return NextResponse.json({
      downloadUrl,
      url: downloadUrl,
      expiresInSeconds: 3600,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Erro ao gerar URL de download";
    const status = msg.includes("não encontrado") ? 404 : msg.includes("permissão") ? 403 : 400;
    return NextResponse.json({ message: msg }, { status });
  }
}
