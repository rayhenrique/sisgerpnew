/**
 * Unit tests for RetentionService
 * 
 * Tests retention policy application, expired backup identification,
 * and automatic deletion functionality.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { retentionService } from './retentionService';
import type { Backup } from '@/server/backup/models/types';

// Helper function to create mock backups
function createMockBackup(overrides: Partial<Backup> = {}): Backup {
  return {
    id: 'backup-1',
    organizationId: 'org-1',
    createdBy: 'user-1',
    createdAt: new Date().toISOString(),
    backupType: 'full',
    status: 'completed',
    filePath: 'org-1/backup-1.gz',
    fileSize: 1000,
    compressedSize: 500,
    tablesIncluded: ['table1'],
    metadata: {
      formatVersion: '1.0.0',
      databaseVersion: 'PostgreSQL 15',
      timestamp: new Date().toISOString(),
      tableSchemas: {},
    },
    errorMessage: null,
    validatedAt: null,
    ...overrides,
  };
}

// Mock Supabase client
const mockSupabase = {
  from: vi.fn(),
  storage: {
    from: vi.fn(),
  },
};

// Mock storage service
vi.mock('./storageService', () => ({
  storageService: {
    deleteBackup: vi.fn(),
  },
}));

// Mock Supabase server client
vi.mock('@/lib/supabase/server', () => ({
  getSupabaseServiceRoleClient: vi.fn(() => mockSupabase),
}));

describe('RetentionService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getExpiredBackups', () => {
    it('should identify backups older than retention period', async () => {
      // Create mock backups - one old, one recent
      const oldDate = new Date();
      oldDate.setDate(oldDate.getDate() - 100); // 100 days old

      const recentDate = new Date();
      recentDate.setDate(recentDate.getDate() - 10); // 10 days old

      const mockBackups = [
        {
          id: 'old-backup-1',
          organization_id: 'org-1',
          created_by: 'user-1',
          created_at: oldDate.toISOString(),
          backup_type: 'full',
          status: 'completed',
          file_path: 'org-1/old-backup-1.gz',
          file_size: 1000,
          compressed_size: 500,
          tables_included: ['table1'],
          metadata: {},
          error_message: null,
          validated_at: null,
        },
      ];

      // Mock query chain
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        lt: vi.fn().mockReturnThis(),
        in: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: mockBackups, error: null }),
      };

      mockSupabase.from.mockReturnValue(mockQuery);

      // Get expired backups with 90 day retention
      const expired = await retentionService.getExpiredBackups('org-1', 90);

      expect(expired).toHaveLength(1);
      expect(expired[0].id).toBe('old-backup-1');
      expect(mockQuery.lt).toHaveBeenCalledWith('created_at', expect.any(String));
      expect(mockQuery.in).toHaveBeenCalledWith('status', ['completed', 'failed', 'corrupted']);
    });

    it('should filter by backup type when specified', async () => {
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        lt: vi.fn().mockReturnThis(),
        in: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: [], error: null }),
      };

      mockSupabase.from.mockReturnValue(mockQuery);

      await retentionService.getExpiredBackups('org-1', 30, 'selective');

      // Should be called twice: once for organization_id, once for backup_type
      expect(mockQuery.eq).toHaveBeenCalledWith('organization_id', 'org-1');
      expect(mockQuery.eq).toHaveBeenCalledWith('backup_type', 'selective');
    });

    it('should handle null organization ID', async () => {
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        lt: vi.fn().mockReturnThis(),
        in: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: [], error: null }),
      };

      mockSupabase.from.mockReturnValue(mockQuery);

      await retentionService.getExpiredBackups(null, 30);

      // Should not call eq for organization_id when null
      expect(mockQuery.eq).not.toHaveBeenCalledWith('organization_id', expect.anything());
    });

    it('should throw error if query fails', async () => {
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        lt: vi.fn().mockReturnThis(),
        in: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ 
          data: null, 
          error: { message: 'Database error' } 
        }),
      };

      mockSupabase.from.mockReturnValue(mockQuery);

      await expect(
        retentionService.getExpiredBackups('org-1', 30)
      ).rejects.toThrow('Failed to identify expired backups');
    });
  });

  describe('deleteExpiredBackups', () => {
    it('should delete backups from storage and update database', async () => {
      const { storageService } = await import('./storageService');
      
      const mockBackups: Backup[] = [createMockBackup()];

      const mockUpdate = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ error: null }),
      };

      mockSupabase.from.mockReturnValue(mockUpdate);
      vi.mocked(storageService.deleteBackup).mockResolvedValue(undefined);

      const deletedCount = await retentionService.deleteExpiredBackups(mockBackups);

      expect(deletedCount).toBe(1);
      expect(storageService.deleteBackup).toHaveBeenCalledWith('org-1', 'backup-1');
      expect(mockUpdate.update).toHaveBeenCalledWith({ status: 'deleted' });
      expect(mockUpdate.eq).toHaveBeenCalledWith('id', 'backup-1');
    });

    it('should continue deletion even if storage deletion fails', async () => {
      const { storageService } = await import('./storageService');
      
      const mockBackups: Backup[] = [createMockBackup()];

      const mockUpdate = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ error: null }),
      };

      mockSupabase.from.mockReturnValue(mockUpdate);
      vi.mocked(storageService.deleteBackup).mockRejectedValue(new Error('Storage error'));

      const deletedCount = await retentionService.deleteExpiredBackups(mockBackups);

      // Should still update database even if storage fails
      expect(deletedCount).toBe(1);
      expect(mockUpdate.update).toHaveBeenCalledWith({ status: 'deleted' });
    });

    it('should skip backup if database update fails', async () => {
      const { storageService } = await import('./storageService');
      
      const mockBackups: Backup[] = [createMockBackup()];

      const mockUpdate = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ error: { message: 'Update failed' } }),
      };

      mockSupabase.from.mockReturnValue(mockUpdate);
      vi.mocked(storageService.deleteBackup).mockResolvedValue(undefined);

      const deletedCount = await retentionService.deleteExpiredBackups(mockBackups);

      expect(deletedCount).toBe(0);
    });

    it('should handle backups without file paths', async () => {
      const { storageService } = await import('./storageService');
      
      const mockBackups: Backup[] = [
        createMockBackup({
          status: 'failed',
          filePath: null,
          fileSize: null,
          compressedSize: null,
          errorMessage: 'Backup failed',
        }),
      ];

      const mockUpdate = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ error: null }),
      };

      mockSupabase.from.mockReturnValue(mockUpdate);

      const deletedCount = await retentionService.deleteExpiredBackups(mockBackups);

      // Should not attempt storage deletion for backups without file paths
      expect(storageService.deleteBackup).not.toHaveBeenCalled();
      expect(deletedCount).toBe(1);
    });

    it('should return 0 for empty backup list', async () => {
      const deletedCount = await retentionService.deleteExpiredBackups([]);
      expect(deletedCount).toBe(0);
    });
  });

  describe('applyRetentionPolicy', () => {
    it('should apply different retention periods for full and selective backups', async () => {
      const oldDate = new Date();
      oldDate.setDate(oldDate.getDate() - 100);

      const mockFullBackups = [
        {
          id: 'full-backup-1',
          organization_id: 'org-1',
          created_by: 'user-1',
          created_at: oldDate.toISOString(),
          backup_type: 'full',
          status: 'completed',
          file_path: 'org-1/full-backup-1.gz',
          file_size: 1000,
          compressed_size: 500,
          tables_included: ['table1'],
          metadata: {},
          error_message: null,
          validated_at: null,
        },
      ];

      const mockSelectiveBackups = [
        {
          id: 'selective-backup-1',
          organization_id: 'org-1',
          created_by: 'user-1',
          created_at: oldDate.toISOString(),
          backup_type: 'selective',
          status: 'completed',
          file_path: 'org-1/selective-backup-1.gz',
          file_size: 500,
          compressed_size: 250,
          tables_included: ['table1'],
          metadata: {},
          error_message: null,
          validated_at: null,
        },
      ];

      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        lt: vi.fn().mockReturnThis(),
        in: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn(),
      };

      // First call returns full backups, second call returns selective backups
      mockQuery.order
        .mockResolvedValueOnce({ data: mockFullBackups, error: null })
        .mockResolvedValueOnce({ data: mockSelectiveBackups, error: null });

      mockSupabase.from.mockReturnValue(mockQuery);

      const mockUpdate = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ error: null }),
      };

      mockSupabase.from.mockReturnValue(mockQuery);
      
      // Mock the from method to return different objects for select vs update
      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'backups') {
          // Check if this is a select or update call based on call count
          const callCount = mockSupabase.from.mock.calls.length;
          if (callCount <= 2) {
            return mockQuery; // First two calls are selects
          } else {
            return mockUpdate; // Subsequent calls are updates
          }
        }
        return mockQuery;
      });

      const { storageService } = await import('./storageService');
      vi.mocked(storageService.deleteBackup).mockResolvedValue(undefined);

      const deletedCount = await retentionService.applyRetentionPolicy('org-1', {
        full: 90,
        selective: 30,
      });

      expect(deletedCount).toBe(2);
    });

    it('should use default retention periods when not specified', async () => {
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        lt: vi.fn().mockReturnThis(),
        in: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: [], error: null }),
      };

      mockSupabase.from.mockReturnValue(mockQuery);

      await retentionService.applyRetentionPolicy('org-1');

      // Should be called twice (once for full, once for selective)
      expect(mockQuery.order).toHaveBeenCalledTimes(2);
    });

    it('should throw error if retention policy fails', async () => {
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        lt: vi.fn().mockReturnThis(),
        in: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ 
          data: null, 
          error: { message: 'Database error' } 
        }),
      };

      mockSupabase.from.mockReturnValue(mockQuery);

      await expect(
        retentionService.applyRetentionPolicy('org-1')
      ).rejects.toThrow('Failed to apply retention policy');
    });
  });
});
