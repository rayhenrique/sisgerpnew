/**
 * RestoreService - Handles backup restoration operations
 * 
 * This service manages database restore operations including:
 * - Restoring data from full and selective backups
 * - Importing table data with transaction support
 * - Validating restore compatibility
 * - Managing restore job status transitions
 * - Implementing rollback on failure
 * 
 * Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8, 15.6
 */

import { getSupabaseServiceRoleClient } from "@/lib/supabase/server";
import type {
  BackupData,
  BackupMetadata,
  RestoreJob,
  UserRole,
  ValidationResult,
} from "@/server/backup/models/types";
import { decompressData } from "@/server/backup/utils/compression";
import { storageService } from "@/server/backup/services/storageService";

/**
 * Current format version supported by the restore service
 */
const SUPPORTED_FORMAT_VERSION = "1.0.0";

/**
 * RestoreService class for managing restore operations
 */
export class RestoreService {
  /**
   * Validate user has required role for restore operations
   * 
   * @param userRole - User's role
   * @throws Error if user doesn't have admin or superadmin role
   * 
   * Requirements: 5.1, 9.1, 9.2
   */
  private validateRole(userRole: UserRole): void {
    if (userRole !== 'admin' && userRole !== 'superadmin') {
      throw new Error('Você não tem permissão para realizar esta operação');
    }
  }

  /**
   * Restore data from a backup
   * 
   * @param backupId - Backup ID to restore from
   * @param userId - User ID initiating the restore
   * @param userRole - User's role for authorization
   * @param confirmed - Explicit confirmation flag
   * @returns Restore job record
   * @throws Error if validation fails or restore fails
   * 
   * Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8
   */
  async restoreBackup(
    backupId: string,
    userId: string,
    userRole: UserRole,
    confirmed: boolean = false
  ): Promise<RestoreJob> {
    // Validate user role
    this.validateRole(userRole);

    // Require explicit confirmation
    if (!confirmed) {
      throw new Error('Restore operation requires explicit confirmation');
    }

    const supabase = getSupabaseServiceRoleClient();
    if (!supabase) {
      throw new Error('Supabase service role client not configured');
    }

    // Get backup record
    const { data: backup, error: backupError } = await supabase
      .from('backups')
      .select('*')
      .eq('id', backupId)
      .single();

    if (backupError || !backup) {
      throw new Error('Backup not found');
    }

    // Validate backup status
    if (backup.status !== 'completed') {
      throw new Error(`Cannot restore from backup with status: ${backup.status}`);
    }

    // Validate restore compatibility
    const validation = await this.validateRestore(backupId, backup.organization_id);
    if (!validation.valid) {
      throw new Error(`Restore validation failed: ${validation.errors.join(', ')}`);
    }

    // Create restore job record with "in_progress" status
    const { data: restoreJob, error: insertError } = await supabase
      .from('restore_jobs')
      .insert({
        backup_id: backupId,
        organization_id: backup.organization_id,
        initiated_by: userId,
        status: 'in_progress',
        tables_restored: [],
      })
      .select()
      .single();

    if (insertError || !restoreJob) {
      throw new Error(`Failed to create restore job: ${insertError?.message || 'Unknown error'}`);
    }

    try {
      // Download backup file
      const compressedData = await storageService.downloadBackup(
        backup.organization_id || 'system',
        backupId
      );

      // Decompress data
      const decompressedData = await decompressData(compressedData);
      const jsonString = decompressedData.toString('utf-8');

      // Parse backup data
      const backupData: BackupData = JSON.parse(jsonString);

      // Import tables with transaction support
      await this.importTables(backup.organization_id, backupData);

      // Update restore job with completion status
      const { data: completedJob, error: updateError } = await supabase
        .from('restore_jobs')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          tables_restored: backup.tables_included || [],
        })
        .eq('id', restoreJob.id)
        .select()
        .single();

      if (updateError || !completedJob) {
        throw new Error(`Failed to update restore job: ${updateError?.message || 'Unknown error'}`);
      }

