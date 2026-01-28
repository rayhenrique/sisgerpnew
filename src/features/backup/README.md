# Backup Module

## Overview

The Backup Module provides comprehensive database backup and restore capabilities for SISGERP. It enables administrators to create, manage, schedule, and restore database backups to ensure data integrity and business continuity in a multi-tenant environment.

## Features

- **Manual Backups**: Create full or selective backups on-demand
- **Scheduled Backups**: Automate backups with daily, weekly, or monthly schedules
- **Backup Management**: View, filter, download, and delete backups
- **Data Restoration**: Restore from full or selective backups with confirmation
- **Retention Policies**: Automatic cleanup of old backups
- **Multi-tenant Isolation**: Organization-scoped data access
- **Role-based Access Control**: Admin/superadmin operations with audit logging
- **Backup Validation**: Integrity checks for backup files

## Architecture

### Directory Structure

```
src/features/backup/
├── BackupPageClient.tsx          # Main page component
├── api.ts                        # API client functions
├── types.ts                      # TypeScript type definitions
├── format.ts                     # Formatting utilities
├── components/
│   ├── BackupTable.tsx           # Backup list table
│   ├── CreateBackupDialog.tsx    # Backup creation dialog
│   ├── RestoreConfirmDialog.tsx  # Restore confirmation dialog
│   ├── ScheduleDialog.tsx        # Schedule management dialog
│   └── ScheduleList.tsx          # Schedule list component
└── README.md                     # This file
```

### Server-side Components

```
src/server/backup/
├── controllers/
│   ├── backupController.ts       # Request handlers for backup operations
│   └── scheduleController.ts     # Request handlers for schedule operations
├── services/
│   ├── backupService.ts          # Backup creation and management
│   ├── restoreService.ts         # Backup restoration logic
│   ├── storageService.ts         # Supabase Storage operations
│   ├── scheduleService.ts        # Schedule management
│   └── retentionService.ts       # Automatic backup cleanup
├── models/
│   ├── types.ts                  # Server-side type definitions
│   └── validation.ts             # Zod validation schemas
└── utils/
    ├── compression.ts            # Gzip compression utilities
    └── format.ts                 # Formatting utilities
```

## API Client Functions

### Backup Operations

#### `listBackups(filters?: BackupFilters): Promise<Backup[]>`

Fetches the list of backups for the current organization with optional filters.

**Parameters:**
- `filters` (optional): Filter criteria
  - `startDate`: ISO date string for start of date range
  - `endDate`: ISO date string for end of date range
  - `backupType`: 'full' | 'selective'
  - `status`: Backup status filter

**Returns:** Array of backup records

**Example:**
```typescript
import { listBackups } from '@/features/backup/api';

const backups = await listBackups({
  startDate: '2024-01-01T00:00:00Z',
  endDate: '2024-12-31T23:59:59Z',
  backupType: 'full',
  status: 'completed'
});
```

#### `createBackup(options: CreateBackupOptions): Promise<Backup>`

Creates a new backup (manual operation).

**Parameters:**
- `options.backupType`: 'full' | 'selective'
- `options.tables`: Array of table names (required for selective backups)

**Returns:** Created backup record

**Example:**
```typescript
import { createBackup } from '@/features/backup/api';

// Full backup
const fullBackup = await createBackup({ backupType: 'full' });

// Selective backup
const selectiveBackup = await createBackup({
  backupType: 'selective',
  tables: ['receitas', 'despesas', 'categorias']
});
```

#### `getBackup(backupId: string): Promise<Backup>`

Fetches details for a specific backup.

**Parameters:**
- `backupId`: UUID of the backup

**Returns:** Backup record

#### `deleteBackup(backupId: string): Promise<void>`

Deletes a backup (admin/superadmin only).

**Parameters:**
- `backupId`: UUID of the backup to delete

**Example:**
```typescript
import { deleteBackup } from '@/features/backup/api';

await deleteBackup('123e4567-e89b-12d3-a456-426614174000');
```

#### `restoreBackup(backupId: string): Promise<void>`

Restores data from a backup (admin/superadmin only).

**Parameters:**
- `backupId`: UUID of the backup to restore

**Example:**
```typescript
import { restoreBackup } from '@/features/backup/api';

await restoreBackup('123e4567-e89b-12d3-a456-426614174000');
```

#### `downloadBackup(backupId: string): Promise<string>`

Generates a signed download URL for a backup file.

**Parameters:**
- `backupId`: UUID of the backup to download

