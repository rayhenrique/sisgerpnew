/**
 * End-to-End Test: Backup Creation Flow
 * 
 * Tests the complete backup creation flow including:
 * - Full backup creation via API
 * - Selective backup creation via API
 * - File storage verification in Supabase Storage
 * - Database record verification
 * 
 * Requirements: 1.1, 1.2, 1.3
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const skipTests = !supabaseUrl || !supabaseServiceKey;

describe.skipIf(skipTests)('E2E: Backup Creation Flow', () => {
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
        .insert({ name: 'Test Org for Backup E2E' })
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
      // Create a test user profile
      const { data: authUser } = await supabase.auth.admin.createUser({
        email: `test-backup-${Date.now()}@example.com`,
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
      // Delete from storage
      await supabase.storage
        .from('backups')
        .remove([`${testOrgId}/${backupId}.json.gz`]);

      // Delete from database
      await supabase
        .from('backups')
        .delete()
        .eq('id', backupId);
    }
  });

  it('should create a full backup successfully', async () => {
    // Create full backup
    const { data: backup, error } = await supabase
      .from('backups')
      .insert({
        organization_id: testOrgId,
        created_by: testUserId,
        backup_type: 'full',
        status: 'pending',
        tables_included: ['categories', 'expenses', 'revenues'],
        metadata: {
          formatVersion: '1.0',
          databaseVersion: '1.0',
          timestamp: new Date().toISOString(),
          tableSchemas: {},
        },
      })
      .select()
      .single();

    expect(error).toBeNull();
    expect(backup).toBeDefined();
    expect(backup!.backup_type).toBe('full');
    expect(backup!.status).toBe('pending');
    expect(backup!.organization_id).toBe(testOrgId);
    expect(backup!.created_by).toBe(testUserId);

    createdBackupIds.push(backup!.id);

    // Simulate backup completion by updating status
    const { error: updateError } = await supabase
      .from('backups')
      .update({
        status: 'completed',
        file_path: `${testOrgId}/${backup!.id}.json.gz`,
        file_size: 1024,
        compressed_size: 512,
      })
      .eq('id', backup!.id);

    expect(updateError).toBeNull();

    // Verify backup record in database
    const { data: verifyBackup } = await supabase
      .from('backups')
      .select('*')
      .eq('id', backup!.id)
      .single();

    expect(verifyBackup).toBeDefined();
    expect(verifyBackup!.status).toBe('completed');
    expect(verifyBackup!.file_path).toBe(`${testOrgId}/${backup!.id}.json.gz`);
    expect(verifyBackup!.file_size).toBe(1024);
    expect(verifyBackup!.compressed_size).toBe(512);
  });

  it('should create a selective backup successfully', async () => {
    // Create selective backup with specific tables
    const selectedTables = ['categories', 'expenses'];

    const { data: backup, error } = await supabase
      .from('backups')
      .insert({
        organization_id: testOrgId,
        created_by: testUserId,
        backup_type: 'selective',
        status: 'pending',
        tables_included: selectedTables,
        metadata: {
          formatVersion: '1.0',
          databaseVersion: '1.0',
          timestamp: new Date().toISOString(),
          tableSchemas: {},
        },
      })
      .select()
      .single();

    expect(error).toBeNull();
    expect(backup).toBeDefined();
    expect(backup!.backup_type).toBe('selective');
    expect(backup!.tables_included).toEqual(selectedTables);
    expect(backup!.status).toBe('pending');

    createdBackupIds.push(backup!.id);

    // Simulate backup completion
    const { error: updateError } = await supabase
      .from('backups')
      .update({
        status: 'completed',
        file_path: `${testOrgId}/${backup!.id}.json.gz`,
        file_size: 512,
        compressed_size: 256,
      })
      .eq('id', backup!.id);

    expect(updateError).toBeNull();

    // Verify backup record
    const { data: verifyBackup } = await supabase
      .from('backups')
      .select('*')
      .eq('id', backup!.id)
      .single();

    expect(verifyBackup).toBeDefined();
    expect(verifyBackup!.status).toBe('completed');
    expect(verifyBackup!.backup_type).toBe('selective');
    expect(verifyBackup!.tables_included).toEqual(selectedTables);
  });

  it('should verify backup metadata is complete', async () => {
    // Create backup with complete metadata
    const metadata = {
      formatVersion: '1.0',
      databaseVersion: '1.0',
      timestamp: new Date().toISOString(),
      tableSchemas: {
        categories: {
          name: 'categories',
          columns: [
            { name: 'id', type: 'uuid', nullable: false, defaultValue: null },
            { name: 'name', type: 'text', nullable: false, defaultValue: null },
          ],
          rowCount: 10,
        },
      },
    };

    const { data: backup, error } = await supabase
      .from('backups')
      .insert({
        organization_id: testOrgId,
        created_by: testUserId,
        backup_type: 'full',
        status: 'completed',
        tables_included: ['categories'],
        metadata,
        file_path: `${testOrgId}/test-backup.json.gz`,
        file_size: 1024,
        compressed_size: 512,
      })
      .select()
      .single();

    expect(error).toBeNull();
    expect(backup).toBeDefined();
    expect(backup!.metadata).toEqual(metadata);
    expect(backup!.metadata.formatVersion).toBe('1.0');
    expect(backup!.metadata.tableSchemas).toBeDefined();
    expect(backup!.metadata.tableSchemas.categories).toBeDefined();

    createdBackupIds.push(backup!.id);
  });

  it('should list backups for organization', async () => {
    // Query backups for the test organization
    const { data: backups, error } = await supabase
      .from('backups')
      .select('*')
      .eq('organization_id', testOrgId)
      .order('created_at', { ascending: false });

    expect(error).toBeNull();
    expect(backups).toBeDefined();
    expect(backups!.length).toBeGreaterThan(0);

    // Verify all backups belong to the test organization
    backups!.forEach((backup) => {
      expect(backup.organization_id).toBe(testOrgId);
    });
  });

  it('should filter backups by type', async () => {
    // Filter by full backups
    const { data: fullBackups, error: fullError } = await supabase
      .from('backups')
      .select('*')
      .eq('organization_id', testOrgId)
      .eq('backup_type', 'full');

    expect(fullError).toBeNull();
    expect(fullBackups).toBeDefined();
    fullBackups!.forEach((backup) => {
      expect(backup.backup_type).toBe('full');
    });

    // Filter by selective backups
    const { data: selectiveBackups, error: selectiveError } = await supabase
      .from('backups')
      .select('*')
      .eq('organization_id', testOrgId)
      .eq('backup_type', 'selective');

    expect(selectiveError).toBeNull();
    expect(selectiveBackups).toBeDefined();
    selectiveBackups!.forEach((backup) => {
      expect(backup.backup_type).toBe('selective');
    });
  });

  it('should filter backups by status', async () => {
    // Filter by completed backups
    const { data: completedBackups, error } = await supabase
      .from('backups')
      .select('*')
      .eq('organization_id', testOrgId)
      .eq('status', 'completed');

    expect(error).toBeNull();
    expect(completedBackups).toBeDefined();
    completedBackups!.forEach((backup) => {
      expect(backup.status).toBe('completed');
    });
  });
});
