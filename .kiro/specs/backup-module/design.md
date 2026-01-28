# Design Document: Backup Module

## Overview

The Backup Module provides comprehensive database backup and restore capabilities for SISGERP. The system follows a client-server architecture where the React frontend communicates with Next.js API routes, which delegate to server-side services that interact with Supabase PostgreSQL and Storage.

The module supports both manual and scheduled backups, with options for full or selective table exports. Backups are stored as compressed JSON files in Supabase Storage, with metadata tracked in the database. The system implements role-based access control, audit logging, and automatic retention policies.

**Key Design Principles:**
- **Multi-tenant isolation**: All operations are scoped to the user's organization
- **Asynchronous processing**: Long-running backup/restore operations run asynchronously
- **Fail-safe restoration**: Restore operations use transactions to ensure atomicity
- **Audit trail**: All operations are logged for compliance
- **Storage efficiency**: Backups are compressed and subject to retention policies

## Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend Layer                          │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  BackupPageClient.tsx                                │  │
│  │  - Backup list table with filters                    │  │
│  │  - Create backup dialog                              │  │
│  │  - Restore confirmation dialog                       │  │
│  │  - Schedule management UI                            │  │
│  └──────────────────────────────────────────────────────┘  │
│                          ↓                                  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  features/backup/api.ts                              │  │
│  │  - API client functions                              │  │
│  │  - HTTP requests with auth tokens                    │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│                      API Layer                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  app/api/backup/                                     │  │
│  │  - route.ts (GET, POST)                              │  │
│  │  - [id]/route.ts (GET, DELETE)                       │  │
│  │  - [id]/restore/route.ts (POST)                      │  │
│  │  - [id]/download/route.ts (GET)                      │  │
│  │  - schedules/route.ts (GET, POST, PUT, DELETE)       │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│                    Server Layer                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  server/backup/                                      │  │
│  │  ├── controllers/                                    │  │
│  │  │   ├── backupController.ts                         │  │
│  │  │   └── scheduleController.ts                       │  │
│  │  ├── services/                                       │  │
│  │  │   ├── backupService.ts                            │  │
│  │  │   ├── restoreService.ts                           │  │
│  │  │   ├── storageService.ts                           │  │
│  │  │   ├── scheduleService.ts                          │  │
│  │  │   └── retentionService.ts                         │  │
│  │  ├── models/                                         │  │
│  │  │   ├── types.ts                                    │  │
│  │  │   └── validation.ts                               │  │
│  │  └── utils/                                          │  │
│  │      ├── compression.ts                              │  │
│  │      └── format.ts                                   │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│                   Data Layer                                │
│  ┌────────────────────┐  ┌──────────────────────────────┐  │
│  │  PostgreSQL        │  │  Supabase Storage            │  │
│  │  - backups table   │  │  - backup files (compressed) │  │
│  │  - schedules table │  │                              │  │
│  │  - audit_logs      │  │                              │  │
│  └────────────────────┘  └──────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

**Backup Creation Flow:**
1. User clicks "Create Backup" → Opens dialog
2. User selects options (full/selective, tables) → Submits form
3. Frontend calls `createBackup()` API function
4. API route validates user role and organization
5. Controller creates backup job record (status: "pending")
6. Service exports selected tables to JSON
7. Service compresses JSON data
8. Service uploads to Supabase Storage
9. Service updates job record (status: "completed", file path, size)
10. Service logs operation in audit_logs
11. Frontend receives success response and refreshes list

**Restore Flow:**
1. User clicks "Restore" → Opens confirmation dialog
2. User types confirmation phrase → Clicks confirm
3. Frontend calls `restoreBackup()` API function
4. API route validates user role and organization
5. Controller creates restore job record (status: "in_progress")
6. Service downloads backup file from Storage
7. Service decompresses file
8. Service begins database transaction
9. Service truncates target tables
10. Service inserts backup data
11. Service commits transaction (or rolls back on error)
12. Service updates job record (status: "completed" or "failed")
13. Service logs operation in audit_logs
14. Frontend receives response and shows notification

