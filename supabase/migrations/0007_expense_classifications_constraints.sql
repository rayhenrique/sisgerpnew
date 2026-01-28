do $$
declare
  r record;
  v_keep_id bigint;
begin
  for r in
    select lower(name) as lname
    from public.expense_classifications
    group by lower(name)
    having count(*) > 1
  loop
    select min(id)
      into v_keep_id
    from public.expense_classifications
    where lower(name) = r.lname;

    delete from public.expense_classifications c
    where lower(c.name) = r.lname
      and c.id <> v_keep_id
      and not exists (
        select 1
        from public.expenses e
        where e.classification_id = c.id
           or e.expense_classification_id = c.id
      );

    update public.expense_classifications c
    set
      name = left(c.name, 140) || ' #' || c.id::text,
      active = false
    where lower(c.name) = r.lname
      and c.id <> v_keep_id;
  end loop;

  for r in
    select lower(code) as lcode
    from public.expense_classifications
    where code is not null
    group by lower(code)
    having count(*) > 1
  loop
    select min(id)
      into v_keep_id
    from public.expense_classifications
    where code is not null
      and lower(code) = r.lcode;

    delete from public.expense_classifications c
    where c.code is not null
      and lower(c.code) = r.lcode
      and c.id <> v_keep_id
      and not exists (
        select 1
        from public.expenses e
        where e.classification_id = c.id
           or e.expense_classification_id = c.id
      );

    update public.expense_classifications c
    set
      code = left(c.code, 40) || '#' || c.id::text,
      active = false
    where c.code is not null
      and lower(c.code) = r.lcode
      and c.id <> v_keep_id;
  end loop;
end $$;

create unique index if not exists expense_classifications_name_ci_unique
on public.expense_classifications (lower(name));

create unique index if not exists expense_classifications_code_ci_unique
on public.expense_classifications (lower(code))
where code is not null;

create or replace function public.prevent_expense_classification_delete_if_in_use()
returns trigger
language plpgsql
as $$
begin
  if exists (
    select 1
    from public.expenses e
    where e.classification_id = old.id
       or e.expense_classification_id = old.id
  ) then
    raise exception 'Não é possível excluir: a classificação está vinculada a despesas.';
  end if;
  return old;
end;
$$;

drop trigger if exists expense_classifications_prevent_delete on public.expense_classifications;
create trigger expense_classifications_prevent_delete
before delete on public.expense_classifications
for each row
execute function public.prevent_expense_classification_delete_if_in_use();

create or replace function public.ensure_expense_classification_active()
returns trigger
language plpgsql
as $$
declare
  v_active boolean;
begin
  if new.classification_id is not null then
    select c.active into v_active
    from public.expense_classifications c
    where c.id = new.classification_id;

    if v_active is false then
      raise exception 'Classificação de despesa inativa não pode ser vinculada.';
    end if;
  end if;

  if new.expense_classification_id is not null then
    select c.active into v_active
    from public.expense_classifications c
    where c.id = new.expense_classification_id;

    if v_active is false then
      raise exception 'Classificação de despesa inativa não pode ser vinculada.';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists zzz_expenses_check_classification_active on public.expenses;
create trigger zzz_expenses_check_classification_active
before insert or update on public.expenses
for each row
execute function public.ensure_expense_classification_active();

