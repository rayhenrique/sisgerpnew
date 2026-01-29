# Deploy do SISGERP na VPS (CloudPanel) — Somente Terminal

Este passo a passo assume que você já criou o domínio no CloudPanel (Site Node.js) e ele já aponta para o IP da VPS.

## 0) Descobrir o diretório raiz do site

No CloudPanel, ao abrir o domínio, a tela **Definições** mostra o campo **Diretório raiz**. Esse é o caminho base do seu site. Exemplo típico:

```bash
/home/USUARIO_DO_SITE/htdocs/SEU_DOMINIO
```

Neste guia vou chamar esse caminho de:

```bash
SITE_ROOT="/home/USUARIO_DO_SITE/htdocs/SEU_DOMINIO"
```

Substitua `USUARIO_DO_SITE` e `SEU_DOMINIO` pelos seus valores.

## 1) Conectar por SSH

Conecte na VPS via SSH (use o usuário que você preferir, idealmente não-root):

```bash
ssh root@IP_DA_VPS
```

Se você usar o usuário do site (criado pelo CloudPanel), ele aparece no CloudPanel na tela do domínio.

Recomendação:
- Use `root` apenas para instalar pacotes e mexer em `/etc/systemd/...`.
- Para `git`, `npm ci`, `npm run build` e cópias dentro do app, use o **usuário do site** (ex.: `sisgerp-olhodagua`) para evitar problemas de permissão.

## 2) Garantir dependências (git + node)

No Ubuntu/Debian, como root:

```bash
apt update
apt install -y git ca-certificates curl
```

Verifique Node.js:

```bash
node -v || true
npm -v || true
```

Se não existir Node.js (ou for muito antigo), instale Node 20:

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs
node -v
npm -v
```

## 3) Baixar o projeto do GitHub (clone)

Defina o caminho do site (ajuste para o seu caso):

```bash
SITE_ROOT="/home/USUARIO_DO_SITE/htdocs/SEU_DOMINIO"
```

Você tem 2 opções de instalação:

### Opção A) Instalar direto na raiz do site (SITE_ROOT)
Use se o `SITE_ROOT` estiver vazio ou se você sabe exatamente o que está substituindo.

1. Entre no diretório raiz:

```bash
mkdir -p "$SITE_ROOT"
cd "$SITE_ROOT"

```

2. Clone o repositório na pasta atual (observação: o diretório precisa estar vazio):

```bash
git clone https://github.com/rayhenrique/sisgerpnew.git .
git checkout main
```

Depois disso, considere:

```bash
APP_DIR="$SITE_ROOT"
```

### Opção B) Instalar em uma subpasta (SITE_ROOT/repo)
Use se você quer manter o `SITE_ROOT` “limpo” e separar código/arquivos.

```bash
mkdir -p "$SITE_ROOT"
cd "$SITE_ROOT"
git clone https://github.com/rayhenrique/sisgerpnew.git repo
cd repo
git checkout main
```

Depois disso, considere:

```bash
APP_DIR="$SITE_ROOT/repo"
```

Atualizações futuras (quando já existir):

```bash
cd "$APP_DIR"
git pull origin main
```

## 4) Configurar variáveis de ambiente (arquivo .env.local)

No mesmo diretório do `package.json`, crie o `.env.local`:

```bash
cd "$APP_DIR"
nano .env.local
```

Conteúdo mínimo (preencha com seus dados do Supabase):

```env
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1

NEXT_PUBLIC_SUPABASE_URL=https://SEU-PROJETO.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=SUA_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=SUA_SERVICE_ROLE_KEY

CRON_SECRET=SEU_CRON_SECRET
```

Notas:
- `NEXT_PUBLIC_*` é obrigatório para o login.
- `SUPABASE_SERVICE_ROLE_KEY` é segredo sensível (não compartilhe / não faça commit).

## 5) Instalar dependências e fazer build (produção)

Dentro do app:

```bash
cd "$APP_DIR"
npm ci
npm run build
```

### 5.1 Preparar o bundle standalone (IMPORTANTE)

Quando você inicia com `node .next/standalone/server.js`, o Next espera encontrar os assets em:

```bash
.next/standalone/.next/static
```

Por isso, após o build, copie os assets para dentro do bundle standalone:

```bash
cd "$APP_DIR"
mkdir -p .next/standalone/.next
rm -rf .next/standalone/.next/static
cp -R .next/static .next/standalone/.next/static

rm -rf .next/standalone/public
cp -R public .next/standalone/public
```

Se você executar esse passo como `root`, corrija as permissões do standalone:

```bash
chown -R USUARIO_DO_SITE:USUARIO_DO_SITE "$APP_DIR/.next/standalone"
```

Se você mudar `NEXT_PUBLIC_SUPABASE_URL` ou `NEXT_PUBLIC_SUPABASE_ANON_KEY` depois, faça rebuild:

```bash
cd "$APP_DIR"
rm -rf .next
npm run build
mkdir -p .next/standalone/.next
rm -rf .next/standalone/.next/static
cp -R .next/static .next/standalone/.next/static
rm -rf .next/standalone/public
cp -R public .next/standalone/public
```

## 6) Subir o app como serviço (systemd)

O CloudPanel normalmente faz o proxy reverso para a porta do app (frequentemente 3000). Vamos rodar o Next standalone em `127.0.0.1:3000`.

### 6.1 Criar unit do systemd

Como root, crie:

```bash
nano /etc/systemd/system/sisgerp.service
```

Conteúdo (ajuste `SITE_ROOT` no WorkingDirectory e o User):

```ini
[Unit]
Description=SISGERP (Next.js)
After=network.target

