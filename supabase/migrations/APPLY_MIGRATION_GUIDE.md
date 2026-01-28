# Migration Application Guide

This guide explains how to apply database migrations to your Supabase project.

## Prerequisites

- Supabase CLI installed (see installation instructions below)
- Access to your Supabase project
- Project linked to local environment

## Installing Supabase CLI

### Windows (using npm)
```bash
npm install -g supabase
```

### Windows (using Scoop)
```bash
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

### macOS/Linux
```bash
brew install supabase/tap/supabase
```

## Linking Your Project

If you haven't linked your local project to Supabase yet:

```bash
# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref zzdybdbppicydbtmjdae
```

## Applying Migrations

### Option 1: Apply All Pending Migrations (Recommended)

This will apply all migrations that haven't been applied yet:

```bash
supabase db push
```

### Option 2: Apply Specific Migration

To apply only the backup module migration:

```bash
supabase migration up --db-url "postgresql://postgres:[YOUR-PASSWORD]@db.zzdybdbppicydbtmjdae.supabase.co:5432/postgres"
```

### Option 3: Manual Application via Supabase Dashboard

1. Go to https://supabase.com/dashboard/project/zzdybdbppicydbtmjdae
2. Navigate to SQL Editor
3. Open the migration file: `supabase/migrations/0013_backup_module.sql`
4. Copy the entire SQL content
5. Paste into the SQL Editor
6. Click "Run" to execute

## Verifying Migration

After applying the migration, verify it was successful:

```bash
# Run the verification script
npx tsx scripts/verify-backup-migration.ts
```

Expected output:
```
🔍 Verifying backup module migration...

Checking backups table...
✅ backups table exists
Checking backup_schedules table...
✅ backup_schedules table exists
Checking restore_jobs table...
✅ restore_jobs table exists

Checking RLS policies...
✅ RLS is enabled (anonymous access blocked)

==================================================
✅ All migration checks passed!
The backup module tables are ready to use.
==================================================
```

## Troubleshooting

### "supabase: command not found"
- Make sure Supabase CLI is installed (see installation instructions above)
- Restart your terminal after installation

### "Project not linked"
- Run `supabase link --project-ref zzdybdbppicydbtmjdae`
- Make sure you're logged in with `supabase login`

### "Permission denied"
- Make sure you have admin access to the Supabase project
- Check that your authentication token is valid

### Migration Already Applied
If you see "migration already applied" errors, the migration has already been run. You can verify this by:
1. Running the verification script
2. Checking the Supabase dashboard under Database > Migrations

## Migration Contents

The backup module migration (0013_backup_module.sql) creates:

### Tables
- `backups` - Stores backup metadata and status
- `backup_schedules` - Stores backup schedule configurations
- `restore_jobs` - Tracks restore operations

### Indexes
- Performance indexes on organization_id, created_at, status, etc.
- Conditional indexes for enabled schedules

### RLS Policies
- Read access for all authenticated users
- Write access restricted to admin and superadmin roles
- Multi-tenant isolation (when organization_id is implemented)

### Functions
- `calculate_next_run()` - Calculates next scheduled backup time
- `set_schedule_next_run()` - Trigger function for automatic scheduling

### Triggers
- `backup_schedules_set_updated_at` - Updates timestamp on schedule changes
- `backup_schedules_set_next_run` - Automatically calculates next run time

## Next Steps

After successfully applying the migration:

1. ✅ Verify tables exist using the verification script
2. ✅ Test backup creation via the UI
3. ✅ Test backup restoration
4. ✅ Configure backup schedules
5. ✅ Set up cron jobs for automatic backups (see `src/app/api/backup/cron/README.md`)