## Components and Interfaces

### Frontend Components

#### BackupPageClient.tsx
Main page component that orchestrates the backup management UI.

**Props:**
```typescript
interface BackupPageClientProps {
  initialBackups: Backup[];
  userRole: UserRole;
}
```

**State:**
- `backups: Backup[]` - List of backups
- `filters: BackupFilters` - Active filters (date range, type, status)
- `isCreateDialogOpen: boolean` - Create dialog visibility
- `isRestoreDialogOpen: boolean` - Restore dialog visibility
- `selectedBackup: Backup | null` - Backup selected for restore/delete
- `isLoading: boolean` - Loading state for operations

**Key Methods:**
- `handleCreateBackup(options: CreateBackupOptions)` - Initiates backup creation
- `handleRestoreBackup(backupId: string)` - Initiates restore operation
- `handleDeleteBackup(backupId: string)` - Deletes a backup
- `handleDownloadBackup(backupId: string)` - Downloads backup file
- `handleFilterChange(filters: BackupFilters)` - Updates filters and refetches
- `refreshBackups()` - Refetches backup list

#### CreateBackupDialog.tsx
Dialog for creating new backups.

**Props:**
```typescript
interface CreateBackupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (options: CreateBackupOptions) => Promise<void>;
  availableTables: TableInfo[];
}
```

**State:**
- `backupType: 'full' | 'selective'` - Selected backup type
- `selectedTables: string[]` - Tables selected for selective backup
- `isSubmitting: boolean` - Form submission state

#### RestoreConfirmDialog.tsx
Confirmation dialog for restore operations.

**Props:**
```typescript
interface RestoreConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  backup: Backup;
  onConfirm: () => Promise<void>;
}
```

**State:**
- `confirmationText: string` - User-typed confirmation phrase
- `isRestoring: boolean` - Restore operation state

#### BackupTable.tsx
Data table component for displaying backups.

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

### API Client Functions

Located in `src/features/backup/api.ts`:

```typescript
// List backups with optional filters
export async function listBackups(
  filters?: BackupFilters
): Promise<Backup[]>

// Create a new backup
export async function createBackup(
  options: CreateBackupOptions
): Promise<Backup>

// Get backup details
export async function getBackup(backupId: string): Promise<Backup>

// Delete a backup
export async function deleteBackup(backupId: string): Promise<void>

// Restore from backup
export async function restoreBackup(backupId: string): Promise<void>

// Download backup file
export async function downloadBackup(backupId: string): Promise<string>

// List backup schedules
export async function listSchedules(): Promise<BackupSchedule[]>

// Create backup schedule
export async function createSchedule(
  schedule: CreateScheduleInput
): Promise<BackupSchedule>

// Update backup schedule
export async function updateSchedule(
  scheduleId: string,
  updates: UpdateScheduleInput
): Promise<BackupSchedule>

// Delete backup schedule
export async function deleteSchedule(scheduleId: string): Promise<void>

// Get available tables for backup
export async function getAvailableTables(): Promise<TableInfo[]>
```

### Server Services

#### BackupService
Handles backup creation and validation.

```typescript
class BackupService {
  // Create a new backup
  async createBackup(
    organizationId: string,
    userId: string,
    options: CreateBackupOptions
  ): Promise<Backup>

  // Export tables to JSON
  async exportTables(
    organizationId: string,
    tables: string[]
  ): Promise<BackupData>

  // Validate backup integrity
  async validateBackup(backupId: string): Promise<boolean>

  // Get backup metadata
  async getBackupMetadata(backupId: string): Promise<BackupMetadata>

  // List backups for organization
  async listBackups(
    organizationId: string,
    filters?: BackupFilters
  ): Promise<Backup[]>
}
```

#### RestoreService
Handles backup restoration.

```typescript
class RestoreService {
  // Restore from backup
  async restoreBackup(
    backupId: string,
    userId: string
  ): Promise<void>

  // Import data from backup
  async importTables(
    organizationId: string,
    backupData: BackupData
  ): Promise<void>

  // Validate restore compatibility
  async validateRestore(
    backupId: string,
    organizationId: string
  ): Promise<ValidationResult>
}
```

