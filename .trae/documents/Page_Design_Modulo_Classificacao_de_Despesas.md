# Classificação de Despesas — Page Design Specs (Desktop-first)

## Global Styles
- Layout base: seguir o **AppShell** do SISGERP (sidebar + conteúdo) e o cabeçalho do **PageShell** (`max-w-6xl`, título e ações).
- Sistema de layout: Grid para filtros e tabela; Flexbox para barras de ação e rodapés de modal.
- Breakpoints: Tailwind defaults (base, `sm`, `md`, `lg`, `xl`).
- Componentes: shadcn/ui (Card, Button, Input, Table, Dialog) + Lucide.
- Estados: loading/empty/error padronizados (texto curto + container com borda/surface).

## Página: /classificacao-despesas

### Meta Information
- Title: SISGERP — Classificação de Despesas
- Description: Gerencie classificações de despesas com busca, filtros e cadastro validado.
- Open Graph: `og:title`, `og:description`, `og:type=website`

### Page Structure
1. Header (PageShell)
2. Card “Filtros”
3. Card “Listagem” (Tabela)
4. Modal “Nova/Editar classificação”
5. Modal de confirmação “Desativar/Ativar”

### 1) Header (PageShell)
- Esquerda: título “Classificação de Despesas” + subtítulo curto (ex.: “Cadastro e manutenção”).
- Direita (headerActions): botão primário “+ Nova classificação”; botão secundário “Atualizar” (opcional, alinhado ao padrão do SISGERP).

### 2) Card “Filtros”
- Layout: `grid` responsivo; desktop-first com 3–4 colunas e empilhamento no mobile.
- Campos (mínimos):
  - Busca (Input com ícone): placeholder “Buscar por nome ou código”.
  - Status (Select): “Todos / Ativos / Inativos”.
  - Ações: “Limpar” (secondary) e/ou “Atualizar”.
- Interação:
  - Digitar na busca filtra a tabela localmente (ou dispara reload com debounce, se adotado no SISGERP).
  - Select altera o filtro e mantém a listagem consistente.

### 3) Card “Listagem” (Tabela)
- Tabela (desktop): colunas **Código**, **Nome**, **Status**, **Ações**.
- Ações por linha:
  - “Editar” (ícone lápis) abre modal preenchido.
  - “Ativar/Desativar” (ícone/ação) abre confirmação.
- Estados:
  - Loading: texto “Carregando…” no CardContent.
  - Empty: box central com título “Nenhuma classificação encontrada” + dica “Ajuste os filtros…”.
  - Error: alerta inline em tom de erro dentro do Card.

### 4) Modal “Nova/Editar classificação”
- Container: shadcn `Dialog` com largura `sm:max-w-lg`.
- Campos (com validação):
  - Nome (obrigatório).
  - Código (opcional, mas único quando informado).
  - Descrição (opcional, textarea se já adotado no padrão do SISGERP).
  - Ativo (checkbox/switch).
- Rodapé:
  - “Cancelar” (secondary)
  - “Salvar” (primary)
- Validação (UX):
  - Mensagens abaixo do campo; bloquear “Salvar” enquanto inválido; exibir erro de backend (ex.: código duplicado).

### 5) Modal de confirmação “Ativar/Desativar”
- Texto objetivo: “Desativar <nome>?” / “Ativar <nome>?”
- Botões: “Cancelar” (secondary) e “Confirmar” (destructive para desativar; primary para ativar).
- Feedback: ao sucesso, fechar modal e atualizar a tabela.
