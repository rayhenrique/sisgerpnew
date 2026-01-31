select 'categories' as table_name, count(*) as rows from public.categories;
select 'expense_classifications' as table_name, count(*) as rows from public.expense_classifications;
select 'revenues' as table_name, count(*) as rows from public.revenues;
select 'expenses' as table_name, count(*) as rows from public.expenses;
select 'legacy_users' as table_name, count(*) as rows from public.legacy_users;
select 'audit_logs (legacy)' as table_name, count(*) as rows from public.audit_logs where legacy_id is not null;

select
  'revenues category_id missing' as check_name,
  count(*) as rows
from public.revenues r
left join public.categories c on c.id = r.category_id
where r.category_id is not null and c.id is null;

select
  'expenses category_id missing' as check_name,
  count(*) as rows
from public.expenses e
left join public.categories c on c.id = e.category_id
where e.category_id is not null and c.id is null;

select
  'expenses classification_id missing' as check_name,
  count(*) as rows
from public.expenses e
left join public.expense_classifications ec on ec.id = e.classification_id
where e.classification_id is not null and ec.id is null;

select
  'expenses fonte_id missing' as check_name,
  count(*) as rows
from public.expenses e
left join public.categories c on c.id = e.fonte_id
where e.fonte_id is not null and c.id is null;

select
  'expenses bloco_id missing' as check_name,
  count(*) as rows
from public.expenses e
left join public.categories c on c.id = e.bloco_id
where e.bloco_id is not null and c.id is null;

select
  'expenses grupo_id missing' as check_name,
  count(*) as rows
from public.expenses e
left join public.categories c on c.id = e.grupo_id
where e.grupo_id is not null and c.id is null;

select
  'expenses acao_id missing' as check_name,
  count(*) as rows
from public.expenses e
left join public.categories c on c.id = e.acao_id
where e.acao_id is not null and c.id is null;

select
  'revenues fonte_id missing' as check_name,
  count(*) as rows
from public.revenues r
left join public.categories c on c.id = r.fonte_id
where r.fonte_id is not null and c.id is null;

select
  'revenues bloco_id missing' as check_name,
  count(*) as rows
from public.revenues r
left join public.categories c on c.id = r.bloco_id
where r.bloco_id is not null and c.id is null;

select
  'revenues grupo_id missing' as check_name,
  count(*) as rows
from public.revenues r
left join public.categories c on c.id = r.grupo_id
where r.grupo_id is not null and c.id is null;

select
  'revenues acao_id missing' as check_name,
  count(*) as rows
from public.revenues r
left join public.categories c on c.id = r.acao_id
where r.acao_id is not null and c.id is null;
