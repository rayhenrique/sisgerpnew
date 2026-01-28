revoke all privileges on table public.report_schedules from anon;
revoke all privileges on table public.report_jobs from anon;
revoke all privileges on table public.report_cache from anon;

grant select, insert, update, delete on table public.report_schedules to authenticated;
grant select, insert, update, delete on table public.report_jobs to authenticated;

