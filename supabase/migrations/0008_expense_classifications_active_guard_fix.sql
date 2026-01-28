create or replace function public.ensure_expense_classification_active()
returns trigger
language plpgsql
as $$
declare
  v_active boolean;
begin
  if tg_op = 'INSERT' or new.classification_id is distinct from old.classification_id then
    if new.classification_id is not null then
      select c.active into v_active
      from public.expense_classifications c
      where c.id = new.classification_id;

      if v_active is false then
        raise exception 'Classificação de despesa inativa não pode ser vinculada.';
      end if;
    end if;
  end if;

  if tg_op = 'INSERT' or new.expense_classification_id is distinct from old.expense_classification_id then
    if new.expense_classification_id is not null then
      select c.active into v_active
      from public.expense_classifications c
      where c.id = new.expense_classification_id;

      if v_active is false then
        raise exception 'Classificação de despesa inativa não pode ser vinculada.';
      end if;
    end if;
  end if;

  return new;
end;
$$;

