import { NextRequest, NextResponse } from "next/server";

import { getActorFromRequest } from "@/server/admin/usersService";
import { getSupabaseServiceRoleClient } from "@/lib/supabase/server";
import { backupController, type Actor } from "@/server/backup/controllers/backupController";
import { backupFiltersSchema, createBackupSchema } from "@/server/backup/models/validation";
import type { BackupFilters, CreateBackupOptions } from "@/server/backup/models/types";

/**
 * GET /api/backup
 * 
 * List backups with optional filters
 * 
 * Query parameters:
 * - startDate: ISO date string (optional)
 * - endDate: ISO date string (optional)
 * - backupType: 'full' | 'selective' (optional)
 * - status: backup status (optional)
 * 
 * Requirements: 3.1, 3.3, 3.4, 3.5
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
    // Parse query parameters
    const url = new URL(req.url);
    const params = Object.fromEntries(url.searchParams.entries());
    
    // Validate filters
    let filters: BackupFilters | undefined;
    if (Object.keys(params).length > 0) {
      const parsed = backupFiltersSchema.safeParse(params);
      if (!parsed.success) {
        return NextResponse.json(
          { message: "Parâmetros inválidos", issues: parsed.error.issues },
          { status: 400 }
        );
      }
      filters = parsed.data;
    }

    // Extend actor with organizationId (null for now, reserved for future multi-tenant support)
    const actor: Actor = {
      id: adminActor.id,
      email: adminActor.email,
      role: adminActor.role as 'superadmin' | 'admin' | 'user',
      organizationId: null,
    };

    // List backups for user's organization
    const backups = await backupController.handleListBackups(actor, filters);
    
    return NextResponse.json({ backups });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Erro ao listar backups";
    return NextResponse.json({ message: msg }, { status: 400 });
  }
}

/**
 * POST /api/backup
 * 
 * Create a new backup
 * 
 * Request body:
 * - backupType: 'full' | 'selective'
 * - tables: string[] (required for selective backups)
 * 
 * Requirements: 1.1, 1.2, 1.3
 */
export async function POST(req: NextRequest) {
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
    // Parse request body
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ message: "JSON inválido" }, { status: 400 });
    }

    // Validate backup options
    const parsed = createBackupSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { message: "Dados inválidos", issues: parsed.error.issues },
        { status: 400 }
      );
    }

    const options: CreateBackupOptions = parsed.data;

    // Extend actor with organizationId (null for now, reserved for future multi-tenant support)
    const actor: Actor = {
      id: adminActor.id,
      email: adminActor.email,
      role: adminActor.role as 'superadmin' | 'admin' | 'user',
      organizationId: null,
    };

    // Create backup
    const backup = await backupController.handleCreateBackup(actor, options);
    
    return NextResponse.json({ backup }, { status: 201 });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Erro ao criar backup";
    const status = msg.includes("permissão") ? 403 : 400;
    return NextResponse.json({ message: msg }, { status });
  }
}
