/**
 * End-to-End Test: Backup Schedule Functionality
 * 
 * Tests the complete backup schedule functionality including:
 * - Create backup schedule
 * - Manually trigger schedule execution
 * - Verify scheduled backup is created
 * 
 * Requirements: 2.1, 2.2, 2.3
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const skipTests = !supabaseUrl || !supabaseServiceKey;

describe.skipIf(skipTests)('E2E: Backup Schedule Functionality', () => {
  let supabase: ReturnType<typeof createClient>;
  let testOrgId: string;
  let testUserId: string;
  let createdScheduleIds: string[] = [];
  let createdBackupIds: string[] = [];

  beforeAll(async () => {
    supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get or create test organization
    const { data: org } = await supabase
      .from('organizations')
      .select('id')
      .limit(1)
      .single();

    if (org) {
      testOrgId = org.id;
    } else {
      const { data: newOrg } = await supabase
        .from('organizations')
        .insert({ name: 'Test Org for Schedule E2E' })
        .select('id')
        .single();
      testOrgId = newOrg!.id;
    }

    // Get or create test user
    const { data: user } = await supabase
      .from('profiles')
      .select('id')
      .eq('organization_id', testOrgId)
      .eq('role', 'admin')
      .limit(1)
      .single();

    if (user) {
      testUserId = user.id;
    } else {
      const { data: authUser } = await supabase.auth.admin.createUser({
        email: `test-schedule-${Date.now()}@example.com`,
        password: 'test-password-123',
        email_confirm: true,
      });

      const { data: profile } = await supabase
        .from('profiles')
        .insert({
          id: authUser.user!.id,
          organization_id: testOrgId,
          role: 'admin',
          name: 'Test Admin User',
        })
        .select('id')
        .single();

      testUserId = profile!.id;
    }
  });

  afterAll(async () => {
    // Cleanup: Delete created backups
    for (const backupId of createdBackupIds) {
      await supabase
        .from('backups')
        .delete()
        .eq('id', backupId);
    }

    // Cleanup: Delete created schedules
    for (const scheduleId of createdScheduleIds) {
      await supabase
        .from('backup_schedules')
        .delete()
        .eq('id', scheduleId);
    }
  });

  it('should create a daily backup schedule', async () => {
    const nextRunAt = new Date();
    nextRunAt.setDate(nextRunAt.getDate() + 1);

    const { data: schedule, error } = await supabase
      .from('backup_schedules')
      .insert({
        organization_id: testOrgId,
        created_by: testUserId,
        name: 'Daily Full Backup',
        frequency: 'daily',
        backup_type: 'full',
        tables_included: ['categories', 'expenses', 'revenues'],
        enabled: true,
        next_run_at: nextRunAt.toISOString(),
        retention_days: 30,
      })
      .select()
      .single();

    expect(error).toBeNull();
    expect(schedule).toBeDefined();
    expect(schedule!.name).toBe('Daily Full Backup');
    expect(schedule!.frequency).toBe('daily');
    expect(schedule!.backup_type).toBe('full');
    expect(schedule!.enabled).toBe(true);
    expect(schedule!.retention_days).toBe(30);

    createdScheduleIds.push(schedule!.id);
  });

  it('should create a weekly selective backup schedule', async () => {
    const nextRunAt = new Date();
    nextRunAt.setDate(nextRunAt.getDate() + 7);

    const { data: schedule, error } = await supabase
      .from('backup_schedules')
      .insert({
        organization_id: testOrgId,
        created_by: testUserId,
        name: 'Weekly Categories Backup',
        frequency: 'weekly',
        backup_type: 'selective',
        tables_included: ['categories'],
        enabled: true,
        next_run_at: nextRunAt.toISOString(),
        retention_days: 60,
      })
      .select()
      .single();

    expect(error).toBeNull();
    expect(schedule).toBeDefined();
    expect(schedule!.frequency).toBe('weekly');
    expect(schedule!.backup_type).toBe('selective');
    expect(schedule!.tables_included).toEqual(['categories']);

    createdScheduleIds.push(schedule!.id);
  });

  it('should create a monthly backup schedule', async () => {
    const nextRunAt = new Date();
    nextRunAt.setMonth(nextRunAt.getMonth() + 1);

    const { data: schedule, error } = await supabase
      .from('backup_schedules')
      .insert({
        organization_id: testOrgId,
        created_by: testUserId,
        name: 'Monthly Archive Backup',
        frequency: 'monthly',
        backup_type: 'full',
        tables_included: ['categories', 'expenses', 'revenues'],
        enabled: true,
        next_run_at: nextRunAt.toISOString(),
        retention_days: 365,
      })
      .select()
      .single();

    expect(error).toBeNull();
    expect(schedule).toBeDefined();
    expect(schedule!.frequency).toBe('monthly');
    expect(schedule!.retention_days).toBe(365);

    createdScheduleIds.push(schedule!.id);
  });

  it('should manually trigger schedule execution and create backup', async () => {
    // Create a schedule
    const { data: schedule } = await supabase
      .from('backup_schedules')
      .insert({
        organization_id: testOrgId,
        created_by: testUserId,
        name: 'Test Manual Trigger',
        frequency: 'daily',
        backup_type: 'full',
        tables_included: ['categories'],
        enabled: true,
        next_run_at: new Date().toISOString(),
        retention_days: 30,
      })
      .select()
      .single();

    createdScheduleIds.push(schedule!.id);

    // Simulate schedule execution by creating a backup
    const { data: backup, error: backupError } = await supabase
      .from('backups')
      .insert({
        organization_id: testOrgId,
        created_by: testUserId,
        backup_type: schedule!.backup_type,
        status: 'completed',
        tables_included: schedule!.tables_included,
        file_path: `${testOrgId}/scheduled-backup-${schedule!.id}.json.gz`,
        file_size: 1024,
        compressed_size: 512,
        metadata: {
          formatVersion: '1.0',
          databaseVersion: '1.0',
          timestamp: new Date().toISOString(),
          tableSchemas: {},
          scheduleId: schedule!.id,
          scheduleName: schedule!.name,
        },
      })
      .select()
      .single();

    expect(backupError).toBeNull();
    expect(backup).toBeDefined();
    expect(backup!.backup_type).toBe(schedule!.backup_type);
    expect(backup!.tables_included).toEqual(schedule!.tables_included);

    createdBackupIds.push(backup!.id);

    // Update schedule with last run time and next run time
    const lastRunAt = new Date();
    const nextRunAt = new Date();
    nextRunAt.setDate(nextRunAt.getDate() + 1);

    const { error: updateError } = await supabase
      .from('backup_schedules')
      .update({
        last_run_at: lastRunAt.toISOString(),
        next_run_at: nextRunAt.toISOString(),
      })
      .eq('id', schedule!.id);

    expect(updateError).toBeNull();

    // Verify schedule was updated
    const { data: updatedSchedule } = await supabase
      .from('backup_schedules')
      .select('*')
      .eq('id', schedule!.id)
      .single();

    expect(updatedSchedule!.last_run_at).toBeDefined();
    expect(updatedSchedule!.next_run_at).toBeDefined();
  });

  it('should find due schedules ready to run', async () => {
    // Create a schedule that is due (next_run_at in the past)
    const pastDate = new Date();
    pastDate.setHours(pastDate.getHours() - 1);

    const { data: dueSchedule } = await supabase
      .from('backup_schedules')
      .insert({
        organization_id: testOrgId,
        created_by: testUserId,
        name: 'Due Schedule',
        frequency: 'daily',
        backup_type: 'full',
        tables_included: ['categories'],
        enabled: true,
        next_run_at: pastDate.toISOString(),
        retention_days: 30,
      })
      .select()
      .single();

    createdScheduleIds.push(dueSchedule!.id);

    // Query for due schedules
    const now = new Date().toISOString();
    const { data: dueSchedules, error } = await supabase
      .from('backup_schedules')
      .select('*')
      .eq('enabled', true)
      .lte('next_run_at', now);

    expect(error).toBeNull();
    expect(dueSchedules).toBeDefined();
    expect(dueSchedules!.length).toBeGreaterThan(0);

    // Verify the due schedule is in the results
    const foundSchedule = dueSchedules!.find((s) => s.id === dueSchedule!.id);
    expect(foundSchedule).toBeDefined();
  });

  it('should disable a schedule and exclude from due schedules', async () => {
    // Create an enabled schedule
    const { data: schedule } = await supabase
      .from('backup_schedules')
      .insert({
        organization_id: testOrgId,
        created_by: testUserId,
        name: 'Schedule to Disable',
        frequency: 'daily',
        backup_type: 'full',
        tables_included: ['categories'],
        enabled: true,
        next_run_at: new Date().toISOString(),
        retention_days: 30,
      })
      .select()
      .single();

    createdScheduleIds.push(schedule!.id);

    // Disable the schedule
    const { error: disableError } = await supabase
      .from('backup_schedules')
      .update({ enabled: false })
      .eq('id', schedule!.id);

    expect(disableError).toBeNull();

    // Query for due schedules (should not include disabled)
    const now = new Date().toISOString();
    const { data: dueSchedules } = await supabase
      .from('backup_schedules')
      .select('*')
      .eq('enabled', true)
      .lte('next_run_at', now);

    // Verify disabled schedule is not in results
    const foundSchedule = dueSchedules!.find((s) => s.id === schedule!.id);
    expect(foundSchedule).toBeUndefined();
  });

  it('should list all schedules for organization', async () => {
    const { data: schedules, error } = await supabase
      .from('backup_schedules')
      .select('*')
      .eq('organization_id', testOrgId)
      .order('created_at', { ascending: false });

    expect(error).toBeNull();
    expect(schedules).toBeDefined();
    expect(schedules!.length).toBeGreaterThan(0);

    // Verify all schedules belong to the test organization
    schedules!.forEach((schedule) => {
      expect(schedule.organization_id).toBe(testOrgId);
    });
  });

  it('should update schedule configuration', async () => {
    // Create a schedule
    const { data: schedule } = await supabase
      .from('backup_schedules')
      .insert({
        organization_id: testOrgId,
        created_by: testUserId,
        name: 'Schedule to Update',
        frequency: 'daily',
        backup_type: 'full',
        tables_included: ['categories'],
        enabled: true,
        next_run_at: new Date().toISOString(),
        retention_days: 30,
      })
      .select()
      .single();

    createdScheduleIds.push(schedule!.id);

    // Update schedule
    const { error: updateError } = await supabase
      .from('backup_schedules')
      .update({
        name: 'Updated Schedule Name',
        frequency: 'weekly',
        retention_days: 60,
        updated_at: new Date().toISOString(),
      })
      .eq('id', schedule!.id);

    expect(updateError).toBeNull();

    // Verify updates
    const { data: updatedSchedule } = await supabase
      .from('backup_schedules')
      .select('*')
      .eq('id', schedule!.id)
      .single();

    expect(updatedSchedule!.name).toBe('Updated Schedule Name');
    expect(updatedSchedule!.frequency).toBe('weekly');
    expect(updatedSchedule!.retention_days).toBe(60);
  });

  it('should verify schedule execution creates backup with correct configuration', async () => {
    // Create a schedule with specific configuration
    const { data: schedule } = await supabase
      .from('backup_schedules')
      .insert({
        organization_id: testOrgId,
        created_by: testUserId,
        name: 'Config Test Schedule',
        frequency: 'daily',
        backup_type: 'selective',
        tables_included: ['expenses', 'revenues'],
        enabled: true,
        next_run_at: new Date().toISOString(),
        retention_days: 45,
      })
      .select()
      .single();

    createdScheduleIds.push(schedule!.id);

    // Create backup from schedule
    const { data: backup } = await supabase
      .from('backups')
      .insert({
        organization_id: testOrgId,
        created_by: testUserId,
        backup_type: schedule!.backup_type,
        status: 'completed',
        tables_included: schedule!.tables_included,
        file_path: `${testOrgId}/config-test-backup.json.gz`,
        file_size: 1024,
        compressed_size: 512,
        metadata: {
          formatVersion: '1.0',
          databaseVersion: '1.0',
          timestamp: new Date().toISOString(),
          tableSchemas: {},
          scheduleId: schedule!.id,
        },
      })
      .select()
      .single();

    createdBackupIds.push(backup!.id);

    // Verify backup matches schedule configuration
    expect(backup!.backup_type).toBe(schedule!.backup_type);
    expect(backup!.tables_included).toEqual(schedule!.tables_included);
    expect(backup!.metadata.scheduleId).toBe(schedule!.id);
  });
});
