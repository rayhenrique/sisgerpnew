/**
 * Unit tests for StorageService
 * 
 * Tests storage operations including upload, download, delete, URL generation,
 * and file existence checks. Uses mocks to avoid actual Supabase calls.
 * 
 * Requirements: 4.2, 4.3, 4.4
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { StorageService } from './storageService';

// Mock the Supabase client
vi.mock('@/lib/supabase/server', () => ({
  getSupabaseServiceRoleClient: vi.fn(),
}));

import { getSupabaseServiceRoleClient } from '@/lib/supabase/server';

describe('StorageService', () => {
  let storageService: StorageService;
  let mockSupabase: any;

  beforeEach(() => {
    storageService = new StorageService();
    
    // Reset mocks
    vi.clearAllMocks();
    
    // Create mock Supabase client
    mockSupabase = {
      storage: {
        from: vi.fn(),
      },
    };
  });

  describe('uploadBackup', () => {
    it('should successfully upload a backup file', async () => {
      const mockUpload = vi.fn().mockResolvedValue({ error: null });
      mockSupabase.storage.from.mockReturnValue({
        upload: mockUpload,
      });
      vi.mocked(getSupabaseServiceRoleClient).mockReturnValue(mockSupabase);

      const organizationId = 'org-123';
      const backupId = 'backup-456';
      const data = Buffer.from('compressed backup data');

      const result = await storageService.uploadBackup(organizationId, backupId, data);

      expect(result).toBe('org-123/backup-456.gz');
      expect(mockSupabase.storage.from).toHaveBeenCalledWith('backups');
      expect(mockUpload).toHaveBeenCalledWith(
        'org-123/backup-456.gz',
        data,
        {
          contentType: 'application/gzip',
          upsert: false,
        }
      );
    });

    it('should throw error when Supabase client is not configured', async () => {
      vi.mocked(getSupabaseServiceRoleClient).mockReturnValue(null);

      const organizationId = 'org-123';
      const backupId = 'backup-456';
      const data = Buffer.from('test data');

      await expect(
        storageService.uploadBackup(organizationId, backupId, data)
      ).rejects.toThrow('Supabase service role client not configured');
    });

    it('should throw error when upload fails', async () => {
      const mockUpload = vi.fn().mockResolvedValue({
        error: { message: 'Storage quota exceeded' },
      });
      mockSupabase.storage.from.mockReturnValue({
        upload: mockUpload,
      });
      vi.mocked(getSupabaseServiceRoleClient).mockReturnValue(mockSupabase);

      const organizationId = 'org-123';
      const backupId = 'backup-456';
      const data = Buffer.from('test data');

      await expect(
        storageService.uploadBackup(organizationId, backupId, data)
      ).rejects.toThrow('Failed to upload backup: Storage quota exceeded');
    });

    it('should handle unexpected errors during upload', async () => {
      const mockUpload = vi.fn().mockRejectedValue(new Error('Network error'));
      mockSupabase.storage.from.mockReturnValue({
        upload: mockUpload,
      });
      vi.mocked(getSupabaseServiceRoleClient).mockReturnValue(mockSupabase);

      const organizationId = 'org-123';
      const backupId = 'backup-456';
      const data = Buffer.from('test data');

      await expect(
        storageService.uploadBackup(organizationId, backupId, data)
      ).rejects.toThrow('Storage upload error: Network error');
    });
  });

  describe('downloadBackup', () => {
    it('should successfully download a backup file', async () => {
      const mockData = new Blob(['compressed backup data']);
      const mockDownload = vi.fn().mockResolvedValue({
        data: mockData,
        error: null,
      });
      mockSupabase.storage.from.mockReturnValue({
        download: mockDownload,
      });
      vi.mocked(getSupabaseServiceRoleClient).mockReturnValue(mockSupabase);

      const organizationId = 'org-123';
      const backupId = 'backup-456';

      const result = await storageService.downloadBackup(organizationId, backupId);

      expect(result).toBeInstanceOf(Buffer);
      expect(mockSupabase.storage.from).toHaveBeenCalledWith('backups');
      expect(mockDownload).toHaveBeenCalledWith('org-123/backup-456.gz');
    });

    it('should throw error when Supabase client is not configured', async () => {
      vi.mocked(getSupabaseServiceRoleClient).mockReturnValue(null);

      const organizationId = 'org-123';
      const backupId = 'backup-456';

      await expect(
        storageService.downloadBackup(organizationId, backupId)
      ).rejects.toThrow('Supabase service role client not configured');
    });

    it('should throw error when file is not found', async () => {
      const mockDownload = vi.fn().mockResolvedValue({
        data: null,
        error: { message: 'Object not found' },
      });
      mockSupabase.storage.from.mockReturnValue({
        download: mockDownload,
      });
      vi.mocked(getSupabaseServiceRoleClient).mockReturnValue(mockSupabase);

      const organizationId = 'org-123';
      const backupId = 'backup-456';

      await expect(
        storageService.downloadBackup(organizationId, backupId)
      ).rejects.toThrow('Backup file not found in storage');
    });

    it('should throw error when download fails', async () => {
      const mockDownload = vi.fn().mockResolvedValue({
        data: null,
        error: { message: 'Permission denied' },
      });
      mockSupabase.storage.from.mockReturnValue({
        download: mockDownload,
      });
      vi.mocked(getSupabaseServiceRoleClient).mockReturnValue(mockSupabase);

      const organizationId = 'org-123';
      const backupId = 'backup-456';

      await expect(
        storageService.downloadBackup(organizationId, backupId)
      ).rejects.toThrow('Failed to download backup: Permission denied');
    });

    it('should throw error when no data is returned', async () => {
      const mockDownload = vi.fn().mockResolvedValue({
        data: null,
        error: null,
      });
      mockSupabase.storage.from.mockReturnValue({
        download: mockDownload,
      });
      vi.mocked(getSupabaseServiceRoleClient).mockReturnValue(mockSupabase);

      const organizationId = 'org-123';
      const backupId = 'backup-456';

      await expect(
        storageService.downloadBackup(organizationId, backupId)
      ).rejects.toThrow('No data returned from storage');
    });
  });

  describe('deleteBackup', () => {
    it('should successfully delete a backup file', async () => {
      const mockRemove = vi.fn().mockResolvedValue({ error: null });
      mockSupabase.storage.from.mockReturnValue({
        remove: mockRemove,
      });
      vi.mocked(getSupabaseServiceRoleClient).mockReturnValue(mockSupabase);

      const organizationId = 'org-123';
      const backupId = 'backup-456';

      await storageService.deleteBackup(organizationId, backupId);

      expect(mockSupabase.storage.from).toHaveBeenCalledWith('backups');
      expect(mockRemove).toHaveBeenCalledWith(['org-123/backup-456.gz']);
    });

    it('should throw error when Supabase client is not configured', async () => {
      vi.mocked(getSupabaseServiceRoleClient).mockReturnValue(null);

      const organizationId = 'org-123';
      const backupId = 'backup-456';

      await expect(
        storageService.deleteBackup(organizationId, backupId)
      ).rejects.toThrow('Supabase service role client not configured');
    });

    it('should throw error when deletion fails', async () => {
      const mockRemove = vi.fn().mockResolvedValue({
        error: { message: 'Permission denied' },
      });
      mockSupabase.storage.from.mockReturnValue({
        remove: mockRemove,
      });
      vi.mocked(getSupabaseServiceRoleClient).mockReturnValue(mockSupabase);

      const organizationId = 'org-123';
      const backupId = 'backup-456';

      await expect(
        storageService.deleteBackup(organizationId, backupId)
      ).rejects.toThrow('Failed to delete backup: Permission denied');
    });

    it('should handle unexpected errors during deletion', async () => {
      const mockRemove = vi.fn().mockRejectedValue(new Error('Network error'));
      mockSupabase.storage.from.mockReturnValue({
        remove: mockRemove,
      });
      vi.mocked(getSupabaseServiceRoleClient).mockReturnValue(mockSupabase);

      const organizationId = 'org-123';
      const backupId = 'backup-456';

      await expect(
        storageService.deleteBackup(organizationId, backupId)
      ).rejects.toThrow('Storage deletion error: Network error');
    });
  });

  describe('getDownloadUrl', () => {
    it('should generate a signed download URL', async () => {
      const mockList = vi.fn().mockResolvedValue({
        data: [{ name: 'backup-456.gz' }],
        error: null,
      });
      const mockCreateSignedUrl = vi.fn().mockResolvedValue({
        data: { signedUrl: 'https://storage.example.com/signed-url' },
        error: null,
      });
      mockSupabase.storage.from.mockReturnValue({
        list: mockList,
        createSignedUrl: mockCreateSignedUrl,
      });
      vi.mocked(getSupabaseServiceRoleClient).mockReturnValue(mockSupabase);

      const organizationId = 'org-123';
      const backupId = 'backup-456';

      const result = await storageService.getDownloadUrl(organizationId, backupId);

      expect(result).toBe('https://storage.example.com/signed-url');
      expect(mockCreateSignedUrl).toHaveBeenCalledWith('org-123/backup-456.gz', 3600);
    });

    it('should use custom expiration time', async () => {
      const mockList = vi.fn().mockResolvedValue({
        data: [{ name: 'backup-456.gz' }],
        error: null,
      });
      const mockCreateSignedUrl = vi.fn().mockResolvedValue({
        data: { signedUrl: 'https://storage.example.com/signed-url' },
        error: null,
      });
      mockSupabase.storage.from.mockReturnValue({
        list: mockList,
        createSignedUrl: mockCreateSignedUrl,
      });
      vi.mocked(getSupabaseServiceRoleClient).mockReturnValue(mockSupabase);

      const organizationId = 'org-123';
      const backupId = 'backup-456';
      const expiresIn = 7200; // 2 hours

      await storageService.getDownloadUrl(organizationId, backupId, expiresIn);

      expect(mockCreateSignedUrl).toHaveBeenCalledWith('org-123/backup-456.gz', 7200);
    });

    it('should throw error when file does not exist', async () => {
      const mockList = vi.fn().mockResolvedValue({
        data: [],
        error: null,
      });
      mockSupabase.storage.from.mockReturnValue({
        list: mockList,
      });
      vi.mocked(getSupabaseServiceRoleClient).mockReturnValue(mockSupabase);

      const organizationId = 'org-123';
      const backupId = 'backup-456';

      await expect(
        storageService.getDownloadUrl(organizationId, backupId)
      ).rejects.toThrow('Backup file not found in storage');
    });

    it('should throw error when Supabase client is not configured', async () => {
      vi.mocked(getSupabaseServiceRoleClient).mockReturnValue(null);

      const organizationId = 'org-123';
      const backupId = 'backup-456';

      await expect(
        storageService.getDownloadUrl(organizationId, backupId)
      ).rejects.toThrow('Supabase service role client not configured');
    });

    it('should throw error when URL generation fails', async () => {
      const mockList = vi.fn().mockResolvedValue({
        data: [{ name: 'backup-456.gz' }],
        error: null,
      });
      const mockCreateSignedUrl = vi.fn().mockResolvedValue({
        data: null,
        error: { message: 'Invalid bucket' },
      });
      mockSupabase.storage.from.mockReturnValue({
        list: mockList,
        createSignedUrl: mockCreateSignedUrl,
      });
      vi.mocked(getSupabaseServiceRoleClient).mockReturnValue(mockSupabase);

      const organizationId = 'org-123';
      const backupId = 'backup-456';

      await expect(
        storageService.getDownloadUrl(organizationId, backupId)
      ).rejects.toThrow('Failed to generate download URL: Invalid bucket');
    });

    it('should throw error when no signed URL is returned', async () => {
      const mockList = vi.fn().mockResolvedValue({
        data: [{ name: 'backup-456.gz' }],
        error: null,
      });
      const mockCreateSignedUrl = vi.fn().mockResolvedValue({
        data: {},
        error: null,
      });
      mockSupabase.storage.from.mockReturnValue({
        list: mockList,
        createSignedUrl: mockCreateSignedUrl,
      });
      vi.mocked(getSupabaseServiceRoleClient).mockReturnValue(mockSupabase);

      const organizationId = 'org-123';
      const backupId = 'backup-456';

      await expect(
        storageService.getDownloadUrl(organizationId, backupId)
      ).rejects.toThrow('No signed URL returned from storage');
    });
  });

  describe('fileExists', () => {
    it('should return true when file exists', async () => {
      const mockList = vi.fn().mockResolvedValue({
        data: [
          { name: 'backup-456.gz' },
          { name: 'backup-789.gz' },
        ],
        error: null,
      });
      mockSupabase.storage.from.mockReturnValue({
        list: mockList,
      });
      vi.mocked(getSupabaseServiceRoleClient).mockReturnValue(mockSupabase);

      const organizationId = 'org-123';
      const backupId = 'backup-456';

      const result = await storageService.fileExists(organizationId, backupId);

      expect(result).toBe(true);
      expect(mockSupabase.storage.from).toHaveBeenCalledWith('backups');
      expect(mockList).toHaveBeenCalledWith('org-123', {
        search: 'backup-456.gz',
      });
    });

    it('should return false when file does not exist', async () => {
      const mockList = vi.fn().mockResolvedValue({
        data: [
          { name: 'backup-789.gz' },
        ],
        error: null,
      });
      mockSupabase.storage.from.mockReturnValue({
        list: mockList,
      });
      vi.mocked(getSupabaseServiceRoleClient).mockReturnValue(mockSupabase);

      const organizationId = 'org-123';
      const backupId = 'backup-456';

      const result = await storageService.fileExists(organizationId, backupId);

      expect(result).toBe(false);
    });

    it('should return false when list operation fails', async () => {
      const mockList = vi.fn().mockResolvedValue({
        data: null,
        error: { message: 'Permission denied' },
      });
      mockSupabase.storage.from.mockReturnValue({
        list: mockList,
      });
      vi.mocked(getSupabaseServiceRoleClient).mockReturnValue(mockSupabase);

      const organizationId = 'org-123';
      const backupId = 'backup-456';

      const result = await storageService.fileExists(organizationId, backupId);

      expect(result).toBe(false);
    });

    it('should return false when Supabase client is not configured', async () => {
      vi.mocked(getSupabaseServiceRoleClient).mockReturnValue(null);

      const organizationId = 'org-123';
      const backupId = 'backup-456';

      const result = await storageService.fileExists(organizationId, backupId);

      expect(result).toBe(false);
    });

    it('should return false when list returns empty array', async () => {
      const mockList = vi.fn().mockResolvedValue({
        data: [],
        error: null,
      });
      mockSupabase.storage.from.mockReturnValue({
        list: mockList,
      });
      vi.mocked(getSupabaseServiceRoleClient).mockReturnValue(mockSupabase);

      const organizationId = 'org-123';
      const backupId = 'backup-456';

      const result = await storageService.fileExists(organizationId, backupId);

      expect(result).toBe(false);
    });

    it('should handle unexpected errors gracefully', async () => {
      const mockList = vi.fn().mockRejectedValue(new Error('Network error'));
      mockSupabase.storage.from.mockReturnValue({
        list: mockList,
      });
      vi.mocked(getSupabaseServiceRoleClient).mockReturnValue(mockSupabase);

      const organizationId = 'org-123';
      const backupId = 'backup-456';

      const result = await storageService.fileExists(organizationId, backupId);

      expect(result).toBe(false);
    });
  });
});
