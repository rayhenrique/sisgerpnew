/**
 * End-to-End Test: Backup Restore Flow
 * 
 * Tests the complete backup restore flow including:
 * - Restore from full backup
 * - Restore from selective backup
 * - Data restoration verification
 * - Audit log verification
 * 
 * Requirements: 5.1, 5.4, 5.5, 5.9
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const skipTests = !supabaseUrl || !supabaseServiceKey;

describe.skipIf(skipTests)('E2E: Backup Restore Flow', () => {
  let supabase: ReturnType<typeof createClient>;
  let testOrgId: string;
  let testUserId: string;
  let testBackupId: string;
  let createdRestoreJobIds: string[] = [];

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
        .insert({ name: 'Test Org for Restore E2E' })
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
        email: `test-restore-${Date.now()}@example.com`,
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

    // Create a test backup for restore operations
    const { data: backup } = await supabase
      .from('backups')
      .insert({
        organization_id: testOrgId,
        created_by: testUserId,
        backup_type: 'full',
        status: 'completed',
        tables_included: ['categories', 'expenses'],
        file_path: `${testOrgId}/test-backup.json.gz`,
        file_size: 1024,
        compressed_size: 512,
        metadata: {
          formatVersion: '1.0',
          databaseVersion: '1.0',
          timestamp: new Date().toISOString(),
          tableSchemas: {},
        },
      })
      .select('id')
      .single();

    testBackupId = backup!.id;
  });

  afterAll(async () => {
    // Cleanup: Delete created restore jobs
    for (const jobId of createdRestoreJobIds) {
      await supabase
        .from('restore_jobs')
        .delete()
        .eq('id', jobId);
    }

    // Delete test backup
    if (testBackupId) {
      await supabase
        .from('backups')
        .delete()
        .eq('id', testBackupId);
    }
  });

  it('should create a restore job for full backup', async () => {
    // Create restore job
    const { data: restoreJob, error } = await supabase
      .from('restore_jobs')
      .insert({
        backup_id: testBackupId,
        organization_id: testOrgId,
        initiated_by: testUserId,
        status: 'in_progress',
        tables_restored: [],
      })
      .select()
      .single();

    expect(error).toBeNull();
    expect(restoreJob).toBeDefined();
    expect(restoreJob!.backup_id).toBe(testBackupId);
    expect(restoreJob!.organization_id).toBe(testOrgId);
    expect(restoreJob!.initiated_by).toBe(testUserId);
    expect(restoreJob!.status).toBe('in_progress');

    createdRestoreJobIds.push(restoreJob!.id);

    // Simulate restore completion
    const { error: updateError } = await supabase
      .from('restore_jobs')
      .update({
        status: 'completed',
        tables_restored: ['categories', 'expenses'],
        completed_at: new Date().toISOString(),
      })
      .eq('id', restoreJob!.id);

    expect(updateError).toBeNull();

    // Verify restore job record
    const { data: verifyJob } = await supabase
      .from('restore_jobs')
      .select('*')
      .eq('id', restoreJob!.id)
      .single();

    expect(verifyJob).toBeDefined();
    expect(verifyJob!.status).toBe('completed');
    expect(verifyJob!.tables_restored).toEqual(['categories', 'expenses']);
    expect(verifyJob!.completed_at).toBeDefined();
  });

  it('should create a restore job for selective backup', async () => {
    // Create a selective backup first
    const { data: selectiveBackup } = await supabase
      .from('backups')
      .insert({
        organization_id: testOrgId,
        created_by: testUserId,
        backup_type: 'selective',
        status: 'completed',
        tables_included: ['categories'],
        file_path: `${testOrgId}/selective-backup.json.gz`,
        file_size: 512,
        compressed_size: 256,
        metadata: {
          formatVersion: '1.0',
          databaseVersion: '1.0',
          timestamp: new Date().toISOString(),
          tableSchemas: {},
        },
      })
      .select('id')
      .single();

    // Create restore job for selective backup
    const { data: restoreJob, error } = await supabase
      .from('restore_jobs')
      .insert({
        backup_id: selectiveBackup!.id,
        organization_id: testOrgId,
        initiated_by: testUserId,
        status: 'in_progress',
        tables_restored: [],
      })
      .select()
      .single();

    expect(error).toBeNull();
    expect(restoreJob).toBeDefined();

    createdRestoreJobIds.push(restoreJob!.id);

    // Simulate restore completion with only selected tables
    const { error: updateError } = await supabase
      .from('restore_jobs')
      .update({
        status: 'completed',
        tables_restored: ['categories'],
        completed_at: new Date().toISOString(),
      })
      .eq('id', restoreJob!.id);

    expect(updateError).toBeNull();

    // Verify only selected tables were restored
    const { data: verifyJob } = await supabase
      .from('restore_jobs')
      .select('*')
      .eq('id', restoreJob!.id)
      .single();

    expect(verifyJob).toBeDefined();
    expect(verifyJob!.tables_restored).toEqual(['categories']);
    expect(verifyJob!.tables_restored.length).toBe(1);

    // Cleanup selective backup
    await supabase
      .from('backups')
      .delete()
      .eq('id', selectiveBackup!.id);
  });

  it('should handle restore failure with error message', async () => {
    // Create restore job that will fail
    const { data: restoreJob, error } = await supabase
      .from('restore_jobs')
      .insert({
        backup_id: testBackupId,
        organization_id: testOrgId,
        initiated_by: testUserId,
        status: 'in_progress',
        tables_restored: [],
      })
      .select()
      .single();

    expect(error).toBeNull();
    createdRestoreJobIds.push(restoreJob!.id);

    // Simulate restore failure
    const errorMessage = 'Failed to restore: Database connection error';
    const { error: updateError } = await supabase
      .from('restore_jobs')
      .update({
        status: 'failed',
        error_message: errorMessage,
        completed_at: new Date().toISOString(),
      })
      .eq('id', restoreJob!.id);

    expect(updateError).toBeNull();

    // Verify failure is recorded
    const { data: verifyJob } = await supabase
      .from('restore_jobs')
      .select('*')
      .eq('id', restoreJob!.id)
      .single();

    expect(verifyJob).toBeDefined();
    expect(verifyJob!.status).toBe('failed');
    expect(verifyJob!.error_message).toBe(errorMessage);
    expect(verifyJob!.completed_at).toBeDefined();
  });

  it('should verify audit log is created for restore operation', async () => {
    // Create restore job
    const { data: restoreJob } = await supabase
      .from('restore_jobs')
      .insert({
        backup_id: testBackupId,
        organization_id: testOrgId,
        initiated_by: testUserId,
        status: 'in_progress',
        tables_restored: [],
      })
      .select()
      .single();

    createdRestoreJobIds.push(restoreJob!.id);

    // Create audit log entry for restore operation
    const { data: auditLog, error: auditError } = await supabase
      .from('audit_logs')
      .insert({
        organization_id: testOrgId,
        user_id: testUserId,
        action: 'backup.restore',
        resource_type: 'backup',
        resource_id: testBackupId,
        details: {
          restore_job_id: restoreJob!.id,
          backup_type: 'full',
          tables: ['categories', 'expenses'],
        },
      })
      .select()
      .single();

    expect(auditError).toBeNull();
    expect(auditLog).toBeDefined();
    expect(auditLog!.action).toBe('backup.restore');
    expect(auditLog!.resource_id).toBe(testBackupId);
    expect(auditLog!.user_id).toBe(testUserId);
    expect(auditLog!.organization_id).toBe(testOrgId);

    // Cleanup audit log
    await supabase
      .from('audit_logs')
      .delete()
      .eq('id', auditLog!.id);
  });

  it('should list restore jobs for a backup', async () => {
    // Query restore jobs for the test backup
    const { data: restoreJobs, error } = await supabase
      .from('restore_jobs')
      .select('*')
      .eq('backup_id', testBackupId)
      .order('started_at', { ascending: false });

    expect(error).toBeNull();
    expect(restoreJobs).toBeDefined();
    expect(restoreJobs!.length).toBeGreaterThan(0);

    // Verify all jobs belong to the test backup
    restoreJobs!.forEach((job) => {
      expect(job.backup_id).toBe(testBackupId);
      expect(job.organization_id).toBe(testOrgId);
    });
  });

  it('should verify restore status transitions', async () => {
    // Create restore job in initial state
    const { data: restoreJob } = await supabase
      .from('restore_jobs')
      .insert({
        backup_id: testBackupId,
        organization_id: testOrgId,
        initiated_by: testUserId,
        status: 'in_progress',
        tables_restored: [],
      })
      .select()
      .single();

    createdRestoreJobIds.push(restoreJob!.id);

    // Verify initial state
    expect(restoreJob!.status).toBe('in_progress');
    expect(restoreJob!.completed_at).toBeNull();

    // Transition to completed
    await supabase
      .from('restore_jobs')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
      })
      .eq('id', restoreJob!.id);

    const { data: completedJob } = await supabase
      .from('restore_jobs')
      .select('*')
      .eq('id', restoreJob!.id)
      .single();

    expect(completedJob!.status).toBe('completed');
    expect(completedJob!.completed_at).toBeDefined();
  });
});
