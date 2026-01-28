alter table public.report_jobs
add column if not exists category_id bigint;

alter table public.report_schedules
add column if not exists category_id bigint;

alter table public.report_schedules
add column if not exists period_window text not null default 'last30d'
check (period_window in ('last7d','last30d','monthToDate','yearToDate'));

alter table public.report_schedules
add column if not exists use_cache boolean not null default true;

create index if not exists idx_report_jobs_category_id on public.report_jobs(category_id);
create index if not exists idx_report_schedules_category_id on public.report_schedules(category_id);

