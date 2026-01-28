# Design de Páginas — Módulo /admin/usuarios (desktop-first)

## 1. Global Styles (tokens e padrões)
- Layout base: CSS Grid para estrutura de página + Flexbox para alinhamentos internos.
- Breakpoints: desktop (>= 1200px) como padrão; ajustes para 768–1199px (tablet) e <768px (mobile).
- Cores:
  - Background: #0B1220 (app shell) e #0F172A (cards)
  - Texto primário: #E5E7EB; secundário: #9CA3AF
  - Acento: #3B82F6; Sucesso: #22C55E; Perigo: #EF4444; Aviso: #F59E0B
- Tipografia: Inter/System; escala 12/14/16/20/24.
- Botões:
  - Primário (accent), Secundário (neutro), Perigo (vermelho)
  - Hover: +6% brilho; Disabled: 50% opacidade
- Campos: borda sutil, foco com anel (accent), mensagens de erro em vermelho.
- Tabela: cabeçalho fixo opcional; linhas com hover; zebra leve.

---

## 2. Página: Login
### 2.1 Layout
- Grid centralizado (max-width 420px) com card sobre fundo do app.
- Espaçamento vertical 24px entre blocos; alinhamento central.

### 2.2 Meta Information
- Title: "Login | Administração"
- Description: "Acesso ao painel administrativo"
- Open Graph: título/descrição equivalentes; noindex (ambiente interno).

### 2.3 Page Structure
1. App Shell (fundo)
2. Card de autenticação

### 2.4 Sections & Components
- Header do card
  - Logo/nome do sistema
  - Texto curto: "Entre para continuar"
- Formulário
  - Input: Email
  - Input: Senha
  - Botão primário: "Entrar"
  - Feedback de erro (alert inline)
- Rodapé (opcional)
  - Texto de suporte: "Se não tiver acesso, contate um administrador" (sem fluxo de auto-cadastro)

### 2.5 Estados e interações
- Loading no submit (spinner no botão)
- Erro: credenciais inválidas / usuário desativado
- Sucesso: redirecionar para /admin/usuarios

---

## 3. Página: Administração > Usuários (/admin/usuarios)
### 3.1 Layout
- Estrutura: grid de 12 colunas.
  - Top bar (12)
  - Área principal com card/tabela (12)
  - Drawer/modal lateral para criar/editar (sobreposição)
- Espaçamentos: 24px padding externo; cards com 16–20px.

### 3.2 Meta Information
- Title: "Usuários | Administração"
- Description: "Gestão de usuários, papéis e auditoria"
- Open Graph: título/descrição equivalentes; noindex.

### 3.3 Page Structure
1. Top Bar
2. Toolbar de filtros
3. Card: Tabela de usuários + paginação
4. Painel/Tab: Auditoria (integrado na mesma página)
5. Drawer: Criar/Editar usuário

### 3.4 Sections & Components
**(A) Top Bar**
- Breadcrumbs: "Administração / Usuários"
- Ações à direita:
  - Botão primário: "Novo usuário" (visível para admin/superadmin)
  - Menu de perfil (email, sair)

**(B) Toolbar de filtros**
- Busca (input com ícone): placeholder "Buscar por nome ou e-mail"
- Filtro Select: Papel (Todos/operator/admin/superadmin)
- Filtro Select: Status (Todos/active/disabled)
- Botões:
  - Secundário: "Limpar"
  - (Opcional) "Atualizar" para refetch manual
- Regra UX: filtros atualizam a listagem e sincronizam querystring.

**(C) Card: Tabela de usuários**
- Colunas:
  - Nome
  - E-mail
  - Papel (badge)
  - Status (badge)
  - Criado em
  - Ações (menu kebab)
- Ações por linha (conforme permissão):
  - "Ver/Editar" (admin/superadmin; operator pode apenas ver)
  - "Desativar" / "Reativar" (admin/superadmin; bloquear se for o próprio usuário)
  - "Alterar papel" (admin/superadmin com restrições por nível)
- Estados:
  - Loading (skeleton de linhas)
  - Empty state (texto + sugestão de limpar filtros)
  - Error state (alert com retry)

**(D) Paginação**
- Controles: anterior/próximo + seletor de pageSize (10/25/50)
- Exibir: "Mostrando X–Y de Z" (quando disponível).

**(E) Auditoria (Tab ou seção colapsável dentro da página)**
- Tabs: "Usuários" | "Auditoria"
- Em Auditoria:
  - Filtros: ator, ação, alvo, período
  - Tabela de logs: data/hora, ator, ação, alvo, resumo
  - Drawer/Modal: detalhes do log (metadata formatado JSON)

**(F) Drawer: Criar/Editar usuário**
- Título dinâmico: "Novo usuário" / "Editar usuário"
- Campos:
  - Email (readonly no editar, se aplicável)
  - Nome
  - Papel (select) com opções limitadas ao nível do ator
  - Status (apenas admin/superadmin)
- Rodapé:
  - Cancelar
  - Salvar (primário)
- Validações inline + mensagem geral de erro.

### 3.5 Responsividade
- <768px:
  - Toolbar quebra em 2–3 linhas
  - Tabela vira lista (cards) ou scroll horizontal
  - Drawer ocupa 100% largura

### 3.6 Acessibilidade e feedback
- Foco visível; navegação por teclado no menu de ações.
- Confirmações para ações destrutivas (desativar).
- Toasts para sucesso