# SISGERP - Sistema de Gestão de Recursos Públicos

SISGERP is a comprehensive municipal public financial management system designed for Brazilian municipalities. It provides tools for managing revenues, expenses, categories, reports, user administration, and database backups.

## Overview

SISGERP helps municipal governments manage their financial operations with features including:
- Revenue and expense tracking
- Hierarchical category management
- Financial reporting with multiple export formats
- User administration with role-based access control
- Automated database backups and restoration
- Audit logging for compliance
- Multi-tenant architecture for multiple municipalities

## Technology Stack

### Core Technologies
- **Framework**: Next.js 16 (App Router)
- **Runtime**: React 19 + TypeScript 5
- **Database**: Supabase (PostgreSQL)
- **Storage**: Supabase Storage
- **Styling**: Tailwind CSS 4
- **UI Components**: shadcn/ui + Radix UI primitives
- **Icons**: Lucide React

### Key Libraries
- `@supabase/supabase-js` - Database client
- `pdf-lib` - PDF generation
- `xlsx` - Excel file generation
- `zod` - Schema validation
- `recharts` - Data visualization
- `react-hook-form` - Form management
- `@tanstack/react-table` - Data tables

### Development Tools
- **Testing**: Vitest with 80% coverage threshold
- **Linting**: ESLint 9
- **Package Manager**: npm

## Features

### 1. Dashboard
- Financial overview with period-based metrics
- Revenue and expense summaries
- Visual charts and graphs
- Customizable date ranges

### 2. Receitas (Revenues)
- Revenue transaction management
- Category assignment
- Date and amount tracking
- Search and filtering

### 3. Despesas (Expenses)
- Expense transaction management
- Expense classification system
- Category assignment
- Detailed tracking and reporting

### 4. Categorias (Categories)
- Hierarchical category tree structure
- Four levels: fonte → bloco → grupo → ação
- Category creation and management
- Tree visualization

### 5. Classificação de Despesas
- Expense classification management
- Active/inactive status control
- Classification assignment to expenses

### 6. Relatórios (Reports)
- Multiple report types (Receitas, Despesas, Balanço)
- Export formats: PDF, XLSX, CSV
- Report scheduling and automation
- Report caching for performance
- Execution history tracking
- Parameter customization

### 7. Backup Module
- **Manual Backups**: Create full or selective database backups
- **Scheduled Backups**: Automate backups with daily/weekly/monthly schedules
- **Data Restoration**: Restore from backups with safety confirmations
- **Retention Policies**: Automatic cleanup of old backups
- **Download**: Export backup files for external storage
- **Validation**: Integrity checks for backup files
- **Multi-tenant**: Organization-scoped backup isolation

See [BACKUP_MODULE.md](BACKUP_MODULE.md) for complete backup documentation.

### 8. Admin/Usuários
- User management interface
- Role assignment (superadmin, admin, user)
- User creation, editing, and deletion
- Profile management
- Organization assignment

### 9. Auditoria (Audit Logs)
- Complete audit trail of system operations
- User action tracking
- Timestamp and details logging
- Compliance reporting

### 10. Configurações (Settings)
- System configuration management
- Organization settings
- User preferences

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account and project
- Git

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd sisgerp
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:

Copy `.env.example` to `.env.local` and fill the values:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
CRON_SECRET=your_cron_secret
```

Notes:
- `npm start` runs in production mode and requires `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` to be set, otherwise login will fail.
- `NEXT_PUBLIC_*` variables are embedded during `npm run build`. If you change them, delete `.next/` and rebuild.
- Never commit `.env.local` (it contains secrets).

4. Apply database migrations:
```bash
# Using Supabase CLI
supabase db push

# Or manually through Supabase Dashboard SQL Editor
# Run files in supabase/migrations/ in order
```

5. Start the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Production

### Local production test
```bash
npm run build
node .next/standalone/server.js
```

### VPS/CloudPanel
- Set environment variables in your platform (CloudPanel Environment Variables), do not store secrets in the repository.
- Build command: `npm ci && npm run build`
- Start command: `npm start` (or `node server.js` if using the standalone output)

### Database Setup

The project includes migration files in `supabase/migrations/`:
- `0001_init_sisgerp.sql` - Initial schema
- `0002_seed_mysql_reference.sql` - Reference data
- `0003_auth_audit_profiles.sql` - Authentication and audit
- `0004_profiles_add_superadmin.sql` - Superadmin role
- `0005_rbac_audit_policies.sql` - RBAC policies
- `0006_promote_rayhenrique_superadmin.sql` - Initial superadmin
- `0007_expense_classifications_constraints.sql` - Expense classifications
- `0008_expense_classifications_active_guard_fix.sql` - Classification fixes
- `0009_categories_constraints.sql` - Category constraints
- `0010_reports_module.sql` - Reports module
- `0011_reports_module_params.sql` - Report parameters
- `0012_reports_permissions.sql` - Report permissions
- `0013_backup_module.sql` - Backup module

Apply migrations in order using Supabase CLI or Dashboard.

## Project Structure

```
sisgerp/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (app)/             # Authenticated routes
│   │   │   ├── dashboard/     # Dashboard page
│   │   │   ├── receitas/      # Revenues page
│   │   │   ├── despesas/      # Expenses page
│   │   │   ├── categorias/    # Categories page
│   │   │   ├── relatorios/    # Reports pages
│   │   │   ├── backup/        # Backup page
│   │   │   ├── admin/         # Admin pages
│   │   │   └── configuracoes/ # Settings page
│   │   ├── api/               # API routes
│   │   │   ├── admin/         # Admin APIs
│   │   │   ├── dashboard/     # Dashboard APIs
│   │   │   ├── reports/       # Reports APIs
│   │   │   └── backup/        # Backup APIs
│   │   ├── login/             # Login page
│   │   └── layout.tsx         # Root layout
│   ├── components/
│   │   ├── app/               # App-level components
│   │   └── ui/                # shadcn/ui components
│   ├── features/              # Feature modules
│   │   ├── adminUsers/        # User management
│   │   ├── auth/              # Authentication
│   │   ├── backup/            # Backup module
│   │   ├── categories/        # Categories
│   │   ├── dashboard/         # Dashboard
│   │   ├── expenses/          # Expenses
│   │   ├── reports/           # Reports
│   │   ├── revenues/          # Revenues
│   │   └── settings/          # Settings
│   ├── lib/
│   │   ├── supabase/          # Supabase clients
│   │   └── utils.ts           # Utilities
│   └── server/                # Server-side logic
│       ├── admin/             # Admin services
│       ├── backup/            # Backup services
│       └── reports/           # Report services
├── supabase/
│   └── migrations/            # Database migrations
├── public/                    # Static assets
├── .kiro/                     # Kiro specs and steering
├── scripts/                   # Utility scripts
└── package.json
```

## Development

### Running Tests

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test src/features/backup/api.test.ts
```

