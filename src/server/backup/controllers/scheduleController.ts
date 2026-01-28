/**
 * ScheduleController - Handles HTTP request processing for backup schedule operations
 * 
 * This controller manages all backup schedule-related HTTP requests including:
 * - Listing schedules with organization scoping
 * - Creating new schedules with authorization
 * - Updating schedules with authorization
 * - Deleting schedules with authorization
 * - Audit logging for all schedule operations
 * 
 * Requirements: 2.1, 2.5, 9.1, 10.5
 */

import { getSupabaseServiceRoleClient } from "@/lib/supabase/server";
import type {
  BackupSchedule,
  CreateScheduleInput,
  UpdateScheduleInput,
  UserRole,
} from "@/server/backup/models/types";
import { scheduleService } from "@/server/backup/services/scheduleService";

/**
 * Actor represents the authenticated user making the request
 */
export interface Actor {
  id: string;
  email: string | null;
  role: UserRole;
  organizationId: string | null;
}

/**
 * Audit log entry for tracking operations
 */
interface AuditLogEntry {
  userId: string;
  action: string;
  modelType: string;
  modelId: string;
  organizationId: string | null;
  oldValues?: Record<string, unknown> | null;
  newValues?: Record<string, unknown> | null;
}

/**
 * ScheduleController class for handling backup schedule HTTP requests
 */
export class ScheduleController {
  /**
   * Validate user has required role for admin operations
   * 
   * @param actor - Authenticated user
   * @throws Error if user doesn't have admin or superadmin role
   * 
   * Requirements: 9.1
   */
  private validateAdminRole(actor: Actor): void {
    if (actor.role !== 'admin' && actor.role !== 'superadmin') {
      throw new Error('Você não tem permissão para realizar esta operação');
    }
  }

  /**
   * Insert audit log entry
   * 
   * @param entry - Audit log entry data
   * 
   * Requirements: 10.5
   */
  private async insertAuditLog(entry: AuditLogEntry): Promise<void> {
    const supabase = getSupabaseServiceRoleClient();
    if (!supabase) {
      console.error('Supabase service role client not configured for audit logging');
      return;
    }

    try {
      const { error } = await supabase.from('audit_logs').insert({
        user_id: entry.userId,
        action: entry.action,
        model_type: entry.modelType,
        model_id: 0, // Schedule operations don't have numeric IDs
        organization_id: entry.organizationId,
        old_values: entry.oldValues ?? null,
        new_values: {
          ...entry.newValues,
          scheduleId: entry.modelId,
        },
      });

      if (error) {
        console.error('Failed to insert audit log:', error);
      }
    } catch (error) {
      console.error('Error inserting audit log:', error);
    }
  }

  /**
   * Handle list schedules request
   * 
   * Lists all backup schedules for the user's organization.
   * Only admin and superadmin users can view schedules.
   * 
   * @param actor - Authenticated user
   * @returns Array of schedules for the organization
   * @throws Error if user lacks permission
   * 
   * Requirements: 2.1, 9.1
   */
  async handleListSchedules(actor: Actor): Promise<BackupSchedule[]> {
    // Validate user has admin role
    this.validateAdminRole(actor);

    // Organization scoping ensures multi-tenant isolation
    return await scheduleService.listSchedules(actor.organizationId);
  }

  /**
   * Handle create schedule request
   * 
   * Creates a new backup schedule with authorization check.
   * Only admin and superadmin users can create schedules.
   * 
   * @param actor - Authenticated user
   * @param input - Schedule creation input
   * @returns Created schedule record
   * @throws Error if user lacks permission or validation fails
   * 
   * Requirements: 2.1, 9.1, 10.5
   */
  async handleCreateSchedule(
    actor: Actor,
    input: CreateScheduleInput
  ): Promise<BackupSchedule> {
    // Validate user has admin role
    this.validateAdminRole(actor);

    // Create schedule
    const schedule = await scheduleService.createSchedule(
      actor.organizationId,
      actor.id,
      actor.role,
      input
    );

    // Log operation in audit log
    await this.insertAuditLog({
      userId: actor.id,
      action: 'backup_schedule.create',
      modelType: 'backup_schedules',
      modelId: schedule.id,
      organizationId: actor.organizationId,
      newValues: {
        name: schedule.name,
        frequency: schedule.frequency,
        backupType: schedule.backupType,
        tablesIncluded: schedule.tablesIncluded,
        enabled: schedule.enabled,
        retentionDays: schedule.retentionDays,
      },
    });

    return schedule;
  }

