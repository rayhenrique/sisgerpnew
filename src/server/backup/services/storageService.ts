/**
 * StorageService - Handles file operations with Supabase Storage
 * 
 * This service manages backup file storage operations including:
 * - Uploading compressed backup files to Supabase Storage
 * - Downloading backup files for restoration
 * - Deleting backup files
 * - Generating signed download URLs
 * - Checking file existence
 * 
 * Files are stored in a 'backups' bucket with organization-based folder structure:
 * backups/{organizationId}/{backupId}.gz
 * 
 * Requirements: 1.5, 4.2, 4.3, 4.4, 5.3, 6.2
 */

import { getSupabaseServiceRoleClient } from "@/lib/supabase/server";

/**
 * StorageService class for managing backup file operations
 */
export class StorageService {
  private readonly bucketName = 'backups';

  /**
   * Get the file path for a backup
   * @param organizationId - Organization ID
   * @param backupId - Backup ID
   * @returns File path in storage
   */
  private getFilePath(organizationId: string, backupId: string): string {
    return `${organizationId}/${backupId}.gz`;
  }

  /**
   * Upload a backup file to Supabase Storage
   * 
   * @param organizationId - Organization ID for folder structure
   * @param backupId - Unique backup identifier
   * @param data - Compressed backup data as Buffer
   * @returns File path in storage
   * @throws Error if upload fails
   * 
   * Requirements: 1.5, 1.8
   */
  async uploadBackup(
    organizationId: string,
    backupId: string,
    data: Buffer
  ): Promise<string> {
    const supabase = getSupabaseServiceRoleClient();
    if (!supabase) {
      throw new Error('Supabase service role client not configured');
    }

    const filePath = this.getFilePath(organizationId, backupId);

    try {
      const { error } = await supabase.storage
        .from(this.bucketName)
        .upload(filePath, data, {
          contentType: 'application/gzip',
          upsert: false, // Don't overwrite existing files
        });

      if (error) {
        throw new Error(`Failed to upload backup: ${error.message}`);
      }

      return filePath;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Storage upload error: ${error.message}`);
      }
      throw new Error('Unknown storage upload error');
    }
  }

  /**
   * Download a backup file from Supabase Storage
   * 
   * @param organizationId - Organization ID for folder structure
   * @param backupId - Unique backup identifier
   * @returns Compressed backup data as Buffer
   * @throws Error if download fails or file doesn't exist
   * 
   * Requirements: 4.2, 5.3
   */
  async downloadBackup(
    organizationId: string,
    backupId: string
  ): Promise<Buffer> {
    const supabase = getSupabaseServiceRoleClient();
    if (!supabase) {
      throw new Error('Supabase service role client not configured');
    }

    const filePath = this.getFilePath(organizationId, backupId);

    try {
      const { data, error } = await supabase.storage
        .from(this.bucketName)
        .download(filePath);

      if (error) {
        if (error.message.includes('not found') || error.message.includes('does not exist')) {
          throw new Error('Backup file not found in storage');
        }
        throw new Error(`Failed to download backup: ${error.message}`);
      }

      if (!data) {
        throw new Error('No data returned from storage');
      }

      // Convert Blob to Buffer
      const arrayBuffer = await data.arrayBuffer();
      return Buffer.from(arrayBuffer);
    } catch (error) {
      if (error instanceof Error) {
        throw error; // Re-throw our custom errors
      }
      throw new Error('Unknown storage download error');
    }
  }

  /**
   * Delete a backup file from Supabase Storage
   * 
   * @param organizationId - Organization ID for folder structure
   * @param backupId - Unique backup identifier
   * @throws Error if deletion fails
   * 
   * Requirements: 6.2
   */
  async deleteBackup(
    organizationId: string,
    backupId: string
  ): Promise<void> {
    const supabase = getSupabaseServiceRoleClient();
    if (!supabase) {
      throw new Error('Supabase service role client not configured');
    }

    const filePath = this.getFilePath(organizationId, backupId);

    try {
      const { error } = await supabase.storage
        .from(this.bucketName)
        .remove([filePath]);

      if (error) {
        throw new Error(`Failed to delete backup: ${error.message}`);
      }
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Storage deletion error: ${error.message}`);
      }
      throw new Error('Unknown storage deletion error');
    }
  }

  /**
   * Generate a signed download URL for a backup file
   * 
   * @param organizationId - Organization ID for folder structure
   * @param backupId - Unique backup identifier
   * @param expiresIn - URL expiration time in seconds (default: 3600 = 1 hour)
   * @returns Signed URL for downloading the backup
   * @throws Error if URL generation fails or file doesn't exist
   * 
   * Requirements: 4.3
   */
  async getDownloadUrl(
    organizationId: string,
    backupId: string,
    expiresIn: number = 3600
  ): Promise<string> {
    const supabase = getSupabaseServiceRoleClient();
    if (!supabase) {
      throw new Error('Supabase service role client not configured');
    }

    const filePath = this.getFilePath(organizationId, backupId);

    // First check if file exists
    const exists = await this.fileExists(organizationId, backupId);
    if (!exists) {
      throw new Error('Backup file not found in storage');
    }

    try {
      const { data, error } = await supabase.storage
        .from(this.bucketName)
        .createSignedUrl(filePath, expiresIn);

      if (error) {
        throw new Error(`Failed to generate download URL: ${error.message}`);
      }

      if (!data?.signedUrl) {
        throw new Error('No signed URL returned from storage');
      }

      return data.signedUrl;
    } catch (error) {
      if (error instanceof Error) {
        throw error; // Re-throw our custom errors
      }
      throw new Error('Unknown URL generation error');
    }
  }

  /**
   * Check if a backup file exists in storage
   * 
   * @param organizationId - Organization ID for folder structure
   * @param backupId - Unique backup identifier
   * @returns True if file exists, false otherwise
   * 
   * Requirements: 4.4
   */
  async fileExists(
    organizationId: string,
    backupId: string
  ): Promise<boolean> {
    const supabase = getSupabaseServiceRoleClient();
    if (!supabase) {
      return false;
    }

    const filePath = this.getFilePath(organizationId, backupId);

    try {
      const { data, error } = await supabase.storage
        .from(this.bucketName)
        .list(organizationId, {
          search: `${backupId}.gz`,
        });

      if (error) {
        // If we can't list files, assume it doesn't exist
        return false;
      }

      // Check if the file is in the list
      return data?.some(file => file.name === `${backupId}.gz`) ?? false;
    } catch (error) {
      // On any error, assume file doesn't exist
      return false;
    }
  }
}

/**
 * Create a singleton instance of StorageService
 */
export const storageService = new StorageService();
