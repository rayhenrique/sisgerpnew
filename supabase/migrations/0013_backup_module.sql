-- Backup Module Migration
-- Creates tables for backups, backup_schedules, and restore_jobs
-- Supports backup and restore operations with audit logging

-- Create backups table
create table if not exists public.backups (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid, -- Reserved for future multi-tenant support
  created_by uuid not null references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  backup_type varchar(20) not null check (backup_type in ('full', 'selective')),
  status varchar(20) not null default 'pending' check (status in ('pending', 'in_progress', 'completed', 'failed', 'deleted', 'corrupted')),
  file_path text,
  file_size bigint,
  compressed_size bigint,
  tables_included text[], -- Array of table names
  metadata jsonb, -- Additional metadata (format version, table schemas, etc.)
  error_message text,
  validated_at timestamptz
);

-- Create indexes for backups table
create index if not exists idx_backups_organization on public.backups(organization_id);
create index if not exists idx_backups_created_by on public.backups(created_by);
create index if not exists idx_backups_created_at on public.backups(created_at desc);
create index if not exists idx_backups_status on public.backups(status);
create index if not exists idx_backups_backup_type on public.backups(backup_type);

-- Create backup_schedules table
create table if not exists public.backup_schedules (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid, -- Reserved for future multi-tenant support
  created_by uuid not null references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  name varchar(255) not null,
  frequency varchar(20) not null check (frequency in ('daily', 'weekly', 'monthly')),
  backup_type varchar(20) not null check (backup_type in ('full', 'selective')),
  tables_included text[],
  enabled boolean not null default true,
  last_run_at timestamptz,
  next_run_at timestamptz,
  retention_days integer not null default 30 check (retention_days >= 1 and retention_days <= 365)
);

-- Create indexes for backup_schedules table
create index if not exists idx_schedules_organization on public.backup_schedules(organization_id);
create index if not exists idx_schedules_created_by on public.backup_schedules(created_by);
create index if not exists idx_schedules_next_run on public.backup_schedules(next_run_at) where enabled = true;
create index if not exists idx_schedules_enabled on public.backup_schedules(enabled);

-- Create restore_jobs table
create table if not exists public.restore_jobs (
  id uuid primary key default gen_random_uuid(),
  backup_id uuid not null references public.backups(id) on delete cascade,
  organization_id uuid, -- Reserved for future multi-tenant support
  initiated_by uuid not null references auth.users(id) on delete set null,
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  status varchar(20) not null default 'in_progress' check (status in ('in_progress', 'completed', 'failed')),
  tables_restored text[],
  error_message text
);

-- Create indexes for restore_jobs table
create index if not exists idx_restore_jobs_backup on public.restore_jobs(backup_id);
create index if not exists idx_restore_jobs_organization on public.restore_jobs(organization_id);
create index if not exists idx_restore_jobs_initiated_by on public.restore_jobs(initiated_by);
create index if not exists idx_restore_jobs_started_at on public.restore_jobs(started_at desc);
create index if not exists idx_restore_jobs_status on public.restore_jobs(status);

-- Add trigger for updated_at on backup_schedules
drop trigger if exists backup_schedules_set_updated_at on public.backup_schedules;
create trigger backup_schedules_set_updated_at
before update on public.backup_schedules
for each row
execute function public.set_updated_at();

-- Enable Row Level Security
alter table public.backups enable row level security;
alter table public.backup_schedules enable row level security;
alter table public.restore_jobs enable row level security;

-- RLS Policies for backups table
-- All authenticated users can view backups
drop policy if exists backups_select_auth on public.backups;
create policy backups_select_auth on public.backups
for select to authenticated
using (true);

-- Only admin and superadmin can create backups
drop policy if exists backups_insert_admin on public.backups;
create policy backups_insert_admin on public.backups
for insert to authenticated
with check (
  exists(
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.active = true
      and p.role in ('admin', 'superadmin')
  )
);

-- Only admin and superadmin can update backups
drop policy if exists backups_update_admin on public.backups;
create policy backups_update_admin on public.backups
for update to authenticated
using (
  exists(
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.active = true
      and p.role in ('admin', 'superadmin')
  )
)
with check (
  exists(
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.active = true
      and p.role in ('admin', 'superadmin')
  )
);

