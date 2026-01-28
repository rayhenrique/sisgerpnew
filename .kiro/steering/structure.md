---
inclusion: always
---

# Project Structure

## Directory Organization

```
src/
├── app/                    # Next.js App Router
│   ├── (app)/             # Authenticated app routes
│   │   ├── dashboard/
│   │   ├── receitas/
│   │   ├── despesas/
│   │   ├── categorias/
│   │   ├── relatorios/
│   │   ├── admin/
│   │   └── layout.tsx     # App shell with AuthGate
│   ├── api/               # API routes
│   │   ├── admin/
│   │   ├── dashboard/
│   │   └── reports/
│   ├── login/
│   └── layout.tsx         # Root layout
├── components/
│   ├── app/               # App-level components (AppShell, PageShell, nav)
│   └── ui/                # shadcn/ui components
├── features/              # Feature modules (see below)
├── lib/
│   ├── supabase/          # Supabase client utilities
│   └── utils.ts           # Shared utilities (cn helper)
└── server/                # Server-side business logic
    ├── admin/             # Admin services (users, authz)
    └── reports/           # Reports module
        ├── controllers/   # Request handlers
        ├── models/        # Types and validation
        ├── services/      # Business logic
        └── views/         # Renderers (PDF, XLSX, CSV)
```

## Feature Module Pattern

Each feature in `src/features/` follows this structure:

```
features/{feature}/
├── {Feature}PageClient.tsx    # Main page component (client)
├── api.ts                     # API client functions
├── types.ts                   # TypeScript types
├── format.ts                  # Formatting utilities (optional)
├── validation.ts              # Zod schemas (optional)
└── components/                # Feature-specific components (optional)
```

Examples: `adminUsers/`, `reports/`, `expenses/`, `revenues/`, `categories/`

## Architectural Patterns

### Route Structure
- Pages in `app/(app)/` are server components by default
- Client interactivity extracted to `{Feature}PageClient.tsx` components
- API routes in `app/api/` follow REST conventions

### Data Flow
1. Page (Server Component) → renders PageClient
2. PageClient → calls feature API functions
3. Feature API → fetches from Next.js API routes with auth token
4. API route → calls server services
5. Server services → interact with Supabase

### Authentication
- `AuthGate` component wraps authenticated routes
- API calls include Bearer token from Supabase session
- Server uses service role client or authenticated client based on operation

### Testing
- Unit tests co-located with source: `{file}.test.ts`
- Focus on server-side logic in `src/server/`
- Coverage thresholds: 80% lines/functions/statements, 70% branches

## Import Aliases

Use `@/` for absolute imports from `src/`:
```typescript
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import type { ReportJob } from "@/features/reports/types";
```

## Naming Conventions

- Files: camelCase for utilities, PascalCase for components
- Components: PascalCase (e.g., `ReportDataTable.tsx`)
- Types: PascalCase interfaces/types
- Functions: camelCase
- Database tables: snake_case
- API routes: kebab-case folders