#### StorageService
Handles file operations with Supabase Storage.

```typescript
class StorageService {
  // Upload backup file
  async uploadBackup(
    organizationId: string,
    backupId: string,
    data: Buffer
  ): Promise<string>

  // Download backup file
  async downloadBackup(
    organizationId: string,
    backupId: string
  ): Promise<Buffer>

  // Delete backup file
  async deleteBackup(
    organizationId: string,
    backupId: string
  ): Promise<void>

  // Generate signed download URL
  async getDownloadUrl(
    organizationId: string,
    backupId: string,
    expiresIn: number
  ): Promise<string>

  // Check if file exists
  async fileExists(
    organizationId: string,
    backupId: string
  ): Promise<boolean>
}
```

#### ScheduleService
Handles backup scheduling.

```typescript
class ScheduleService {
  // Create backup schedule
  async createSchedule(
    organizationId: string,
    userId: string,
    schedule: CreateScheduleInput
  ): Promise<BackupSchedule>

  // Update schedule
  async updateSchedule(
    scheduleId: string,
    updates: UpdateScheduleInput
  ): Promise<BackupSchedule>

  // Delete schedule
  async deleteSchedule(scheduleId: string): Promise<void>

  // Get due schedules
  async getDueSchedules(): Promise<BackupSchedule[]>

  // Execute scheduled backup
  async executeSchedule(schedule: BackupSchedule): Promise<void>

  // List schedules for organization
  async listSchedules(organizationId: string): Promise<BackupSchedule[]>
}
```

#### RetentionService
Handles automatic backup deletion based on retention policies.

```typescript
class RetentionService {
  // Apply retention policy
  async applyRetentionPolicy(
    organizationId: string
  ): Promise<number>

  // Get expired backups
  async getExpiredBackups(
    organizationId: string,
    retentionDays: number
  ): Promise<Backup[]>

  // Delete expired backups
  async deleteExpiredBackups(
    backups: Backup[]
  ): Promise<number>
}
```

## Data Models

### Database Tables

#### backups
Stores backup metadata and status.

```sql
CREATE TABLE backups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  backup_type VARCHAR(20) NOT NULL CHECK (backup_type IN ('full', 'selective')),
  status VARCHAR(20) NOT NULL CHECK (status IN ('pending', 'in_progress', 'completed', 'failed', 'deleted', 'corrupted')),
  file_path TEXT,
  file_size BIGINT,
  compressed_size BIGINT,
  tables_included TEXT[], -- Array of table names
  metadata JSONB, -- Additional metadata (format version, etc.)
  error_message TEXT,
  validated_at TIMESTAMP WITH TIME ZONE,
  CONSTRAINT fk_organization FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
  CONSTRAINT fk_user FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_backups_organization ON backups(organization_id);
CREATE INDEX idx_backups_created_at ON backups(created_at DESC);
CREATE INDEX idx_backups_status ON backups(status);
```

#### backup_schedules
Stores backup schedule configurations.

```sql
CREATE TABLE backup_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  name VARCHAR(255) NOT NULL,
  frequency VARCHAR(20) NOT NULL CHECK (frequency IN ('daily', 'weekly', 'monthly')),
  backup_type VARCHAR(20) NOT NULL CHECK (backup_type IN ('full', 'selective')),
  tables_included TEXT[],
  enabled BOOLEAN DEFAULT true,
  last_run_at TIMESTAMP WITH TIME ZONE,
  next_run_at TIMESTAMP WITH TIME ZONE,
  retention_days INTEGER DEFAULT 30,
  CONSTRAINT fk_organization FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
  CONSTRAINT fk_user FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_schedules_organization ON backup_schedules(organization_id);
CREATE INDEX idx_schedules_next_run ON backup_schedules(next_run_at) WHERE enabled = true;
```

#### restore_jobs
Tracks restore operations.

