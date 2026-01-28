/**
 * ScheduleService - Handles backup scheduling and automatic execution
 * 
 * This service manages backup schedule operations including:
 * - Creating and managing backup schedules
 * - Finding schedules that are due to run
 * - Executing scheduled backups
 * - Calculating next run times based on frequency
 * 
 * Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7
 */

import { getSupabaseServiceRoleClient } from "@/lib/supabase/server";
import type {
  BackupSchedule,
  CreateScheduleInput,
  UpdateScheduleInput,
  UserRole,
} from "@/server/backup/models/types";
import { backupService } from "@/server/backup/services/backupService";

/**
 * ScheduleService class for managing backup schedules
 */
export class ScheduleService {
  /**
   * Validate user has required role for schedule operations
   * 
   * @param userRole - User's role
   * @throws Error if user doesn't have admin or superadmin role
   * 
   * Requirements: 2.1, 9.1
   */
  private validateRole(userRole: UserRole): void {
    if (userRole !== 'admin' && userRole !== 'superadmin') {
      throw new Error('Você não tem permissão para realizar esta operação');
    }
  }

  /**
   * Calculate next run time based on frequency
   * 
   * @param frequency - Schedule frequency (daily, weekly, monthly)
   * @param fromDate - Base date to calculate from (defaults to now)
   * @returns ISO timestamp for next run
   * 
   * Requirements: 2.2
   */
  private calculateNextRunAt(
    frequency: 'daily' | 'weekly' | 'monthly',
    fromDate: Date = new Date()
  ): string {
    const nextRun = new Date(fromDate);

    switch (frequency) {
      case 'daily':
        nextRun.setDate(nextRun.getDate() + 1);
        break;
      case 'weekly':
        nextRun.setDate(nextRun.getDate() + 7);
        break;
      case 'monthly':
        nextRun.setMonth(nextRun.getMonth() + 1);
        break;
    }

    return nextRun.toISOString();
  }

  /**
   * Create a new backup schedule
   * 
   * @param organizationId - Organization ID (null for single-tenant)
   * @param userId - User ID creating the schedule
   * @param userRole - User's role for authorization
   * @param input - Schedule creation input
   * @returns Created schedule record
   * @throws Error if validation fails or creation fails
   * 
   * Requirements: 2.1, 2.2
   */
  async createSchedule(
    organizationId: string | null,
    userId: string,
    userRole: UserRole,
    input: CreateScheduleInput
  ): Promise<BackupSchedule> {
    // Validate user role
    this.validateRole(userRole);

    const supabase = getSupabaseServiceRoleClient();
    if (!supabase) {
      throw new Error('Supabase service role client not configured');
    }

    // Validate selective backup has tables
    if (input.backupType === 'selective' && (!input.tables || input.tables.length === 0)) {
      throw new Error('Backups seletivos devem incluir pelo menos uma tabela');
    }

    // Calculate next run time
    const nextRunAt = this.calculateNextRunAt(input.frequency);

    // Create schedule record
    const { data: schedule, error } = await supabase
      .from('backup_schedules')
      .insert({
        organization_id: organizationId,
        created_by: userId,
        name: input.name,
        frequency: input.frequency,
        backup_type: input.backupType,
        tables_included: input.tables || [],
        enabled: true,
        next_run_at: nextRunAt,
        retention_days: input.retentionDays || 30,
      })
      .select()
      .single();

    if (error || !schedule) {
      throw new Error(`Failed to create schedule: ${error?.message || 'Unknown error'}`);
    }

    return this.mapScheduleRecord(schedule);
  }

  /**
   * Update an existing backup schedule
   * 
   * @param scheduleId - Schedule ID to update
   * @param userRole - User's role for authorization
   * @param updates - Schedule update input
   * @returns Updated schedule record
   * @throws Error if validation fails or update fails
   * 
   * Requirements: 2.1, 2.5
   */
  async updateSchedule(
    scheduleId: string,
    userRole: UserRole,
    updates: UpdateScheduleInput
  ): Promise<BackupSchedule> {
    // Validate user role
    this.validateRole(userRole);

    const supabase = getSupabaseServiceRoleClient();
    if (!supabase) {
      throw new Error('Supabase service role client not configured');
    }

    // Get existing schedule
    const { data: existingSchedule, error: fetchError } = await supabase
      .from('backup_schedules')
      .select('*')
      .eq('id', scheduleId)
      .single();

    if (fetchError || !existingSchedule) {
      throw new Error('Schedule not found');
    }

    // Build update object
    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (updates.name !== undefined) {
      updateData.name = updates.name;
    }

    if (updates.frequency !== undefined) {
      updateData.frequency = updates.frequency;
      // Recalculate next run time if frequency changed
      updateData.next_run_at = this.calculateNextRunAt(
        updates.frequency,
        existingSchedule.last_run_at ? new Date(existingSchedule.last_run_at) : new Date()
      );
    }

    if (updates.backupType !== undefined) {
      updateData.backup_type = updates.backupType;
    }

    if (updates.tables !== undefined) {
      updateData.tables_included = updates.tables;
    }

    if (updates.enabled !== undefined) {
      updateData.enabled = updates.enabled;
    }

    if (updates.retentionDays !== undefined) {
      updateData.retention_days = updates.retentionDays;
    }

    // Validate selective backup has tables
    const finalBackupType = updates.backupType || existingSchedule.backup_type;
    const finalTables = updates.tables || existingSchedule.tables_included;
    if (finalBackupType === 'selective' && (!finalTables || finalTables.length === 0)) {
      throw new Error('Backups seletivos devem incluir pelo menos uma tabela');
    }

    // Update schedule
    const { data: updatedSchedule, error: updateError } = await supabase
      .from('backup_schedules')
      .update(updateData)
      .eq('id', scheduleId)
      .select()
      .single();

    if (updateError || !updatedSchedule) {
      throw new Error(`Failed to update schedule: ${updateError?.message || 'Unknown error'}`);
    }

    return this.mapScheduleRecord(updatedSchedule);
  }