**Returns:** Signed download URL (valid for 1 hour)

**Example:**
```typescript
import { downloadBackup } from '@/features/backup/api';

const downloadUrl = await downloadBackup('123e4567-e89b-12d3-a456-426614174000');
window.open(downloadUrl, '_blank');
```

### Schedule Operations

#### `listSchedules(): Promise<BackupSchedule[]>`

Fetches all backup schedules for the current organization.

**Returns:** Array of schedule records

#### `createSchedule(schedule: CreateScheduleInput): Promise<BackupSchedule>`

Creates a new backup schedule.

**Parameters:**
- `schedule.name`: Schedule name
- `schedule.frequency`: 'daily' | 'weekly' | 'monthly'
- `schedule.backupType`: 'full' | 'selective'
- `schedule.tables`: Array of table names (required for selective)
- `schedule.retentionDays`: Number of days to retain backups (default: 30)

**Returns:** Created schedule record

**Example:**
```typescript
import { createSchedule } from '@/features/backup/api';

const schedule = await createSchedule({
  name: 'Daily Full Backup',
  frequency: 'daily',
  backupType: 'full',
  retentionDays: 30
});
```

#### `updateSchedule(scheduleId: string, updates: UpdateScheduleInput): Promise<BackupSchedule>`

Updates an existing backup schedule.

**Parameters:**
- `scheduleId`: UUID of the schedule
- `updates`: Partial schedule updates

**Returns:** Updated schedule record

#### `deleteSchedule(scheduleId: string): Promise<void>`

Deletes a backup schedule.

**Parameters:**
- `scheduleId`: UUID of the schedule to delete

### Utility Functions

#### `getAvailableTables(): Promise<TableInfo[]>`

Fetches the list of tables available for backup.

**Returns:** Array of table information with display names and row counts

**Example:**
```typescript
import { getAvailableTables } from '@/features/backup/api';

const tables = await getAvailableTables();
// [
//   { name: 'receitas', displayName: 'Receitas', module: 'Financeiro', rowCount: 1234 },
//   { name: 'despesas', displayName: 'Despesas', module: 'Financeiro', rowCount: 5678 },
//   ...
// ]
```

## Component Usage

### BackupPageClient

Main page component that orchestrates the backup management UI.

**Props:**
```typescript
interface BackupPageClientProps {
  initialBackups: Backup[];
  userRole: UserRole;
}
```

**Usage:**
```typescript
import { BackupPageClient } from '@/features/backup/BackupPageClient';

export default function BackupPage() {
  const backups = await fetchBackups();
  const userRole = await getUserRole();
  
  return <BackupPageClient initialBackups={backups} userRole={userRole} />;
}
```

### CreateBackupDialog

Dialog component for creating new backups.

**Props:**
```typescript
interface CreateBackupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (options: CreateBackupOptions) => Promise<void>;
  availableTables: TableInfo[];
}
```

**Usage:**
```typescript
<CreateBackupDialog
  open={isDialogOpen}
  onOpenChange={setIsDialogOpen}
  onSubmit={handleCreateBackup}
  availableTables={tables}
/>
```

### RestoreConfirmDialog

Confirmation dialog for restore operations with safety checks.

**Props:**
```typescript
interface RestoreConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  backup: Backup;
  onConfirm: () => Promise<void>;
}
```

**Usage:**
```typescript
<RestoreConfirmDialog
  open={isRestoreDialogOpen}
  onOpenChange={setIsRestoreDialogOpen}
  backup={selectedBackup}
  onConfirm={handleRestoreConfirm}
/>
```

### BackupTable

Data table component for displaying backups with actions.

**Props:**
```typescript
interface BackupTableProps {
  backups: Backup[];
  onRestore: (backup: Backup) => void;
  onDelete: (backup: Backup) => void;
  onDownload: (backup: Backup) => void;
  userRole: UserRole;
}
```

### ScheduleList & ScheduleDialog

Components for managing backup schedules.

**Usage:**
```typescript
<ScheduleList
  schedules={schedules}
  onEdit={handleEditSchedule}
  onDelete={handleDeleteSchedule}
  onToggle={handleToggleSchedule}
/>

<ScheduleDialog
  open={isScheduleDialogOpen}
  onOpenChange={setIsScheduleDialogOpen}
  schedule={editingSchedule}
  onSubmit={handleScheduleSubmit}
  availableTables={tables}
/>
```

## Service Architecture

### BackupService

