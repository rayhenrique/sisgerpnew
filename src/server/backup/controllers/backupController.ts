/**
 * BackupController - Handles HTTP request processing for backup operations
 * 
 * This controller manages all backup-related HTTP requests including:
 * - Listing backups with organization scoping
 * - Creating new backups with authorization
 * - Getting backup details with organization validation
 * - Deleting backups with authorization
 * - Restoring backups with authorization
 * - Downloading backups with authorization
 * - Getting available tables for backup
 * - Audit logging for all operations
 * 
 * Requirements: 1.1, 3.1, 4.1, 5.1, 6.1, 9.1, 9.2, 9.3, 9.4, 9.6, 9.7, 10.1, 10.2, 10.3, 10.4
 */

import { getSupabaseServiceRoleClient } from "@/lib/supabase/server";
import type {
  Backup,
  BackupFilters,
  CreateBackupOptions,
  TableInfo,
  UserRole,
} from "@/server/backup/models/types";
import { backupService } from "@/server/backup/services/backupService";
import { restoreService } from "@/server/backup/services/restoreService";
import { storageService } from "@/server/backup/services/storageService";

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
 * BackupController class for handling backup HTTP requests
 */
export class BackupController {
  /**
   * Validate user has required role for admin operations
   * 
   * @param actor - Authenticated user
   * @throws Error if user doesn't have admin or superadmin role
   * 
   * Requirements: 9.1, 9.2, 9.3, 9.4
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
   * Requirements: 10.1, 10.2, 10.3, 10.4
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
        model_id: 0, // Backup operations don't have numeric IDs
        organization_id: entry.organizationId,
        old_values: entry.oldValues ?? null,
        new_values: {
          ...entry.newValues,
          backupId: entry.modelId,
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
   * Handle list backups request
   * 
   * Lists all backups for the user's organization with optional filters.
   * All authenticated users can view backups (read access).
   * 
   * @param actor - Authenticated user
   * @param filters - Optional filters for date range, type, status
   * @returns Array of backups for the organization
   * 
   * Requirements: 3.1, 9.6, 9.7
   */
  async handleListBackups(
    actor: Actor,
    filters?: BackupFilters
  ): Promise<Backup[]> {
    // All authenticated users can view backups for their organization
    // Organization scoping ensures multi-tenant isolation
    return await backupService.listBackups(actor.organizationId, filters);
  }

  /**
   * Handle create backup request
   * 
   * Creates a new backup with authorization check.
   * Only admin and superadmin users can create backups.
   * 
   * @param actor - Authenticated user
   * @param options - Backup creation options (type, tables)
   * @returns Created backup record
   * @throws Error if user lacks permission
   * 
   * Requirements: 1.1, 9.1, 9.2, 10.1
   */
  async handleCreateBackup(
    actor: Actor,
    options: CreateBackupOptions
  ): Promise<Backup> {
    // Validate user has admin role
    this.validateAdminRole(actor);

    // Create backup
    const backup = await backupService.createBackup(
      actor.organizationId,
      actor.id,
      actor.role,
      options
    );

    // Log operation in audit log
    await this.insertAuditLog({
      userId: actor.id,
      action: 'backup.create',
      modelType: 'backups',
      modelId: backup.id,
      organizationId: actor.organizationId,
      newValues: {
        backupType: backup.backupType,
        tablesIncluded: backup.tablesIncluded,
        status: backup.status,
      },
    });

    return backup;
  }