[Service]
Type=simple
WorkingDirectory=/home/USUARIO_DO_SITE/htdocs/SEU_DOMINIO/.next/standalone
EnvironmentFile=/home/USUARIO_DO_SITE/htdocs/SEU_DOMINIO/.env.local
ExecStart=/usr/bin/node server.js
Restart=always
RestartSec=3
TimeoutStopSec=20
KillSignal=SIGINT
User=USUARIO_DO_SITE
Group=USUARIO_DO_SITE

[Install]
WantedBy=multi-user.target
```

Ative e inicie:

```bash
systemctl daemon-reload
systemctl enable sisgerp
systemctl restart sisgerp
systemctl status sisgerp --no-pager
```

Logs:

```bash
journalctl -u sisgerp -n 200 --no-pager
```

### 6.2 Se a porta 3000 estiver ocupada

Verifique:

```bash
ss -ltnp | grep ':3000' || true
```

Se precisar trocar a porta, você tem 2 opções:
- Ajustar o proxy/porta no CloudPanel (UI), ou
- Rodar em outra porta e adaptar o vhost do CloudPanel (mais avançado).

## 7) Testes rápidos (terminal)

### 7.1 Testar o app localmente na VPS

```bash
curl -fsS http://127.0.0.1:3000/api/health
```

### 7.2 Testar se CSS/JS estão servindo (evita “página sem estilo”)

```bash
CSS_PATH=$(curl -fsS http://127.0.0.1:3000/ | grep -oE '/_next/static/css/[^"]+\\.css' | head -n 1)
echo "$CSS_PATH"
curl -I "http://127.0.0.1:3000$CSS_PATH"
```

### 7.2 Testar pelo domínio (HTTPS)

```bash
curl -fsS https://SEU_DOMINIO/api/health
```

Se falhar no domínio mas funcionar no localhost, o problema está no proxy/vhost do CloudPanel.

## 8) Atualizar o sistema (deploy de nova versão)

Checklist rápido antes:
- Garanta que você está no diretório do app (onde existe `package.json`).
- Faça os comandos como o **usuário do site** para evitar permissões quebradas.

### 8.1 Atualização padrão (recomendado)

Como usuário do site:

```bash
cd "$APP_DIR"
git pull origin main
npm ci
npm run build
mkdir -p .next/standalone/.next
rm -rf .next/standalone/.next/static
cp -R .next/static .next/standalone/.next/static
rm -rf .next/standalone/public
cp -R public .next/standalone/public
```

Como root, reinicie o serviço:

```bash
systemctl restart sisgerp
systemctl status sisgerp --no-pager
```

### 8.2 Comando único (para copiar/colar)

```bash
sudo -u USUARIO_DO_SITE -H bash -lc '
cd /home/USUARIO_DO_SITE/htdocs/SEU_DOMINIO &&
git pull origin main &&
npm ci &&
npm run build &&
mkdir -p .next/standalone/.next &&
rm -rf .next/standalone/.next/static &&
cp -R .next/static .next/standalone/.next/static &&
rm -rf .next/standalone/public &&
cp -R public .next/standalone/public
' && sudo systemctl restart sisgerp && sudo systemctl status sisgerp --no-pager
```

### 8.3 Verificação pós-update

```bash
curl -fsS http://127.0.0.1:3000/api/health
CSS_PATH=$(curl -fsS http://127.0.0.1:3000/ | grep -oE '/_next/static/css/[^"]+\\.css' | head -n 1)
curl -I "http://127.0.0.1:3000$CSS_PATH"
```

## 9) Agendar cron (backups) via terminal

Se você preferir cron por terminal (em vez de UI do CloudPanel), crie um arquivo:

```bash
nano /etc/cron.d/sisgerp
```

Conteúdo (ajuste domínio):

```cron
SHELL=/bin/bash
PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
0 * * * * root curl -fsS -X POST -H "Authorization: Bearer SEU_CRON_SECRET" https://SEU_DOMINIO/api/backup/cron/execute-schedules >/var/log/sisgerp-cron-execute-schedules.log 2>&1
0 2 * * * root curl -fsS -X POST -H "Authorization: Bearer SEU_CRON_SECRET" https://SEU_DOMINIO/api/backup/cron/apply-retention >/var/log/sisgerp-cron-apply-retention.log 2>&1
```

Logs:

```bash
tail -n 200 /var/log/sisgerp-cron-execute-schedules.log || true
tail -n 200 /var/log/sisgerp-cron-apply-retention.log || true
```

## 10) Problemas comuns

### “Missing environment variable: NEXT_PUBLIC_SUPABASE_URL”
- `.env.local` não existe no servidor, está no lugar errado (fora do `repo`), ou o build foi feito sem as variáveis.
- Solução: criar/ajustar `.env.local` → apagar `.next` → `npm run build` → reiniciar serviço.

### CSS/JS 404 em `/_next/static/*` (página sem estilo)
- Causa: `standalone` sem assets copiados.
- Solução: executar o passo “5.1 Preparar o bundle standalone”.

### systemd `status=200/CHDIR`
- Causa: `WorkingDirectory` do serviço apontando para pasta inexistente.
- Solução: `WorkingDirectory` deve ser `.../.next/standalone` e o start `node server.js`.

### Build OK, mas site não abre no domínio
- Verifique se o app está de pé: `curl http://127.0.0.1:3000/api/health`
- Se OK no localhost, revise proxy/vhost no CloudPanel (porta do app).

