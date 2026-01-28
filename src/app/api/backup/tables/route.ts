import { NextRequest, NextResponse } from "next/server";

import { getActorFromRequest } from "@/server/admin/usersService";
import { getSupabaseServiceRoleClient } from "@/lib/supabase/server";
import { backupController, type Actor } from "@/server/backup/controllers/backupController";

/**
 * GET /api/backup/tables
 * 
 * List available tables for backup with metadata
 * 
 * Returns:
 * - tables: TableInfo[] (array of table information with display names and row counts)
 * 
 * Requirements: 12.3
 */
export async function GET(req: NextRequest) {
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
    // Extend actor with organizationId (null for now, reserved for future multi-tenant support)
    const actor: Actor = {
      id: adminActor.id,
      email: adminActor.email,
      role: adminActor.role as 'superadmin' | 'admin' | 'user',
      organizationId: null,
    };

    // Get available tables
    const tables = await backupController.handleGetAvailableTables(actor);
    
    return NextResponse.json({ tables });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Erro ao listar tabelas disponíveis";
    return NextResponse.json({ message: msg }, { status: 400 });
  }
}
