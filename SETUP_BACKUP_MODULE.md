# Setup do Módulo de Backup - Guia Rápido

## ⚠️ Passo Importante: Aplicar Migração do Banco de Dados

O erro que você está vendo acontece porque **as tabelas do banco de dados ainda não foram criadas**. Você precisa aplicar a migração antes de usar o módulo.

## Como Aplicar a Migração

### Opção 1: Usando Supabase CLI (Recomendado)

```bash
# 1. Instalar Supabase CLI (se ainda não tiver)
npm install -g supabase

# 2. Login no Supabase
supabase login

# 3. Linkar seu projeto
supabase link --project-ref zzdybdbppicydbtmjdae

# 4. Aplicar todas as migrações pendentes
supabase db push
```

### Opção 2: Usando Supabase Dashboard (Manual)

1. Acesse: https://supabase.com/dashboard/project/zzdybdbppicydbtmjdae
2. Vá para **SQL Editor** no menu lateral
3. Abra o arquivo `supabase/migrations/0013_backup_module.sql` no seu editor
4. Copie **TODO** o conteúdo do arquivo
5. Cole no SQL Editor do Supabase
6. Clique em **Run** para executar

## Verificar se a Migração Foi Aplicada

Depois de aplicar a migração, você pode verificar se funcionou:

```bash
npx tsx scripts/verify-backup-migration.ts
```

Você deve ver:
```
✅ backups table exists
✅ backup_schedules table exists
✅ restore_jobs table exists
✅ RLS is enabled
✅ All migration checks passed!
```

## Configurar Supabase Storage

O módulo de backup também precisa do Supabase Storage configurado:

1. Acesse: https://supabase.com/dashboard/project/zzdybdbppicydbtmjdae/storage/buckets
2. Crie um bucket chamado `backups` (se não existir)
3. Configure as permissões:
   - **Public**: Não (privado)
   - **File size limit**: 50 MB ou mais
   - **Allowed MIME types**: application/gzip, application/json

## Depois de Aplicar a Migração

1. Reinicie o servidor de desenvolvimento:
   ```bash
   # Pare com Ctrl+C
   npm run dev
   ```

2. Acesse o módulo de backup: http://localhost:3000/backup

3. Agora você deve ver a interface completa funcionando!

## Troubleshooting

### Erro: "Supabase não configurado"
- Verifique se o arquivo `.env.local` existe e contém:
  ```env
  NEXT_PUBLIC_SUPABASE_URL=sua_url_aqui
  NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_aqui
  SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key_aqui
  ```

### Erro: "Você não tem permissão"
- Verifique se seu usuário tem role `admin` ou `superadmin` na tabela `profiles`
- Você pode atualizar via SQL Editor:
  ```sql
  UPDATE profiles 
  SET role = 'superadmin' 
  WHERE email = 'seu_email@exemplo.com';
  ```

### Erro: "Backup file not found"
- Verifique se o bucket `backups` existe no Supabase Storage
- Verifique as permissões do bucket

## Recursos Adicionais

- [Documentação Completa do Módulo](BACKUP_MODULE.md)
- [Guia de Aplicação de Migração](supabase/migrations/APPLY_MIGRATION_GUIDE.md)
- [README do Módulo](src/features/backup/README.md)

## Próximos Passos

Depois que a migração estiver aplicada e o módulo funcionando:

1. ✅ Teste criar um backup manual
2. ✅ Configure um agendamento de backup
3. ✅ Configure os cron jobs para backups automáticos (opcional)
4. ✅ Configure políticas de retenção

---

**Nota**: A migração é segura e não afeta dados existentes. Ela apenas cria novas tabelas para o módulo de backup.
