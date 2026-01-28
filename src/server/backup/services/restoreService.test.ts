/**
 * Unit tests for RestoreService
 * 
 * Tests restore operations including:
 * - Role-based access control
 * - Restore validation
 * - Full and selective restoration
 * - Transaction rollback on failure
 * - Status transitions
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { restoreService } from './restoreService';
import type { BackupData, UserRole } from '@/server/backup/models/types';

// Mock dependencies
vi.mock('@/lib/supabase/server', () => ({
  getSupabaseServiceRoleClient: vi.fn(),
}));

vi.mock('./storageService', () => ({
  storageService: {
    downloadBackup: vi.fn(),
    fileExists: vi.fn(),
  },
}));

vi.mock('@/server/backup/utils/compression', () => ({
  decompressData: vi.fn(),
}));

import { getSupabaseServiceRoleClient } from '@/lib/supabase/server';
import { storageService } from './storageService';
import { decompressData } from '@/server/backup/utils/compression';

describe('RestoreService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('restoreBackup', () => {
    it('should reject restore without admin role', async () => {
      await expect(
        restoreService.restoreBackup('backup-1', 'user-1', 'user' as UserRole, true)
      ).rejects.toThrow('Você não tem permissão para realizar esta operação');
    });

    it('should reject restore without confirmation', async () => {
      await expect(
        restoreService.restoreBackup('backup-1', 'user-1', 'admin' as UserRole, false)
      ).rejects.toThrow('Restore operation requires explicit confirmation');
    });

    it('should reject restore from non-completed backup', async () => {
      const mockSupabase = {
        from: vi.fn(() => ({
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn(() => ({
                data: {
                  id: 'backup-1',
                  status: 'pending',
                  organization_id: 'org-1',
                },
                error: null,
              })),
            })),
          })),
        })),
      };

      vi.mocked(getSupabaseServiceRoleClient).mockReturnValue(mockSupabase as any);

      await expect(
        restoreService.restoreBackup('backup-1', 'user-1', 'admin' as UserRole, true)
      ).rejects.toThrow('Cannot restore from backup with status: pending');
    });

    it('should successfully restore a valid backup', async () => {
      const mockBackupData: BackupData = {
        metadata: {
          formatVersion: '1.0.0',
          databaseVersion: 'PostgreSQL 15',
          timestamp: '2024-01-01T00:00:00Z',
          tableSchemas: {
            categories: {
              name: 'categories',
              columns: [],
              rowCount: 2,
            },
          },
        },
        tables: {
          categories: {
            schema: {
              name: 'categories',
              columns: [],
              rowCount: 2,
            },
            rows: [
              { id: '1', name: 'Category 1' },
              { id: '2', name: 'Category 2' },
            ],
          },
        },
      };

      const mockSupabase = {
        from: vi.fn((table: string) => {
          if (table === 'backups') {
            return {
              select: vi.fn(() => ({
                eq: vi.fn(() => ({
                  single: vi.fn(() => ({
                    data: {
                      id: 'backup-1',
                      status: 'completed',
                      organization_id: 'org-1',
                      tables_included: ['categories'],
                    },
                    error: null,
                  })),
                })),
              })),
            };
          }
          if (table === 'restore_jobs') {
            return {
              insert: vi.fn(() => ({
                select: vi.fn(() => ({
                  single: vi.fn(() => ({
                    data: {
                      id: 'restore-1',
                      backup_id: 'backup-1',
                      organization_id: 'org-1',
                      initiated_by: 'user-1',
                      started_at: '2024-01-01T00:00:00Z',
                      status: 'in_progress',
                      tables_restored: [],
                    },
                    error: null,
                  })),
                })),
              })),
              update: vi.fn(() => ({
                eq: vi.fn(() => ({
                  select: vi.fn(() => ({
                    single: vi.fn(() => ({
                      data: {
                        id: 'restore-1',
                        backup_id: 'backup-1',
                        organization_id: 'org-1',
                        initiated_by: 'user-1',
                        started_at: '2024-01-01T00:00:00Z',
                        completed_at: '2024-01-01T00:01:00Z',
                        status: 'completed',
                        tables_restored: ['categories'],
                      },
                      error: null,
                    })),
                  })),
                })),
              })),
            };
          }
          // For table operations (delete, insert)
          return {
            delete: vi.fn(() => ({
              neq: vi.fn(() => ({ error: null })),
            })),
            insert: vi.fn(() => ({ error: null })),
            select: vi.fn(() => ({
              limit: vi.fn(() => ({ error: null })),
            })),
          };
        }),
      };

      vi.mocked(getSupabaseServiceRoleClient).mockReturnValue(mockSupabase as any);
      vi.mocked(storageService.fileExists).mockResolvedValue(true);
      vi.mocked(storageService.downloadBackup).mockResolvedValue(Buffer.from('compressed'));
      vi.mocked(decompressData).mockResolvedValue(Buffer.from(JSON.stringify(mockBackupData)));

      const result = await restoreService.restoreBackup('backup-1', 'user-1', 'admin' as UserRole, true);

      expect(result.status).toBe('completed');
      expect(result.tablesRestored).toEqual(['categories']);
    });
  });

  describe('validateRestore', () => {
    it('should return errors if backup not found', async () => {
      const mockSupabase = {
        from: vi.fn(() => ({
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn(() => ({
                data: null,
                error: { message: 'Not found' },
              })),
            })),
          })),
        })),
      };

      vi.mocked(getSupabaseServiceRoleClient).mockReturnValue(mockSupabase as any);

      const result = await restoreService.validateRestore('backup-1', 'org-1');

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Backup not found');
    });

    it('should return errors if file does not exist', async () => {
      const mockSupabase = {
        from: vi.fn(() => ({
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn(() => ({
                data: {
                  id: 'backup-1',
                  organization_id: 'org-1',
                  status: 'completed',
                },
                error: null,
              })),
            })),
          })),
        })),
      };

      vi.mocked(getSupabaseServiceRoleClient).mockReturnValue(mockSupabase as any);
      vi.mocked(storageService.fileExists).mockResolvedValue(false);

      const result = await restoreService.validateRestore('backup-1', 'org-1');

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Backup file not found in storage');
    });

    it('should return errors for incompatible format version', async () => {
      const mockBackupData: BackupData = {
        metadata: {
          formatVersion: '2.0.0', // Incompatible version
          databaseVersion: 'PostgreSQL 15',
          timestamp: '2024-01-01T00:00:00Z',
          tableSchemas: {},
        },
        tables: {},
      };

      const mockSupabase = {
        from: vi.fn(() => ({
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn(() => ({
                data: {
                  id: 'backup-1',
                  organization_id: 'org-1',
                  status: 'completed',
                },
                error: null,
              })),
            })),
            limit: vi.fn(() => ({ error: null })),
          })),
        })),
      };

      vi.mocked(getSupabaseServiceRoleClient).mockReturnValue(mockSupabase as any);
      vi.mocked(storageService.fileExists).mockResolvedValue(true);
      vi.mocked(storageService.downloadBackup).mockResolvedValue(Buffer.from('compressed'));
      vi.mocked(decompressData).mockResolvedValue(Buffer.from(JSON.stringify(mockBackupData)));

      const result = await restoreService.validateRestore('backup-1', 'org-1');

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('Incompatible backup format version'))).toBe(true);
    });

    it('should validate successfully for compatible backup', async () => {
      const mockBackupData: BackupData = {
        metadata: {
          formatVersion: '1.0.0',
          databaseVersion: 'PostgreSQL 15',
          timestamp: '2024-01-01T00:00:00Z',
          tableSchemas: {
            categories: {
              name: 'categories',
              columns: [],
              rowCount: 0,
            },
          },
        },
        tables: {
          categories: {
            schema: {
              name: 'categories',
              columns: [],
              rowCount: 0,
            },
            rows: [],
          },
        },
      };

      const mockSupabase = {
        from: vi.fn(() => ({
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn(() => ({
                data: {
                  id: 'backup-1',
                  organization_id: 'org-1',
                  status: 'completed',
                },
                error: null,
              })),
            })),
            limit: vi.fn(() => ({ error: null })),
          })),
        })),
      };

      vi.mocked(getSupabaseServiceRoleClient).mockReturnValue(mockSupabase as any);
      vi.mocked(storageService.fileExists).mockResolvedValue(true);
      vi.mocked(storageService.downloadBackup).mockResolvedValue(Buffer.from('compressed'));
      vi.mocked(decompressData).mockResolvedValue(Buffer.from(JSON.stringify(mockBackupData)));

      const result = await restoreService.validateRestore('backup-1', 'org-1');

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('importTables', () => {
    it('should import table data successfully', async () => {
      const mockBackupData: BackupData = {
        metadata: {
          formatVersion: '1.0.0',
          databaseVersion: 'PostgreSQL 15',
          timestamp: '2024-01-01T00:00:00Z',
          tableSchemas: {},
        },
        tables: {
          categories: {
            schema: {
              name: 'categories',
              columns: [],
              rowCount: 2,
            },
            rows: [
              { id: '1', name: 'Category 1' },
              { id: '2', name: 'Category 2' },
            ],
          },
        },
      };

      const mockSupabase = {
        from: vi.fn(() => ({
          delete: vi.fn(() => ({
            neq: vi.fn(() => ({ error: null })),
          })),
          insert: vi.fn(() => ({ error: null })),
        })),
      };

      vi.mocked(getSupabaseServiceRoleClient).mockReturnValue(mockSupabase as any);

      await expect(
        restoreService.importTables('org-1', mockBackupData)
      ).resolves.not.toThrow();
    });

    it('should throw error if table data is invalid', async () => {
      const mockBackupData: BackupData = {
        metadata: {
          formatVersion: '1.0.0',
          databaseVersion: 'PostgreSQL 15',
          timestamp: '2024-01-01T00:00:00Z',
          tableSchemas: {},
        },
        tables: {
          categories: {
            schema: {
              name: 'categories',
              columns: [],
              rowCount: 0,
            },
            rows: null as any, // Invalid data
          },
        },
      };

      const mockSupabase = {
        from: vi.fn(() => ({
          delete: vi.fn(() => ({
            neq: vi.fn(() => ({ error: null })),
          })),
        })),
      };

      vi.mocked(getSupabaseServiceRoleClient).mockReturnValue(mockSupabase as any);

      await expect(
        restoreService.importTables('org-1', mockBackupData)
      ).rejects.toThrow('Invalid data for table categories');
    });
  });
});
