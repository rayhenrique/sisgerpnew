# ReportDataTable - Level 2 Flexible Data Table

## Overview

The `ReportDataTable` is a powerful, reusable component built with TanStack Table that provides advanced data manipulation features for reports.

## Features

### ✅ Level 2 Capabilities

1. **Column Visibility Toggle**
   - Button: "Visualizar Colunas" with Columns icon
   - Dropdown checkbox menu to show/hide columns
   - Persists during the session

2. **Client-Side Sorting**
   - Click headers to sort (Ascending → Descending → None)
   - Visual indicators (↑ ↓) show current sort direction
   - Works on all sortable columns

3. **Smart Excel Export**
   - Button: "Exportar Excel" (Emerald green)
   - Exports ONLY visible columns and filtered rows
   - Respects user's column visibility choices
   - Includes friendly column headers
   - Auto-generates filename with timestamp

4. **Pagination**
   - Standard Previous/Next buttons
   - Shows "Página X de Y"
   - Configurable page size (default: 10 rows)

5. **Global Search**
   - Search across all columns
   - Real-time filtering
   - Customizable placeholder text

## Usage Example

### 1. Define Your Data Type

\`\`\`typescript
// src/features/reports/types/receitas.ts
export type ReceitaReportRow = {
  id: string;
  data: string;
  descricao: string;
  fonte: string;
  valor: number;
  observacao: string | null;
};
\`\`\`

### 2. Create Column Definitions

\`\`\`typescript
// src/features/reports/columns/receitasColumns.tsx
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { ReceitaReportRow } from "@/features/reports/types/receitas";
import { formatDateBR } from "@/lib/dates";

export const receitasColumns: ColumnDef<ReceitaReportRow>[] = [
  {
    accessorKey: "data",
    header: "Data",
    cell: ({ row }) => {
      return formatDateBR(String(row.getValue("data")));
    },
    enableSorting: true,
  },
  {
    accessorKey: "descricao",
    header: "Descrição",
    cell: ({ row }) => {
      return <div className="max-w-[300px]">{row.getValue("descricao")}</div>;
    },
    enableSorting: true,
  },
  {
    accessorKey: "fonte",
    header: "Fonte",
    cell: ({ row }) => {
      const fonte = row.getValue("fonte") as string;
      return (
        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
          {fonte}
        </Badge>
      );
    },
    enableSorting: true,
  },
  {
    accessorKey: "valor",
    header: "Valor",
    cell: ({ row }) => {
      const valor = parseFloat(row.getValue("valor"));
      const formatted = new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
      }).format(valor);
      return <div className="text-right font-medium text-green-600">{formatted}</div>;
    },
    enableSorting: true,
  },
  {
    accessorKey: "observacao",
    header: "Observação",
    cell: ({ row }) => {
      const obs = row.getValue("observacao") as string | null;
      return (
        <div className="max-w-[250px] text-sm text-slate-600">
          {obs || <span className="text-slate-400">—</span>}
        </div>
      );
    },
    enableSorting: false,
    enableHiding: true, // This column can be hidden
  },
];
\`\`\`

### 3. Use the Component

\`\`\`typescript
import { ReportDataTable } from "@/features/reports/ReportDataTable";
import { receitasColumns } from "@/features/reports/columns/receitasColumns";
import type { ReceitaReportRow } from "@/features/reports/types/receitas";

function MyReportPage() {
  const [data, setData] = React.useState<ReceitaReportRow[]>([]);

  return (
    <ReportDataTable
      columns={receitasColumns}
      data={data}
      searchPlaceholder="Buscar por descrição, fonte..."
      exportFileName="relatorio_receitas"
    />
  );
}
\`\`\`

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `columns` | `ColumnDef<TData, TValue>[]` | Yes | - | Column definitions from TanStack Table |
| `data` | `TData[]` | Yes | - | Array of data rows |
| `searchPlaceholder` | `string` | No | "Buscar..." | Placeholder text for search input |
| `searchColumn` | `string` | No | - | Specific column to search (uses global search if omitted) |
| `exportFileName` | `string` | No | "relatorio" | Base name for exported Excel file |

## Column Definition Options

### Key Properties

- `accessorKey`: The key in your data object
- `header`: Column header text (string or React component)
- `cell`: Custom cell renderer function
- `enableSorting`: Enable/disable sorting for this column
- `enableHiding`: Allow users to hide this column

### Cell Formatting Examples

**Date Formatting:**
\`\`\`typescript
cell: ({ row }) => {
  return formatDateBR(String(row.getValue("data")));
}
\`\`\`

**Currency Formatting:**
\`\`\`typescript
cell: ({ row }) => {
  const valor = parseFloat(row.getValue("valor"));
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(valor);
}
\`\`\`

**Badge/Tag:**
\`\`\`typescript
cell: ({ row }) => {
  const status = row.getValue("status") as string;
  return <Badge variant="outline">{status}</Badge>;
}
\`\`\`

## Visual Customization

### Table Styling
- White background with rounded corners
- Light gray header (`bg-slate-50`)
- Blue hover effect on rows (`hover:bg-blue-50`)
- Subtle border (`border-slate-200`)

### Button Styling
- "Visualizar Colunas": Secondary variant
- "Exportar Excel": Emerald green (`bg-emerald-600`)
- Pagination: Secondary variant

## Advanced Features

### Hiding Columns by Default

Set initial visibility in the table configuration:

\`\`\`typescript
const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({
  observacao: false, // Hide "observacao" column by default
});
\`\`\`

### Custom Page Size

Modify the `initialState` in `ReportDataTable.tsx`:

\`\`\`typescript
initialState: {
  pagination: {
    pageSize: 20, // Show 20 rows per page
  },
}
\`\`\`

### Excel Export Customization

The export function automatically:
- Uses only visible columns
- Respects current filters/search
- Adds friendly column headers
- Includes timestamp in filename

## Integration with Reports Module

The table is integrated into the Reports page (`ReportsPageClient.tsx`):

1. User selects a report type (Receitas, Despesas, etc.)
2. User applies filters (date range, categories, etc.)
3. User clicks "Pré-visualizar na Tela"
4. Data is fetched and displayed in the `ReportDataTable`
5. User can:
   - Search within results
   - Sort by any column
   - Hide/show columns
   - Export to Excel with current view

## Next Steps

To add more report types:

1. Create a new type file (e.g., `types/despesas.ts`)
2. Create column definitions (e.g., `columns/despesasColumns.tsx`)
3. Update the filter view to use the appropriate columns based on `reportType`
4. Fetch real data from Supabase instead of using sample data

## Dependencies

- `@tanstack/react-table`: ^8.x
- `xlsx`: ^0.18.x
- `lucide-react`: Icons
- Shadcn UI components: Button, Table, DropdownMenu, Input
