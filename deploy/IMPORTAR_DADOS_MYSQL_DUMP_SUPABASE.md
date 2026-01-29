# Importar dump do phpMyAdmin (MySQL) no Supabase (Postgres)

O arquivo `referencia/127_0_0_1 (1).sql` é um **dump MySQL** (phpMyAdmin). Ele não pode ser executado diretamente no Supabase (Postgres).

Este procedimento converte apenas os dados compatíveis do SISGERP e importa no banco atual do Supabase.

## O que será importado

- `categories`
- `expense_classifications`
- `city_settings`
- `revenues`
- `expenses`

Não importamos `audit_logs`/`users` do dump MySQL porque o esquema de autenticação no Supabase é diferente (`auth.users`).

## 1) Gerar o SQL de importação (no seu computador)

Na raiz do projeto:

```bash
node scripts/generate-supabase-import-from-mysql-dump.mjs ^
  --input "referencia/127_0_0_1 (1).sql" ^
  --output "referencia/import_supabase.sql" ^
  --mode replace
```

O `--mode replace` faz `TRUNCATE` nas tabelas-alvo antes de inserir (substitui os dados atuais).

Nota sobre duplicados:
- O Supabase usa uma constraint case-insensitive para `categories.name` (`categories_name_ci_unique`).
- Se o dump tiver nomes repetidos (ex.: `FUS` em tipos diferentes), o gerador renomeia automaticamente os duplicados para manter a integridade, por exemplo: `FUS #29`, e marca `active=false` nesses itens.

Se você quiser tentar inserir sem apagar dados (pode falhar por IDs duplicados):

```bash
node scripts/generate-supabase-import-from-mysql-dump.mjs ^
  --input "referencia/127_0_0_1 (1).sql" ^
  --output "referencia/import_supabase.sql" ^
  --mode append
```

## 2) Fazer backup antes (recomendado)

Antes de importar em produção, faça um backup do banco no Supabase (ou use um ambiente de homologação).

## 3) Importar no Supabase

### Opção A) SQL Editor (mais simples)
1. Supabase Dashboard → **SQL Editor**
2. Abra `referencia/import_supabase.sql`
3. Cole o conteúdo no editor
4. Execute

### Opção B) psql (linha de comando)
1. Instale o `psql` (PostgreSQL client)
2. Conecte usando a connection string do Supabase e rode:

```bash
psql "postgresql://postgres:SENHA@db.SEUREF.supabase.co:5432/postgres" -f referencia/import_supabase.sql
```

## 4) Validar após a importação

No Supabase (SQL Editor), rode:

```sql
select count(*) from public.categories;
select count(*) from public.expense_classifications;
select count(*) from public.city_settings;
select count(*) from public.revenues;
select count(*) from public.expenses;
```

Depois, no app:
- Abra **Configurações** e confirme o “Nome do Município”.
- Abra **Receitas/Despesas/Categorias** e valide os registros.
