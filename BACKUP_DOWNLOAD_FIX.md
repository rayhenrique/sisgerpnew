# Correção do Download de Backups

## Problemas Identificados

### 1. Incompatibilidade de Resposta da API
**Problema**: A rota de download retornava `{ downloadUrl }` mas o frontend esperava `{ url, expiresInSeconds }`

**Correção**: Atualizado `src/app/api/backup/[id]/download/route.ts` para retornar o formato correto:
```typescript
return NextResponse.json({ 
  url: downloadUrl,
  expiresInSeconds: 3600 
});
```

### 2. Inconsistência no Caminho de Armazenamento
**Problema**: Quando `organization_id` é `null`, diferentes partes do código usavam fallbacks diferentes:
- Criação de backup: `organizationId || 'system'`
- Download: `backup.organization_id || 'default'` ❌
- Delete: `backup.organization_id || 'default'` ❌

Isso causava incompatibilidade de caminhos:
- Arquivo salvo em: `system/{backupId}.gz`
- Tentativa de download de: `default/{backupId}.gz`

**Correção**: Padronizado todos os fallbacks para `'system'` nos seguintes arquivos:
- ✅ `src/server/backup/controllers/backupController.ts` (download e delete)
- ✅ `src/server/backup/services/restoreService.ts` (2 ocorrências)
- ✅ `src/server/backup/services/retentionService.ts` (2 ocorrências)

## Estrutura de Armazenamento

Os arquivos de backup são armazenados no bucket `backups` com a seguinte estrutura:
```
backups/
├── system/              # Para backups sem organization_id
│   └── {backupId}.gz
└── {organizationId}/    # Para backups com organization_id
    └── {backupId}.gz
```

## Próximos Passos para Verificação

### 1. Verificar Arquivos no Supabase Storage

Acesse o Supabase Dashboard → Storage → bucket `backups` e verifique:

1. **Os arquivos existem?**
   - Deve haver uma pasta `system/` (já que organization_id é null)
   - Dentro deve haver arquivos `.gz` com os IDs dos backups

2. **Se os arquivos NÃO existirem:**
   - O upload falhou silenciosamente
   - Verifique os logs do servidor durante a criação do backup
   - Pode ser um problema de permissões de storage

3. **Se os arquivos existirem:**
   - O problema era apenas a incompatibilidade de caminhos (já corrigido)
   - Teste o download novamente

### 2. Verificar Políticas de Storage

Certifique-se de que existem as seguintes políticas no bucket `backups`:

#### Política 1: Service Role Full Access
```
Operation: ALL (SELECT, INSERT, UPDATE, DELETE)
Role: service_role
Bucket: backups
```

#### Política 2: Authenticated Read Access
```
Operation: SELECT
Role: authenticated
Bucket: backups
```

#### Política 3: Service Role Signed URLs (se necessário)
Se ainda houver erro ao gerar URLs assinadas, adicione:
```sql
CREATE POLICY "Service role can generate signed URLs"
ON storage.objects FOR SELECT
TO service_role
USING (bucket_id = 'backups');
```

### 3. Testar o Download

Após verificar o storage:

1. Pare o servidor de desenvolvimento se estiver rodando
2. Inicie novamente: `npm run dev`
3. Acesse a página de backups
4. Tente fazer download de um backup existente
5. Se falhar, verifique o console do navegador e os logs do servidor

## Logs Úteis para Debug

Se o download ainda falhar, verifique:

### No Console do Navegador:
- Mensagem de erro específica
- Status HTTP da resposta (400, 403, 404, 500)

### Nos Logs do Servidor:
- Erros durante `storageService.getDownloadUrl()`
- Erros durante `storageService.fileExists()`
- Mensagens do Supabase Storage

## Resumo das Alterações

| Arquivo | Alteração |
|---------|-----------|
| `src/app/api/backup/[id]/download/route.ts` | Corrigido formato de resposta da API |
| `src/server/backup/controllers/backupController.ts` | Padronizado fallback para 'system' (2x) |
| `src/server/backup/services/restoreService.ts` | Padronizado fallback para 'system' (3x) |
| `src/server/backup/services/retentionService.ts` | Padronizado fallback para 'system' (2x) |

**Total**: 8 correções em 4 arquivos
