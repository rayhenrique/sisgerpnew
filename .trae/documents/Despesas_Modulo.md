# Módulo Despesas

## Mudanças aplicadas
- Remoção do subtítulo padrão "Overview" na rota `/despesas`.
- Implementação de CRUD completo (criar/editar/excluir) com validação e confirmação.
- Paginação (itens por página, navegação e contador de resultados), mantendo estado em operações.

## Regras de negócio implementadas
- Campos obrigatórios: descrição, valor (> 0), data, hierarquia de categorias (fonte/bloco/grupo/ação) e classificação.
- Classificação inativa não pode ser vinculada (garantia no banco + UI marca como inativa quando aplicável).

## Discrepâncias observadas
- O banco permite `categories.active = false` ainda ser referenciada; a UI impede seleção de categorias inativas (exceto para manter valores já existentes na edição).
- A tabela `expenses` mantém colunas legadas (`fonte_id`, `acao_id`, `expense_classification_id`) e colunas atuais (`source_id`, `category_id`, `classification_id`); o formulário grava ambas para consistência.

## Auditoria
- Operações de criar/editar/excluir tentam registrar eventos em `audit_logs` quando o usuário está autenticado.
