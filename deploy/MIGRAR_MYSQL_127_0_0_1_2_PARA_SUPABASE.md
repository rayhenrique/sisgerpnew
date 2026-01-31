# Migração do dump MySQL `127_0_0_1 (2).sql` para Supabase

Este documento descreve como converter e importar o dump MySQL `referencia/127_0_0_1 (2).sql` para o banco PostgreSQL do Supabase usado pelo SISGERP.

## Resumo do que é migrado (recomendado)

### Tabelas de domínio (SISGERP)
- `categories`
- `expense_classifications`
- `revenues`
- `expenses`

### Tabelas do Laravel (não migradas)
O dump contém tabelas de framework como `cache`, `jobs`, `sessions`, `migrations`, etc. Elas não são usadas pelo SISGERP no Supabase e não devem ser migradas.

## Verificações do dump MySQL

- Dump é MySQL/phpMyAdmin (usa `ENGINE=InnoDB`, `AUTO_INCREMENT`, backticks, etc.).
- Não há triggers/procedures/functions MySQL no dump (sem `DELIMITER`, `CREATE TRIGGER`, `CREATE PROCEDURE`).

## Mapeamento de tipos (MySQL → Postgres/Supabase)

- `bigint unsigned` → `bigint`
- `tinyint(1)` → `boolean`
- `decimal(15,2)` → `numeric(15,2)`
- `varchar(n)` → `text` (no schema atual do SISGERP)
- `timestamp` → `timestamptz`
- `json` → `jsonb`

## Migração de usuários e logs (opcional)

Se você quiser importar usuários/logs do MySQL, é necessário criar tabelas/colunas adicionais no Supabase, porque:
- Supabase Auth usa `auth.users.id` como `uuid`.
- MySQL usa `users.id` como `bigint`.

Migração SQL adicionada:
- `supabase/migrations/0014_legacy_mysql_dump_support.sql`

## Diferenças relevantes (MySQL vs schema atual do SISGERP)

- `users`: não é migrado para `auth.users`. O Supabase não aceita reaproveitar hash/senha do MySQL; criação de usuários deve ser feita via Supabase Auth (Dashboard/Admin API).
- `audit_logs.user_id`: no schema atual é `uuid` (Supabase Auth). Na importação do MySQL, o vínculo é preservado em `audit_logs.legacy_user_id` e `audit_logs.legacy_id`.
- `ON DELETE CASCADE` do MySQL pode não ser idêntico ao comportamento atual do Postgres. O schema do SISGERP prioriza consistência com o app atual.

## Passo a passo

### 1) Aplicar as migrations no Supabase

Garanta que todas as migrations do projeto foram aplicadas (incluindo a `0014_legacy_mysql_dump_support.sql`).

### 2) Gerar o script de importação compatível com Supabase (no seu computador)

Na raiz do projeto:

```powershell
node scripts/generate-supabase-import-from-mysql-dump.mjs `
  --preset sisgerp-domain `
  --input "referencia/127_0_0_1 (2).sql" `
  --output "referencia/import_supabase_127_0_0_1_2.sql" `
  --mode replace
```

Notas:
- `--mode replace` faz `TRUNCATE` nas tabelas-alvo antes de inserir (substitui dados atuais).
- `--mode append` tenta inserir sem apagar (pode falhar por conflitos de PK/unique).
- `--preset sisgerp-domain` migra apenas tabelas de domínio (sem usuários/logs).

### 3) Importar no Supabase

Supabase Dashboard → SQL Editor:
1. Abra o arquivo `referencia/import_supabase_127_0_0_1_2.sql`
2. Cole no editor
3. Execute

### 4) Validar a integridade

Rode o script de validação:
- `deploy/VALIDAR_MIGRACAO_MYSQL_127_0_0_1_2.sql`

## Regras de conversão aplicadas

- Apenas números entram no campo `amount` (já vem numérico no dump, permanece numérico no Postgres).
- `active` (0/1) vira `false/true`.
- Duplicidades case-insensitive em `categories.name` e `expense_classifications.name` são normalizadas renomeando duplicados para `"Nome #id"` e marcando `active=false`.
- `audit_logs.old_values` e `audit_logs.new_values` são ajustados para JSON válido no Postgres (remoção de escapes MySQL como `\\\"`).

## Observações sobre RLS

- `legacy_users` fica com RLS habilitado e leitura apenas para `admin/superadmin`.
- As tabelas de domínio já seguem o padrão de RLS/políticas do projeto.
