# Manual de Deploy e Operação — Instância Senador Rui Palmeira

Este documento traz a especificação exata e o procedimento operacional da instância **`senadorruipalmeira.sisgerp.com`** no CloudPanel / VPS.

---

## 📌 Especificação Técnica da Instância

| Parâmetro | Valor Configurado |
| :--- | :--- |
| **Subdomínio** | `senadorruipalmeira.sisgerp.com` |
| **IP do Servidor** | `72.60.142.2` |
| **Usuário Linux (VPS)** | `sisgerp-senadorruipalmeira` |
| **Diretório da Aplicação** | `/home/sisgerp-senadorruipalmeira/htdocs/senadorruipalmeira.sisgerp.com` |
| **Porta Interna (HTTP)** | `3027` |
| **Gerenciador de Processo** | PM2 (`ecosystem.config.js`) |
| **Nome no PM2** | `senadorruipalmeira` |
| **Serviço de Boot (Systemd)** | `pm2-sisgerp-senadorruipalmeira.service` |

---

## 🔑 1. Acesso SSH ao Servidor

Conecte-se à VPS pelo terminal:

```bash
ssh root@72.60.142.2
```

Alternar para o usuário da instância:
```bash
su sisgerp-senadorruipalmeira
cd ~/htdocs/senadorruipalmeira.sisgerp.com
```

---

## ⚙️ 2. Arquivo de Variáveis de Ambiente (`.env`)

O arquivo `.env` localizado na raiz do projeto (`~/htdocs/senadorruipalmeira.sisgerp.com/.env`) deve conter:

```env
NODE_ENV=production
PORT=3027
NEXT_TELEMETRY_DISABLED=1

NEXT_PUBLIC_SUPABASE_URL=https://hhexgsnmmshulyjbxqju.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 🚀 3. Configuração do PM2 (`ecosystem.config.js`)

Arquivo localizado em `~/htdocs/senadorruipalmeira.sisgerp.com/ecosystem.config.js`:

```javascript
module.exports = {
  apps: [
    {
      name: "senadorruipalmeira",
      script: "server.js",
      cwd: "./.next/standalone",
      instances: 1,
      exec_mode: "fork",
      env: {
        NODE_ENV: "production",
        PORT: 3027
      }
    }
  ]
};
```

---

## 🔄 4. Comando de Deploy / Atualização (Checklist Completo)

Para aplicar atualizações do repositório GitHub nesta instância, execute o comando abaixo como `sisgerp-senadorruipalmeira`:

```bash
cd ~/htdocs/senadorruipalmeira.sisgerp.com && \
git pull origin main && \
npm ci && \
npm run build && \
mkdir -p .next/standalone/.next && \
rm -rf .next/standalone/.next/static && \
cp -R .next/static .next/standalone/.next/static && \
rm -rf .next/standalone/public && \
cp -R public .next/standalone/public && \
pm2 restart senadorruipalmeira
```

---

## 📊 5. Comandos de Monitoramento e Diagnóstico

### Ver status da aplicação no PM2:
```bash
pm2 status
```

### Ver logs em tempo real:
```bash
pm2 logs senadorruipalmeira --lines 50
```

### Testar resposta local da API de Healthcheck (Porta 3027):
```bash
curl -I http://127.0.0.1:3027/api/health
```

### Verificar o serviço systemd de inicialização automática (boot):
```bash
systemctl status pm2-sisgerp-senadorruipalmeira
```

---

## 🔒 6. Configuração no CloudPanel (Painel Web)

1. Acesse o CloudPanel: `https://painel.sisgerp.com/`
2. Abra a configuração do site **`senadorruipalmeira.sisgerp.com`**.
3. Em **Reverse Proxy / Node.js**, certifique-se de que a porta de destino está configurada para **`3027`**.
4. Verifique se o **SSL (Let's Encrypt)** está ativo e renovado.
