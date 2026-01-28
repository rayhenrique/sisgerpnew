# Design de Páginas — UI Responsiva (320/768/1024/1440)

## 0. Princípios (desktop-first)
- Base (>=1024) define a estrutura principal; ajustes progressivos reduzem densidade e reorganizam componentes para 768 e 320.
- Objetivo: consistência visual, previsibilidade de navegação e manutenção simples.

## 1. Global Styles (Design tokens)
### Cores
- Background: neutro claro (ex.: #F7F8FA)
- Surface (cards): branco (ex.: #FFFFFF)
- Texto primário: alto contraste (ex.: #111827)
- Texto secundário: (ex.: #4B5563)
- Acento (primary): cor institucional do SISGERP (manter padrão atual)
- Estados:
  - Success/Warning/Error com contraste suficiente e ícones opcionais

### Tipografia (escala sugerida)
- H1: 28–32px (desktop), 24–28px (mobile)
- H2: 20–24px
- Body: 14–16px
- Caption: 12–13px

### Espaçamento e grid
- Espaçamento base: 4px (multiplicadores: 8/12/16/24/32)
- Container desktop: max-width 1200–1280px com padding lateral 24px
- Mobile: padding lateral 16px (320) / 20px (768)

### Componentes (estados)
- Botões: 44px min de altura em mobile; hover/focus/disabled definidos.
- Links: sublinhado em hover e foco visível.
- Foco: outline visível (2px) com bom contraste.
- Animações: curtas (150–250ms) e respeitando “prefers-reduced-motion”.

## 2. Breakpoints e regras de layout
- 320px (mobile pequeno): 1 coluna; navegação por drawer; tabelas viram lista/cartões quando necessário.
- 768px (tablet): 1–2 colunas; filtros podem virar painel colapsável; drawer ainda preferível.
- 1024px (desktop): sidebar persistente; conteúdo em 2–3 colunas conforme página.
- 1440px (desktop largo): aumentar respiro, manter max-width do conteúdo e evitar linhas muito longas.

---

## 3. Página: Estrutura Global (Cabeçalho + Menu + Conteúdo)
### Layout
- Abordagem híbrida: CSS Grid para estrutura macro (Header/Sidebar/Main) + Flexbox dentro de componentes.
- Desktop (>=1024): grid com 2 colunas (Sidebar fixa + Main fluido).
- Mobile/Tablet (<1024): grid com 1 coluna; Sidebar vira Drawer.

### Meta Information
- Title: “SISGERP — {Seção atual}”
- Description: “Sistema SISGERP — gestão e operações.”
- Open Graph: título e descrição equivalentes; imagem opcional se existir padrão no produto.

### Page Structure
1. Skip Link (visível ao foco)
2. Header fixo (top)
3. Sidebar (persistente no desktop / drawer no mobile)
4. Main content (área rolável)

### Sections & Components
#### 3.1 Header (top bar)
- Esquerda: botão “Menu” (aparece no <1024), logo/nome do sistema.
- Centro (opcional): breadcrumb compacto (pode ocultar no 320 se poluir).
- Direita: ações globais essenciais (ex.: usuário/sair) — manter apenas o necessário.
- Acessibilidade:
  - Botão menu com `aria-label="Abrir menu"` e `aria-expanded`.
  - Header com landmarks (role/banner).

#### 3.2 Sidebar (desktop)
- Itens de navegação em lista vertical, com estado ativo.
- Modo recolhido: apenas ícones + tooltip (para manter performance e espaço).

#### 3.3 Mobile Drawer (320/768)
- Padrão: drawer à esquerda com overlay.
- Interações:
  - Abrir pelo botão do header.
  - Fechar por: ESC, clique no overlay, botão fechar, seleção de item.
  - Focus trap dentro do drawer; foco retorna ao botão de menu ao fechar.
  - Bloquear scroll do body enquanto aberto.

#### 3.4 Main
- Título da página + ações primárias (desktop: alinhadas à direita; mobile: empilhadas ou em menu “mais”).
- Estados padrão:
  - Loading: skeleton leve.
  - Empty: mensagem + CTA principal.
  - Error: mensagem clara + ação de tentar novamente.

---

## 4. Página: Listagem (padrão)
### Layout
- Desktop: grid com 2 áreas (Filtros à esquerda ou topo + tabela).
- Mobile: layout empilhado; filtros em painel colapsável (accordion) ou drawer.

### Meta Information
- Title: “SISGERP — {Módulo}”
- Description: “Listagem de {entidade} com filtros e ações.”

### Page Structure
1. Header local (título + ações principais)
2. Área de filtros
3. Área de resultados
4. Paginação

### Sections & Components
#### 4.1 Ações principais
- Botão primário (ex.: “Novo”) sempre visível.
- No 320: botões em largura total quando necessário.

#### 4.2 Filtros
- Desktop (>=1024): painel fixo (sidebar) ou barra no topo com campos alinhados.
- 768/320: botão “Filtrar” abre painel; aplicar/limpar visíveis.
- Acessibilidade: labels, agrupamentos (fieldset/legend quando útil) e mensagens de erro.

#### 4.3 Resultados
- Desktop: tabela com cabeçalho fixo opcional.
- Mobile:
  - Preferir lista/cartões com campos-chave (ex.: título, status, data, ação).
  - Ações secundárias em menu contextual acessível.

#### 4.4 Paginação
- Desktop: completa.
- Mobile: compacta (anterior/próximo + página atual).

---

## 5. Página: Detalhe/Formulário (padrão)
### Layout
- Desktop: formulário em 2 colunas quando houver muitos campos; seções em cards.
- Mobile: 1 coluna; seções em acordeão quando necessário para reduzir scroll.

### Meta Information
- Title: “SISGERP — {Entidade} — {Criar/Editar}”
- Description: “Cadastro/edição de {entidade}.”

### Page Structure
1. Header local (título + status)
2. Formulário (seções)
3. Barra de ações (salvar/cancelar)

### Sections & Components
#### 5.1 Campos
- Inputs com altura confortável no toque.
- Máscaras/validações sem bloquear digitação.
- Mensagens de erro:
  - Texto objetivo.
  - Associadas ao campo (aria-describedby).

#### 5.2 Barra de ações
- Desktop: botões alinhados à direita.
- Mobile: barra sticky no rodapé da área visível (sem cobrir campos) com:
  - Primário: “Salvar”
  - Secundário: “Cancelar/Voltar”

#### 5.3 Feedback
- Toast/alerta com anúncio para leitor de tela (aria-live) ao salvar/erro.

---

## 6. Checklist de acessibilidade e performance (aceite)
### Acessibilidade
- Todos os controles alcançáveis via teclado e com foco visível.
- Drawer com foco preso e retorno de foco ao fechar.
- Contraste adequado para textos e estados.
- Alvos de toque adequados (mínimo 44px no mobile).

### Performance
- Layout responsivo prioriza CSS (media queries) e evita lógica JS para medir viewport.
- Abrir/fechar menu não provoca travamentos perceptíveis.
- Páginas podem ser carregadas sob demanda (lazy) quando aplicável.
