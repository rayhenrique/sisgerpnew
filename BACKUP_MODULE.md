# Backup Module Documentation

## Overview

The Backup Module is a comprehensive database backup and restore system for SISGERP that enables administrators to protect organizational data through manual and automated backups. The module supports full and selective backups, scheduled automation, retention policies, and secure restoration with multi-tenant isolation.

## Key Features

### 1. Manual Backup Creation
- **Full Backups**: Export all organization tables in a single operation
- **Selective Backups**: Choose specific tables/modules to backup
- **Compression**: Automatic gzip compression to reduce storage space
- **Validation**: Integrity checks after backup creation

### 2. Scheduled Automatic Backups
- **Flexible Scheduling**: Daily, weekly, or monthly backup schedules
- **Multiple Schedules**: Support for multiple concurrent schedules per organization
- **Configuration**: Customize backup type, tables, and retention period per schedule
- **Enable/Disable**: Toggle schedules on/off without deletion

### 3. Backup Management
- **List View**: Comprehensive table with all backups
- **Filtering**: Filter by date range, type, and status
- **Sorting**: Default sort by creation date (newest first)
- **Details**: View backup metadata, size, tables included, and creator

### 4. Data Restoration
- **Full Restore**: Restore all tables from a full backup
- **Selective Restore**: Restore only specific tables from a selective backup
- **Safety Confirmation**: Require explicit confirmation phrase before restore
- **Transaction Support**: Automatic rollback on failure
- **Audit Trail**: Complete logging of restore operations

### 5. Backup Operations
- **Download**: Generate signed URLs for backup file downloads
- **Delete**: Remove old or unnecessary backups
- **Validation**: Verify backup integrity and file existence

### 6. Automatic Retention
- **Retention Policies**: Automatically delete backups older than specified period
- **Differential Periods**: Different retention for full vs selective backups
- **Daily Execution**: Automated cleanup runs daily via cron job

### 7. Security & Access Control
- **Role-Based Access**: Admin/superadmin only for sensitive operations
- **Multi-tenant Isolation**: Organization-scoped data access
- **Audit Logging**: Complete audit trail for compliance
- **Read Access**: All users can view backup history

## Architecture

