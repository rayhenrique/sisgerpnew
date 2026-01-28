drop policy if exists audit_logs_select_auth on public.audit_logs;
create policy audit_logs_select_admin on public.audit_logs
for select to authenticated
using (
  exists(
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.active = true
      and p.role in ('admin', 'superadmin')
  )
);

