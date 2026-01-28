# Page Design — Módulo Relatórios (Desktop-first)

## Padrões globais (todas as páginas)
- **Layout**: Grid 12 colunas (desktop) + empilhamento (mobile). Conteúdo central com `max-width: 1200px`, gutters 24px.
- **Breakpoints**: 1280/1024/768/480. Em <=768, filtros viram drawer e tabelas viram cartões.
- **Tokens**: fundo `#F7F8FA`, superfície `#FFFFFF`, texto `#111827`, borda `#E5E7EB`, primária `#2563EB`, sucesso `#16A34A`, erro `#DC2626`.
- **Tipografia**: H1 24/32, H2 18/28, body 14/22, caption 12/18.
- **Botões**: primário (filled), secundário (outline), danger; estados hover (escurecer 6%), disabled (opacidade 50%).
- **Links**: sublinhado no hover; foco com outline visível.
- **Segurança/privacidade**: ocultar detalhes sensíveis (ex.: caminho no storage); mensagens de erro sempre genéricas com “ver detalhes” apenas para admin.

---

## 1) Central de Relatórios
### Meta information
- Title: "Relatórios | SISGERP"
- Description: "Gerar e exportar relatórios com filtros e download seguro."
- OG: `og:title`, `og:description`, `og:type=website`

### Estrutura da página
- **Page Structure**: header fixo + conteúdo em duas colunas (desktop): esquerda “Catálogo”, direita “Parâmetros e Execuções”.
- **Layout**: `display: grid; grid-template-columns: 360px 1fr; gap: 24px;`

### Seções & componentes
1. **Topbar + Breadcrumbs**
   - Breadcrumb: Início / Relatórios
   - Ações: botão “Agendamentos”, botão “Atualizar status”.
2. **Catálogo por categoria (coluna esquerda)**
   - Campo de busca (texto).
   - Lista por categoria (accordion): nome + contagem.
   - Item de relatório: título + descrição curta; clique seleciona `reportKey`.
3. **Painel de filtros (coluna direita, topo)**
   - Período: date-range (início/fim) + presets (hoje, 7d, mês atual, mês anterior).
   - Categoria: readonly (da seleção) com opção trocar.
   - Toggle “Usar cache (se disponível)”.
4. **Exportação**
   - Seletor de formato: segmented (PDF/XLSX/CSV).
   - Botão primário “Gerar relatório”.
   - Nota de UX: ao clicar, abrir toast “Job criado” + adicionar na lista de execuções.
5. **Execuções recentes**
   - Tabela: Data, Relatório, Período, Formato, Status (badge), Ações.
   - Ações: “Ver detalhe”, “Baixar” (apenas READY), “Tentar novamente” (apenas FAILED e permitido).
   - Estados: empty, loading skeleton, erro com retry.

---

## 2) Agendamentos de Relatórios
### Meta information
- Title: "Agendamentos de Relatórios | SISGERP"
- Description: "Criar e gerenciar agendamentos recorrentes de relatórios."

### Estrutura da página
- **Page Structure**: lista + drawer/modal de criação/edição.
- **Layout**: lista em tabela (desktop) com toolbar; em mobile vira cartões.

### Seções & componentes
1. **Toolbar**
   - Botão “Novo agendamento”.
   - Filtros rápidos: status (ativos/pausados), categoria.
2. **Lista de agendamentos**
   - Colunas: Nome, Relatório/Categoria, Formato, Recorrência, Próxima execução, Status, Ações.
   - Ações: editar, pausar/retomar, excluir (com confirmação).
3. **Modal/Drawer: Novo/Editar**
   - Campos: Nome, Categoria, Relatório, Formato (PDF/XLSX/CSV).
   - Recorrência: seletor (diário/semanal/mensal) + horário; exibir resumo humano (“Toda segunda às 08:00”).
   - Parâmetro de período: “Executar sobre” (ex.: último dia/última semana/último mês) e/ou regra baseada na data de execução.
   - CTA: Salvar; secundário: Cancelar.
4. **Histórico resumido (inline)**
   - Linha expansível: últimas 5 execuções com status e link para detalhe.

---

## 3) Execução / Detalhe do Relatório
### Meta information
- Title: "Detalhe da Execução | SISGERP"
- Description: "Acompanhar status, parâmetros e baixar o arquivo gerado."

### Estrutura da página
- **Page Structure**: resumo em cards + área de eventos/logs + ações fixas.
- **Layout**: grid 2 colunas (desktop), empilhado no mobile.

### Seções & componentes
1. **Header**
   - Título: “Execução #<id curto>” + badge de status.
   - Botões: “Baixar” (READY), “Reprocessar” (permissão), “Voltar”.
2. **Card: Parâmetros**
   - Relatório, Categoria, Período, Formato, Solicitante, “Usou cache: sim/não”.
3. **Card: Linha do tempo**
   - queued_at → started_at → finished_at; exibir duração.
4. **Card: Resultado**
   - Tamanho do arquivo, validade do link (expiração), aviso “Link expira em X min”.
5. **Área: Mensagens/erros**
   - Para usuário: mensagem curta e segura.
   - Para admin: seção “Detalhes técnicos” com erro sanitizado e correlação (jobId).
