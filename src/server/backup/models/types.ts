/**
 * TypeScript types for the Backup Module
 * 
 * This file contains all type definitions for backup operations including:
 * - Backup records and metadata
 * - Backup schedules
 * - Restore jobs
 * - Table information and data structures
 * - Validation results
 * 
 * Requirements: 1.2, 1.3, 1.7, 2.1, 3.1, 5.1, 15.2
 */

// ============================================================================
// Core Backup Types
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
  creatorName?: string; // Joined from users table
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
 * Complete backup data structure
 */
export interface BackupData {
  metadata: BackupMetadata;
  tables: Record<string, TableData>;
}

/**
 * Table data including schema and rows
 */
export interface TableData {
  schema: TableSchema;
  rows: Record<string, any>[];
}

// ============================================================================
// Backup Operation Types
// ============================================================================

/**
 * Options for creating a new backup
 */
export interface CreateBackupOptions {
  backupType: 'full' | 'selective';
  tables?: string[]; // Required for selective backups
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
// Backup Schedule Types
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
// Restore Types
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
 * Result of backup validation
 */
export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

// ============================================================================
// User Role Type
// ============================================================================

/**
 * User role for authorization
 */
export type UserRole = 'superadmin' | 'admin' | 'user';
