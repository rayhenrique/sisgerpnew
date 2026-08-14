-- Migration: 0016_create_backups_storage_bucket.sql
-- Descrição: Cria o bucket de storage 'backups' no Supabase Storage se ele ainda não existir.
-- Requisito para o módulo de backup funcionar corretamente.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'backups',
  'backups',
  false, -- Bucket privado
  524288000, -- Limite de 500MB por arquivo (ajuste se necessário)
  array['application/gzip', 'application/json', 'application/octet-stream']
)
on conflict (id) do update set
  public = false;
