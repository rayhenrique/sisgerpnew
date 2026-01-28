import { NextRequest, NextResponse } from "next/server";

import { getActorFromRequest } from "@/server/admin/usersService";
import { getSupabaseServiceRoleClient } from "@/lib/supabase/server";
import { backupController, type Actor } from "@/server/backup/controllers/backupController";

/**
 * GET /api/backup/[id]
 * 
 * Get backup details by ID
 * 
 * Requirements: 3.1
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

    // Get backup details
    const backup = await backupController.handleGetBackup(actor, id);
    
    return NextResponse.json({ backup });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Erro ao carregar backup";
    const status = msg.includes("não encontrado") ? 404 : msg.includes("permissão") ? 403 : 400;
    return NextResponse.json({ message: msg }, { status });
  }
}

/**
 * DELETE /api/backup/[id]
 * 
 * Delete a backup by ID
 * 
 * Requirements: 6.1, 6.2
 */
export async function DELETE(
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

    // Delete backup
    await backupController.handleDeleteBackup(actor, id);
    
    return NextResponse.json({ message: "Backup deletado com sucesso" });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Erro ao deletar backup";
    const status = msg.includes("não encontrado") ? 404 : msg.includes("permissão") ? 403 : 400;
    return NextResponse.json({ message: msg }, { status });
  }
}
