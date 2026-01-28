create table if not exists public.report_schedules (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  name text not null,
  report_key text not null,
  category text not null,
  format text not null check (format in ('PDF','XLSX','CSV')),
  cron text not null,
  is_paused boolean not null default false,
  next_run_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_report_schedules_user_id on public.report_schedules(user_id);
create index if not exists idx_report_schedules_next_run on public.report_schedules(next_run_at);

drop trigger if exists report_schedules_set_updated_at on public.report_schedules;
create trigger report_schedules_set_updated_at
before update on public.report_schedules
for each row
execute function public.set_updated_at();

create table if not exists public.report_jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  schedule_id uuid,
  report_key text not null,
  category text not null,
  period_start date not null,
  period_end date not null,
  format text not null check (format in ('PDF','XLSX','CSV')),
  status text not null check (status in ('QUEUED','RUNNING','READY','FAILED')),
  cache_key text,
  storage_path text,
  error_message text,
  queued_at timestamptz not null default now(),
  started_at timestamptz,
  finished_at timestamptz
);

create index if not exists idx_report_jobs_user_id on public.report_jobs(user_id);
create index if not exists idx_report_jobs_status on public.report_jobs(status);
create index if not exists idx_report_jobs_period on public.report_jobs(period_start, period_end);
create index if not exists idx_report_jobs_cache_key on public.report_jobs(cache_key);

create table if not exists public.report_cache (
  id uuid primary key default gen_random_uuid(),
  cache_key text unique not null,
  storage_path text not null,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_report_cache_expires_at on public.report_cache(expires_at);

alter table public.report_schedules enable row level security;
alter table public.report_jobs enable row level security;
alter table public.report_cache enable row level security;

drop policy if exists report_schedules_select_owner on public.report_schedules;
create policy report_schedules_select_owner on public.report_schedules
for select to authenticated
using (user_id = auth.uid());

drop policy if exists report_schedules_insert_owner on public.report_schedules;
create policy report_schedules_insert_owner on public.report_schedules
for insert to authenticated
with check (user_id = auth.uid());

drop policy if exists report_schedules_update_owner on public.report_schedules;
create policy report_schedules_update_owner on public.report_schedules
for update to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists report_schedules_delete_owner on public.report_schedules;
create policy report_schedules_delete_owner on public.report_schedules
for delete to authenticated
using (user_id = auth.uid());

drop policy if exists report_jobs_select_owner on public.report_jobs;
create policy report_jobs_select_owner on public.report_jobs
for select to authenticated
using (user_id = auth.uid());

drop policy if exists report_jobs_insert_owner on public.report_jobs;
create policy report_jobs_insert_owner on public.report_jobs
for insert to authenticated
with check (user_id = auth.uid());

drop policy if exists report_jobs_update_owner on public.report_jobs;
create policy report_jobs_update_owner on public.report_jobs
for update to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists report_jobs_delete_owner on public.report_jobs;
create policy report_jobs_delete_owner on public.report_jobs
for delete to authenticated
using (user_id = auth.uid());

drop policy if exists report_cache_no_access on public.report_cache;
create policy report_cache_no_access on public.report_cache
for all to authenticated
using (false)
with check (false);

grant select, insert, update, delete on public.report_schedules to authenticated;
grant select, insert, update, delete on public.report_jobs to authenticated;
grant select on public.report_schedules to anon;
grant select on public.report_jobs to anon;

