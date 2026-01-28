/**
 * Unit tests for Backup Module validation schemas
 * 
 * Tests validation logic for:
 * - Backup creation options
 * - Backup filters
 * - Schedule creation and updates
 */

import { describe, it, expect } from 'vitest';
import {
  createBackupSchema,
  backupFiltersSchema,
  createScheduleSchema,
  updateScheduleSchema,
} from './validation';

describe('createBackupSchema', () => {
  it('should accept valid full backup', () => {
    const result = createBackupSchema.safeParse({
      backupType: 'full',
    });
    expect(result.success).toBe(true);
  });

  it('should accept valid selective backup with tables', () => {
    const result = createBackupSchema.safeParse({
      backupType: 'selective',
      tables: ['revenues', 'expenses'],
    });
    expect(result.success).toBe(true);
  });

  it('should reject selective backup without tables', () => {
    const result = createBackupSchema.safeParse({
      backupType: 'selective',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('pelo menos uma tabela');
    }
  });

  it('should reject selective backup with empty tables array', () => {
    const result = createBackupSchema.safeParse({
      backupType: 'selective',
      tables: [],
    });
    expect(result.success).toBe(false);
  });

  it('should reject invalid backup type', () => {
    const result = createBackupSchema.safeParse({
      backupType: 'invalid',
    });
    expect(result.success).toBe(false);
  });
});

describe('backupFiltersSchema', () => {
  it('should accept empty filters', () => {
    const result = backupFiltersSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it('should accept valid date range', () => {
    const result = backupFiltersSchema.safeParse({
      startDate: '2024-01-01T00:00:00Z',
      endDate: '2024-12-31T23:59:59Z',
    });
    expect(result.success).toBe(true);
  });

  it('should accept valid backup type filter', () => {
    const result = backupFiltersSchema.safeParse({
      backupType: 'full',
    });
    expect(result.success).toBe(true);
  });

  it('should accept valid status filter', () => {
    const result = backupFiltersSchema.safeParse({
      status: 'completed',
    });
    expect(result.success).toBe(true);
  });

  it('should accept all filters combined', () => {
    const result = backupFiltersSchema.safeParse({
      startDate: '2024-01-01T00:00:00Z',
      endDate: '2024-12-31T23:59:59Z',
      backupType: 'selective',
      status: 'completed',
    });
    expect(result.success).toBe(true);
  });

  it('should reject invalid date format', () => {
    const result = backupFiltersSchema.safeParse({
      startDate: '2024-01-01',
    });
    expect(result.success).toBe(false);
  });

  it('should reject invalid backup type', () => {
    const result = backupFiltersSchema.safeParse({
      backupType: 'invalid',
    });
    expect(result.success).toBe(false);
  });

  it('should reject invalid status', () => {
    const result = backupFiltersSchema.safeParse({
      status: 'invalid',
    });
    expect(result.success).toBe(false);
  });
});

describe('createScheduleSchema', () => {
  it('should accept valid full backup schedule', () => {
    const result = createScheduleSchema.safeParse({
      name: 'Daily Full Backup',
      frequency: 'daily',
      backupType: 'full',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.retentionDays).toBe(30); // default value
    }
  });

  it('should accept valid selective backup schedule with tables', () => {
    const result = createScheduleSchema.safeParse({
      name: 'Weekly Selective Backup',
      frequency: 'weekly',
      backupType: 'selective',
      tables: ['revenues', 'expenses'],
      retentionDays: 60,
    });
    expect(result.success).toBe(true);
  });

  it('should reject selective schedule without tables', () => {
    const result = createScheduleSchema.safeParse({
      name: 'Weekly Selective Backup',
      frequency: 'weekly',
      backupType: 'selective',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('pelo menos uma tabela');
    }
  });

  it('should reject empty name', () => {
    const result = createScheduleSchema.safeParse({
      name: '',
      frequency: 'daily',
      backupType: 'full',
    });
    expect(result.success).toBe(false);
  });

  it('should reject name longer than 255 characters', () => {
    const result = createScheduleSchema.safeParse({
      name: 'a'.repeat(256),
      frequency: 'daily',
      backupType: 'full',
    });
    expect(result.success).toBe(false);
  });

  it('should reject invalid frequency', () => {
    const result = createScheduleSchema.safeParse({
      name: 'Test Schedule',
      frequency: 'hourly',
      backupType: 'full',
    });
    expect(result.success).toBe(false);
  });

  it('should reject retention days less than 1', () => {
    const result = createScheduleSchema.safeParse({
      name: 'Test Schedule',
      frequency: 'daily',
      backupType: 'full',
      retentionDays: 0,
    });
    expect(result.success).toBe(false);
  });

  it('should reject retention days greater than 365', () => {
    const result = createScheduleSchema.safeParse({
      name: 'Test Schedule',
      frequency: 'daily',
      backupType: 'full',
      retentionDays: 366,
    });
    expect(result.success).toBe(false);
  });
});

describe('updateScheduleSchema', () => {
  it('should accept empty update', () => {
    const result = updateScheduleSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it('should accept partial update with name', () => {
    const result = updateScheduleSchema.safeParse({
      name: 'Updated Schedule Name',
    });
    expect(result.success).toBe(true);
  });

  it('should accept partial update with enabled flag', () => {
    const result = updateScheduleSchema.safeParse({
      enabled: false,
    });
    expect(result.success).toBe(true);
  });

  it('should accept partial update with frequency', () => {
    const result = updateScheduleSchema.safeParse({
      frequency: 'monthly',
    });
    expect(result.success).toBe(true);
  });

  it('should accept partial update with retention days', () => {
    const result = updateScheduleSchema.safeParse({
      retentionDays: 90,
    });
    expect(result.success).toBe(true);
  });

  it('should accept multiple fields update', () => {
    const result = updateScheduleSchema.safeParse({
      name: 'Updated Name',
      frequency: 'weekly',
      enabled: true,
      retentionDays: 45,
    });
    expect(result.success).toBe(true);
  });

  it('should reject invalid name', () => {
    const result = updateScheduleSchema.safeParse({
      name: '',
    });
    expect(result.success).toBe(false);
  });

  it('should reject invalid frequency', () => {
    const result = updateScheduleSchema.safeParse({
      frequency: 'invalid',
    });
    expect(result.success).toBe(false);
  });

  it('should reject invalid retention days', () => {
    const result = updateScheduleSchema.safeParse({
      retentionDays: 400,
    });
    expect(result.success).toBe(false);
  });
});
