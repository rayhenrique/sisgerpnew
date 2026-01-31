# Integridade temporal (datas e fuso horário)

Este projeto usa **PostgreSQL (Supabase)** e trata datas de duas formas diferentes:

- **Data de negócio (date-only)**: campos como `revenues.date` e `expenses.date` representam um dia do calendário (sem horário).
- **Instantes no tempo (timestamp)**: campos como `created_at`/`updated_at` representam um instante e usam `timestamptz` (sempre com fuso/UTC).

## Causa raiz do “-1 dia” (ex.: 01/01/2026 → 31/12/2025)

O bug típico acontece quando uma string `YYYY-MM-DD` (date-only) é convertida em JavaScript usando:

- `new Date("2026-01-01")`

Por padrão, essa forma é interpretada como **UTC 00:00**. Em fusos negativos (ex.: `America/Sao_Paulo`, UTC-03), ao formatar para `pt-BR` o resultado vira o dia anterior (ex.: 31/12/2025 21:00).

Isso explica a combinação de sintomas:
- **Listas/telas exibem “-1 dia”**, pois a UI estava formatando com `new Date(isoDate)`.
- **Filtros continuam funcionando**, pois o filtro usa `gte/lte` diretamente em `date` como string `YYYY-MM-DD`, sem conversão para `Date`.

## Regras do projeto

### 1) Campo `date` no banco deve ser `date` (não timestamp)

No schema atual:
- `public.revenues.date` é `date`
- `public.expenses.date` é `date`

### 2) No front-end, date-only deve ser tratado como string

- Não use `new Date(isoDateOnly)` para `YYYY-MM-DD`.
- Para exibir, converta `YYYY-MM-DD` → `DD/MM/YYYY` por string.
- Para gerar “hoje”/presets, evite `toISOString().split("T")[0]` (usa UTC) e gere o `YYYY-MM-DD` no fuso de negócio.

O projeto centraliza isso em `src/lib/dates.ts`:
- `formatDateBR(value)` (seguro para `YYYY-MM-DD`)
- `isoDateFromDateInTimeZone(date)` (gera `YYYY-MM-DD` no fuso de negócio)
- `isoDateFromPartsInTimeZone({year, month, day})`
- `addDaysToIsoDateOnly(isoDate, days)`

## Checklist para migrações (Laravel/MySQL → Supabase)

### A) Colunas date-only
- Garanta que o dump/export leve `YYYY-MM-DD` (sem horário).
- Insira em colunas `date` no Postgres.
- No app, armazene e filtre com `YYYY-MM-DD` (string).

### B) Colunas timestamptz (created_at/updated_at)
- Se o dump MySQL não tem fuso, defina explicitamente a origem (ex.: timestamps eram `America/Sao_Paulo`).
- Padronize no Supabase em `timestamptz` (UTC).
- Ao exibir, formatar com `Intl.DateTimeFormat("pt-BR")` é ok (instantes podem variar por fuso).

## Auditoria (queries úteis no Supabase)

### 1) Ver tipos de colunas de data/timestamp
```sql
select
  table_schema,
  table_name,
  column_name,
  data_type
from information_schema.columns
where table_schema = 'public'
  and (
    column_name ilike '%date%'
    or column_name in ('created_at','updated_at')
  )
order by table_name, column_name;
```

### 2) Verificar se existem valores nulos/fora do esperado
```sql
select count(*) from public.revenues where date is null;
select count(*) from public.expenses where date is null;
```

## Testes automatizados

Há testes em `src/lib/dates.test.ts` garantindo que:
- `formatDateBR("YYYY-MM-DD")` nunca depende do fuso do ambiente.
- utilitários de cálculo de período não usam UTC por `toISOString()` para datas de negócio.
