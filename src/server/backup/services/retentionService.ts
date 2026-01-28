/**
 * RetentionService - Handles automatic backup deletion based on retention policies
 * 
 * This service manages backup retention operations including:
 * - Applying retention policies to delete old backups
 * - Identifying expired backups based on retention period
 * - Deleting expired backups from storage and database
 * - Supporting different retention periods for full vs selective backups
 * 
 * Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6
 */

import { getSupabaseServiceRoleClient } from "@/lib/supabase/server";
import type { Backup } from "@/server/backup/models/types";
import { storageService } from "@/server/backup/services/storageService";

/**
 * Default retention periods in days
 */
const DEFAULT_RETENTION_DAYS = {
  full: 90,      // 90 days for full backups
  selective: 30, // 30 days for selective backups
};

/**
 * RetentionService class for managing backup retention policies
 */
export class RetentionService {
  /**
   * Apply retention policy to an organization's backups
   * 
   * This method identifies and deletes backups that have exceeded their retention period.
   * Different retention periods can be applied for full and selective backups.
   * 
   * @param organizationId - Organization ID (null for single-tenant)
   * @param retentionDays - Optional custom retention periods by backup type
   * @returns Number of backups deleted
   * @throws Error if retention policy application fails
   * 
   * Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6
   */
  async applyRetentionPolicy(
    organizationId: string | null,
    retentionDays?: { full?: number; selective?: number }
  ): Promise<number> {
    const supabase = getSupabaseServiceRoleClient();
    if (!supabase) {
      throw new Error('Supabase service role client not configured');
    }

    // Use provided retention periods or defaults
    const fullRetentionDays = retentionDays?.full ?? DEFAULT_RETENTION_DAYS.full;
    const selectiveRetentionDays = retentionDays?.selective ?? DEFAULT_RETENTION_DAYS.selective;

    let totalDeleted = 0;

    try {
      // Get expired full backups
      const expiredFullBackups = await this.getExpiredBackups(
        organizationId,
        fullRetentionDays,
        'full'
      );

      // Get expired selective backups
      const expiredSelectiveBackups = await this.getExpiredBackups(
        organizationId,
        selectiveRetentionDays,
        'selective'
      );

      // Combine all expired backups
      const allExpiredBackups = [...expiredFullBackups, ...expiredSelectiveBackups];

      // Delete expired backups
      if (allExpiredBackups.length > 0) {
        totalDeleted = await this.deleteExpiredBackups(allExpiredBackups);
      }

      return totalDeleted;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to apply retention policy: ${message}`);
    }
  }

  /**
   * Get expired backups based on retention period
   * 
   * Identifies backups that are older than the specified retention period
   * and are eligible for deletion (status: completed, failed, or corrupted).
   * 
   * @param organizationId - Organization ID (null for single-tenant)
   * @param retentionDays - Number of days to retain backups
   * @param backupType - Optional backup type filter ('full' or 'selective')
   * @returns List of expired backups
   * @throws Error if query fails
   * 
   * Requirements: 7.2, 7.6
   */
  async getExpiredBackups(
    organizationId: string | null,
    retentionDays: number,
    backupType?: 'full' | 'selective'
  ): Promise<Backup[]> {
    const supabase = getSupabaseServiceRoleClient();
    if (!supabase) {
      throw new Error('Supabase service role client not configured');
    }

    // Calculate cutoff date
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);
    const cutoffIso = cutoffDate.toISOString();

    try {
      // Build query
      let query = supabase
        .from('backups')
        .select('*')
        .lt('created_at', cutoffIso)
        .in('status', ['completed', 'failed', 'corrupted']);

      // Apply organization filter
      if (organizationId) {
        query = query.eq('organization_id', organizationId);
      }

      // Apply backup type filter
      if (backupType) {
        query = query.eq('backup_type', backupType);
      }

      // Order by creation date (oldest first)
      query = query.order('created_at', { ascending: true });

      const { data, error } = await query;

      if (error) {
        throw new Error(`Failed to get expired backups: ${error.message}`);
      }

      return (data || []).map(record => this.mapBackupRecord(record));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to identify expired backups: ${message}`);
    }
  }

  /**
   * Delete expired backups
   * 
   * Deletes backup files from storage and updates database records to "deleted" status.
   * Operations are performed individually to ensure partial success if some deletions fail.
   * 
   * @param backups - List of backups to delete
   * @returns Number of successfully deleted backups
   * @throws Error if deletion process fails critically
   * 
   * Requirements: 7.3, 7.5
   */
  async deleteExpiredBackups(backups: Backup[]): Promise<number> {
    const supabase = getSupabaseServiceRoleClient();
    if (!supabase) {
      throw new Error('Supabase service role client not configured');
    }

    let deletedCount = 0;
    const errors: string[] = [];

    for (const backup of backups) {
      try {
        // Delete file from storage if it exists
        if (backup.filePath) {
          try {
            await storageService.deleteBackup(
              backup.organizationId || 'system',
              backup.id
            );
          } catch (storageError) {
            // Log storage error but continue with database update
            const message = storageError instanceof Error ? storageError.message : 'Unknown error';
            errors.push(`Storage deletion failed for backup ${backup.id}: ${message}`);
          }
        }

        // Update backup record status to "deleted"
        const { error: updateError } = await supabase
          .from('backups')
          .update({ status: 'deleted' })
          .eq('id', backup.id);

        if (updateError) {
          errors.push(`Database update failed for backup ${backup.id}: ${updateError.message}`);
          continue;
        }

        deletedCount++;
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        errors.push(`Failed to delete backup ${backup.id}: ${message}`);
      }
    }

    // If we had errors but some succeeded, log them
    if (errors.length > 0) {
      console.error('Retention policy deletion errors:', errors);
    }

    return deletedCount;
  }

  /**
   * Map database record to Backup type
   * 
   * @param record - Database record
   * @returns Backup object
   */
  private mapBackupRecord(record: any): Backup {
    return {
      id: record.id,
      organizationId: record.organization_id || 'system',
      createdBy: record.created_by,
      createdAt: record.created_at,
      backupType: record.backup_type,
      status: record.status,
      filePath: record.file_path,
      fileSize: record.file_size,
      compressedSize: record.compressed_size,
      tablesIncluded: record.tables_included || [],
      metadata: record.metadata || {
        formatVersion: '1.0.0',
        databaseVersion: 'unknown',
        timestamp: record.created_at,
        tableSchemas: {},
      },
      errorMessage: record.error_message,
      validatedAt: record.validated_at,
      creatorName: undefined,
    };
  }
}

/**
 * Create a singleton instance of RetentionService
 */
export const retentionService = new RetentionService();
