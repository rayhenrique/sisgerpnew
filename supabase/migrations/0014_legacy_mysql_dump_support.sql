create table if not exists public.legacy_users (
  id bigint primary key,
  name text not null,
  email text not null,
  email_verified_at timestamptz,
  password_hash text,
  role text not null default 'operator' check (role in ('admin', 'operator', 'superadmin')),
  active boolean not null default true,
  created_at timestamptz,
  updated_at timestamptz
);

create unique index if not exists legacy_users_email_ci_unique
on public.legacy_users (lower(email));

alter table public.legacy_users enable row level security;

drop policy if exists legacy_users_select_admin on public.legacy_users;
create policy legacy_users_select_admin on public.legacy_users
for select to authenticated
using (
  exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.active = true
      and p.role in ('admin', 'superadmin')
  )
);

alter table public.audit_logs
add column if not exists legacy_id bigint,
add column if not exists legacy_user_id bigint;

create unique index if not exists audit_logs_legacy_id_unique
on public.audit_logs (legacy_id)
where legacy_id is not null;

create index if not exists audit_logs_legacy_user_id_idx
on public.audit_logs (legacy_user_id);

alter table public.audit_logs
drop constraint if exists audit_logs_legacy_user_id_fk;

alter table public.audit_logs
add constraint audit_logs_legacy_user_id_fk
foreign key (legacy_user_id) references public.legacy_users(id) on delete set null;