### Linting

```bash
npm run lint
```

### Building for Production

```bash
npm run build
npm start
```

## Deployment

### Vercel (Recommended)

1. Connect your repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Cron Jobs Setup

For automated backups and reports, configure cron jobs:

**Option 1: Vercel Cron**
Add to `vercel.json`:
```json
{
  "crons": [
    {
      "path": "/api/backup/cron/execute-schedules",
      "schedule": "0 * * * *"
    },
    {
      "path": "/api/backup/cron/apply-retention",
      "schedule": "0 2 * * *"
    }
  ]
}
```

**Option 2: External Cron Service**
Use services like cron-job.org or EasyCron to call the cron endpoints.

See [Backup Module Documentation](BACKUP_MODULE.md) for detailed cron setup.

## User Roles

### Superadmin
- Full system access
- User management
- All CRUD operations
- System configuration
- Backup and restore operations

### Admin
- Organization-level access
- User management within organization
- All CRUD operations for organization data
- Backup and restore operations
- Report generation

### User
- Read-only access to organization data
- View reports
- View backup history
- No administrative capabilities

## Multi-tenant Architecture

SISGERP supports multiple organizations (municipalities) with complete data isolation:
- Each organization has its own data
- Users belong to one organization
- RLS (Row Level Security) policies enforce isolation
- Backups are organization-scoped
- Reports are organization-scoped

## Security

### Authentication
- Supabase Auth for user authentication
- Email/password authentication
- Session management
- Secure token handling

### Authorization
- Role-based access control (RBAC)
- Row Level Security (RLS) policies
- Organization-scoped data access
- API route protection

### Audit Logging
- All sensitive operations logged
- User action tracking
- Timestamp and details
- Compliance support

## Documentation

- [Backup Module](BACKUP_MODULE.md) - Complete backup system documentation
- [Reports Module Upgrade](REPORTS_MODULE_UPGRADE.md) - Reports feature documentation
- [Migration Status](MIGRATION_STATUS.md) - Database migration status
- [Feature READMEs](src/features/) - Individual feature documentation

## Contributing

1. Create a feature branch
2. Make your changes
3. Write/update tests
4. Ensure tests pass and coverage meets threshold
5. Submit a pull request

## Testing Guidelines

- Maintain 80% code coverage
- Write unit tests for services and utilities
- Write integration tests for API routes
- Write E2E tests for critical flows
- Use Vitest for all testing

## Environment Variables

Required environment variables:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=        # Your Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=   # Supabase anonymous key
SUPABASE_SERVICE_ROLE_KEY=       # Supabase service role key (server-side only)

# Cron Jobs (optional, for automated tasks)
CRON_SECRET=                     # Secret for authenticating cron job requests
```

## Troubleshooting

### Database Connection Issues
- Verify Supabase credentials in `.env.local`
- Check Supabase project status
- Ensure migrations are applied

### Authentication Issues
- Clear browser cookies and local storage
- Verify Supabase Auth is enabled
- Check user exists in database

### Backup Issues
- See [Backup Module Troubleshooting](BACKUP_MODULE.md#troubleshooting)
- Verify Supabase Storage is configured
- Check user has admin/superadmin role

### Build Issues
- Clear `.next` directory: `rm -rf .next`
- Clear node_modules: `rm -rf node_modules && npm install`
- Check TypeScript errors: `npx tsc --noEmit`

## Support

For issues or questions:
1. Check the documentation
2. Review troubleshooting guides
3. Check audit logs for operation details
4. Contact system administrator

## License

[Add your license information here]

## Acknowledgments

Built with:
- [Next.js](https://nextjs.org/)
- [React](https://react.dev/)
- [Supabase](https://supabase.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)
