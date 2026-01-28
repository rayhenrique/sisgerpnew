/**
 * Unit tests for Backup API client functions
 * 
 * These tests verify that API client functions correctly format requests,
 * handle responses, and provide appropriate error messages.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as api from './api';
import type { Backup, BackupSchedule, CreateBackupOptions, CreateScheduleInput } from './types';

// Mock the Supabase browser client
vi.mock('@/lib/supabase/browser', () => ({
  getSupabaseBrowserClient: vi.fn(() => ({
    auth: {
      getSession: vi.fn(() => ({
        data: { session: { access_token: 'mock-token' } },
        error: null,
      })),
    },
  })),
}));

// Mock global fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('Backup API Client', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('listBackups', () => {
    it('should fetch backups without filters', async () => {
      const mockBackups: Backup[] = [
        {
          id: '1',
          organizationId: 'org-1',
          createdBy: 'user-1',
          createdAt: '2024-01-01T00:00:00Z',
          backupType: 'full',
          status: 'completed',
          filePath: '/backups/1.gz',
          fileSize: 1000,
          compressedSize: 500,
          tablesIncluded: ['users', 'posts'],
          metadata: {
            formatVersion: '1.0',
            databaseVersion: '15.0',
            timestamp: '2024-01-01T00:00:00Z',
            tableSchemas: {},
          },
          errorMessage: null,
          validatedAt: null,
        },
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ backups: mockBackups }),
      });

      const result = await api.listBackups();

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/backup',
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer mock-token',
            'Content-Type': 'application/json',
          }),
        })
      );
      expect(result).toEqual(mockBackups);
    });

    it('should fetch backups with filters', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ backups: [] }),
      });

      await api.listBackups({
        startDate: '2024-01-01',
        endDate: '2024-01-31',
        backupType: 'full',
        status: 'completed',
      });

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/backup?startDate=2024-01-01&endDate=2024-01-31&backupType=full&status=completed',
        expect.any(Object)
      );
    });

    it('should handle API errors with user-friendly messages', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: 'Erro ao buscar backups' }),
      });

      await expect(api.listBackups()).rejects.toThrow('Erro ao buscar backups');
    });
  });

  describe('createBackup', () => {
    it('should create a full backup', async () => {
      const options: CreateBackupOptions = {
        backupType: 'full',
      };

      const mockBackup: Backup = {
        id: '1',
        organizationId: 'org-1',
        createdBy: 'user-1',
        createdAt: '2024-01-01T00:00:00Z',
        backupType: 'full',
        status: 'pending',
        filePath: null,
        fileSize: null,
        compressedSize: null,
        tablesIncluded: [],
        metadata: {
          formatVersion: '1.0',
          databaseVersion: '15.0',
          timestamp: '2024-01-01T00:00:00Z',
          tableSchemas: {},
        },
        errorMessage: null,
        validatedAt: null,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ backup: mockBackup }),
      });

      const result = await api.createBackup(options);

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/backup',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(options),
        })
      );
      expect(result).toEqual(mockBackup);
    });

    it('should create a selective backup with tables', async () => {
      const options: CreateBackupOptions = {
        backupType: 'selective',
        tables: ['users', 'posts'],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ backup: {} }),
      });

      await api.createBackup(options);

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/backup',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(options),
        })
      );
    });
  });

  describe('deleteBackup', () => {
    it('should delete a backup', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ ok: true }),
      });

      await api.deleteBackup('backup-1');

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/backup/backup-1',
        expect.objectContaining({
          method: 'DELETE',
        })
      );
    });
  });

  describe('restoreBackup', () => {
    it('should restore a backup with confirmation', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ ok: true }),
      });

      await api.restoreBackup('backup-1');

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/backup/backup-1/restore',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ confirmed: true }),
        })
      );
    });
  });

  describe('downloadBackup', () => {
    it('should get download URL', async () => {
      const mockUrl = 'https://storage.example.com/backup-1.gz?token=abc';

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ url: mockUrl, expiresInSeconds: 3600 }),
      });

      const result = await api.downloadBackup('backup-1');

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/backup/backup-1/download',
        expect.any(Object)
      );
      expect(result).toBe(mockUrl);
    });
  });

  describe('getAvailableTables', () => {
    it('should fetch available tables', async () => {
      const mockTables = [
        { name: 'users', displayName: 'Usuários', module: 'admin', rowCount: 100 },
        { name: 'posts', displayName: 'Posts', module: 'content', rowCount: 500 },
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ tables: mockTables }),
      });

      const result = await api.getAvailableTables();

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/backup/tables',
        expect.any(Object)
      );
      expect(result).toEqual(mockTables);
    });
  });

  describe('Schedule Operations', () => {
    describe('listSchedules', () => {
      it('should fetch schedules', async () => {
        const mockSchedules: BackupSchedule[] = [
          {
            id: '1',
            organizationId: 'org-1',
            createdBy: 'user-1',
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z',
            name: 'Daily Backup',
            frequency: 'daily',
            backupType: 'full',
            tablesIncluded: [],
            enabled: true,
            lastRunAt: null,
            nextRunAt: '2024-01-02T00:00:00Z',
            retentionDays: 30,
          },
        ];

        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: async () => ({ schedules: mockSchedules }),
        });

        const result = await api.listSchedules();

        expect(mockFetch).toHaveBeenCalledWith(
          '/api/backup/schedules',
          expect.any(Object)
        );
        expect(result).toEqual(mockSchedules);
      });
    });

    describe('createSchedule', () => {
      it('should create a schedule', async () => {
        const input: CreateScheduleInput = {
          name: 'Daily Backup',
          frequency: 'daily',
          backupType: 'full',
          retentionDays: 30,
        };

        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: async () => ({ schedule: { id: '1', ...input } }),
        });

        await api.createSchedule(input);

        expect(mockFetch).toHaveBeenCalledWith(
          '/api/backup/schedules',
          expect.objectContaining({
            method: 'POST',
            body: JSON.stringify(input),
          })
        );
      });
    });

    describe('updateSchedule', () => {
      it('should update a schedule', async () => {
        const updates = { enabled: false };

        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: async () => ({ schedule: { id: 'schedule-1', ...updates } }),
        });

        await api.updateSchedule('schedule-1', updates);

        expect(mockFetch).toHaveBeenCalledWith(
          '/api/backup/schedules',
          expect.objectContaining({
            method: 'PUT',
            body: JSON.stringify({ id: 'schedule-1', ...updates }),
          })
        );
      });
    });

    describe('deleteSchedule', () => {
      it('should delete a schedule', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: async () => ({ ok: true }),
        });

        await api.deleteSchedule('schedule-1');

        expect(mockFetch).toHaveBeenCalledWith(
          '/api/backup/schedules',
          expect.objectContaining({
            method: 'DELETE',
            body: JSON.stringify({ id: 'schedule-1' }),
          })
        );
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle authentication errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ message: 'Não autenticado' }),
      });

      await expect(api.listBackups()).rejects.toThrow('Não autenticado');
    });

    it('should handle authorization errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        json: async () => ({ message: 'Sem permissão' }),
      });

      await expect(api.createBackup({ backupType: 'full' })).rejects.toThrow('Sem permissão');
    });

    it('should handle generic API errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({}),
      });

      await expect(api.listBackups()).rejects.toThrow('Erro na API');
    });

    it('should handle network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(api.listBackups()).rejects.toThrow('Network error');
    });
  });
});
