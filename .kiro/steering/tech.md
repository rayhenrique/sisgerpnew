---
inclusion: always
---

# Technology Stack

## Core Technologies

- **Framework**: Next.js 16 (App Router)
- **Runtime**: React 19 + TypeScript 5
- **Database**: Supabase (PostgreSQL)
- **Styling**: Tailwind CSS 4
- **UI Components**: shadcn/ui + Radix UI primitives
- **Icons**: Lucide React
- **Forms**: React Hook Form + Zod validation
- **Tables**: TanStack Table
- **Charts**: Recharts
- **Animation**: Framer Motion

## Key Libraries

- `@supabase/supabase-js` - Database client
- `pdf-lib` - PDF generation
- `xlsx` - Excel file generation
- `zod` - Schema validation
- `class-variance-authority` + `clsx` + `tailwind-merge` - Styling utilities

## Development Tools

- **Testing**: Vitest with coverage (80% threshold)
- **Linting**: ESLint 9
- **Package Manager**: npm

## Common Commands

```bash
# Development
npm run dev              # Start dev server with webpack

# Build & Deploy
npm run build            # Production build
npm start                # Start production server

# Testing
npm test                 # Run tests once
npm run test:coverage    # Run tests with coverage report

# Code Quality
npm run lint             # Run ESLint
```

## Environment Variables

Required in `.env.local`:
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anon key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key (server-side only)

## Database

- Migrations in `supabase/migrations/`
- Use Supabase service role client for admin operations
- Use authenticated client for user operations
- RLS (Row Level Security) policies enforce access control
