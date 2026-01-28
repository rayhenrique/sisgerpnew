/**
 * Unit tests for ScheduleService
 * 
 * Tests backup schedule management including:
 * - Creating schedules with validation
 * - Updating schedules
 * - Deleting schedules
 * - Finding due schedules
 * - Executing scheduled backups
 * - Calculating next run times
 * 
 * Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { scheduleService } from './scheduleService';
import type { CreateScheduleInput, UpdateScheduleInput } from '@/server/backup/models/types';

// Mock Supabase client
vi.mock('@/lib/supabase/server', () => ({
  getSupabaseServiceRoleClient: vi.fn(),
}));

// Mock BackupService
vi.mock('./backupService', () => ({
  backupService: {
    createBackup: vi.fn(),
  },
}));

import { getSupabaseServiceRoleClient } from '@/lib/supabase/server';
import { backupService } from './backupService';

describe('ScheduleService', () => {
  let mockSupabase: any;

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup mock Supabase client
    mockSupabase = {
      from: vi.fn(() => mockSupabase),
      insert: vi.fn(() => mockSupabase),
      update: vi.fn(() => mockSupabase),
      delete: vi.fn(() => mockSupabase),
      select: vi.fn(() => mockSupabase),
      eq: vi.fn(() => mockSupabase),
      lte: vi.fn(() => mockSupabase),
      order: vi.fn(() => mockSupabase),
      single: vi.fn(() => mockSupabase),
    };

    vi.mocked(getSupabaseServiceRoleClient).mockReturnValue(mockSupabase);
  });

  describe('createSchedule', () => {
    it('should create a daily full backup schedule', async () => {
      const input: CreateScheduleInput = {
        name: 'Daily Full Backup',
        frequency: 'daily',
        backupType: 'full',
        retentionDays: 30,
      };

      const mockSchedule = {
        id: 'schedule-1',
        organization_id: 'org-1',
        created_by: 'user-1',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        name: 'Daily Full Backup',
        frequency: 'daily',
        backup_type: 'full',
        tables_included: [],
        enabled: true,
        last_run_at: null,
        next_run_at: '2024-01-02T00:00:00Z',
        retention_days: 30,
      };

      mockSupabase.single.mockResolvedValue({ data: mockSchedule, error: null });

      const result = await scheduleService.createSchedule(
        'org-1',
        'user-1',
        'admin',
        input
      );

      expect(result.id).toBe('schedule-1');
      expect(result.name).toBe('Daily Full Backup');
      expect(result.frequency).toBe('daily');
      expect(result.backupType).toBe('full');
      expect(result.enabled).toBe(true);
      expect(mockSupabase.from).toHaveBeenCalledWith('backup_schedules');
      expect(mockSupabase.insert).toHaveBeenCalled();
    });

    it('should create a weekly selective backup schedule', async () => {
      const input: CreateScheduleInput = {
        name: 'Weekly Selective Backup',
        frequency: 'weekly',
        backupType: 'selective',
        tables: ['revenues', 'expenses'],
        retentionDays: 60,
      };

      const mockSchedule = {
        id: 'schedule-2',
        organization_id: 'org-1',
        created_by: 'user-1',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        name: 'Weekly Selective Backup',
        frequency: 'weekly',
        backup_type: 'selective',
        tables_included: ['revenues', 'expenses'],
        enabled: true,
        last_run_at: null,
        next_run_at: '2024-01-08T00:00:00Z',
        retention_days: 60,
      };

      mockSupabase.single.mockResolvedValue({ data: mockSchedule, error: null });

      const result = await scheduleService.createSchedule(
        'org-1',
        'user-1',
        'admin',
        input
      );

      expect(result.backupType).toBe('selective');
      expect(result.tablesIncluded).toEqual(['revenues', 'expenses']);
      expect(result.frequency).toBe('weekly');
    });

    it('should create a monthly backup schedule', async () => {
      const input: CreateScheduleInput = {
        name: 'Monthly Backup',
        frequency: 'monthly',
        backupType: 'full',
      };

      const mockSchedule = {
        id: 'schedule-3',
        organization_id: 'org-1',
        created_by: 'user-1',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        name: 'Monthly Backup',
        frequency: 'monthly',
        backup_type: 'full',
        tables_included: [],
        enabled: true,
        last_run_at: null,
        next_run_at: '2024-02-01T00:00:00Z',
        retention_days: 30,
      };

      mockSupabase.single.mockResolvedValue({ data: mockSchedule, error: null });

      const result = await scheduleService.createSchedule(
        'org-1',
        'user-1',
        'admin',
        input
      );

      expect(result.frequency).toBe('monthly');
    });

    it('should reject creation by non-admin users', async () => {
      const input: CreateScheduleInput = {
        name: 'Test Schedule',
        frequency: 'daily',
        backupType: 'full',
      };

      await expect(
        scheduleService.createSchedule('org-1', 'user-1', 'user', input)
      ).rejects.toThrow('Você não tem permissão para realizar esta operação');
    });

    it('should reject selective backup without tables', async () => {
      const input: CreateScheduleInput = {
        name: 'Invalid Selective',
        frequency: 'daily',
        backupType: 'selective',
        tables: [],
      };

      await expect(
        scheduleService.createSchedule('org-1', 'user-1', 'admin', input)
      ).rejects.toThrow('Backups seletivos devem incluir pelo menos uma tabela');
    });

    it('should handle database errors', async () => {
      const input: CreateScheduleInput = {
        name: 'Test Schedule',
        frequency: 'daily',
        backupType: 'full',
      };

      mockSupabase.single.mockResolvedValue({
        data: null,
        error: { message: 'Database error' },
      });

      await expect(
        scheduleService.createSchedule('org-1', 'user-1', 'admin', input)
      ).rejects.toThrow('Failed to create schedule');
    });
  });

  describe('updateSchedule', () => {
    it('should update schedule name', async () => {
      const existingSchedule = {
        id: 'schedule-1',
        organization_id: 'org-1',
        created_by: 'user-1',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        name: 'Old Name',
        frequency: 'daily',
        backup_type: 'full',
        tables_included: [],
        enabled: true,
        last_run_at: null,
        next_run_at: '2024-01-02T00:00:00Z',
        retention_days: 30,
      };

      const updatedSchedule = {
        ...existingSchedule,
        name: 'New Name',
        updated_at: '2024-01-02T00:00:00Z',
      };

      mockSupabase.single
        .mockResolvedValueOnce({ data: existingSchedule, error: null })
        .mockResolvedValueOnce({ data: updatedSchedule, error: null });

      const updates: UpdateScheduleInput = {
        name: 'New Name',
      };

      const result = await scheduleService.updateSchedule('schedule-1', 'admin', updates);

      expect(result.name).toBe('New Name');
      expect(mockSupabase.update).toHaveBeenCalled();
    });

    it('should update schedule frequency and recalculate next run', async () => {
      const existingSchedule = {
        id: 'schedule-1',
        organization_id: 'org-1',
        created_by: 'user-1',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        name: 'Test Schedule',
        frequency: 'daily',
        backup_type: 'full',
        tables_included: [],
        enabled: true,
        last_run_at: '2024-01-01T00:00:00Z',
        next_run_at: '2024-01-02T00:00:00Z',
        retention_days: 30,
      };

      const updatedSchedule = {
        ...existingSchedule,
        frequency: 'weekly',
        next_run_at: '2024-01-08T00:00:00Z',
        updated_at: '2024-01-02T00:00:00Z',
      };

      mockSupabase.single
        .mockResolvedValueOnce({ data: existingSchedule, error: null })
        .mockResolvedValueOnce({ data: updatedSchedule, error: null });

      const updates: UpdateScheduleInput = {
        frequency: 'weekly',
      };

      const result = await scheduleService.updateSchedule('schedule-1', 'admin', updates);

      expect(result.frequency).toBe('weekly');
    });

    it('should enable/disable schedule', async () => {
      const existingSchedule = {
        id: 'schedule-1',
        organization_id: 'org-1',
        created_by: 'user-1',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        name: 'Test Schedule',
        frequency: 'daily',
        backup_type: 'full',
        tables_included: [],
        enabled: true,
        last_run_at: null,
        next_run_at: '2024-01-02T00:00:00Z',
        retention_days: 30,
      };

      const updatedSchedule = {
        ...existingSchedule,
        enabled: false,
        updated_at: '2024-01-02T00:00:00Z',
      };

      mockSupabase.single
        .mockResolvedValueOnce({ data: existingSchedule, error: null })
        .mockResolvedValueOnce({ data: updatedSchedule, error: null });

      const updates: UpdateScheduleInput = {
        enabled: false,
      };

      const result = await scheduleService.updateSchedule('schedule-1', 'admin', updates);

      expect(result.enabled).toBe(false);
    });

    it('should reject update by non-admin users', async () => {
      const updates: UpdateScheduleInput = {
        name: 'New Name',
      };

      await expect(
        scheduleService.updateSchedule('schedule-1', 'user', updates)
      ).rejects.toThrow('Você não tem permissão para realizar esta operação');
    });

    it('should reject selective backup without tables', async () => {
      const existingSchedule = {
        id: 'schedule-1',
        organization_id: 'org-1',
        created_by: 'user-1',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        name: 'Test Schedule',
        frequency: 'daily',
        backup_type: 'full',
        tables_included: [],
        enabled: true,
        last_run_at: null,
        next_run_at: '2024-01-02T00:00:00Z',
        retention_days: 30,
      };

      mockSupabase.single.mockResolvedValueOnce({ data: existingSchedule, error: null });

      const updates: UpdateScheduleInput = {
        backupType: 'selective',
        tables: [],
      };

      await expect(
        scheduleService.updateSchedule('schedule-1', 'admin', updates)
      ).rejects.toThrow('Backups seletivos devem incluir pelo menos uma tabela');
    });

    it('should handle schedule not found', async () => {
      mockSupabase.single.mockResolvedValue({ data: null, error: { message: 'Not found' } });

      const updates: UpdateScheduleInput = {
        name: 'New Name',
      };

      await expect(
        scheduleService.updateSchedule('nonexistent', 'admin', updates)
      ).rejects.toThrow('Schedule not found');
    });
  });

  describe('deleteSchedule', () => {
    it('should delete a schedule', async () => {
      mockSupabase.eq.mockResolvedValue({ error: null });

      await scheduleService.deleteSchedule('schedule-1', 'admin');

      expect(mockSupabase.from).toHaveBeenCalledWith('backup_schedules');
      expect(mockSupabase.delete).toHaveBeenCalled();
      expect(mockSupabase.eq).toHaveBeenCalledWith('id', 'schedule-1');
    });

    it('should reject deletion by non-admin users', async () => {
      await expect(
        scheduleService.deleteSchedule('schedule-1', 'user')
      ).rejects.toThrow('Você não tem permissão para realizar esta operação');
    });

    it('should handle database errors', async () => {
      mockSupabase.eq.mockResolvedValue({ error: { message: 'Database error' } });

      await expect(
        scheduleService.deleteSchedule('schedule-1', 'admin')
      ).rejects.toThrow('Failed to delete schedule');
    });
  });

  describe('getDueSchedules', () => {
    it('should return enabled schedules that are due', async () => {
      const mockSchedules = [
        {
          id: 'schedule-1',
          organization_id: 'org-1',
          created_by: 'user-1',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
          name: 'Daily Backup',
          frequency: 'daily',
          backup_type: 'full',
          tables_included: [],
          enabled: true,
          last_run_at: '2024-01-01T00:00:00Z',
          next_run_at: '2024-01-02T00:00:00Z',
          retention_days: 30,
        },
        {
          id: 'schedule-2',
          organization_id: 'org-1',
          created_by: 'user-1',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
          name: 'Weekly Backup',
          frequency: 'weekly',
          backup_type: 'full',
          tables_included: [],
          enabled: true,
          last_run_at: null,
          next_run_at: '2024-01-02T00:00:00Z',
          retention_days: 60,
        },
      ];

      mockSupabase.lte.mockResolvedValue({ data: mockSchedules, error: null });

      const result = await scheduleService.getDueSchedules();

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('schedule-1');
      expect(result[1].id).toBe('schedule-2');
      expect(mockSupabase.eq).toHaveBeenCalledWith('enabled', true);
      expect(mockSupabase.lte).toHaveBeenCalled();
    });

    it('should return empty array when no schedules are due', async () => {
      mockSupabase.lte.mockResolvedValue({ data: [], error: null });

      const result = await scheduleService.getDueSchedules();

      expect(result).toHaveLength(0);
    });

    it('should handle database errors', async () => {
      mockSupabase.lte.mockResolvedValue({ data: null, error: { message: 'Database error' } });

      await expect(scheduleService.getDueSchedules()).rejects.toThrow('Failed to get due schedules');
    });
  });

  describe('executeSchedule', () => {
    it('should execute a full backup schedule', async () => {
      const schedule = {
        id: 'schedule-1',
        organizationId: 'org-1',
        createdBy: 'user-1',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
        name: 'Daily Full Backup',
        frequency: 'daily' as const,
        backupType: 'full' as const,
        tablesIncluded: [],
        enabled: true,
        lastRunAt: null,
        nextRunAt: '2024-01-02T00:00:00Z',
        retentionDays: 30,
      };

      vi.mocked(backupService.createBackup).mockResolvedValue({
        id: 'backup-1',
        organizationId: 'org-1',
        createdBy: 'user-1',
        createdAt: '2024-01-02T00:00:00Z',
        backupType: 'full',
        status: 'completed',
        filePath: '/backups/backup-1.gz',
        fileSize: 1000,
        compressedSize: 500,
        tablesIncluded: [],
        metadata: {} as any,
        errorMessage: null,
        validatedAt: null,
      });

      mockSupabase.eq.mockResolvedValue({ error: null });

      await scheduleService.executeSchedule(schedule);

      expect(backupService.createBackup).toHaveBeenCalledWith(
        'org-1',
        'user-1',
        'admin',
        {
          backupType: 'full',
          tables: undefined,
        }
      );
      expect(mockSupabase.update).toHaveBeenCalled();
    });

    it('should execute a selective backup schedule', async () => {
      const schedule = {
        id: 'schedule-2',
        organizationId: 'org-1',
        createdBy: 'user-1',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
        name: 'Weekly Selective Backup',
        frequency: 'weekly' as const,
        backupType: 'selective' as const,
        tablesIncluded: ['revenues', 'expenses'],
        enabled: true,
        lastRunAt: null,
        nextRunAt: '2024-01-08T00:00:00Z',
        retentionDays: 60,
      };

      vi.mocked(backupService.createBackup).mockResolvedValue({
        id: 'backup-2',
        organizationId: 'org-1',
        createdBy: 'user-1',
        createdAt: '2024-01-08T00:00:00Z',
        backupType: 'selective',
        status: 'completed',
        filePath: '/backups/backup-2.gz',
        fileSize: 500,
        compressedSize: 250,
        tablesIncluded: ['revenues', 'expenses'],
        metadata: {} as any,
        errorMessage: null,
        validatedAt: null,
      });

      mockSupabase.eq.mockResolvedValue({ error: null });

      await scheduleService.executeSchedule(schedule);

      expect(backupService.createBackup).toHaveBeenCalledWith(
        'org-1',
        'user-1',
        'admin',
        {
          backupType: 'selective',
          tables: ['revenues', 'expenses'],
        }
      );
    });

    it('should handle backup creation failure', async () => {
      const schedule = {
        id: 'schedule-1',
        organizationId: 'org-1',
        createdBy: 'user-1',
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

      vi.mocked(backupService.createBackup).mockRejectedValue(new Error('Backup failed'));

      await expect(scheduleService.executeSchedule(schedule)).rejects.toThrow(
        'Failed to execute schedule'
      );
    });
  });

  describe('listSchedules', () => {
    it('should list all schedules for an organization', async () => {
      const mockSchedules = [
        {
          id: 'schedule-1',
          organization_id: 'org-1',
          created_by: 'user-1',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
          name: 'Daily Backup',
          frequency: 'daily',
          backup_type: 'full',
          tables_included: [],
          enabled: true,
          last_run_at: null,
          next_run_at: '2024-01-02T00:00:00Z',
          retention_days: 30,
        },
        {
          id: 'schedule-2',
          organization_id: 'org-1',
          created_by: 'user-1',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
          name: 'Weekly Backup',
          frequency: 'weekly',
          backup_type: 'selective',
          tables_included: ['revenues'],
          enabled: false,
          last_run_at: null,
          next_run_at: '2024-01-08T00:00:00Z',
          retention_days: 60,
        },
      ];

      mockSupabase.order.mockResolvedValue({ data: mockSchedules, error: null });

      const result = await scheduleService.listSchedules('org-1');

      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('Daily Backup');
      expect(result[1].name).toBe('Weekly Backup');
      expect(mockSupabase.eq).toHaveBeenCalledWith('organization_id', 'org-1');
    });

    it('should list schedules without organization filter', async () => {
      const mockSchedules = [
        {
          id: 'schedule-1',
          organization_id: null,
          created_by: 'user-1',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
          name: 'Daily Backup',
          frequency: 'daily',
          backup_type: 'full',
          tables_included: [],
          enabled: true,
          last_run_at: null,
          next_run_at: '2024-01-02T00:00:00Z',
          retention_days: 30,
        },
      ];

      mockSupabase.order.mockResolvedValue({ data: mockSchedules, error: null });

      const result = await scheduleService.listSchedules(null);

      expect(result).toHaveLength(1);
      expect(mockSupabase.eq).not.toHaveBeenCalledWith('organization_id', expect.anything());
    });

    it('should handle database errors', async () => {
      mockSupabase.order.mockResolvedValue({ data: null, error: { message: 'Database error' } });

      await expect(scheduleService.listSchedules('org-1')).rejects.toThrow('Failed to list schedules');
    });
  });
});