  /**
   * Delete a backup schedule
   * 
   * @param scheduleId - Schedule ID to delete
   * @param userRole - User's role for authorization
   * @throws Error if validation fails or deletion fails
   * 
   * Requirements: 2.1
   */
  async deleteSchedule(scheduleId: string, userRole: UserRole): Promise<void> {
    // Validate user role
    this.validateRole(userRole);

    const supabase = getSupabaseServiceRoleClient();
    if (!supabase) {
      throw new Error('Supabase service role client not configured');
    }

    const { error } = await supabase
      .from('backup_schedules')
      .delete()
      .eq('id', scheduleId);

    if (error) {
      throw new Error(`Failed to delete schedule: ${error.message}`);
    }
  }

  /**
   * Get schedules that are due to run
   * 
   * Finds all enabled schedules where next_run_at is in the past or now
   * 
   * @returns List of schedules ready to execute
   * @throws Error if query fails
   * 
   * Requirements: 2.2, 2.5
   */
  async getDueSchedules(): Promise<BackupSchedule[]> {
    const supabase = getSupabaseServiceRoleClient();
    if (!supabase) {
      throw new Error('Supabase service role client not configured');
    }

    const now = new Date().toISOString();

    const { data, error } = await supabase
      .from('backup_schedules')
      .select('*')
      .eq('enabled', true)
      .lte('next_run_at', now);

    if (error) {
      throw new Error(`Failed to get due schedules: ${error.message}`);
    }

    return (data || []).map(record => this.mapScheduleRecord(record));
  }

  /**
   * Execute a scheduled backup
   * 
   * Creates a backup using the schedule's configuration and updates
   * the schedule's last_run_at and next_run_at timestamps
   * 
   * @param schedule - Schedule to execute
   * @throws Error if backup creation fails
   * 
   * Requirements: 2.2, 2.3, 2.4
   */
  async executeSchedule(schedule: BackupSchedule): Promise<void> {
    const supabase = getSupabaseServiceRoleClient();
    if (!supabase) {
      throw new Error('Supabase service role client not configured');
    }

    try {
      // Create backup using schedule configuration
      await backupService.createBackup(
        schedule.organizationId,
        schedule.createdBy,
        'admin', // Scheduled backups run with admin privileges
        {
          backupType: schedule.backupType,
          tables: schedule.tablesIncluded.length > 0 ? schedule.tablesIncluded : undefined,
        }
      );

      // Update schedule with execution timestamps
      const lastRunAt = new Date().toISOString();
      const nextRunAt = this.calculateNextRunAt(schedule.frequency, new Date(lastRunAt));

      await supabase
        .from('backup_schedules')
        .update({
          last_run_at: lastRunAt,
          next_run_at: nextRunAt,
        })
        .eq('id', schedule.id);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to execute schedule ${schedule.id}: ${message}`);
    }
  }

  /**
   * List schedules for an organization
   * 
   * @param organizationId - Organization ID (null for single-tenant)
   * @returns List of schedules
   * @throws Error if query fails
   * 
   * Requirements: 2.1, 2.6
   */
  async listSchedules(organizationId: string | null): Promise<BackupSchedule[]> {
    const supabase = getSupabaseServiceRoleClient();
    if (!supabase) {
      throw new Error('Supabase service role client not configured');
    }

    let query = supabase
      .from('backup_schedules')
      .select('*');

    // Apply organization filter (for multi-tenant support)
    if (organizationId) {
      query = query.eq('organization_id', organizationId);
    }

    // Sort by creation date descending
    query = query.order('created_at', { ascending: false });

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to list schedules: ${error.message}`);
    }

    return (data || []).map(record => this.mapScheduleRecord(record));
  }

  /**
   * Map database record to BackupSchedule type
   * 
   * @param record - Database record
   * @returns BackupSchedule object
   */
  private mapScheduleRecord(record: any): BackupSchedule {
    return {
      id: record.id,
      organizationId: record.organization_id,
      createdBy: record.created_by,
      createdAt: record.created_at,
      updatedAt: record.updated_at,
      name: record.name,
      frequency: record.frequency,
      backupType: record.backup_type,
      tablesIncluded: record.tables_included || [],
      enabled: record.enabled,
      lastRunAt: record.last_run_at,
      nextRunAt: record.next_run_at,
      retentionDays: record.retention_days,
    };
  }
}

/**
 * Create a singleton instance of ScheduleService
 */
export const scheduleService = new ScheduleService();
