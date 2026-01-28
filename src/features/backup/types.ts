/**
 * Frontend types for the Backup Module
 * 
 * This file mirrors server types for frontend use and adds UI-specific types
 * for loading states, dialog states, and component props.
 * 
 * Requirements: 11.1, 11.2, 12.1, 13.1
 */

// ============================================================================
// Core Backup Types (mirrored from server)
// ============================================================================

/**
 * Backup record representing a database backup
 */
export interface Backup {
  id: string;
  organizationId: string;
  createdBy: string;
  createdAt: string;
  backupType: 'full' | 'selective';
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'deleted' | 'corrupted';
  filePath: string | null;
  fileSize: number | null;
  compressedSize: number | null;
  tablesIncluded: string[];
  metadata: BackupMetadata;
  errorMessage: string | null;
  validatedAt: string | null;
  creatorName?: string;
}

/**
 * Backup metadata containing format and schema information
 */
export interface BackupMetadata {
  formatVersion: string;
  databaseVersion: string;
  timestamp: string;
  tableSchemas: Record<string, TableSchema>;
}

/**
 * Table schema definition
 */
export interface TableSchema {
  name: string;
  columns: ColumnDefinition[];
  rowCount: number;
}

/**
 * Column definition for table schema
 */
export interface ColumnDefinition {
  name: string;
  type: string;
  nullable: boolean;
  defaultValue: string | null;
}

/**
 * Options for creating a new backup
 */
export interface CreateBackupOptions {
  backupType: 'full' | 'selective';
  tables?: string[];
}

/**
 * Filters for querying backups
 */
export interface BackupFilters {
  startDate?: string;
  endDate?: string;
  backupType?: 'full' | 'selective';
  status?: Backup['status'];
}

/**
 * Information about available tables for backup
 */
export interface TableInfo {
  name: string;
  displayName: string;
  module: string;
  rowCount: number;
}

// ============================================================================
// Backup Schedule Types (mirrored from server)
// ============================================================================

/**
 * Backup schedule configuration
 */
export interface BackupSchedule {
  id: string;
  organizationId: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  name: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  backupType: 'full' | 'selective';
  tablesIncluded: string[];
  enabled: boolean;
  lastRunAt: string | null;
  nextRunAt: string | null;
  retentionDays: number;
}

/**
 * Input for creating a new backup schedule
 */
export interface CreateScheduleInput {
  name: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  backupType: 'full' | 'selective';
  tables?: string[];
  retentionDays?: number;
}

/**
 * Input for updating an existing backup schedule
 */
export interface UpdateScheduleInput {
  name?: string;
  frequency?: 'daily' | 'weekly' | 'monthly';
  backupType?: 'full' | 'selective';
  tables?: string[];
  enabled?: boolean;
  retentionDays?: number;
}

// ============================================================================
// Restore Types (mirrored from server)
// ============================================================================

/**
 * Restore job tracking a restore operation
 */
export interface RestoreJob {
  id: string;
  backupId: string;
  organizationId: string;
  initiatedBy: string;
  startedAt: string;
  completedAt: string | null;
  status: 'in_progress' | 'completed' | 'failed';
  tablesRestored: string[];
  errorMessage: string | null;
}

/**
 * User role for authorization
 */
export type UserRole = 'superadmin' | 'admin' | 'user';

// ============================================================================
// UI-Specific Types
// ============================================================================

/**
 * Loading states for async operations
 */
export interface LoadingStates {
  isLoadingBackups: boolean;
  isCreatingBackup: boolean;
  isRestoringBackup: boolean;
  isDeletingBackup: boolean;
  isDownloadingBackup: boolean;
  isLoadingSchedules: boolean;
  isCreatingSchedule: boolean;
  isUpdatingSchedule: boolean;
  isDeletingSchedule: boolean;
  isLoadingTables: boolean;
}

/**
 * Dialog visibility states
 */
export interface DialogStates {
  isCreateBackupDialogOpen: boolean;
  isRestoreConfirmDialogOpen: boolean;
  isDeleteConfirmDialogOpen: boolean;
  isScheduleDialogOpen: boolean;
}

/**
 * Selected items for operations
 */
export interface SelectedItems {
  selectedBackup: Backup | null;
  selectedSchedule: BackupSchedule | null;
}

/**
 * Props for BackupPageClient component
 */
export interface BackupPageClientProps {
  initialBackups?: Backup[];
  userRole?: UserRole;
}

/**
 * Props for CreateBackupDialog component
 */
export interface CreateBackupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (options: CreateBackupOptions) => Promise<void>;
  availableTables: TableInfo[];
  isSubmitting: boolean;
}

/**
 * Props for RestoreConfirmDialog component
 */
export interface RestoreConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  backup: Backup | null;
  onConfirm: () => Promise<void>;
  isRestoring: boolean;
}

/**
 * Props for BackupTable component
 */
export interface BackupTableProps {
  backups: Backup[];
  onRestore: (backup: Backup) => void;
  onDelete: (backup: Backup) => void;
  onDownload: (backup: Backup) => void;
  userRole: UserRole;
  isLoading?: boolean;
}

/**
 * Props for ScheduleDialog component
 */
export interface ScheduleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  schedule: BackupSchedule | null;
  onSubmit: (input: CreateScheduleInput | UpdateScheduleInput) => Promise<void>;
  availableTables: TableInfo[];
  isSubmitting: boolean;
}

/**
 * Props for ScheduleList component
 */
export interface ScheduleListProps {
  schedules: BackupSchedule[];
  onEdit: (schedule: BackupSchedule) => void;
  onDelete: (schedule: BackupSchedule) => void;
  onToggleEnabled: (schedule: BackupSchedule) => void;
  isLoading?: boolean;
}
