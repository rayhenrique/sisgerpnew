import { NextRequest, NextResponse } from "next/server";

import { getActorFromRequest } from "@/server/admin/usersService";
import { getSupabaseServiceRoleClient } from "@/lib/supabase/server";
import { scheduleController, type Actor } from "@/server/backup/controllers/scheduleController";
import { createScheduleSchema, updateScheduleSchema } from "@/server/backup/models/validation";
import type { CreateScheduleInput, UpdateScheduleInput, UserRole } from "@/server/backup/models/types";

/**
 * GET /api/backup/schedules
 * 
 * List all backup schedules for the user's organization
 * 
 * Requirements: 2.1, 2.5
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
      ...adminActor,
      role: adminActor.role as UserRole,
      organizationId: null,
    };

    // List schedules for user's organization
    const schedules = await scheduleController.handleListSchedules(actor);
    
    return NextResponse.json({ schedules });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Erro ao listar agendamentos";
    const status = msg.includes("permissão") ? 403 : 400;
    return NextResponse.json({ message: msg }, { status });
  }
}

/**
 * POST /api/backup/schedules
 * 
 * Create a new backup schedule
 * 
 * Request body:
 * - name: string (required)
 * - frequency: 'daily' | 'weekly' | 'monthly' (required)
 * - backupType: 'full' | 'selective' (required)
 * - tables: string[] (required for selective backups)
 * - retentionDays: number (optional, defaults to 30)
 * 
 * Requirements: 2.1
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

    // Validate schedule input
    const parsed = createScheduleSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { message: "Dados inválidos", issues: parsed.error.issues },
        { status: 400 }
      );
    }

    const input: CreateScheduleInput = parsed.data;

    // Extend actor with organizationId (null for now, reserved for future multi-tenant support)
    const actor: Actor = {
      ...adminActor,
      role: adminActor.role as UserRole,
      organizationId: null,
    };

    // Create schedule
    const schedule = await scheduleController.handleCreateSchedule(actor, input);
    
    return NextResponse.json({ schedule }, { status: 201 });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Erro ao criar agendamento";
    const status = msg.includes("permissão") ? 403 : 400;
    return NextResponse.json({ message: msg }, { status });
  }
}

/**
 * PUT /api/backup/schedules
 * 
 * Update an existing backup schedule
 * 
 * Request body:
 * - id: string (required)
 * - name: string (optional)
 * - frequency: 'daily' | 'weekly' | 'monthly' (optional)
 * - backupType: 'full' | 'selective' (optional)
 * - tables: string[] (optional)
 * - enabled: boolean (optional)
 * - retentionDays: number (optional)
 * 
 * Requirements: 2.1, 2.5
 */
export async function PUT(req: NextRequest) {
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

    // Validate body has id field
    if (!body || typeof body !== 'object' || !('id' in body)) {
      return NextResponse.json({ message: "ID do agendamento é obrigatório" }, { status: 400 });
    }

    const { id, ...updates } = body as { id: string; [key: string]: unknown };

    if (!id || typeof id !== 'string') {
      return NextResponse.json({ message: "ID do agendamento inválido" }, { status: 400 });
    }

    // Validate update input
    const parsed = updateScheduleSchema.safeParse(updates);
    if (!parsed.success) {
      return NextResponse.json(
        { message: "Dados inválidos", issues: parsed.error.issues },
        { status: 400 }
      );
    }

    const updateInput: UpdateScheduleInput = parsed.data;

    // Extend actor with organizationId (null for now, reserved for future multi-tenant support)
    const actor: Actor = {
      ...adminActor,
      role: adminActor.role as UserRole,
      organizationId: null,
    };

    // Update schedule
    const schedule = await scheduleController.handleUpdateSchedule(actor, id, updateInput);
    
    return NextResponse.json({ schedule });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Erro ao atualizar agendamento";
    const status = msg.includes("permissão") || msg.includes("não encontrado") ? 403 : 400;
    return NextResponse.json({ message: msg }, { status });
  }
}

/**
 * DELETE /api/backup/schedules
 * 
 * Delete a backup schedule
 * 
 * Query parameters:
 * - id: string (required)
 * 
 * Requirements: 2.1
 */
export async function DELETE(req: NextRequest) {
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
    const id = url.searchParams.get('id');

    if (!id) {
      return NextResponse.json({ message: "ID do agendamento é obrigatório" }, { status: 400 });
    }

    // Extend actor with organizationId (null for now, reserved for future multi-tenant support)
    const actor: Actor = {
      ...adminActor,
      role: adminActor.role as UserRole,
      organizationId: null,
    };

    // Delete schedule
    await scheduleController.handleDeleteSchedule(actor, id);
    
    return NextResponse.json({ message: "Agendamento deletado com sucesso" });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Erro ao deletar agendamento";
    const status = msg.includes("permissão") || msg.includes("não encontrado") ? 403 : 400;
    return NextResponse.json({ message: msg }, { status });
  }
}