```sql
CREATE TABLE restore_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  backup_id UUID NOT NULL REFERENCES backups(id),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  initiated_by UUID NOT NULL REFERENCES users(id),
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  status VARCHAR(20) NOT NULL CHECK (status IN ('in_progress', 'completed', 'failed')),
  tables_restored TEXT[],
  error_message TEXT,
  CONSTRAINT fk_backup FOREIGN KEY (backup_id) REFERENCES backups(id) ON DELETE CASCADE,
  CONSTRAINT fk_organization FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
  CONSTRAINT fk_user FOREIGN KEY (initiated_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_restore_jobs_backup ON restore_jobs(backup_id);
CREATE INDEX idx_restore_jobs_organization ON restore_jobs(organization_id);
```

### TypeScript Types

```typescript
// Backup record
export interface Backup {
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
  creatorName?: string; // Joined from users table
}

// Backup metadata
export interface BackupMetadata {
  formatVersion: string;
  databaseVersion: string;
  timestamp: string;
  tableSchemas: Record<string, TableSchema>;
}

// Table schema
export interface TableSchema {
  name: string;
  columns: ColumnDefinition[];
  rowCount: number;
}

// Column definition
export interface ColumnDefinition {
  name: string;
  type: string;
  nullable: boolean;
  defaultValue: string | null;
}

// Backup data structure
export interface BackupData {
  metadata: BackupMetadata;
  tables: Record<string, TableData>;
}

// Table data
export interface TableData {
  schema: TableSchema;
  rows: Record<string, any>[];
}

// Create backup options
export interface CreateBackupOptions {
  backupType: 'full' | 'selective';
  tables?: string[]; // Required for selective backups
}

// Backup filters
export interface BackupFilters {
  startDate?: string;
  endDate?: string;
  backupType?: 'full' | 'selective';
  status?: Backup['status'];
}

// Backup schedule
export interface BackupSchedule {
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

// Create schedule input
export interface CreateScheduleInput {
  name: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  backupType: 'full' | 'selective';
  tables?: string[];
  retentionDays?: number;
}

// Update schedule input
export interface UpdateScheduleInput {
  name?: string;
  frequency?: 'daily' | 'weekly' | 'monthly';
  backupType?: 'full' | 'selective';
  tables?: string[];
  enabled?: boolean;
  retentionDays?: number;
}

// Table info
export interface TableInfo {
  name: string;
  displayName: string;
  module: string;
  rowCount: number;
}

// Restore job
export interface RestoreJob {
  id: string;
  backupId: string;
  organizationId: string;
  initiatedBy: string;
  startedAt: string;
  completedAt: string | null;
  status: 'in_progress' | 'completed' | 'failed';
  tablesRestored: string[];
  errorMessage: string | null;
}

// Validation result
export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

// User role
export type UserRole = 'superadmin' | 'admin' | 'user';
```

### Validation Schemas

Using Zod for runtime validation:

```typescript
import { z } from 'zod';

export const createBackupSchema = z.object({
  backupType: z.enum(['full', 'selective']),
  tables: z.array(z.string()).optional(),
}).refine(
  (data) => data.backupType === 'full' || (data.tables && data.tables.length > 0),
  {
    message: 'Selective backups must include at least one table',
    path: ['tables'],
  }
);

export const backupFiltersSchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  backupType: z.enum(['full', 'selective']).optional(),
  status: z.enum(['pending', 'in_progress', 'completed', 'failed', 'deleted', 'corrupted']).optional(),
});

export const createScheduleSchema = z.object({
  name: z.string().min(1).max(255),
  frequency: z.enum(['daily', 'weekly', 'monthly']),
  backupType: z.enum(['full', 'selective']),
  tables: z.array(z.string()).optional(),
  retentionDays: z.number().int().min(1).max(365).default(30),
}).refine(
  (data) => data.backupType === 'full' || (data.tables && data.tables.length > 0),
  {
    message: 'Selective backups must include at least one table',
    path: ['tables'],
  }
);

export const updateScheduleSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  frequency: z.enum(['daily', 'weekly', 'monthly']).optional(),
  backupType: z.enum(['full', 'selective']).optional(),
  tables: z.array(z.string()).optional(),
  enabled: z.boolean().optional(),
  retentionDays: z.number().int().min(1).max(365).optional(),
});
```


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Role-Based Access Control

