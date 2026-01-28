/**
 * BackupService - Handles backup creation and management
 * 
 * This service manages backup operations including:
 * - Creating full and selective backups
 * - Exporting table data to JSON
 * - Compressing backup data
 * - Validating backup integrity
 * - Listing backups with filters
 * - Getting backup metadata
 * 
 * Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 8.1, 8.2, 8.3, 8.4, 8.6, 15.1, 15.2, 15.5
 */

import { getSupabaseServiceRoleClient } from "@/lib/supabase/server";
import type {
  Backup,
  BackupData,
  BackupFilters,
  BackupMetadata,
  CreateBackupOptions,
  TableData,
  TableSchema,
  UserRole,
} from "@/server/backup/models/types";
import { compressData, decompressData } from "@/server/backup/utils/compression";
import { storageService } from "@/server/backup/services/storageService";

const BACKUP_FORMAT_VERSION = "1.0.0";

const BACKUPABLE_TABLES = [
  'profiles',
  'categories',
  'expense_classifications',
  'revenues',
  'expenses',
  'report_jobs',
  'report_schedules',
  'audit_logs',
] as const;

export class BackupService {
  private validateRole(userRole: UserRole): void {
    if (userRole !== 'admin' && userRole !== 'superadmin') {
      throw new Error('Você não tem permissão para realizar esta operação');
    }
  }