  /**
   * Handle get backup request
   * 
   * Gets details of a specific backup with organization validation.
   * Ensures users can only access backups from their organization.
   * 
   * @param actor - Authenticated user
   * @param backupId - Backup ID to retrieve
   * @returns Backup record
   * @throws Error if backup not found or belongs to different organization
   * 
   * Requirements: 3.1, 9.7
   */
  async handleGetBackup(
    actor: Actor,
    backupId: string
  ): Promise<Backup> {
    const supabase = getSupabaseServiceRoleClient();
    if (!supabase) {
      throw new Error('Supabase service role client not configured');
    }

    // Get backup with organization validation
    const { data: backup, error } = await supabase
      .from('backups')
      .select('*, profiles:created_by (name)')
      .eq('id', backupId)
      .single();

    if (error || !backup) {
      throw new Error('Backup não encontrado');
    }

    // Validate organization match (multi-tenant isolation)
    if (backup.organization_id !== actor.organizationId) {
      throw new Error('Você não tem permissão para acessar este backup');
    }

    return {
      id: backup.id,
      organizationId: backup.organization_id,
      createdBy: backup.created_by,
      createdAt: backup.created_at,
      backupType: backup.backup_type,
      status: backup.status,
      filePath: backup.file_path,
      fileSize: backup.file_size,
      compressedSize: backup.compressed_size,
      tablesIncluded: backup.tables_included || [],
      metadata: backup.metadata || {},
      errorMessage: backup.error_message,
      validatedAt: backup.validated_at,
      creatorName: backup.profiles?.name || null,
    };
  }

