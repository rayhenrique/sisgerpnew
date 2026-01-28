---
name: "sisgerp-best-practices"
displayName: "SISGERP Best Practices"
description: "Comprehensive coding standards, architecture patterns, and best practices for SISGERP municipal financial management system development."
keywords: ["sisgerp", "nextjs", "supabase", "typescript", "best-practices", "brazilian-finance"]
author: "SISGERP Team"
---

# SISGERP Best Practices

## Overview

This power provides comprehensive coding standards, architecture patterns, and best practices specifically for SISGERP - a municipal public financial management system for Brazilian municipalities. It covers Next.js 16 development patterns, Supabase integration, TypeScript conventions, and domain-specific practices for Brazilian public finance systems.

SISGERP manages revenues (receitas), expenses (despesas), hierarchical categories, and generates financial reports with scheduling and caching. This guide ensures consistency, maintainability, and compliance across the codebase.

## Core Principles

### 1. Feature-First Architecture
Organize code by feature modules, not by technical layers. Each feature should be self-contained with its own components, API clients, types, and utilities.

### 2. Server-First Rendering
Leverage Next.js App Router server components by default. Only use client components when necessary for interactivity.

### 3. Type Safety Everywhere
Use TypeScript strictly. No `any` types. Define explicit interfaces for all data structures, especially Supabase database schemas.

### 4. Brazilian Compliance
Follow Brazilian public finance regulations. All monetary values in BRL, dates in Brazilian format, and proper audit logging for compliance.

### 5. Test Coverage
Maintain 80% test coverage threshold. Focus on server-side business logic and critical user workflows.

## Project Structure Patterns

### Feature Module Pattern

Each feature follows this structure:

```
features/{feature}/
├── {Feature}PageClient.tsx    # Main client component
├── api.ts                     # API client functions
├── types.ts                   # TypeScript types
├── format.ts                  # Formatting utilities (optional)
├── validation.ts              # Zod schemas (optional)
└── components/                # Feature-specific components (optional)
```

**Example:**
```typescript
// features/expenses/types.ts
export interface Expense {
  id: string;
  description: string;
  amount: number;
  date: string;
  category_id: string;
  classification_id: string;
  organization_id: string;
}

// features/expenses/api.ts
export async function fetchExpenses(filters: ExpenseFilters): Promise<Expense[]> {
  const token = await getAuthToken();
  const response = await fetch('/api/expenses', {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.json();
}

// features/expenses/ExpensesPageClient.tsx
'use client';
export function ExpensesPageClient() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  // Component logic...
}
```

### API Route Pattern

API routes follow REST conventions and use server-side services:

```
app/api/{resource}/
├── route.ts              # GET, POST
└── [id]/
    └── route.ts          # GET, PUT, DELETE
```

**Example:**
```typescript
// app/api/expenses/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from('expenses')
    .select('*')
    .order('date', { ascending: false });
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  
  return NextResponse.json(data);
}
```

## TypeScript Best Practices

### 1. Explicit Return Types

Always specify return types for functions:

```typescript
// Good
async function calculateTotal(expenses: Expense[]): Promise<number> {
  return expenses.reduce((sum, exp) => sum + exp.amount, 0);
}

// Bad
async function calculateTotal(expenses: Expense[]) {
  return expenses.reduce((sum, exp) => sum + exp.amount, 0);
}
```

### 2. Interface Over Type

Use `interface` for object shapes, `type` for unions and complex types:

```typescript
// Good
interface User {
  id: string;
  name: string;
  role: UserRole;
}

type UserRole = 'superadmin' | 'admin' | 'user';

// Avoid
type User = {
  id: string;
  name: string;
  role: UserRole;
}
```

### 3. Strict Null Checks

Handle null/undefined explicitly:

```typescript
// Good
function getUserName(user: User | null): string {
  return user?.name ?? 'Unknown';
}

// Bad
function getUserName(user: User) {
  return user.name; // Assumes user is never null
}
```

## Supabase Integration Patterns

### 1. Client Selection

Use the appropriate Supabase client based on context:

```typescript
// Browser client (client components)
import { getSupabaseBrowserClient } from '@/lib/supabase/browser';
const supabase = getSupabaseBrowserClient();

// Server client (API routes, server components)
import { getSupabaseServerClient } from '@/lib/supabase/server';
const supabase = getSupabaseServerClient();
```

### 2. Row Level Security (RLS)

Always rely on RLS policies, never bypass them in application code:

```typescript
// Good - RLS enforces organization filtering
const { data } = await supabase
  .from('expenses')
  .select('*');

// Bad - Manual filtering bypasses RLS
const { data } = await supabase
  .from('expenses')
  .select('*')
  .eq('organization_id', orgId); // RLS should handle this
```

