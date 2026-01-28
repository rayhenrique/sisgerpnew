## 1.Architecture design
```mermaid
graph TD
  A["User Browser"] --> B["React Frontend (SISGERP)"]
  B --> C["Supabase SDK"]
  C --> D["Supabase Auth"]
  C --> E["Supabase Database (PostgreSQL)"]
  C --> F["Supabase Storage (report-files)"]
  B --> G["Supabase Edge Functions (report-runner)"]
  H["Supabase Cron Trigger"] --> G
  G --> E
  G --> F

  subgraph "Frontend Layer"
    B
  end

  subgraph "Service Layer (Supabase)"
    D
    E
    F
    G
    H
  end
```

## 2.Technology Description
- Frontend: React@18 + TypeScript + vite + (UI do projeto)
- Backend: Supabase (Auth + PostgreSQL + Storage + Edge Functions)

## 3.Route definitions
| Route | Purpose |
|-------|---------|
| /relatorios | Central de relatórios (catálogo, filtros, exportações e downloads) |
| /relatorios/agendamentos | Gerir agendamentos recorrentes |
| /relatorios/execucoes/:id | Ver detalhes/status e baixar artefatos |

## 4.API definitions
### 4.1 Tipos principais (compartilhados)
```ts
type ReportFormat = 'PDF' | 'XLSX' | 'CSV'

type ReportJobStatus = 'QUEUED' | 'RUNNING' | 'READY' | 'FAILED'

type CreateReportJobRequest = {
  reportKey: string
  category: string
  periodStart: string // ISO
  periodEnd: string   // ISO
  format: ReportFormat
  useCache: boolean
}
```

### 4.2 Edge Functions
`POST /functions/v1/report-runner/create-job`
- Cria `report_jobs` com parâmetros e retorna `jobId`.

`POST /functions/v1/report-runner/run-job`
- Executa um job (chamado internamente/cron), gera arquivo, grava no Storage, atualiza status.

`POST /functions/v1/report-runner/cleanup-cache`
- Remove entradas expiradas de cache e arquivos órfãos (rotina periódica).

## 5.Server architecture diagram
```mermaid
graph TD
  A["Frontend"] --> B["Edge Function: create-job"]
  A --> C["Edge Function: run-job (on-demand)"]
  D["Cron Trigger"] --> C
  B --> E["DB: report_jobs"]
  C --> E
  C --> F["DB: report_cache"]
  C --> G["Storage: report-files"]

  subgraph "Server (Supabase Edge Functions)"
    B
    C
  end
```

## 6.Data model
### 6.1 Data model definition
```mermaid
erDiagram
  "auth.users" ||--o{ "report_schedules" : "owns"
  "auth.users" ||--o{ "report_jobs" : "requests"
  "report_schedules" ||--o{ "report_jobs" : "spawns"

  "report_schedules" {
    uuid id
    uuid user_id
    string name
    string report_key
    string category
    string format
    string cron
    boolean is_paused
    timestamptz next_run_at
    timestamptz created_at
  }

  "report_jobs" {
    uuid id
    uuid user_id
    uuid schedule_id
    string report_key
    string category
    date period_start
    date period_end
    string format
    string status
    string cache_key
    string storage_path
    string error_message
    timestamptz queued_at
    timestamptz started_at
    timestamptz finished_at
  }

  "report_cache" {
    uuid id
    string cache_key
    string storage_path
    timestamptz expires_at
    timestamptz created_at
  }
```

### 6.2 Data Definition Language
```sql
-- Tabela de agendamentos
CREATE TABLE report_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  report_key TEXT NOT NULL,
  category TEXT NOT NULL,
  format TEXT NOT NULL CHECK (format IN ('PDF','XLSX','CSV')),
  cron TEXT NOT NULL,
  is_paused BOOLEAN NOT NULL DEFAULT FALSE,
  next_run_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_report_schedules_user_id ON report_schedules(user_id);
CREATE INDEX idx_report_schedules_next_run ON report_schedules(next_run_at);

-- Execuções (jobs)
CREATE TABLE report_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  schedule_id UUID,
  report_key TEXT NOT NULL,
  category TEXT NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  format TEXT NOT NULL CHECK (format IN ('PDF','XLSX','CSV')),
  status TEXT NOT NULL CHECK (status IN ('QUEUED','RUNNING','READY','FAILED')),
  cache_key TEXT,
  storage_path TEXT,
  error_message TEXT,
  queued_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  finished_at TIMESTAMPTZ
);
CREATE INDEX idx_report_jobs_user_id ON report_jobs(user_id);
CREATE INDEX idx_report_jobs_status ON report_jobs(status);
CREATE INDEX idx_report_jobs_period ON report_jobs(period_start, period_end);
CREATE INDEX idx_report_jobs_cache_key ON report_jobs(cache_key);

-- Cache de relatórios (por hash dos parâmetros)
CREATE TABLE report_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cache_key TEXT UNIQUE NOT NULL,
  storage_path TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_report_cache_expires_at ON report_cache(expires_at);

-- Segurança (diretriz)
-- 1) Ativar RLS nas tabelas e criar policies por user_id (dono) e papel admin.
-- 2) Storage bucket "report-files" com acesso privado; downloads via URL assinada (expirável).
-- 3) Edge Functions validam sessão (JWT), checam permissões e sanitizam error_message.

-- Permissões (base)
GRANT ALL PRIVILEGES ON report_schedules TO authenticated;
GRANT ALL PRIVILEGES ON report_jobs TO authenticated;
GRANT ALL PRIVILEGES ON report_cache