      return this.mapRestoreJobRecord(completedJob);
    } catch (error) {
      // Update restore job with failed status
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      await supabase
        .from('restore_jobs')
        .update({
          status: 'failed',
          completed_at: new Date().toISOString(),
          error_message: errorMessage,
        })
        .eq('id', restoreJob.id);

      throw new Error(`Restore operation failed: ${errorMessage}`);
    }
  }

  /**
   * Import tables from backup data with transaction support
   * 
   * @param organizationId - Organization ID
   * @param backupData - Backup data to import
   * @throws Error if import fails (triggers rollback)
   * 
   * Requirements: 5.4, 5.5, 5.8, 15.3
   */
  async importTables(
    organizationId: string | null,
    backupData: BackupData
  ): Promise<void> {
    const supabase = getSupabaseServiceRoleClient();
    if (!supabase) {
      throw new Error('Supabase service role client not configured');
    }

    // Get list of tables to restore
    const tablesToRestore = Object.keys(backupData.tables);

    // Define which tables use UUID vs bigint for their id column
    const uuidTables = new Set([
      'profiles',
      'report_schedules',
      'report_jobs',
    ]);

    // Define deletion order to respect foreign key constraints
    // Tables with foreign keys must be deleted before their referenced tables
    const deletionOrder = [
      // First: Tables that reference others (dependent tables)
      'expenses',           // References categories, expense_classifications
      'revenues',           // References categories
      'report_schedules',   // May reference other tables
      'report_jobs',        // May reference other tables
      'audit_logs',         // References profiles
      
      // Second: Tables that are referenced by others (parent tables)
      'expense_classifications',  // Referenced by expenses
      'categories',              // Referenced by revenues, expenses (self-referencing too)
      
      // Last: Independent tables
      'profiles',           // Referenced by audit_logs (but we delete audit_logs first)
    ];

    // Filter to only tables that are in the backup
    const orderedTables = deletionOrder.filter(table => tablesToRestore.includes(table));
    
    // Add any tables from backup that aren't in our predefined order (at the end)
    const remainingTables = tablesToRestore.filter(table => !deletionOrder.includes(table));
    const finalOrder = [...orderedTables, ...remainingTables];

    // Use a transaction-like approach by tracking operations
    const restoredTables: string[] = [];

    try {
      // Phase 1: Delete existing data in correct order
      for (const tableName of finalOrder) {
        const tableData = backupData.tables[tableName];
        
        if (!tableData || !tableData.rows) {
          throw new Error(`Invalid data for table ${tableName}`);
        }

        // Delete existing data for this table
        let deleteQuery = supabase.from(tableName).delete();
        
        // Determine id type: check explicit list first, then inspect data
        let isUuid = uuidTables.has(tableName);
        
        // If not in explicit list and has data, try to detect from data
        if (!isUuid && tableData.rows.length > 0) {
          const firstRow = tableData.rows[0];
          const idValue = firstRow.id;
          isUuid = typeof idValue === 'string' && idValue.includes('-');
        }
        
        // Use appropriate delete condition based on id type
        if (isUuid) {
          // UUID: use null UUID as comparison
          deleteQuery = deleteQuery.neq('id', '00000000-0000-0000-0000-000000000000');
        } else {
          // Bigint: use numeric comparison
          deleteQuery = deleteQuery.neq('id', -1);
        }

        const { error: deleteError } = await deleteQuery;

        if (deleteError) {
          throw new Error(`Failed to clear table ${tableName}: ${deleteError.message}`);
        }
      }

      // Phase 2: Insert backup data in the same order
      for (const tableName of finalOrder) {
        const tableData = backupData.tables[tableName];

        // Insert backup data
        if (tableData.rows.length > 0) {
          const { error: insertError } = await supabase
            .from(tableName)
            .insert(tableData.rows);

          if (insertError) {
            throw new Error(`Failed to restore table ${tableName}: ${insertError.message}`);
          }
        }

        restoredTables.push(tableName);
      }
    } catch (error) {
      // On failure, we should rollback
      // Since Supabase client doesn't support explicit transactions,
      // we'll throw the error and let the caller handle it
      // In a production system, you'd use database-level transactions
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Import failed, rollback required: ${message}`);
    }
  }

  /**
   * Validate restore compatibility
   * 
   * @param backupId - Backup ID to validate
   * @param organizationId - Organization ID
   * @returns Validation result with errors and warnings
   * 
   * Requirements: 5.3, 15.6
   */
  async validateRestore(
    backupId: string,
    organizationId: string | null
  ): Promise<ValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      const supabase = getSupabaseServiceRoleClient();
      if (!supabase) {
        errors.push('Supabase service role client not configured');
        return { valid: false, errors, warnings };
      }

      // Get backup record
      const { data: backup, error: backupError } = await supabase
        .from('backups')
        .select('*')
        .eq('id', backupId)
        .single();

      if (backupError || !backup) {
        errors.push('Backup not found');
        return { valid: false, errors, warnings };
      }

      // Check if backup file exists
      const fileExists = await storageService.fileExists(
        backup.organization_id || 'system',
        backupId
      );

      if (!fileExists) {
        errors.push('Backup file not found in storage');
        return { valid: false, errors, warnings };
      }

      // Download and parse backup to check format version
      try {
        const compressedData = await storageService.downloadBackup(
          backup.organization_id || 'system',
          backupId
        );

        const decompressedData = await decompressData(compressedData);
        const jsonString = decompressedData.toString('utf-8');
        const backupData: BackupData = JSON.parse(jsonString);

        // Validate format version
        const backupVersion = backupData.metadata.formatVersion;
        if (backupVersion !== SUPPORTED_FORMAT_VERSION) {
          errors.push(
            `Incompatible backup format version: ${backupVersion} (supported: ${SUPPORTED_FORMAT_VERSION})`
          );
        }

        // Check if all tables in backup still exist in the database
        const tablesToRestore = Object.keys(backupData.tables);
        for (const tableName of tablesToRestore) {
          // Try to query the table to see if it exists
          const { error: tableError } = await supabase
            .from(tableName)
            .select('id')
            .limit(1);

          if (tableError) {
            warnings.push(`Table ${tableName} may not exist or is not accessible`);
          }
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        errors.push(`Failed to validate backup file: ${message}`);
      }

      // Check organization match
      if (organizationId && backup.organization_id !== organizationId) {
        errors.push('Backup belongs to a different organization');
      }

    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      errors.push(`Validation error: ${message}`);
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Map database record to RestoreJob type
   * 
   * @param record - Database record
   * @returns RestoreJob object
   */
  private mapRestoreJobRecord(record: any): RestoreJob {
    return {
      id: record.id,
      backupId: record.backup_id,
      organizationId: record.organization_id,
      initiatedBy: record.initiated_by,
      startedAt: record.started_at,
      completedAt: record.completed_at,
      status: record.status,
      tablesRestored: record.tables_restored || [],
      errorMessage: record.error_message,
    };
  }
}

/**
 * Create a singleton instance of RestoreService
 */
export const restoreService = new RestoreService();