### 3. Error Handling

Always check for errors from Supabase operations:

```typescript
// Good
const { data, error } = await supabase
  .from('expenses')
  .insert(newExpense);

if (error) {
  console.error('Failed to insert expense:', error);
  throw new Error(`Database error: ${error.message}`);
}

return data;

// Bad
const { data } = await supabase
  .from('expenses')
  .insert(newExpense);

return data; // Ignores potential errors
```

## Brazilian Finance Domain Patterns

### 1. Monetary Values

Always use number type for amounts (stored as numeric in PostgreSQL):

```typescript
interface Transaction {
  amount: number; // In BRL cents or reais (be consistent)
  currency: 'BRL'; // Always BRL for Brazilian municipalities
}

// Format for display
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(amount);
}
```

### 2. Date Handling

Use ISO 8601 format for storage, Brazilian format for display:

```typescript
// Storage: ISO 8601
interface Expense {
  date: string; // "2026-01-18"
}

// Display: Brazilian format
function formatDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString('pt-BR'); // "18/01/2026"
}
```

### 3. Hierarchical Categories

Categories follow Brazilian public finance structure (fonte → bloco → grupo → ação):

```typescript
interface Category {
  id: string;
  name: string;
  parent_id: string | null;
  level: 'fonte' | 'bloco' | 'grupo' | 'acao';
  code: string; // e.g., "1.2.3.4"
}

// Build tree structure
function buildCategoryTree(categories: Category[]): CategoryNode[] {
  // Implementation...
}
```

## Testing Best Practices

### 1. Test File Location

Co-locate tests with source files using `.test.ts` suffix:

```
features/expenses/
├── utils.ts
├── utils.test.ts
├── validation.ts
└── validation.test.ts
```

### 2. Test Structure

Use descriptive test names and arrange-act-assert pattern:

```typescript
import { describe, it, expect } from 'vitest';
import { calculateTotal } from './utils';

describe('calculateTotal', () => {
  it('should sum all expense amounts correctly', () => {
    // Arrange
    const expenses = [
      { id: '1', amount: 100 },
      { id: '2', amount: 200 },
      { id: '3', amount: 300 }
    ];
    
    // Act
    const total = calculateTotal(expenses);
    
    // Assert
    expect(total).toBe(600);
  });
  
  it('should return 0 for empty array', () => {
    expect(calculateTotal([])).toBe(0);
  });
});
```

### 3. Coverage Thresholds

Maintain these minimum coverage thresholds (configured in vitest.config.ts):

- Lines: 80%
- Functions: 80%
- Statements: 80%
- Branches: 70%

Focus testing on:
- Server-side business logic (`src/server/`)
- Data transformations and calculations
- Validation logic
- Critical user workflows

## Component Patterns

### 1. Server vs Client Components

Default to server components, use client components only when needed:

```typescript
// Server component (default)
// app/(app)/expenses/page.tsx
export default async function ExpensesPage() {
  // Can fetch data directly
  const expenses = await fetchExpensesServer();
  
  return <ExpensesPageClient initialExpenses={expenses} />;
}

// Client component (when needed)
// features/expenses/ExpensesPageClient.tsx
'use client';
export function ExpensesPageClient({ initialExpenses }: Props) {
  const [expenses, setExpenses] = useState(initialExpenses);
  // Interactive logic...
}
```

### 2. Form Handling

Use React Hook Form with Zod validation:

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const expenseSchema = z.object({
  description: z.string().min(3, 'Mínimo 3 caracteres'),
  amount: z.number().positive('Valor deve ser positivo'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida')
});

type ExpenseFormData = z.infer<typeof expenseSchema>;

export function ExpenseForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<ExpenseFormData>({
    resolver: zodResolver(expenseSchema)
  });
  
  const onSubmit = async (data: ExpenseFormData) => {
    // Handle submission
  };
  
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* Form fields */}
    </form>
  );
}
```

### 3. Loading States

Always provide loading states for async operations:

```typescript
'use client';
export function ExpensesList() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchExpenses()
      .then(setExpenses)
      .finally(() => setLoading(false));
  }, []);
  
  if (loading) {
    return <div>Carregando despesas...</div>;
  }
  
  return <ExpensesTable expenses={expenses} />;
}
```

## Security Best Practices

### 1. Authentication

Always verify authentication in API routes:

```typescript
import { getSupabaseServerClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const supabase = getSupabaseServerClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  // Proceed with authenticated request
}
```

### 2. Authorization (RBAC)

Check user roles before sensitive operations:

```typescript
import { checkPermission } from '@/server/admin/authz';

