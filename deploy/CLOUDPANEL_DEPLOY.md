# Deploy do SISGERP na VPS (CloudPanel)

Este guia instala e publica o SISGERP (Next.js) na VPS usando CloudPanel (Hostinger).

## Como usar este guia

Você pode fazer o deploy de 3 formas:

- **UI do CloudPanel + Terminal (recomendado)**: configura o site no CloudPanel e faz build/ajustes por SSH quando necessário.
- **Somente Terminal**: siga [CLOUDPANEL_DEPLOY_TERMINAL.md](file:///c:/Users/rayhe/OneDrive/%C3%81rea%20de%20Trabalho/projetos/sisgerp/deploy/CLOUDPANEL_DEPLOY_TERMINAL.md).
- **UI completa (Git/Build/Start)**: se o seu CloudPanel tiver esses campos visíveis no site Node.js.

## Pré-requisitos

- Um domínio (ou subdomínio) apontado para o IP da VPS (registro A/AAAA).
- Acesso ao CloudPanel.
- Projeto Supabase configurado e com migrations aplicadas.

## 1) Criar o Site (Node.js) no CloudPanel

1. CloudPanel → **Sites** → **Add Site**.
2. Selecione **Node.js**.
3. Preencha:
   - **Domain**: `seu-dominio.com` (ou `app.seu-dominio.com`)
   - **Node.js Version**: recomendo 20.x (ou 18+)
4. Conclua a criação do site.

## 2) Configurar SSL (Let’s Encrypt)

1. Abra o site criado.
2. Vá em **SSL/TLS** (ou **Let’s Encrypt**).
3. Emita o certificado para o domínio e habilite HTTPS.

## 3) Configurar variáveis de ambiente (obrigatório)

1. Abra o site Node.js criado no CloudPanel.
2. Entre em **App / Node.js** (ou **Settings**) e localize a seção **Environment Variables**.
3. Clique em **Add Variable** e cadastre as variáveis abaixo (1 por linha).

- `NODE_ENV=production`
- `NEXT_TELEMETRY_DISABLED=1`
- `NEXT_PUBLIC_SUPABASE_URL=...`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY=...`
- `SUPABASE_SERVICE_ROLE_KEY=...`
- `CRON_SECRET=...`

4. Salve/aplique as alterações.

Onde pegar cada valor (Supabase):
- `NEXT_PUBLIC_SUPABASE_URL`: Supabase → **Settings → API → Project URL**
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase → **Settings → API → Project API keys → anon public**
- `SUPABASE_SERVICE_ROLE_KEY`: Supabase → **Settings → API → Project API keys → service_role**

Como gerar o `CRON_SECRET` (recomendado):
- Use um valor longo/aleatório (32+ bytes em hex). Exemplo (no terminal local):
  ```bash
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  ```

Notas importantes:
- `NEXT_PUBLIC_*` é necessário para o login (front-end).
- Defina as env vars **antes do build**, porque `NEXT_PUBLIC_*` é embutido durante `npm run build`.
- Nunca armazene segredos no GitHub. Use somente o CloudPanel.
- Depois que salvar env vars, reinicie o app (quando ele já existir) para garantir que elas foram carregadas.
- Se o seu CloudPanel não tiver campo de Environment Variables, use `.env.local` no servidor (veja [CLOUDPANEL_DEPLOY_TERMINAL.md](file:///c:/Users/rayhe/OneDrive/%C3%81rea%20de%20Trabalho/projetos/sisgerp/deploy/CLOUDPANEL_DEPLOY_TERMINAL.md)).

## 4) Fazer deploy do código via Git (recomendado)

1. No site Node.js, abra **Git** (ou **Deployment → Git**).
2. Preencha:
   - **Repository URL**: `https://github.com/rayhenrique/sisgerpnew.git`
   - **Branch**: `main`
3. Autenticação:
   - Se o repositório for **público**, normalmente basta salvar e continuar.
   - Se o repositório for **privado**, você terá que escolher uma das opções do CloudPanel:
     - **Personal Access Token (GitHub)**, ou
     - **Deploy Key (SSH)** (o CloudPanel mostra a chave pública; você adiciona em GitHub → Settings → Deploy keys).
4. Clique em **Save**.
5. Clique em **Pull/Deploy** (ou “Clone repository”). Aguarde finalizar sem erros.

Checklist rápido:
- Verifique que o CloudPanel mostra o último commit/branch corretamente.
- Se houver erro de permissão (403/401), ajuste token/deploy key e tente de novo.
- Se você não encontrar a seção Git na UI, faça clone/pull via SSH (veja [CLOUDPANEL_DEPLOY_TERMINAL.md](file:///c:/Users/rayhe/OneDrive/%C3%81rea%20de%20Trabalho/projetos/sisgerp/deploy/CLOUDPANEL_DEPLOY_TERMINAL.md)).

## 5) Instalar dependências e gerar build de produção

Há 2 formas comuns no CloudPanel. Use a que existir no seu painel:

### Opção A) Build Command (recomendado)
1. No site Node.js, localize o campo **Build Command**.
2. Cole:

```bash
npm ci
npm run build
```

Importante (standalone + assets):
- Ao usar `output: "standalone"`, você precisa copiar `.next/static` e `public` para dentro do bundle standalone, senão `/_next/static/*` pode retornar 404.
- Execute após o build:

```bash
mkdir -p .next/standalone/.next
rm -rf .next/standalone/.next/static
cp -R .next/static .next/standalone/.next/static
rm -rf .next/standalone/public
cp -R public .next/standalone/public
```

3. Salve.
4. Rode o build pelo botão do CloudPanel (ex.: **Build/Deploy**, **Run Build**, ou o próprio deploy do Git que executa o build).

### Opção B) Terminal do CloudPanel (manual)
1. Abra o **Terminal** do site (ou SSH na VPS).
2. Entre na pasta do repositório (o CloudPanel normalmente deixa o caminho visível na tela do site).
3. Rode:
```bash
npm ci
npm run build
```

Dica (permissões):
- Prefira rodar build/cópias como o **usuário do site** (não como root), para evitar permissão quebrada em `.next/standalone`.

Rebuild quando mudar `NEXT_PUBLIC_SUPABASE_URL` ou `NEXT_PUBLIC_SUPABASE_ANON_KEY`:

```bash
rm -rf .next
npm run build
mkdir -p .next/standalone/.next
rm -rf .next/standalone/.next/static
cp -R .next/static .next/standalone/.next/static
rm -rf .next/standalone/public
cp -R public .next/standalone/public
```

## 6) Start Command (como iniciar o app)

Este projeto usa `output: "standalone"`, então o comando recomendado é:

```bash
node server.js
```

No CloudPanel, defina:
- **App Root / Working Directory**: a pasta `.next/standalone` (onde fica o `server.js`)
- **Start Command**: `node server.js`

Depois, reinicie o app pelo CloudPanel.

## 7) Verificação (rápida)

1. Healthcheck:
   - `https://seu-dominio.com/api/health`
   - Deve retornar `ok: true`
2. Abra `https://seu-dominio.com/login` e teste autenticação.
3. Verificação dos assets (CSS/JS):
   - Abra no navegador `https://seu-dominio.com/`
   - Se a página abrir “sem estilo”, teste o CSS:
     ```bash
     curl -I https://seu-dominio.com/_next/static/css/<arquivo>.css
     ```
     O correto é retornar `200` com `content-type: text/css`.

Se `ok: false` no healthcheck, revise as env vars do CloudPanel.

## 8) Agendar backups (cron) dentro do CloudPanel

O CloudPanel permite criar cron jobs por site/usuário.

1. CloudPanel → **Cron Jobs**.
2. Crie estes jobs (ajuste o domínio):

Executar schedules (a cada hora):
```bash
curl -fsS -X POST -H "Authorization: Bearer $CRON_SECRET" https://seu-dominio.com/api/backup/cron/execute-schedules
```

Aplicar retenção (diário, 02:00):
```bash
curl -fsS -X POST -H "Authorization: Bearer $CRON_SECRET" https://seu-dominio.com/api/backup/cron/apply-retention
```

Notas:
- Use o `CRON_SECRET` definido nas env vars do CloudPanel.
- Se o CloudPanel não expandir `$CRON_SECRET` no cron, troque por um valor fixo (sem aspas) no comando.

## 9) Problemas comuns

### “Missing environment variable: NEXT_PUBLIC_SUPABASE_URL”
- As env vars não estão definidas no CloudPanel, ou o build foi feito sem elas.
- Solução: configurar env vars → apagar `.next` → rodar `npm run build` novamente.

### CSS/JS 404 em `/_next/static/*` (página sem estilo)
- Causa: bundle `standalone` sem assets.
- Solução: após `npm run build`, copie os assets:
  ```bash
  mkdir -p .next/standalone/.next
  rm -rf .next/standalone/.next/static
  cp -R .next/static .next/standalone/.next/static
  rm -rf .next/standalone/public
  cp -R public .next/standalone/public
  ```

### systemd `status=200/CHDIR`
- Causa: `WorkingDirectory` incorreto ou inexistente.
- Solução: `WorkingDirectory` deve apontar para `.next/standalone` e o start para `node server.js`.

### Permissões quebradas (rodou como root)
- Sintoma: serviço roda como usuário do site e não consegue acessar `.next/standalone`.
- Solução: `chown` no diretório do app (principalmente `.next/standalone`) para o usuário do site.

## 10) Atualizar o sistema (quando fizer push no GitHub)

Se o CloudPanel estiver usando Git pela UI, rode um **Pull/Deploy** e depois execute o build (se configurado).

Se você atualiza via SSH, use este checklist:

1. `git pull` no diretório do app
2. `npm ci`
3. `npm run build`
4. Copiar assets para o bundle standalone (`.next/static` e `public`)
5. Reiniciar o app

Exemplo (SSH):

```bash
cd /caminho/do/seu/app
git pull origin main
npm ci
npm run build
mkdir -p .next/standalone/.next
rm -rf .next/standalone/.next/static
cp -R .next/static .next/standalone/.next/static
rm -rf .next/standalone/public
cp -R public .next/standalone/public
sudo systemctl restart sisgerp
```

Validação:

```bash
curl -fsS http://127.0.0.1:3000/api/health
```

### Porta/Proxy
- No CloudPanel, normalmente o proxy reverso é automático para Node.js sites.
- Evite customizar porta manualmente, a menos que o CloudPanel exija.

### CSP “unsafe-eval” no console
- Em desenvolvimento (`npm run dev`) isso pode acontecer por conta do Webpack/React Refresh.
- Em produção (standalone) não deve ocorrer. Se ocorrer, verifique se você não está rodando `npm run dev` por engano.