*For any* backup operation (create, restore, delete, download), only users with admin or superadmin roles should be authorized to perform the operation, while users with user role should receive an authorization error.

**Validates: Requirements 1.1, 4.1, 5.1, 6.1, 9.1, 9.2, 9.3, 9.4, 9.5**

### Property 2: Multi-Tenant Data Isolation

*For any* user and any backup operation (list, view, download, restore, delete), the system should only return or allow access to backups belonging to the user's organization, preventing cross-organization data access.

**Validates: Requirements 3.1, 9.7**

### Property 3: Full Backup Completeness

*For any* organization, when creating a full backup, the backup data should include all tables belonging to that organization.

**Validates: Requirements 1.2**

### Property 4: Selective Backup Accuracy

*For any* set of selected tables, when creating a selective backup, the backup data should contain exactly those tables and no others.

**Validates: Requirements 1.3**

### Property 5: Backup Metadata Completeness

*For any* created backup, the backup record should contain all required metadata fields: timestamp, user ID, organization ID, backup type, table list, format version, and table schemas.

**Validates: Requirements 1.7, 3.2, 15.2, 15.5**

### Property 6: Compression Effectiveness

*For any* backup data, the compressed file size should be less than the original uncompressed data size.

**Validates: Requirements 1.8**

### Property 7: Backup Status State Machine

*For any* backup job, the status transitions should follow valid paths:
- Initial state: "pending"
- Success path: "pending" → "in_progress" → "completed"
- Failure path: "pending" → "in_progress" → "failed"
- Deletion: any state → "deleted"
- Corruption: "completed" → "corrupted"

Invalid transitions (e.g., "pending" → "completed" without "in_progress") should not occur.

**Validates: Requirements 1.4, 1.5, 1.6, 6.3**

### Property 8: Backup Failure Error Logging

*For any* failed backup operation, the backup record should have status "failed" and contain a non-empty error message describing the failure.

**Validates: Requirements 1.6**

### Property 9: Schedule Configuration Validation

*For any* backup schedule, the frequency should be one of the valid values (daily, weekly, monthly), and selective schedules should include at least one table.

**Validates: Requirements 2.1, 12.4**

### Property 10: Schedule Execution Fidelity

*For any* executed backup schedule, the created backup should match the schedule's configuration (backup type, selected tables, retention period).

**Validates: Requirements 2.3**

### Property 11: Disabled Schedule Exclusion

*For any* disabled backup schedule, it should not appear in the list of due schedules when checking for schedules to execute.

**Validates: Requirements 2.5**

### Property 12: Scheduled Backup History

*For any* executed backup schedule, a corresponding backup record should exist in the backup history with the correct organization and configuration.

**Validates: Requirements 2.4**

### Property 13: Multiple Schedules Support

*For any* organization, the system should support creating and maintaining multiple active backup schedules simultaneously without conflicts.

**Validates: Requirements 2.6**

### Property 14: Date Range Filtering

*For any* date range filter (start date, end date), all returned backups should have creation timestamps within the specified range (inclusive).

**Validates: Requirements 3.3**

### Property 15: Type and Status Filtering

*For any* combination of type filter and status filter, all returned backups should match both the specified type and status.

**Validates: Requirements 3.4, 3.5**

### Property 16: Default Sort Order

*For any* unfiltered backup list, the backups should be sorted by creation date in descending order (newest first).

**Validates: Requirements 3.6**

### Property 17: Human-Readable Size Formatting

*For any* file size in bytes, the formatted output should use appropriate units (KB, MB, GB, TB) and be human-readable (e.g., "1.5 MB" instead of "1572864 bytes").

**Validates: Requirements 3.7**

### Property 18: Download URL Generation

*For any* existing backup file, requesting a download should generate a valid signed URL with an expiration time.