  /**
   * Handle delete backup request
   * 
   * Deletes a backup with authorization check.
   * Only admin and superadmin users can delete backups.
   * 
   * @param actor - Authenticated user
   * @param backupId - Backup ID to delete
   * @throws Error if user lacks permission or deletion fails
   * 
   * Requirements: 6.1, 9.1, 9.3, 10.3
   */
  async handleDeleteBackup(
    actor: Actor,
    backupId: string
  ): Promise<void> {
    // Validate user has admin role
    this.validateAdminRole(actor);

    const supabase = getSupabaseServiceRoleClient();
    if (!supabase) {
      throw new Error('Supabase service role client not configured');
    }

    // Get backup to validate organization and capture old values
    const { data: backup, error: fetchError } = await supabase
      .from('backups')
      .select('*')
      .eq('id', backupId)
      .single();

    if (fetchError || !backup) {
      throw new Error('Backup não encontrado');
    }

    // Validate organization match
    if (backup.organization_id !== actor.organizationId) {
      throw new Error('Você não tem permissão para deletar este backup');
    }

    try {
      // Delete file from storage
      await storageService.deleteBackup(
        backup.organization_id || 'system',
        backupId
      );

      // Update backup record status to "deleted"
      const { error: updateError } = await supabase
        .from('backups')
        .update({ status: 'deleted' })
        .eq('id', backupId);

      if (updateError) {
        throw new Error(`Failed to update backup status: ${updateError.message}`);
      }

      // Log operation in audit log
      await this.insertAuditLog({
        userId: actor.id,
        action: 'backup.delete',
        modelType: 'backups',
        modelId: backupId,
        organizationId: actor.organizationId,
        oldValues: {
          backupType: backup.backup_type,
          status: backup.status,
          fileSize: backup.file_size,
        },
        newValues: {
          status: 'deleted',
        },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to delete backup: ${message}`);
    }
  }

  /**
   * Handle restore backup request
   * 
   * Restores data from a backup with authorization check.
   * Only admin and superadmin users can restore backups.
   * Requires explicit confirmation.
   * 
   * @param actor - Authenticated user
   * @param backupId - Backup ID to restore from
   * @param confirmed - Explicit confirmation flag
   * @throws Error if user lacks permission or restore fails
   * 
   * Requirements: 5.1, 9.1, 9.2, 10.2
   */
  async handleRestoreBackup(
    actor: Actor,
    backupId: string,
    confirmed: boolean = false
  ): Promise<void> {
    // Validate user has admin role
    this.validateAdminRole(actor);

    const supabase = getSupabaseServiceRoleClient();
    if (!supabase) {
      throw new Error('Supabase service role client not configured');
    }

    // Get backup to validate organization
    const { data: backup, error: fetchError } = await supabase
      .from('backups')
      .select('*')
      .eq('id', backupId)
      .single();

    if (fetchError || !backup) {
      throw new Error('Backup não encontrado');
    }

    // Validate organization match
    if (backup.organization_id !== actor.organizationId) {
      throw new Error('Você não tem permissão para restaurar este backup');
    }

    // Perform restore operation
    const restoreJob = await restoreService.restoreBackup(
      backupId,
      actor.id,
      actor.role,
      confirmed
    );

    // Log operation in audit log
    await this.insertAuditLog({
      userId: actor.id,
      action: 'backup.restore',
      modelType: 'backups',
      modelId: backupId,
      organizationId: actor.organizationId,
      newValues: {
        restoreJobId: restoreJob.id,
        tablesRestored: restoreJob.tablesRestored,
        status: restoreJob.status,
      },
    });
  }

  /**
   * Handle download backup request
   * 
   * Generates a signed download URL for a backup file.
   * Only admin and superadmin users can download backups.
   * 
   * @param actor - Authenticated user
   * @param backupId - Backup ID to download
   * @returns Signed download URL
   * @throws Error if user lacks permission or file not found
   * 
   * Requirements: 4.1, 9.1, 9.4, 10.4
   */
  async handleDownloadBackup(
    actor: Actor,
    backupId: string
  ): Promise<string> {
    // Validate user has admin role
    this.validateAdminRole(actor);

    const supabase = getSupabaseServiceRoleClient();
    if (!supabase) {
      throw new Error('Supabase service role client not configured');
    }

    // Get backup to validate organization
    const { data: backup, error: fetchError } = await supabase
      .from('backups')
      .select('*')
      .eq('id', backupId)
      .single();

    if (fetchError || !backup) {
      throw new Error('Backup não encontrado');
    }

    // Validate organization match
    if (backup.organization_id !== actor.organizationId) {
      throw new Error('Você não tem permissão para baixar este backup');
    }

    // Generate signed download URL (expires in 1 hour)
    const downloadUrl = await storageService.getDownloadUrl(
      backup.organization_id || 'system',
      backupId,
      3600
    );

    // Log operation in audit log
    await this.insertAuditLog({
      userId: actor.id,
      action: 'backup.download',
      modelType: 'backups',
      modelId: backupId,
      organizationId: actor.organizationId,
      newValues: {
        backupType: backup.backup_type,
        fileSize: backup.file_size,
      },
    });

    return downloadUrl;
  }

  /**
   * Handle get available tables request
   * 
   * Returns list of tables available for backup with metadata.
   * All authenticated users can view available tables.
   * 
   * @param actor - Authenticated user
   * @returns Array of table information
   * 
   * Requirements: 12.3
   */
  async handleGetAvailableTables(actor: Actor): Promise<TableInfo[]> {
    const supabase = getSupabaseServiceRoleClient();
    if (!supabase) {
      throw new Error('Supabase service role client not configured');
    }

    // Define available tables with display names and modules
    const tables: TableInfo[] = [
      {
        name: 'profiles',
        displayName: 'Perfis de Usuários',
        module: 'Administração',
        rowCount: 0,
      },
      {
        name: 'categories',
        displayName: 'Categorias',
        module: 'Categorias',
        rowCount: 0,
      },
      {
        name: 'expense_classifications',
        displayName: 'Classificações de Despesas',
        module: 'Despesas',
        rowCount: 0,
      },
      {
        name: 'revenues',
        displayName: 'Receitas',
        module: 'Receitas',
        rowCount: 0,
      },
      {
        name: 'expenses',
        displayName: 'Despesas',
        module: 'Despesas',
        rowCount: 0,
      },
      {
        name: 'report_jobs',
        displayName: 'Trabalhos de Relatórios',
        module: 'Relatórios',
        rowCount: 0,
      },
      {
        name: 'report_schedules',
        displayName: 'Agendamentos de Relatórios',
        module: 'Relatórios',
        rowCount: 0,
      },
      {
        name: 'audit_logs',
        displayName: 'Logs de Auditoria',
        module: 'Auditoria',
        rowCount: 0,
      },
    ];

    // Get row counts for each table (scoped to organization)
    for (const table of tables) {
      try {
        let query = supabase.from(table.name).select('id', { count: 'exact', head: true });
        
        // Scope to organization if applicable
        if (actor.organizationId && table.name !== 'profiles') {
          query = query.eq('organization_id', actor.organizationId);
        }

        const { count, error } = await query;

        if (!error && count !== null) {
          table.rowCount = count;
        }
      } catch (error) {
        // If we can't get count, leave it as 0
        console.error(`Failed to get row count for ${table.name}:`, error);
      }
    }

    return tables;
  }
}

/**
 * Create a singleton instance of BackupController
 */
export const backupController = new BackupController();
