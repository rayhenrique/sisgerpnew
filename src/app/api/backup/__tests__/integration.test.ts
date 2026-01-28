/**
 * Integration tests for Backup API routes
 * 
 * Tests end-to-end flows from API routes to services
 * 
 * Requirements: 1.1, 3.1, 4.1, 5.1, 6.1, 9.1, 2.1
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET as getBackups, POST as createBackup } from '../route';
import { GET as getBackup, DELETE as deleteBackup } from '../[id]/route';
import { POST as restoreBackup } from '../[id]/restore/route';
import { GET as downloadBackup } from '../[id]/download/route';
import { GET as getTables } from '../tables/route';
import { GET as getSchedules, POST as createSchedule, PUT as updateSchedule, DELETE as deleteSchedule } from '../schedules/route';

// Mock dependencies
vi.mock('@/server/admin/usersService');
vi.mock('@/lib/supabase/server');
vi.mock('@/server/backup/controllers/backupController');
vi.mock('@/server/backup/controllers/scheduleController');

import { getActorFromRequest } from '@/server/admin/usersService';
import { getSupabaseServiceRoleClient } from '@/lib/supabase/server';
import { backupController } from '@/server/backup/controllers/backupController';
import { scheduleController } from '@/server/backup/controllers/scheduleController';

describe('Backup API Integration Tests', () => {
  const mockActor = {
    id: 'user-123',
    email: 'admin@test.com',
    role: 'admin',
    active: true,
    organizationId: null,
  };

  const mockBackup = {
    id: 'backup-123',
    organizationId: null,
    createdBy: 'user-123',
    createdAt: '2024-01-01T00:00:00Z',
    backupType: 'full' as const,
    status: 'completed' as const,
    filePath: 'backups/backup-123.json.gz',
    fileSize: 1024000,
    compressedSize: 512000,
    tablesIncluded: ['users', 'organizations'],
    metadata: {
      formatVersion: '1.0',
      databaseVersion: '15.0',
      timestamp: '2024-01-01T00:00:00Z',
      tableSchemas: {},
    },
    errorMessage: null,
    validatedAt: '2024-01-01T00:01:00Z',
  };

  const mockSchedule = {
    id: 'schedule-123',
    organizationId: null,
    createdBy: 'user-123',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    name: 'Daily Backup',
    frequency: 'daily' as const,
    backupType: 'full' as const,
    tablesIncluded: [],
    enabled: true,
    lastRunAt: null,
    nextRunAt: '2024-01-02T00:00:00Z',
    retentionDays: 30,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getActorFromRequest).mockResolvedValue(mockActor);
    vi.mocked(getSupabaseServiceRoleClient).mockReturnValue({} as any);
  });

  describe('GET /api/backup', () => {
    it('should list backups successfully', async () => {
      vi.mocked(backupController.handleListBackups).mockResolvedValue([mockBackup]);

      const req = new NextRequest('http://localhost:3000/api/backup');
      const response = await getBackups(req);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.backups).toHaveLength(1);
      expect(data.backups[0].id).toBe('backup-123');
      expect(backupController.handleListBackups).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'user-123' }),
        undefined
      );
    });

    it('should apply filters when provided', async () => {
      vi.mocked(backupController.handleListBackups).mockResolvedValue([mockBackup]);

      const req = new NextRequest('http://localhost:3000/api/backup?backupType=full&status=completed');
      const response = await getBackups(req);

      expect(response.status).toBe(200);
      expect(backupController.handleListBackups).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({
          backupType: 'full',
          status: 'completed',
        })
      );
    });

    it('should return 401 when not authenticated', async () => {
      vi.mocked(getActorFromRequest).mockResolvedValue(null);

      const req = new NextRequest('http://localhost:3000/api/backup');
      const response = await getBackups(req);

      expect(response.status).toBe(401);
    });

    it('should return 403 when user is inactive', async () => {
      vi.mocked(getActorFromRequest).mockResolvedValue({ ...mockActor, active: false });

      const req = new NextRequest('http://localhost:3000/api/backup');
      const response = await getBackups(req);

      expect(response.status).toBe(403);
    });
  });

  describe('POST /api/backup', () => {
    it('should create full backup successfully', async () => {
      vi.mocked(backupController.handleCreateBackup).mockResolvedValue(mockBackup);

      const req = new NextRequest('http://localhost:3000/api/backup', {
        method: 'POST',
        body: JSON.stringify({ backupType: 'full' }),
      });
      const response = await createBackup(req);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.backup.id).toBe('backup-123');
      expect(backupController.handleCreateBackup).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'user-123' }),
        { backupType: 'full' }
      );
    });

    it('should create selective backup with tables', async () => {
      const selectiveBackup = { ...mockBackup, backupType: 'selective' as const, tablesIncluded: ['users'] };
      vi.mocked(backupController.handleCreateBackup).mockResolvedValue(selectiveBackup);

      const req = new NextRequest('http://localhost:3000/api/backup', {
        method: 'POST',
        body: JSON.stringify({ backupType: 'selective', tables: ['users'] }),
      });
      const response = await createBackup(req);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.backup.backupType).toBe('selective');
      expect(data.backup.tablesIncluded).toContain('users');
    });

    it('should return 400 for invalid backup options', async () => {
      const req = new NextRequest('http://localhost:3000/api/backup', {
        method: 'POST',
        body: JSON.stringify({ backupType: 'invalid' }),
      });
      const response = await createBackup(req);

      expect(response.status).toBe(400);
    });

    it('should return 400 for selective backup without tables', async () => {
      const req = new NextRequest('http://localhost:3000/api/backup', {
        method: 'POST',
        body: JSON.stringify({ backupType: 'selective' }),
      });
      const response = await createBackup(req);

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/backup/[id]', () => {
    it('should get backup details successfully', async () => {
      vi.mocked(backupController.handleGetBackup).mockResolvedValue(mockBackup);

      const req = new NextRequest('http://localhost:3000/api/backup/backup-123');
      const ctx = { params: Promise.resolve({ id: 'backup-123' }) };
      const response = await getBackup(req, ctx);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.backup.id).toBe('backup-123');
      expect(backupController.handleGetBackup).toHaveBeenCalledWith(
        expect.any(Object),
        'backup-123'
      );
    });

    it('should return 404 when backup not found', async () => {
      vi.mocked(backupController.handleGetBackup).mockRejectedValue(
        new Error('Backup não encontrado')
      );

      const req = new NextRequest('http://localhost:3000/api/backup/invalid-id');
      const ctx = { params: Promise.resolve({ id: 'invalid-id' }) };
      const response = await getBackup(req, ctx);

      expect(response.status).toBe(404);
    });
  });

  describe('DELETE /api/backup/[id]', () => {
    it('should delete backup successfully', async () => {
      vi.mocked(backupController.handleDeleteBackup).mockResolvedValue(undefined);

      const req = new NextRequest('http://localhost:3000/api/backup/backup-123', {
        method: 'DELETE',
      });
      const ctx = { params: Promise.resolve({ id: 'backup-123' }) };
      const response = await deleteBackup(req, ctx);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.message).toContain('sucesso');
      expect(backupController.handleDeleteBackup).toHaveBeenCalledWith(
        expect.any(Object),
        'backup-123'
      );
    });

    it('should return 403 for permission errors', async () => {
      vi.mocked(backupController.handleDeleteBackup).mockRejectedValue(
        new Error('Você não tem permissão')
      );

      const req = new NextRequest('http://localhost:3000/api/backup/backup-123', {
        method: 'DELETE',
      });
      const ctx = { params: Promise.resolve({ id: 'backup-123' }) };
      const response = await deleteBackup(req, ctx);

      expect(response.status).toBe(403);
    });
  });

  describe('POST /api/backup/[id]/restore', () => {
    it('should restore backup successfully', async () => {
      vi.mocked(backupController.handleRestoreBackup).mockResolvedValue(undefined);

      const req = new NextRequest('http://localhost:3000/api/backup/backup-123/restore', {
        method: 'POST',
        body: JSON.stringify({ confirmed: true }),
      });
      const ctx = { params: Promise.resolve({ id: 'backup-123' }) };
      const response = await restoreBackup(req, ctx);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.message).toContain('sucesso');
      expect(backupController.handleRestoreBackup).toHaveBeenCalledWith(
        expect.any(Object),
        'backup-123',
        true
      );
    });

    it('should return 400 when confirmation is false', async () => {
      const req = new NextRequest('http://localhost:3000/api/backup/backup-123/restore', {
        method: 'POST',
        body: JSON.stringify({ confirmed: false }),
      });
      const ctx = { params: Promise.resolve({ id: 'backup-123' }) };
      const response = await restoreBackup(req, ctx);

      expect(response.status).toBe(400);
    });

    it('should return 400 when confirmation is missing', async () => {
      const req = new NextRequest('http://localhost:3000/api/backup/backup-123/restore', {
        method: 'POST',
        body: JSON.stringify({}),
      });
      const ctx = { params: Promise.resolve({ id: 'backup-123' }) };
      const response = await restoreBackup(req, ctx);

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/backup/[id]/download', () => {
    it('should generate download URL successfully', async () => {
      vi.mocked(backupController.handleDownloadBackup).mockResolvedValue(
        'https://storage.example.com/backup-123.json.gz?token=abc123'
      );

      const req = new NextRequest('http://localhost:3000/api/backup/backup-123/download');
      const ctx = { params: Promise.resolve({ id: 'backup-123' }) };
      const response = await downloadBackup(req, ctx);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.downloadUrl).toContain('backup-123');
      expect(backupController.handleDownloadBackup).toHaveBeenCalledWith(
        expect.any(Object),
        'backup-123'
      );
    });

    it('should return 404 when file not found', async () => {
      vi.mocked(backupController.handleDownloadBackup).mockRejectedValue(
        new Error('Arquivo não encontrado')
      );

      const req = new NextRequest('http://localhost:3000/api/backup/backup-123/download');
      const ctx = { params: Promise.resolve({ id: 'backup-123' }) };
      const response = await downloadBackup(req, ctx);

      expect(response.status).toBe(404);
    });
  });

  describe('GET /api/backup/tables', () => {
    it('should list available tables successfully', async () => {
      const mockTables = [
        { name: 'users', displayName: 'Usuários', module: 'Admin', rowCount: 100 },
        { name: 'organizations', displayName: 'Organizações', module: 'Admin', rowCount: 10 },
      ];
      vi.mocked(backupController.handleGetAvailableTables).mockResolvedValue(mockTables);

      const req = new NextRequest('http://localhost:3000/api/backup/tables');
      const response = await getTables(req);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.tables).toHaveLength(2);
      expect(data.tables[0].name).toBe('users');
      expect(backupController.handleGetAvailableTables).toHaveBeenCalled();
    });
  });

  describe('Schedule API Routes', () => {
    describe('GET /api/backup/schedules', () => {
      it('should list schedules successfully', async () => {
        vi.mocked(scheduleController.handleListSchedules).mockResolvedValue([mockSchedule]);

        const req = new NextRequest('http://localhost:3000/api/backup/schedules');
        const response = await getSchedules(req);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.schedules).toHaveLength(1);
        expect(data.schedules[0].id).toBe('schedule-123');
      });
    });

    describe('POST /api/backup/schedules', () => {
      it('should create schedule successfully', async () => {
        vi.mocked(scheduleController.handleCreateSchedule).mockResolvedValue(mockSchedule);

        const req = new NextRequest('http://localhost:3000/api/backup/schedules', {
          method: 'POST',
          body: JSON.stringify({
            name: 'Daily Backup',
            frequency: 'daily',
            backupType: 'full',
            retentionDays: 30,
          }),
        });
        const response = await createSchedule(req);
        const data = await response.json();

        expect(response.status).toBe(201);
        expect(data.schedule.name).toBe('Daily Backup');
      });

      it('should return 400 for invalid schedule data', async () => {
        const req = new NextRequest('http://localhost:3000/api/backup/schedules', {
          method: 'POST',
          body: JSON.stringify({ name: 'Test' }), // Missing required fields
        });
        const response = await createSchedule(req);

        expect(response.status).toBe(400);
      });
    });

    describe('PUT /api/backup/schedules', () => {
      it('should update schedule successfully', async () => {
        const updatedSchedule = { ...mockSchedule, enabled: false };
        vi.mocked(scheduleController.handleUpdateSchedule).mockResolvedValue(updatedSchedule);

        const req = new NextRequest('http://localhost:3000/api/backup/schedules', {
          method: 'PUT',
          body: JSON.stringify({ id: 'schedule-123', enabled: false }),
        });
        const response = await updateSchedule(req);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.schedule.enabled).toBe(false);
      });

      it('should return 400 when id is missing', async () => {
        const req = new NextRequest('http://localhost:3000/api/backup/schedules', {
          method: 'PUT',
          body: JSON.stringify({ enabled: false }),
        });
        const response = await updateSchedule(req);

        expect(response.status).toBe(400);
      });
    });

    describe('DELETE /api/backup/schedules', () => {
      it('should delete schedule successfully', async () => {
        vi.mocked(scheduleController.handleDeleteSchedule).mockResolvedValue(undefined);

        const req = new NextRequest('http://localhost:3000/api/backup/schedules?id=schedule-123', {
          method: 'DELETE',
        });
        const response = await deleteSchedule(req);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.message).toContain('sucesso');
      });

      it('should return 400 when id is missing', async () => {
        const req = new NextRequest('http://localhost:3000/api/backup/schedules', {
          method: 'DELETE',
        });
        const response = await deleteSchedule(req);

        expect(response.status).toBe(400);
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle Supabase not configured', async () => {
      vi.mocked(getSupabaseServiceRoleClient).mockReturnValue(null);

      const req = new NextRequest('http://localhost:3000/api/backup');
      const response = await getBackups(req);

      expect(response.status).toBe(500);
    });

    it('should handle invalid JSON in request body', async () => {
      const req = new NextRequest('http://localhost:3000/api/backup', {
        method: 'POST',
        body: 'invalid json',
      });
      const response = await createBackup(req);

      expect(response.status).toBe(400);
    });

    it('should handle service errors gracefully', async () => {
      vi.mocked(backupController.handleListBackups).mockRejectedValue(
        new Error('Database connection failed')
      );

      const req = new NextRequest('http://localhost:3000/api/backup');
      const response = await getBackups(req);

      expect(response.status).toBe(400);
    });
  });
});