  async listBackups(
    organizationId: string | null,
    filters?: BackupFilters
  ): Promise<Backup[]> {
    const supabase = getSupabaseServiceRoleClient();
    if (!supabase) {
      throw new Error('Supabase service role client not configured');
    }

    let query = supabase
      .from('backups')
      .select('*')
      .order('created_at', { ascending: false });

    if (organizationId) {
      query = query.eq('organization_id', organizationId);
    } else {
      query = query.is('organization_id', null);
    }

    if (filters) {
      if (filters.startDate) {
        query = query.gte('created_at', filters.startDate);
      }
      if (filters.endDate) {
        query = query.lte('created_at', filters.endDate);
      }
      if (filters.backupType) {
        query = query.eq('backup_type', filters.backupType);
      }
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to list backups: ${error.message}`);
    }

    return (data || []).map(row => ({
      id: row.id,
      organizationId: row.organization_id,
      createdBy: row.created_by,
      createdAt: row.created_at,
      backupType: row.backup_type as 'full' | 'selective',
      status: row.status as 'pending' | 'in_progress' | 'completed' | 'failed' | 'deleted' | 'corrupted',
      filePath: row.file_path,
      fileSize: row.file_size,
      compressedSize: row.compressed_size,
      tablesIncluded: row.tables_included || [],
      metadata: row.metadata || {},
      errorMessage: row.error_message,
      validatedAt: row.validated_at,
    }));
  }

  async createBackup(
    organizationId: string | null,
    userId: string,
    userRole: UserRole,
    options: CreateBackupOptions
  ): Promise<Backup> {
    this.validateRole(userRole);

    const supabase = getSupabaseServiceRoleClient();
    if (!supabase) {
      throw new Error('Supabase service role client not configured');
    }

    if (options.backupType === 'selective' && (!options.tables || options.tables.length === 0)) {
      throw new Error('Selective backups must include at least one table');
    }

    const tablesToBackup = options.backupType === 'full' 
      ? [...BACKUPABLE_TABLES] 
      : options.tables!;

    const { data: backupRecord, error: insertError } = await supabase
      .from('backups')
      .insert({
        organization_id: organizationId,
        created_by: userId,
        backup_type: options.backupType,
        status: 'pending',
        tables_included: tablesToBackup,
        metadata: {},
      })
      .select()
      .single();

    if (insertError || !backupRecord) {
      throw new Error(`Failed to create backup record: ${insertError?.message || 'Unknown error'}`);
    }

    try {
      await supabase
        .from('backups')
        .update({ status: 'in_progress' })
        .eq('id', backupRecord.id);

      const backupData = await this.exportTables(organizationId, tablesToBackup);

      const jsonData = JSON.stringify(backupData);
      const originalSize = Buffer.byteLength(jsonData, 'utf-8');
      const compressedData = await compressData(jsonData);
      const compressedSize = compressedData.length;

      const filePath = await storageService.uploadBackup(
        organizationId || 'system',
        backupRecord.id,
        compressedData
      );

      const { data: updatedBackup, error: updateError } = await supabase
        .from('backups')
        .update({
          status: 'completed',
          file_path: filePath,
          file_size: originalSize,
          compressed_size: compressedSize,
          metadata: backupData.metadata,
        })
        .eq('id', backupRecord.id)
        .select()
        .single();

      if (updateError || !updatedBackup) {
        throw new Error(`Failed to update backup record: ${updateError?.message || 'Unknown error'}`);
      }

      await this.validateBackup(backupRecord.id);

      return {
        id: updatedBackup.id,
        organizationId: updatedBackup.organization_id,
        createdBy: updatedBackup.created_by,
        createdAt: updatedBackup.created_at,
        backupType: updatedBackup.backup_type as 'full' | 'selective',
        status: updatedBackup.status as 'completed',
        filePath: updatedBackup.file_path,
        fileSize: updatedBackup.file_size,
        compressedSize: updatedBackup.compressed_size,
        tablesIncluded: updatedBackup.tables_included || [],
        metadata: updatedBackup.metadata || {},
        errorMessage: updatedBackup.error_message,
        validatedAt: updatedBackup.validated_at,
      };
    } catch (error) {
      await supabase
        .from('backups')
        .update({
          status: 'failed',
          error_message: error instanceof Error ? error.message : 'Unknown error',
        })
        .eq('id', backupRecord.id);

      throw error;
    }
  }

  private async exportTables(
    organizationId: string | null,
    tables: readonly string[]
  ): Promise<BackupData> {
    const supabase = getSupabaseServiceRoleClient();
    if (!supabase) {
      throw new Error('Supabase service role client not configured');
    }

    const tableData: Record<string, TableData> = {};
    const tableSchemas: Record<string, TableSchema> = {};

    for (const tableName of tables) {
      const { data, error } = await supabase
        .from(tableName)
        .select('*');

      if (error) {
        throw new Error(`Failed to export table ${tableName}: ${error.message}`);
      }

      const rows = data || [];
      const columns: Array<{ name: string; type: string; nullable: boolean; defaultValue: string | null }> = [];
      
      if (rows.length > 0) {
        Object.keys(rows[0]).forEach(key => {
          columns.push({
            name: key,
            type: typeof rows[0][key],
            nullable: true,
            defaultValue: null,
          });
        });
      }

      const schema: TableSchema = {
        name: tableName,
        columns,
        rowCount: rows.length,
      };

      tableSchemas[tableName] = schema;

      tableData[tableName] = {
        schema,
        rows,
      };
    }

    return {
      metadata: {
        formatVersion: BACKUP_FORMAT_VERSION,
        databaseVersion: '1.0.0',
        timestamp: new Date().toISOString(),
        tableSchemas,
      },
      tables: tableData,
    };
  }

  async validateBackup(backupId: string): Promise<{ valid: boolean; error?: string }> {
    const supabase = getSupabaseServiceRoleClient();
    if (!supabase) {
      throw new Error('Supabase service role client not configured');
    }

    try {
      const { data: backup, error: fetchError } = await supabase
        .from('backups')
        .select('*')
        .eq('id', backupId)
        .single();

      if (fetchError || !backup) {
        return { valid: false, error: 'Backup record not found' };
      }

      if (!backup.file_path) {
        return { valid: false, error: 'No file path recorded' };
      }

      const organizationId = backup.organization_id || 'system';
      
      try {
        const compressedData = await storageService.downloadBackup(organizationId, backupId);
        const decompressedBuffer = await decompressData(compressedData);
        const jsonData = decompressedBuffer.toString('utf-8');
        const backupData = JSON.parse(jsonData) as BackupData;

        if (!backupData.metadata?.formatVersion) {
          return { valid: false, error: 'Missing format version' };
        }

        if (!backupData.tables || Object.keys(backupData.tables).length === 0) {
          return { valid: false, error: 'No tables in backup' };
        }

        await supabase
          .from('backups')
          .update({ validated_at: new Date().toISOString() })
          .eq('id', backupId);

        return { valid: true };
      } catch (error) {
        await supabase
          .from('backups')
          .update({ status: 'corrupted' })
          .eq('id', backupId);

        return { 
          valid: false, 
          error: error instanceof Error ? error.message : 'Validation failed' 
        };
      }
    } catch (error) {
      return { 
        valid: false, 
        error: error instanceof Error ? error.message : 'Unknown validation error' 
      };
    }
  }

  async getBackupMetadata(backupId: string): Promise<BackupMetadata | null> {
    const supabase = getSupabaseServiceRoleClient();
    if (!supabase) {
      throw new Error('Supabase service role client not configured');
    }

    const { data, error } = await supabase
      .from('backups')
      .select('metadata')
      .eq('id', backupId)
      .single();

    if (error || !data) {
      return null;
    }

    return data.metadata as BackupMetadata;
  }
}

export const backupService = new BackupService();