-- Only admin and superadmin can delete backups
drop policy if exists backups_delete_admin on public.backups;
create policy backups_delete_admin on public.backups
for delete to authenticated
using (
  exists(
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.active = true
      and p.role in ('admin', 'superadmin')
  )
);

-- RLS Policies for backup_schedules table
-- All authenticated users can view schedules
drop policy if exists schedules_select_auth on public.backup_schedules;
create policy schedules_select_auth on public.backup_schedules
for select to authenticated
using (true);

-- Only admin and superadmin can create schedules
drop policy if exists schedules_insert_admin on public.backup_schedules;
create policy schedules_insert_admin on public.backup_schedules
for insert to authenticated
with check (
  exists(
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.active = true
      and p.role in ('admin', 'superadmin')
  )
);

-- Only admin and superadmin can update schedules
drop policy if exists schedules_update_admin on public.backup_schedules;
create policy schedules_update_admin on public.backup_schedules
for update to authenticated
using (
  exists(
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.active = true
      and p.role in ('admin', 'superadmin')
  )
)
with check (
  exists(
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.active = true
      and p.role in ('admin', 'superadmin')
  )
);

-- Only admin and superadmin can delete schedules
drop policy if exists schedules_delete_admin on public.backup_schedules;
create policy schedules_delete_admin on public.backup_schedules
for delete to authenticated
using (
  exists(
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.active = true
      and p.role in ('admin', 'superadmin')
  )
);

-- RLS Policies for restore_jobs table
-- All authenticated users can view restore jobs
drop policy if exists restore_jobs_select_auth on public.restore_jobs;
create policy restore_jobs_select_auth on public.restore_jobs
for select to authenticated
using (true);

-- Only admin and superadmin can create restore jobs
drop policy if exists restore_jobs_insert_admin on public.restore_jobs;
create policy restore_jobs_insert_admin on public.restore_jobs
for insert to authenticated
with check (
  exists(
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.active = true
      and p.role in ('admin', 'superadmin')
  )
);

-- Only admin and superadmin can update restore jobs
drop policy if exists restore_jobs_update_admin on public.restore_jobs;
create policy restore_jobs_update_admin on public.restore_jobs
for update to authenticated
using (
  exists(
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.active = true
      and p.role in ('admin', 'superadmin')
  )
)
with check (
  exists(
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.active = true
      and p.role in ('admin', 'superadmin')
  )
);

-- Only admin and superadmin can delete restore jobs
drop policy if exists restore_jobs_delete_admin on public.restore_jobs;
create policy restore_jobs_delete_admin on public.restore_jobs
for delete to authenticated
using (
  exists(
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.active = true
      and p.role in ('admin', 'superadmin')
  )
);

-- Create a function to calculate next run time for schedules
create or replace function public.calculate_next_run(
  p_frequency varchar(20),
  p_last_run timestamptz
)
returns timestamptz
language plpgsql
as $$
declare
  v_base_time timestamptz;
begin
  -- Use last run time or current time as base
  v_base_time := coalesce(p_last_run, now());
  
  -- Calculate next run based on frequency
  case p_frequency
    when 'daily' then
      return v_base_time + interval '1 day';
    when 'weekly' then
      return v_base_time + interval '7 days';
    when 'monthly' then
      return v_base_time + interval '1 month';
    else
      return v_base_time + interval '1 day';
  end case;
end;
$$;

-- Create a function to automatically set next_run_at on schedule creation/update
create or replace function public.set_schedule_next_run()
returns trigger
language plpgsql
as $$
begin
  -- Only calculate if enabled and next_run_at is not manually set
  if new.enabled = true and (new.next_run_at is null or old.frequency != new.frequency or old.last_run_at != new.last_run_at) then
    new.next_run_at := public.calculate_next_run(new.frequency, new.last_run_at);
  elsif new.enabled = false then
    new.next_run_at := null;
  end if;
  
  return new;
end;
$$;

-- Add trigger to automatically set next_run_at
drop trigger if exists backup_schedules_set_next_run on public.backup_schedules;
create trigger backup_schedules_set_next_run
before insert or update on public.backup_schedules
for each row
execute function public.set_schedule_next_run();