**Validates: Requirements 4.3**

### Property 19: Missing File Error Handling

*For any* backup download or restore request where the file does not exist in storage, the system should return an error indicating the file is missing.

**Validates: Requirements 4.4**

### Property 20: Restore Status State Machine

*For any* restore job, the status transitions should follow valid paths:
- Initial state: "in_progress"
- Success path: "in_progress" → "completed"
- Failure path: "in_progress" → "failed"

**Validates: Requirements 5.6, 5.7, 5.8**

### Property 21: Full Restore Completeness

*For any* full backup restoration, all tables included in the backup should be restored to the organization's database.

**Validates: Requirements 5.4**

### Property 22: Selective Restore Accuracy

*For any* selective backup restoration, only the tables included in the backup should be restored, leaving other tables unchanged.

**Validates: Requirements 5.5**

### Property 23: Restore Transaction Rollback

*For any* failed restore operation, the database should be rolled back to its state before the restore began, and the restore job status should be "failed" with an error message.

**Validates: Requirements 5.8**

### Property 24: Backup Deletion Status Update

*For any* successful backup deletion, the backup record status should be updated to "deleted" and the file should be removed from storage.

**Validates: Requirements 6.2, 6.3**

### Property 25: Deletion Failure Preservation

*For any* failed backup deletion, the backup record should remain unchanged with its original status and data.

**Validates: Requirements 6.4**

### Property 26: Retention Policy Identification

*For any* retention period in days, the system should correctly identify all backups older than that period (creation date < current date - retention days).

**Validates: Requirements 7.2**

### Property 27: Automatic Retention Deletion

*For any* set of expired backups identified by the retention policy, all should be deleted automatically and their statuses updated to "deleted".

**Validates: Requirements 7.3**

### Property 28: Differential Retention Periods

*For any* organization, the system should support different retention periods for full backups and selective backups, applying the correct period to each backup type.

**Validates: Requirements 7.6**

### Property 29: Backup Validation Integrity

*For any* backup file, validation should verify that the file exists, is not corrupted (can be decompressed and parsed), and the metadata matches the file contents.

**Validates: Requirements 8.1, 8.2, 8.3**

### Property 30: Validation Success Timestamp

*For any* successful backup validation, the backup record should be updated with a validation timestamp (validated_at field).

**Validates: Requirements 8.4**

### Property 31: Validation Failure Corruption Marking

*For any* failed backup validation, the backup record status should be updated to "corrupted".

**Validates: Requirements 8.5**

### Property 32: Automatic Post-Creation Validation

*For any* newly created backup, the system should automatically run validation after the backup completes successfully.

**Validates: Requirements 8.6**

### Property 33: Read Access for All Users

*For any* authenticated user, they should be able to view the backup history for their organization regardless of their role (superadmin, admin, or user).

**Validates: Requirements 9.6**

### Property 34: Comprehensive Audit Logging

*For any* backup operation (create, restore, delete, download, schedule create/modify), an audit log entry should be created containing the user ID, timestamp, organization ID, operation type, and relevant details (backup ID, affected tables, etc.).

**Validates: Requirements 4.5, 5.9, 6.5, 7.5, 10.1, 10.2, 10.3, 10.4, 10.5, 10.7**

### Property 35: JSON Data Format

*For any* backup file, the data should be serialized in valid JSON format that can be parsed without errors.

**Validates: Requirements 15.1**

### Property 36: Data Type Preservation (Round-Trip)

*For any* valid database state, creating a backup and then restoring from that backup should produce an equivalent database state with all data types and relationships preserved.

**Validates: Requirements 15.3**

### Property 37: Gzip Compression Format

*For any* backup file stored in Supabase Storage, the file should be compressed using gzip format and be decompressible using standard gzip tools.

**Validates: Requirements 15.4**

### Property 38: Format Version Compatibility

*For any* restore operation, the system should validate that the backup's format version is compatible with the current system version, rejecting incompatible backups with a clear error message.

**Validates: Requirements 15.6**

