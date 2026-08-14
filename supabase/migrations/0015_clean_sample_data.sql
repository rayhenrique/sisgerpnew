-- Migration: 0015_clean_sample_data.sql
-- Descrição: Migration opcional para limpar dados de exemplo/seed das tabelas de produção:
--   - public.expenses (Despesas)
--   - public.revenues (Receitas)
--   - public.expense_classifications (Classificações de Despesas)
--   - public.categories (Categorias: Fontes, Blocos, Grupos e Ações)
--   - public.city_settings (Configurações da Prefeitura)
--
-- NOTA: Esta migration é OPCIONAL. Execute-a caso queira reiniciar o banco de dados sem dados de demonstração.

-- 1. Limpar movimentações (Despesas e Receitas)
truncate table public.expenses restart identity cascade;
truncate table public.revenues restart identity cascade;

-- 2. Limpar tabelas de classificação e estrutura de categorias
truncate table public.expense_classifications restart identity cascade;
truncate table public.categories restart identity cascade;

-- 3. Limpar configurações de exemplo da prefeitura
truncate table public.city_settings restart identity cascade;
