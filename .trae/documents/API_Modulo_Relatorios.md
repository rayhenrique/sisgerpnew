# API — Módulo Relatórios

## Autenticação
- Todas as rotas exigem header `Authorization: Bearer <access_token>`.
- Respostas de erro seguem o formato `{ "message": "..." }`.

## Catálogo

### `GET /api/reports/catalog`
Retorna a lista de relatórios disponíveis.

**Resposta 200**
```json
{
  "items": [
    {
      "key": "transactions",
      "category": "Financeiro",
      "name": "Transações (Receitas e Despesas)",
      "description": "...",
      "supportsCategoryFilter": true
    }
  ]
}
```

## Jobs (execuções)

### `GET /api/reports/jobs?limit=20`
Lista as execuções recentes do usuário.

### `POST /api/reports/jobs`
Cria um job em estado `QUEUED`.

**Body**
```json
{
  "reportKey": "transactions",
  "category": "Financeiro",
  "periodStart": "2026-01-01",
  "periodEnd": "2026-01-31",
  "format": "PDF",
  "categoryId": null,
  "useCache": true
}
```

**Resposta 200**
```json
{ "job": { "id": "...", "status": "QUEUED" } }
```

### `GET /api/reports/jobs/:id`
Retorna detalhes de um job.

### `POST /api/reports/jobs/:id/run`
Processa o job (assíncrono pelo ponto de vista do usuário: status muda para `RUNNING` e depois `READY/FAILED`).

**Body (opcional)**
```json
{ "useCache": true, "categoryId": null }
```

### `GET /api/reports/jobs/:id/download`
Gera uma URL assinada (expirável) para download quando `status=READY`.

**Resposta 200**
```json
{ "url": "https://...", "expiresInSeconds": 300 }
```

## Agendamentos

### `GET /api/reports/schedules`
Lista agendamentos do usuário.

### `POST /api/reports/schedules`
Cria agendamento recorrente.

**Body**
```json
{
  "name": "Relatório semanal",
  "reportKey": "summary_by_category",
  "category": "Financeiro",
  "format": "XLSX",
  "useCache": true,
  "categoryId": null,
  "periodWindow": "last30d",
  "recurrence": "weekly",
  "time": "08:00",
  "weekday": 1
}
```

### `PATCH /api/reports/schedules/:id`
Atualiza campos do agendamento (inclui `isPaused`).

### `DELETE /api/reports/schedules/:id`
Exclui o agendamento.

### `POST /api/reports/schedules/:id/run`
Executa o agendamento imediatamente (gera um job e processa).

