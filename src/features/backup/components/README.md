# Backup Components

This directory contains React components for the Backup Module.

## Components

### CreateBackupDialog

Dialog component for creating new database backups.

**Features:**
- Radio button selection for full or selective backup
- Table selection with checkboxes (for selective backups)
- Validation to ensure at least one table is selected for selective backups
- Loading state during backup creation
- Error display for validation and API errors
- Tables grouped by module for better organization

**Usage:**

```tsx
import { CreateBackupDialog } from '@/features/backup/components';
import { createBackup, getAvailableTables } from '@/features/backup/api';

function MyComponent() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [tables, setTables] = React.useState<TableInfo[]>([]);

  // Load available tables
  React.useEffect(() => {
    getAvailableTables().then(setTables);
  }, []);

  const handleSubmit = async (options: CreateBackupOptions) => {
    setIsSubmitting(true);
    try {
      await createBackup(options);
      setIsOpen(false);
      // Show success notification
    } catch (error) {
      // Error is handled by the dialog
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <button onClick={() => setIsOpen(true)}>
        Create Backup
      </button>
      
      <CreateBackupDialog
        open={isOpen}
        onOpenChange={setIsOpen}
        onSubmit={handleSubmit}
        availableTables={tables}
        isSubmitting={isSubmitting}
      />
    </>
  );
}
```

**Props:**

- `open` (boolean): Controls dialog visibility
- `onOpenChange` (function): Callback when dialog should open/close
- `onSubmit` (async function): Callback when form is submitted with backup options
- `availableTables` (TableInfo[]): List of available tables for selection
- `isSubmitting` (boolean): Loading state during backup creation

**Requirements Satisfied:**

- 12.1: Dialog opens when "Create Backup" is clicked
- 12.2: Provides options for full or selective backup
- 12.3: Displays list of available tables with checkboxes
- 12.4: Validates at least one table is selected for selective backups
- 12.5: Validation passes before initiating backup
- 12.6: Shows success notification (handled by parent component)
- 12.7: Shows error notification with details

### BackupTable

Data table component for displaying backup history.

See `BackupTable.tsx` for implementation details.
