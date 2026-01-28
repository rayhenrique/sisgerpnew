## Checagens de segurança (antes do Git)
1. Garantir que `.env.local` e quaisquer `.env*` não sejam versionados (contêm `SUPABASE_SERVICE_ROLE_KEY` e `NEXT_PUBLIC_SUPABASE_ANON_KEY`).
2. Criar um `.gitignore` na raiz (hoje só existe `web/.gitignore`) cobrindo pelo menos: `node_modules/`, `.next/`, `coverage/`, `.vercel/`, `.env*`, `*.tsbuildinfo` e artefatos de build.
3. Revisar pastas de artefatos/temporários (ex.: `coverage/`) e confirmar que ficarão fora do commit.

## Inicializar Git local
1. No diretório do projeto (`sisgerp`), executar `git init`.
2. Definir o branch principal como `main` (ex.: `git branch -M main`).
3. Fazer staging apenas do que é relevante (`git add -A` depois do `.gitignore` existir).
4. Criar o commit inicial (ex.: `git commit -m "chore: commit inicial do SISGERP"`).

## Criar/confirmar repositório no GitHub
1. Verificar se `https://github.com/rayhenrique/sisgerpnew` já existe (se estiver vazio, ok; se não existir, criar).
2. Criar via interface web (recomendado): novo repo `sisgerpnew`, escolher *private* ou *public*, e **não** inicializar com README/.gitignore (para evitar conflitos com o repositório local).

## Configurar remoto e fazer push
1. Configurar o remoto:
   - `git remote add origin https://github.com/rayhenrique/sisgerpnew.git`
2. Enviar o branch principal:
   - `git push -u origin main`

## Verificação pós-push
1. Abrir `https://github.com/rayhenrique/sisgerpnew` e confirmar que os arquivos aparecem.
2. Confirmar explicitamente que **não** foram enviados: `.env.local`, `node_modules`, `.next`, `coverage`.
3. Confirmar que o branch padrão é `main`.

## (Recomendação crítica)
- Como `SUPABASE_SERVICE_ROLE_KEY` está em `.env.local`, manter o repositório **privado** e, idealmente, rotacionar a service role key no Supabase antes/na sequência.