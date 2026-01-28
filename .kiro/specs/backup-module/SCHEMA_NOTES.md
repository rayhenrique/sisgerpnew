# Backup Module Database Schema Notes

## Migration File
`supabase/migrations/0013_backup_module.sql`

## Schema Overview

The backup module creates three main tables:
1. **backups** - Stores backup metadata and status
2. **backup_schedules** - Stores backup schedule configurations
3. **restore_jobs** - Tracks restore operations

## Key Design Decisions

### 1. Organization ID Adaptation
**Issue**: The design document references `organizations` table with foreign key constraints, but the current SISGERP database does not have an organizations table (single-tenant system).

**Solution**: 
- Added `organization_id uuid` column to all three tables WITHOUT foreign key constraint
- Column is nullable and reserved for future multi-tenant support
- Indexes are still created for performance when multi-tenant is implemented
- RLS policies currently allow all authenticated users to see all backups (single-tenant behavior)

**Future Migration Path**:
When organizations table is added:
```sql
-- Add organizations table
CREATE TABLE organizations (...);

-- Add foreign key constraints
ALTER TABLE backups 
  ADD CONSTRAINT fk_organization 
  FOREIGN KEY (organization_id) 
  REFERENCES organizations(id) 
  ON DELETE CASCADE;

-- Update RLS policies to filter by organization_id
CREATE POLICY backups_select_org ON backups
  FOR SELECT TO authenticated
  USING (organization_id = (SELECT organization_id FROM profiles WHERE id = auth.uid()));
```

### 2. User References
- Uses `auth.users(id)` for user references (Supabase Auth)
- Uses `public.profiles` table for role checking in RLS policies
- Supports roles: 'operator', 'admin', 'superadmin'
- Only 'admin' and 'superadmin' can perform backup operations

### 3. Row Level Security (RLS)
All tables have RLS enabled with the following policies:

**backups table**:
- SELECT: All authenticated users (for viewing backup history)
- INSERT/UPDATE/DELETE: Only admin and superadmin roles

**backup_schedules table**:
- SELECT: All authenticated users (for viewing schedules)
- INSERT/UPDATE/DELETE: Only admin and superadmin roles

**restore_jobs table**:
- SELECT: All authenticated users (for viewing restore history)
- INSERT/UPDATE/DELETE: Only admin and superadmin roles

### 4. Indexes for Performance
Created indexes on:
- Foreign key columns (created_by, backup_id, initiated_by)
- Filter columns (status, backup_type, enabled)
- Sort columns (created_at DESC, started_at DESC)
- Conditional index on next_run_at WHERE enabled = true

### 5. Automatic Triggers

**backup_schedules_set_updated_at**:
- Updates `updated_at` timestamp on schedule modifications
- Uses existing `public.set_updated_at()` function

**backup_schedules_set_next_run**:
- Automatically calculates `next_run_at` based on frequency
- Triggers on INSERT or UPDATE
- Sets next_run_at to NULL when schedule is disabled
- Uses `calculate_next_run()` helper function

### 6. Helper Functions

**calculate_next_run(frequency, last_run)**:
- Calculates next scheduled run time
- Supports: daily (+1 day), weekly (+7 days), monthly (+1 month)
- Uses last_run_at or current time as base

**set_schedule_next_run()**:
- Trigger function to automatically set next_run_at
- Only recalculates when enabled or frequency/last_run changes

## Schema Validation

### Requirements Coverage

✅ **Requirement 1.4**: Backup job status tracking (pending, in_progress, completed, failed)
✅ **Requirement 1.7**: Backup metadata storage (JSONB field)
✅ **Requirement 2.1**: Schedule frequency validation (CHECK constraint)
✅ **Requirement 5.6**: Restore job status tracking
✅ **Requirement 9.7**: Multi-tenant isolation (prepared with organization_id)

### Constraints

**backups table**:
- `backup_type` must be 'full' or 'selective'
- `status` must be one of: pending, in_progress, completed, failed, deleted, corrupted

**backup_schedules table**:
- `frequency` must be 'daily', 'weekly', or 'monthly'
- `backup_type` must be 'full' or 'selective'
- `retention_days` must be between 1 and 365

**restore_jobs table**:
- `status` must be 'in_progress', 'completed', or 'failed'

## Data Types

- **UUID**: Used for all IDs (primary keys and foreign keys)
- **TIMESTAMPTZ**: All timestamps include timezone
- **TEXT[]**: Arrays for storing table names
- **JSONB**: Flexible metadata storage
- **BIGINT**: File sizes in bytes
- **VARCHAR**: Limited-length strings with constraints
- **BOOLEAN**: Flags (enabled, active)

## Testing Recommendations

1. **RLS Policy Testing**: Verify that operators cannot create/modify backups
2. **Trigger Testing**: Verify next_run_at is calculated correctly
3. **Constraint Testing**: Verify invalid values are rejected
4. **Cascade Testing**: Verify restore_jobs are deleted when backup is deleted
5. **Index Performance**: Verify queries use indexes efficiently

## Migration Rollback

To rollback this migration:
```sql
DROP TRIGGER IF EXISTS backup_schedules_set_next_run ON public.backup_schedules;
DROP TRIGGER IF EXISTS backup_schedules_set_updated_at ON public.backup_schedules;
DROP FUNCTION IF EXISTS public.set_schedule_next_run();
DROP FUNCTION IF EXISTS public.calculate_next_run(varchar, timestamptz);
DROP TABLE IF EXISTS public.restore_jobs CASCADE;
DROP TABLE IF EXISTS public.backup_schedules CASCADE;
DROP TABLE IF EXISTS public.backups CASCADE;
```

## Next Steps

After this migration is applied:
1. Create TypeScript types matching the schema
2. Implement server-side services (BackupService, RestoreService, etc.)
3. Create API routes for backup operations
4. Build frontend components for backup management
5. Add unit tests for database operations
6. Add property-based tests for correctness properties
