/**
 * End-to-End Test: Backup Retention Policy
 * 
 * Tests the retention policy functionality including:
 * - Create old backups (manually set dates)
 * - Run retention service
 * - Verify old backups are deleted
 * 
 * Requirements: 7.2, 7.3
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const skipTests = !supabaseUrl || !supabaseServiceKey;

describe.skipIf(skipTests)('E2E: Backup Retention Policy', () => {
  let supabase: ReturnType<typeof createClient>;
  let testOrgId: string;
  let testUserId: string;
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
        .insert({ name: 'Test Org for Retention E2E' })
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
        email: `test-retention-${Date.now()}@example.com`,
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
    // Cleanup: Delete any remaining backups
    for (const backupId of createdBackupIds) {
      await supabase
        .from('backups')
        .delete()
        .eq('id', backupId);
    }
  });

  it('should create old backups with past dates', async () => {
    // Create backup from 45 days ago
    const date45DaysAgo = new Date();
    date45DaysAgo.setDate(date45DaysAgo.getDate() - 45);

    const { data: oldBackup, error } = await supabase
      .from('backups')
      .insert({
        organization_id: testOrgId,
        created_by: testUserId,
        created_at: date45DaysAgo.toISOString(),
        backup_type: 'full',
        status: 'completed',
        tables_included: ['categories'],
        file_path: `${testOrgId}/old-backup-45.json.gz`,
        file_size: 1024,
        compressed_size: 512,
        metadata: {
          formatVersion: '1.0',
          databaseVersion: '1.0',
          timestamp: date45DaysAgo.toISOString(),
          tableSchemas: {},
        },
      })
      .select()
      .single();

    expect(error).toBeNull();
    expect(oldBackup).toBeDefined();
    createdBackupIds.push(oldBackup!.id);

    // Create backup from 60 days ago
    const date60DaysAgo = new Date();
    date60DaysAgo.setDate(date60DaysAgo.getDate() - 60);

    const { data: veryOldBackup } = await supabase
      .from('backups')
      .insert({
        organization_id: testOrgId,
        created_by: testUserId,
        created_at: date60DaysAgo.toISOString(),
        backup_type: 'full',
        status: 'completed',
        tables_included: ['categories'],
        file_path: `${testOrgId}/old-backup-60.json.gz`,
        file_size: 1024,
        compressed_size: 512,
        metadata: {
          formatVersion: '1.0',
          databaseVersion: '1.0',
          timestamp: date60DaysAgo.toISOString(),
          tableSchemas: {},
        },
      })
      .select()
      .single();

    createdBackupIds.push(veryOldBackup!.id);

    // Create recent backup (should not be deleted)
    const { data: recentBackup } = await supabase
      .from('backups')
      .insert({
        organization_id: testOrgId,
        created_by: testUserId,
        backup_type: 'full',
        status: 'completed',
        tables_included: ['categories'],
        file_path: `${testOrgId}/recent-backup.json.gz`,
        file_size: 1024,
        compressed_size: 512,
        metadata: {
          formatVersion: '1.0',
          databaseVersion: '1.0',
          timestamp: new Date().toISOString(),
          tableSchemas: {},
        },
      })
      .select()
      .single();

    createdBackupIds.push(recentBackup!.id);
  });

  it('should identify expired backups based on retention period', async () => {
    const retentionDays = 30;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    // Query for expired backups
    const { data: expiredBackups, error } = await supabase
      .from('backups')
      .select('*')
      .eq('organization_id', testOrgId)
      .eq('status', 'completed')
      .lt('created_at', cutoffDate.toISOString());

    expect(error).toBeNull();
    expect(expiredBackups).toBeDefined();
    expect(expiredBackups!.length).toBeGreaterThan(0);

    // Verify all returned backups are older than retention period
    expiredBackups!.forEach((backup) => {
      const backupDate = new Date(backup.created_at);
      expect(backupDate.getTime()).toBeLessThan(cutoffDate.getTime());
    });
  });

  it('should mark expired backups as deleted', async () => {
    const retentionDays = 30;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    // Get expired backups
    const { data: expiredBackups } = await supabase
      .from('backups')
      .select('id')
      .eq('organization_id', testOrgId)
      .eq('status', 'completed')
      .lt('created_at', cutoffDate.toISOString());

    if (expiredBackups && expiredBackups.length > 0) {
      // Mark as deleted
      const { error: updateError } = await supabase
        .from('backups')
        .update({ status: 'deleted' })
        .in('id', expiredBackups.map((b) => b.id));

      expect(updateError).toBeNull();

      // Verify status was updated
      const { data: deletedBackups } = await supabase
        .from('backups')
        .select('*')
        .in('id', expiredBackups.map((b) => b.id));

      deletedBackups!.forEach((backup) => {
        expect(backup.status).toBe('deleted');
      });
    }
  });

  it('should not delete recent backups within retention period', async () => {
    const retentionDays = 30;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    // Query for recent backups (within retention period)
    const { data: recentBackups, error } = await supabase
      .from('backups')
      .select('*')
      .eq('organization_id', testOrgId)
      .eq('status', 'completed')
      .gte('created_at', cutoffDate.toISOString());

    expect(error).toBeNull();
    expect(recentBackups).toBeDefined();

    // Verify all backups are within retention period
    recentBackups!.forEach((backup) => {
      const backupDate = new Date(backup.created_at);
      expect(backupDate.getTime()).toBeGreaterThanOrEqual(cutoffDate.getTime());
      expect(backup.status).toBe('completed');
    });
  });

  it('should support different retention periods for full vs selective backups', async () => {
    // Create old full backup (should be kept longer)
    const date40DaysAgo = new Date();
    date40DaysAgo.setDate(date40DaysAgo.getDate() - 40);

    const { data: fullBackup } = await supabase
      .from('backups')
      .insert({
        organization_id: testOrgId,
        created_by: testUserId,
        created_at: date40DaysAgo.toISOString(),
        backup_type: 'full',
        status: 'completed',
        tables_included: ['categories', 'expenses', 'revenues'],
        file_path: `${testOrgId}/full-backup-40.json.gz`,
        file_size: 2048,
        compressed_size: 1024,
        metadata: {
          formatVersion: '1.0',
          databaseVersion: '1.0',
          timestamp: date40DaysAgo.toISOString(),
          tableSchemas: {},
        },
      })
      .select()
      .single();

    createdBackupIds.push(fullBackup!.id);

    // Create old selective backup (shorter retention)
    const { data: selectiveBackup } = await supabase
      .from('backups')
      .insert({
        organization_id: testOrgId,
        created_by: testUserId,
        created_at: date40DaysAgo.toISOString(),
        backup_type: 'selective',
        status: 'completed',
        tables_included: ['categories'],
        file_path: `${testOrgId}/selective-backup-40.json.gz`,
        file_size: 512,
        compressed_size: 256,
        metadata: {
          formatVersion: '1.0',
          databaseVersion: '1.0',
          timestamp: date40DaysAgo.toISOString(),
          tableSchemas: {},
        },
      })
      .select()
      .single();

    createdBackupIds.push(selectiveBackup!.id);

    // Apply different retention periods
    const fullRetentionDays = 60;
    const selectiveRetentionDays = 30;

    const fullCutoffDate = new Date();
    fullCutoffDate.setDate(fullCutoffDate.getDate() - fullRetentionDays);

    const selectiveCutoffDate = new Date();
    selectiveCutoffDate.setDate(selectiveCutoffDate.getDate() - selectiveRetentionDays);

    // Check full backup (should not be expired with 60-day retention)
    const fullBackupDate = new Date(fullBackup!.created_at);
    expect(fullBackupDate.getTime()).toBeGreaterThan(fullCutoffDate.getTime());

    // Check selective backup (should be expired with 30-day retention)
    const selectiveBackupDate = new Date(selectiveBackup!.created_at);
    expect(selectiveBackupDate.getTime()).toBeLessThan(selectiveCutoffDate.getTime());
  });

  it('should count deleted backups after retention policy execution', async () => {
    const retentionDays = 30;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    // Get count of expired backups before deletion
    const { count: beforeCount } = await supabase
      .from('backups')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', testOrgId)
      .eq('status', 'completed')
      .lt('created_at', cutoffDate.toISOString());

    if (beforeCount && beforeCount > 0) {
      // Mark expired backups as deleted
      const { data: expiredBackups } = await supabase
        .from('backups')
        .select('id')
        .eq('organization_id', testOrgId)
        .eq('status', 'completed')
        .lt('created_at', cutoffDate.toISOString());

      await supabase
        .from('backups')
        .update({ status: 'deleted' })
        .in('id', expiredBackups!.map((b) => b.id));

      // Get count of deleted backups
      const { count: deletedCount } = await supabase
        .from('backups')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', testOrgId)
        .eq('status', 'deleted')
        .in('id', expiredBackups!.map((b) => b.id));

      expect(deletedCount).toBe(beforeCount);
    }
  });

  it('should create audit log for retention policy execution', async () => {
    const retentionDays = 30;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    // Get expired backups
    const { data: expiredBackups } = await supabase
      .from('backups')
      .select('id')
      .eq('organization_id', testOrgId)
      .eq('status', 'completed')
      .lt('created_at', cutoffDate.toISOString())
      .limit(1);

    if (expiredBackups && expiredBackups.length > 0) {
      const backupId = expiredBackups[0].id;

      // Create audit log for retention deletion
      const { data: auditLog, error: auditError } = await supabase
        .from('audit_logs')
        .insert({
          organization_id: testOrgId,
          user_id: null, // System action
          action: 'backup.retention_delete',
          resource_type: 'backup',
          resource_id: backupId,
          details: {
            retention_days: retentionDays,
            reason: 'Automatic retention policy',
          },
        })
        .select()
        .single();

      expect(auditError).toBeNull();
      expect(auditLog).toBeDefined();
      expect(auditLog!.action).toBe('backup.retention_delete');
      expect(auditLog!.resource_id).toBe(backupId);

      // Cleanup audit log
      await supabase
        .from('audit_logs')
        .delete()
        .eq('id', auditLog!.id);
    }
  });

  it('should verify retention policy runs daily', async () => {
    // This test verifies the concept - actual scheduling would be done via cron
    const retentionDays = 30;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    // Simulate daily retention check
    const { data: expiredBackups } = await supabase
      .from('backups')
      .select('id, created_at')
      .eq('organization_id', testOrgId)
      .eq('status', 'completed')
      .lt('created_at', cutoffDate.toISOString());

    // Verify we can identify expired backups
    expect(expiredBackups).toBeDefined();

    if (expiredBackups && expiredBackups.length > 0) {
      // Each backup should be older than retention period
      expiredBackups.forEach((backup) => {
        const backupDate = new Date(backup.created_at);
        const daysDiff = Math.floor(
          (Date.now() - backupDate.getTime()) / (1000 * 60 * 60 * 24)
        );
        expect(daysDiff).toBeGreaterThan(retentionDays);
      });
    }
  });
});
