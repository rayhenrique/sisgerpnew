# Módulo Receitas

## Mudanças aplicadas
- Remoção do subtítulo padrão "Overview" na rota `/receitas`.
- Padronização de layout: ações e filtros no Card "Filtros"; total exibido no cabeçalho do Card "Receitas".
- Exclusão de receitas com confirmação em popup.

## Regras de negócio
- Criação/Edição grava hierarquia selecionada (fonte/bloco/grupo/ação) além dos IDs padrão (`source_id` e `category_id`).
- Exclusão é física (remoção do registro) e exige confirmação.

## Auditoria
- Operações de criar/editar/excluir tentam registrar eventos em `audit_logs` quando o usuário está autenticado.