### Technology Stack
- **Frontend**: React 19 + TypeScript + Next.js 16 App Router
- **Backend**: Next.js API Routes + Server Services
- **Database**: Supabase PostgreSQL
- **Storage**: Supabase Storage (for backup files)
- **Compression**: Node.js zlib (gzip)
- **UI Components**: shadcn/ui + Radix UI

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend Layer                          │
│  - BackupPageClient (main UI)                               │
│  - CreateBackupDialog (backup creation)                     │
│  - RestoreConfirmDialog (restore confirmation)              │
│  - ScheduleDialog (schedule management)                     │
│  - BackupTable (data display)                               │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│                      API Layer                              │
│  - /api/backup (list, create)                               │
│  - /api/backup/[id] (get, delete)                           │
│  - /api/backup/[id]/restore (restore)                       │
│  - /api/backup/[id]/download (download)                     │
│  - /api/backup/schedules (CRUD operations)                  │
│  - /api/backup/cron/* (automated tasks)                     │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│                    Server Layer                             │
│  Controllers:                                               │
│  - BackupController (request handling)                      │
│  - ScheduleController (schedule management)                 │
│                                                             │
│  Services:                                                  │
│  - BackupService (backup creation & management)             │
│  - RestoreService (data restoration)                        │
│  - StorageService (file operations)                         │
│  - ScheduleService (schedule execution)                     │
│  - RetentionService (automatic cleanup)                     │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│                   Data Layer                                │
│  PostgreSQL Tables:                                         │
│  - backups (backup metadata)                                │
│  - backup_schedules (schedule configurations)               │
│  - restore_jobs (restore operation tracking)                │
│  - audit_logs (operation audit trail)                       │
│                                                             │
│  Supabase Storage:                                          │
│  - Compressed backup files (.gz)                            │
└─────────────────────────────────────────────────────────────┘
```

## User Guide

### Creating a Manual Backup

1. Navigate to the Backup page (`/backup`)
2. Click "Criar Backup" button (admin/superadmin only)
3. Select backup type:
   - **Full**: Backs up all organization tables
   - **Selective**: Choose specific tables to backup
4. If selective, check the tables you want to include
5. Click "Criar" to start the backup
6. Wait for completion notification

### Restoring from a Backup

1. Navigate to the Backup page
2. Find the backup you want to restore
3. Click the "Restaurar" button (admin/superadmin only)
4. Read the warning carefully - **this will overwrite current data**
5. Type "RESTAURAR" in the confirmation field
6. Click "Confirmar Restauração"
7. Wait for completion notification

### Creating a Backup Schedule

1. Navigate to the Backup page
2. Go to the "Agendamentos" tab
3. Click "Novo Agendamento"
4. Fill in the schedule details:
   - **Name**: Descriptive name for the schedule
   - **Frequency**: Daily, weekly, or monthly
   - **Backup Type**: Full or selective
   - **Tables**: Select tables (if selective)
   - **Retention Days**: How long to keep backups (default: 30 days)
5. Click "Salvar"

### Managing Schedules

- **Enable/Disable**: Toggle the switch to enable or disable a schedule
- **Edit**: Click the edit icon to modify schedule settings
- **Delete**: Click the delete icon to remove a schedule
- **View History**: See when the schedule last ran and when it will run next

### Downloading a Backup

1. Navigate to the Backup page
2. Find the backup you want to download
3. Click the "Download" button (admin/superadmin only)
4. The backup file will download to your computer
5. The file is compressed (.gz) and contains JSON data

### Deleting a Backup

1. Navigate to the Backup page
2. Find the backup you want to delete
3. Click the "Excluir" button (admin/superadmin only)
4. Confirm the deletion
5. The backup file and record will be removed

## Administrator Guide

### Setting Up Automated Backups

#### 1. Configure Backup Schedules

Create schedules through the UI as described in the User Guide above.

#### 2. Deploy Cron Jobs

The module includes two cron jobs that need to be deployed:

**Execute Schedules** (runs every hour):
- Endpoint: `/api/backup/cron/execute-schedules`
- Purpose: Checks for due schedules and executes them
- Recommended: Run every hour

**Apply Retention** (runs daily):
- Endpoint: `/api/backup/cron/apply-retention`
- Purpose: Deletes expired backups based on retention policies
- Recommended: Run once per day

#### 3. Deployment Options

**Option A: Vercel Cron (Recommended for Vercel deployments)**

Add to `vercel.json`:
```json
{
  "crons": [
    {
      "path": "/api/backup/cron/execute-schedules",
      "schedule": "0 * * * *"
    },
    {
      "path": "/api/backup/cron/apply-retention",
      "schedule": "0 2 * * *"
    }
  ]
}
```

**Option B: External Cron Service**

Use services like:
- Cron-job.org
- EasyCron
- GitHub Actions

Configure them to call the cron endpoints with the `CRON_SECRET` header.

**Option C: Server Cron**

If self-hosting, add to crontab:
```bash
# Execute schedules every hour
0 * * * * curl -H "Authorization: Bearer $CRON_SECRET" https://your-domain.com/api/backup/cron/execute-schedules

# Apply retention daily at 2 AM
0 2 * * * curl -H "Authorization: Bearer $CRON_SECRET" https://your-domain.com/api/backup/cron/apply-retention
```

### Configuring Retention Policies

Retention policies are configured per schedule:

1. When creating/editing a schedule, set the "Retention Days" field
2. Default is 30 days
3. Different schedules can have different retention periods
4. The retention cron job will automatically delete backups older than their retention period

### Monitoring Backups

#### Check Backup Status

1. Navigate to the Backup page
2. Use filters to find specific backups
3. Check the status column:
   - **Completed**: Backup successful
   - **Failed**: Backup failed (check error message)
   - **Corrupted**: Backup failed validation
   - **In Progress**: Backup currently running
   - **Pending**: Backup queued

#### Review Audit Logs

All backup operations are logged in the `audit_logs` table:
- Backup creation
- Backup restoration
- Backup deletion
- Schedule creation/modification
- Download operations

Access audit logs through the Admin → Auditoria page.

### Troubleshooting

#### Backup Creation Fails

**Symptoms**: Backup status shows "failed" with error message

**Common Causes**:
1. Insufficient permissions
2. Supabase Storage not configured
3. Database connection issues
4. Table doesn't exist

**Solutions**:
1. Verify user has admin/superadmin role
2. Check Supabase Storage bucket exists and is accessible
3. Verify database connection in `.env.local`
4. Check table names in selective backup

#### Restore Fails

**Symptoms**: Restore operation fails with error

**Common Causes**:
1. Backup file missing from storage
2. Corrupted backup file
3. Incompatible format version
4. Database constraints violated

**Solutions**:
1. Verify backup status is "completed"
2. Run backup validation
3. Check backup format version matches current version
4. Review restore job error message

#### Schedule Not Running

**Symptoms**: Schedule shows as enabled but backups aren't being created

**Common Causes**:
1. Cron job not configured
2. Cron job authentication failing
3. Schedule next_run_at in the future

**Solutions**:
1. Verify cron job is deployed and running
2. Check `CRON_SECRET` environment variable
3. Review cron job logs
4. Check schedule's `next_run_at` timestamp

#### Storage Space Issues

**Symptoms**: Backups failing due to storage limits

**Solutions**:
1. Reduce retention periods to delete old backups faster
2. Use selective backups instead of full backups
3. Manually delete unnecessary backups
4. Upgrade Supabase Storage plan

## Developer Guide

### API Reference

See [src/features/backup/README.md](src/features/backup/README.md) for complete API documentation.

### Database Schema

#### backups table
```sql
- id: UUID (primary key)
- organization_id: UUID (foreign key)
- created_by: UUID (foreign key to users)
- created_at: TIMESTAMP
- backup_type: VARCHAR ('full' | 'selective')
- status: VARCHAR (pending, in_progress, completed, failed, deleted, corrupted)
- file_path: TEXT (storage path)
- file_size: BIGINT (original size in bytes)
- compressed_size: BIGINT (compressed size in bytes)
- tables_included: TEXT[] (array of table names)
- metadata: JSONB (format version, schemas, etc.)
- error_message: TEXT
- validated_at: TIMESTAMP
```

#### backup_schedules table
```sql
- id: UUID (primary key)
- organization_id: UUID (foreign key)
- created_by: UUID (foreign key to users)
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
- name: VARCHAR(255)
- frequency: VARCHAR ('daily' | 'weekly' | 'monthly')
- backup_type: VARCHAR ('full' | 'selective')
- tables_included: TEXT[]
- enabled: BOOLEAN
- last_run_at: TIMESTAMP
- next_run_at: TIMESTAMP
- retention_days: INTEGER (default: 30)
```

#### restore_jobs table
```sql
- id: UUID (primary key)
- backup_id: UUID (foreign key to backups)
- organization_id: UUID (foreign key)
- initiated_by: UUID (foreign key to users)
- started_at: TIMESTAMP
- completed_at: TIMESTAMP
- status: VARCHAR (in_progress, completed, failed)
- tables_restored: TEXT[]
- error_message: TEXT
```

### Backup File Format

Backups are stored as gzip-compressed JSON files with the following structure:

```json
{
  "metadata": {
    "formatVersion": "1.0.0",
    "databaseVersion": "PostgreSQL 15.x",
    "timestamp": "2024-01-15T10:30:00Z",
    "tableSchemas": {
      "receitas": {
        "name": "receitas",
        "columns": [
          {
            "name": "id",
            "type": "uuid",
            "nullable": false,
            "defaultValue": "gen_random_uuid()"
          },
          ...
        ],
        "rowCount": 1234
      },
      ...
    }
  },
  "tables": {
    "receitas": {
      "schema": { ... },
      "rows": [
        { "id": "...", "description": "...", ... },
        ...
      ]
    },
    ...
  }
}
```

### Testing

The module includes comprehensive test coverage:

**Unit Tests**:
```bash
npm test src/server/backup/services
npm test src/server/backup/utils
npm test src/features/backup
```

**Integration Tests**:
```bash
npm test src/app/api/backup/__tests__/integration.test.ts
```

**E2E Tests**:
```bash
npm test src/app/api/backup/__tests__/e2e-*.test.ts
```

**All Tests**:
```bash
npm test
```

### Extending the Module

#### Adding New Backupable Tables

1. Add table name to `BACKUPABLE_TABLES` in `src/server/backup/services/backupService.ts`
2. Update table info in `src/server/backup/controllers/backupController.ts` `handleGetAvailableTables` method
3. Test backup and restore with the new table

#### Customizing Retention Policies

Modify `src/server/backup/services/retentionService.ts` to implement custom retention logic:
- Keep last N backups regardless of age
- Different retention for different backup types
- Retention based on backup size
- Custom retention rules per organization

#### Adding Backup Notifications

Integrate with notification system to alert users:
- When scheduled backups complete
- When backups fail
- When retention deletes backups
- When storage space is low

## Security Considerations

### Access Control
- Only admin and superadmin roles can create, restore, delete, or download backups
- All users can view backup history for their organization
- Multi-tenant isolation prevents cross-organization access

### Data Protection
- Backup files are stored in Supabase Storage with access controls
- Download URLs are signed and expire after 1 hour
- Restore operations require explicit confirmation
- All operations are logged in audit trail

### Backup Integrity
- Automatic validation after backup creation
- Checksum verification during restore
- Format version compatibility checks
- Corruption detection and marking

## Performance Considerations

### Backup Creation
- Large databases may take several minutes to backup
- Compression reduces storage by 70-90% typically
- Selective backups are faster than full backups
- Background processing prevents UI blocking

### Restoration
- Restore operations use database transactions
- Automatic rollback on failure
- Large restores may take several minutes
- Consider maintenance window for production restores

### Storage
- Compressed backups use significantly less space
- Retention policies automatically manage storage
- Monitor storage usage in Supabase dashboard
- Consider storage limits when setting retention periods

## Compliance & Audit

### Audit Trail
All backup operations are logged with:
- User ID and email
- Timestamp
- Operation type
- Affected resources
- Organization ID
- Operation details

### Data Retention
- Configurable retention periods per schedule
- Automatic deletion of expired backups
- Audit logs retained separately
- Compliance with data retention policies

### Disaster Recovery
- Regular automated backups
- Off-site storage (Supabase Storage)
- Point-in-time recovery capability
- Documented restore procedures

## Related Documentation

- [Feature README](src/features/backup/README.md) - API client and component documentation
- [Design Document](.kiro/specs/backup-module/design.md) - Detailed technical design
- [Requirements Document](.kiro/specs/backup-module/requirements.md) - Functional requirements
- [Implementation Tasks](.kiro/specs/backup-module/tasks.md) - Development task list
- [Cron Jobs README](src/app/api/backup/cron/README.md) - Automated task deployment
- [Migration Guide](supabase/migrations/APPLY_MIGRATION_GUIDE.md) - Database setup

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review the related documentation
3. Check audit logs for operation details
4. Verify environment configuration
5. Contact system administrator

## Version History

### Version 1.0.0 (Current)
- Initial release
- Full and selective backups
- Scheduled automation
- Retention policies
- Multi-tenant support
- Audit logging
- Backup validation
