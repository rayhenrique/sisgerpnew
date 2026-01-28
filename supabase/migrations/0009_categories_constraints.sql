do $$
declare
  r record;
  v_keep_id bigint;
begin
  for r in
    select lower(name) as lname
    from public.categories
    where deleted_at is null
    group by lower(name)
    having count(*) > 1
  loop
    select min(id)
      into v_keep_id
    from public.categories
    where deleted_at is null
      and lower(name) = r.lname;

    delete from public.categories c
    where c.deleted_at is null
      and lower(c.name) = r.lname
      and c.id <> v_keep_id
      and not exists (
        select 1
        from public.revenues rev
        where rev.source_id = c.id
           or rev.category_id = c.id
           or rev.fonte_id = c.id
           or rev.bloco_id = c.id
           or rev.grupo_id = c.id
           or rev.acao_id = c.id
      )
      and not exists (
        select 1
        from public.expenses exp
        where exp.source_id = c.id
           or exp.category_id = c.id
           or exp.fonte_id = c.id
           or exp.bloco_id = c.id
           or exp.grupo_id = c.id
           or exp.acao_id = c.id
      );

    update public.categories c
    set
      name = left(c.name, 140) || ' #' || c.id::text,
      active = false
    where c.deleted_at is null
      and lower(c.name) = r.lname
      and c.id <> v_keep_id;
  end loop;

  for r in
    select lower(code) as lcode
    from public.categories
    where deleted_at is null
      and code is not null
    group by lower(code)
    having count(*) > 1
  loop
    select min(id)
      into v_keep_id
    from public.categories
    where deleted_at is null
      and code is not null
      and lower(code) = r.lcode;

    delete from public.categories c
    where c.deleted_at is null
      and c.code is not null
      and lower(c.code) = r.lcode
      and c.id <> v_keep_id
      and not exists (
        select 1
        from public.revenues rev
        where rev.source_id = c.id
           or rev.category_id = c.id
           or rev.fonte_id = c.id
           or rev.bloco_id = c.id
           or rev.grupo_id = c.id
           or rev.acao_id = c.id
      )
      and not exists (
        select 1
        from public.expenses exp
        where exp.source_id = c.id
           or exp.category_id = c.id
           or exp.fonte_id = c.id
           or exp.bloco_id = c.id
           or exp.grupo_id = c.id
           or exp.acao_id = c.id
      );

    update public.categories c
    set
      code = left(c.code, 40) || '#' || c.id::text,
      active = false
    where c.deleted_at is null
      and c.code is not null
      and lower(c.code) = r.lcode
      and c.id <> v_keep_id;
  end loop;
end $$;

create unique index if not exists categories_name_ci_unique
on public.categories (lower(name))
where deleted_at is null;

create unique index if not exists categories_code_ci_unique
on public.categories (lower(code))
where deleted_at is null and code is not null;

create or replace function public.category_has_movements(cat_id bigint)
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.revenues r
    where r.source_id = cat_id
       or r.category_id = cat_id
       or r.fonte_id = cat_id
       or r.bloco_id = cat_id
       or r.grupo_id = cat_id
       or r.acao_id = cat_id
  )
  or exists (
    select 1
    from public.expenses e
    where e.source_id = cat_id
       or e.category_id = cat_id
       or e.fonte_id = cat_id
       or e.bloco_id = cat_id
       or e.grupo_id = cat_id
       or e.acao_id = cat_id
  );
$$;

create or replace function public.prevent_category_update_if_in_use()
returns trigger
language plpgsql
as $$
begin
  if public.category_has_movements(old.id) then
    if new.name is distinct from old.name
      or new.code is distinct from old.code
      or new.type is distinct from old.type
      or new.parent_id is distinct from old.parent_id
      or new.description is distinct from old.description
      or new.deleted_at is distinct from old.deleted_at
    then
      raise exception 'Não é possível editar: a categoria está vinculada a receitas/despesas.';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists categories_prevent_update_if_in_use on public.categories;
create trigger categories_prevent_update_if_in_use
before update on public.categories
for each row
execute function public.prevent_category_update_if_in_use();

create or replace function public.prevent_category_delete_if_in_use()
returns trigger
language plpgsql
as $$
begin
  if public.category_has_movements(old.id) then
    raise exception 'Não é possível excluir: a categoria está vinculada a receitas/despesas.';
  end if;
  return old;
end;
$$;

drop trigger if exists categories_prevent_delete_if_in_use on public.categories;
create trigger categories_prevent_delete_if_in_use
before delete on public.categories
for each row
execute function public.prevent_category_delete_if_in_use();