export async function DELETE(request: NextRequest) {
  const supabase = getSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  const hasPermission = await checkPermission(user!.id, 'delete:expenses');
  
  if (!hasPermission) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  
  // Proceed with deletion
}
```

### 3. Input Validation

Validate all user input with Zod schemas:

```typescript
import { z } from 'zod';

const createExpenseSchema = z.object({
  description: z.string().min(3).max(255),
  amount: z.number().positive(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  category_id: z.string().uuid(),
  classification_id: z.string().uuid()
});

export async function POST(request: NextRequest) {
  const body = await request.json();
  
  const result = createExpenseSchema.safeParse(body);
  
  if (!result.success) {
    return NextResponse.json(
      { error: 'Invalid input', details: result.error.errors },
      { status: 400 }
    );
  }
  
  // Proceed with validated data
  const validatedData = result.data;
}
```

## Performance Best Practices

### 1. Database Queries

Select only needed columns:

```typescript
// Good
const { data } = await supabase
  .from('expenses')
  .select('id, description, amount, date')
  .limit(100);

// Bad
const { data } = await supabase
  .from('expenses')
  .select('*'); // Fetches all columns
```

### 2. Pagination

Always paginate large datasets:

```typescript
const PAGE_SIZE = 50;

const { data, count } = await supabase
  .from('expenses')
  .select('*', { count: 'exact' })
  .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1)
  .order('date', { ascending: false });
```

### 3. Caching

Use Next.js caching for static data:

```typescript
// Cache for 1 hour
export const revalidate = 3600;

export default async function CategoriesPage() {
  const categories = await fetchCategories();
  return <CategoriesList categories={categories} />;
}
```

## Audit Logging

Always log sensitive operations for compliance:

```typescript
async function logAuditEvent(
  userId: string,
  action: string,
  resourceType: string,
  resourceId: string,
  details?: Record<string, any>
) {
  const supabase = getSupabaseServerClient();
  
  await supabase.from('audit_logs').insert({
    user_id: userId,
    action,
    resource_type: resourceType,
    resource_id: resourceId,
    details,
    timestamp: new Date().toISOString()
  });
}

// Usage
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const supabase = getSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  // Perform deletion
  await supabase.from('expenses').delete().eq('id', params.id);
  
  // Log the action
  await logAuditEvent(
    user!.id,
    'delete',
    'expense',
    params.id,
    { reason: 'User requested deletion' }
  );
  
  return NextResponse.json({ success: true });
}
```

## Common Pitfalls to Avoid

### 1. Client-Side Data Fetching in Server Components

```typescript
// Bad - Don't use useEffect in server components
export default function ExpensesPage() {
  const [expenses, setExpenses] = useState([]);
  
  useEffect(() => {
    fetch('/api/expenses').then(/* ... */);
  }, []);
  
  return <div>{/* ... */}</div>;
}

// Good - Fetch directly in server component
export default async function ExpensesPage() {
  const expenses = await fetchExpensesServer();
  return <ExpensesPageClient initialExpenses={expenses} />;
}
```

### 2. Ignoring TypeScript Errors

```typescript
// Bad
// @ts-ignore
const result = someFunction(invalidArg);

// Good - Fix the underlying issue
const result = someFunction(validArg as ExpectedType);
```

### 3. Hardcoding Organization IDs

```typescript
// Bad
const expenses = await supabase
  .from('expenses')
  .select('*')
  .eq('organization_id', 'hardcoded-id');

// Good - Let RLS handle organization filtering
const expenses = await supabase
  .from('expenses')
  .select('*');
```

## Quick Reference

### Import Aliases

```typescript
import { Component } from '@/components/ui/component';
import { getSupabaseBrowserClient } from '@/lib/supabase/browser';
import type { Expense } from '@/features/expenses/types';
```

### Common Commands

```bash
# Development
npm run dev

# Testing
npm test
npm run test:coverage

# Linting
npm run lint

# Build
npm run build
```

### File Naming Conventions

- Components: PascalCase (`ExpensesList.tsx`)
- Utilities: camelCase (`formatCurrency.ts`)
- Types: camelCase (`types.ts`)
- Tests: Same as source + `.test.ts` (`utils.test.ts`)

## Additional Resources

- [Next.js 16 Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Vitest Documentation](https://vitest.dev/)
- [shadcn/ui Components](https://ui.shadcn.com/)

---

**Project:** SISGERP - Sistema de Gestão de Recursos Públicos
**Stack:** Next.js 16, React 19, TypeScript 5, Supabase, Tailwind CSS 4