  /**
   * Handle update schedule request
   * 
   * Updates an existing backup schedule with authorization check.
   * Only admin and superadmin users can update schedules.
   * Validates organization ownership before updating.
   * 
   * @param actor - Authenticated user
   * @param scheduleId - Schedule ID to update
   * @param updates - Schedule update input
   * @returns Updated schedule record
   * @throws Error if user lacks permission, schedule not found, or belongs to different organization
   * 
   * Requirements: 2.1, 2.5, 9.1, 10.5
   */
  async handleUpdateSchedule(
    actor: Actor,
    scheduleId: string,
    updates: UpdateScheduleInput
  ): Promise<BackupSchedule> {
    // Validate user has admin role
    this.validateAdminRole(actor);

    const supabase = getSupabaseServiceRoleClient();
    if (!supabase) {
      throw new Error('Supabase service role client not configured');
    }

    // Get existing schedule to validate organization and capture old values
    const { data: existingSchedule, error: fetchError } = await supabase
      .from('backup_schedules')
      .select('*')
      .eq('id', scheduleId)
      .single();

    if (fetchError || !existingSchedule) {
      throw new Error('Agendamento não encontrado');
    }

    // Validate organization match (multi-tenant isolation)
    if (existingSchedule.organization_id !== actor.organizationId) {
      throw new Error('Você não tem permissão para atualizar este agendamento');
    }

    // Update schedule
    const updatedSchedule = await scheduleService.updateSchedule(
      scheduleId,
      actor.role,
      updates
    );

    // Log operation in audit log
    await this.insertAuditLog({
      userId: actor.id,
      action: 'backup_schedule.update',
      modelType: 'backup_schedules',
      modelId: scheduleId,
      organizationId: actor.organizationId,
      oldValues: {
        name: existingSchedule.name,
        frequency: existingSchedule.frequency,
        backupType: existingSchedule.backup_type,
        enabled: existingSchedule.enabled,
        retentionDays: existingSchedule.retention_days,
      },
      newValues: {
        name: updates.name,
        frequency: updates.frequency,
        backupType: updates.backupType,
        enabled: updates.enabled,
        retentionDays: updates.retentionDays,
      },
    });

    return updatedSchedule;
  }

  /**
   * Handle delete schedule request
   * 
   * Deletes a backup schedule with authorization check.
   * Only admin and superadmin users can delete schedules.
   * Validates organization ownership before deleting.
   * 
   * @param actor - Authenticated user
   * @param scheduleId - Schedule ID to delete
   * @throws Error if user lacks permission, schedule not found, or belongs to different organization
   * 
   * Requirements: 2.1, 9.1, 10.5
   */
  async handleDeleteSchedule(
    actor: Actor,
    scheduleId: string
  ): Promise<void> {
    // Validate user has admin role
    this.validateAdminRole(actor);

    const supabase = getSupabaseServiceRoleClient();
    if (!supabase) {
      throw new Error('Supabase service role client not configured');
    }

    // Get schedule to validate organization and capture old values
    const { data: schedule, error: fetchError } = await supabase
      .from('backup_schedules')
      .select('*')
      .eq('id', scheduleId)
      .single();

    if (fetchError || !schedule) {
      throw new Error('Agendamento não encontrado');
    }

    // Validate organization match (multi-tenant isolation)
    if (schedule.organization_id !== actor.organizationId) {
      throw new Error('Você não tem permissão para deletar este agendamento');
    }

    // Delete schedule
    await scheduleService.deleteSchedule(scheduleId, actor.role);

    // Log operation in audit log
    await this.insertAuditLog({
      userId: actor.id,
      action: 'backup_schedule.delete',
      modelType: 'backup_schedules',
      modelId: scheduleId,
      organizationId: actor.organizationId,
      oldValues: {
        name: schedule.name,
        frequency: schedule.frequency,
        backupType: schedule.backup_type,
        enabled: schedule.enabled,
        retentionDays: schedule.retention_days,
      },
      newValues: null,
    });
  }
}

/**
 * Create a singleton instance of ScheduleController
 */
export const scheduleController = new ScheduleController();