Handles backup creation, validation, and management.

**Key Methods:**
- `createBackup()`: Creates a new backup with compression
- `exportTables()`: Exports table data to JSON
- `validateBackup()`: Validates backup integrity
- `listBackups()`: Lists backups with filtering

### RestoreService

Handles backup restoration with transaction support.

**Key Methods:**
- `restoreBackup()`: Restores data from backup
- `importTables()`: Imports table data with rollback support
- `validateRestore()`: Validates restore compatibility

### StorageService

Manages file operations with Supabase Storage.

**Key Methods:**
- `uploadBackup()`: Uploads compressed backup file
- `downloadBackup()`: Downloads backup file
- `deleteBackup()`: Removes backup file
- `getDownloadUrl()`: Generates signed download URL

### ScheduleService

Manages backup schedules and execution.

**Key Methods:**
- `createSchedule()`: Creates new schedule
- `getDueSchedules()`: Finds schedules ready to run
- `executeSchedule()`: Triggers scheduled backup

### RetentionService

Handles automatic backup cleanup.

**Key Methods:**
- `applyRetentionPolicy()`: Deletes expired backups
- `getExpiredBackups()`: Identifies old backups

## Data Models

### Backup

```typescript
interface Backup {
  id: string;
  organizationId: string;
  createdBy: string;
  createdAt: string;
  backupType: 'full' | 'selective';
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'deleted' | 'corrupted';
  filePath: string | null;
  fileSize: number | null;
  compressedSize: number | null;
  tablesIncluded: string[];
  metadata: BackupMetadata;
  errorMessage: string | null;
  validatedAt: string | null;
  creatorName?: string;
}
```

### BackupSchedule

```typescript
interface BackupSchedule {
  id: string;
  organizationId: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  name: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  backupType: 'full' | 'selective';
  tablesIncluded: string[];
  enabled: boolean;
  lastRunAt: string | null;
  nextRunAt: string | null;
  retentionDays: number;
}
```

## Access Control

### Role Requirements

- **View Backups**: All authenticated users (user, admin, superadmin)
- **Create Backup**: Admin or superadmin only
- **Restore Backup**: Admin or superadmin only
- **Delete Backup**: Admin or superadmin only
- **Download Backup**: Admin or superadmin only
- **Manage Schedules**: Admin or superadmin only

### Multi-tenant Isolation

All operations are automatically scoped to the user's organization. Users cannot access backups from other organizations.

## Audit Logging

All backup operations are logged in the `audit_logs` table with:
- User ID
- Organization ID
- Timestamp
- Operation type (backup_created, backup_restored, backup_deleted, etc.)
- Operation details (backup ID, affected tables, etc.)

## Error Handling

API functions throw errors with descriptive messages:

```typescript
try {
  await restoreBackup(backupId);
} catch (error) {
  if (error.message.includes('not found')) {
    // Handle missing backup
  } else if (error.message.includes('unauthorized')) {
    // Handle permission error
  } else {
    // Handle other errors
  }
}
```

## Testing

The module includes comprehensive test coverage:

- **Unit Tests**: Service logic, validation, utilities
- **Integration Tests**: API routes, end-to-end flows
- **E2E Tests**: Complete backup/restore workflows

Run tests:
```bash
npm test src/features/backup
npm test src/server/backup
npm test src/app/api/backup
```

## Cron Jobs

Automated tasks run via API routes:

- **Execute Schedules**: `/api/backup/cron/execute-schedules` (runs every hour)
- **Apply Retention**: `/api/backup/cron/apply-retention` (runs daily)

See `src/app/api/backup/cron/README.md` for deployment instructions.

## Troubleshooting

### Backup Creation Fails

1. Check user has admin/superadmin role
2. Verify Supabase Storage bucket exists and is accessible
3. Check database connection and table permissions
4. Review error message in backup record

### Restore Fails

1. Verify backup file exists in storage
2. Check backup status is 'completed'
3. Ensure backup format version is compatible
4. Review restore job error message

### Schedule Not Running

1. Verify schedule is enabled
2. Check `next_run_at` timestamp
3. Ensure cron job is configured and running
4. Review cron job logs

## Related Documentation

- [Design Document](.kiro/specs/backup-module/design.md)
- [Requirements Document](.kiro/specs/backup-module/requirements.md)
- [Implementation Tasks](.kiro/specs/backup-module/tasks.md)
- [Cron Jobs README](../../app/api/backup/cron/README.md)
