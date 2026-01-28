/**
 * Zod validation schemas for the Backup Module
 * 
 * This file contains runtime validation schemas for:
 * - Backup creation options
 * - Backup filters
 * - Schedule creation and updates
 * 
 * Requirements: 1.3, 2.1, 3.3, 3.4, 3.5, 12.4
 */

import { z } from 'zod';

// ============================================================================
// Backup Validation Schemas
// ============================================================================

/**
 * Schema for creating a new backup
 * 
 * Validates:
 * - backupType must be 'full' or 'selective'
 * - For selective backups, at least one table must be specified
 * 
 * Requirements: 1.3, 12.4
 */
export const createBackupSchema = z.object({
  backupType: z.enum(['full', 'selective']),
  tables: z.array(z.string()).optional(),
}).refine(
  (data) => data.backupType === 'full' || (data.tables && data.tables.length > 0),
  {
    message: 'Backups seletivos devem incluir pelo menos uma tabela',
    path: ['tables'],
  }
);

/**
 * Schema for filtering backups
 * 
 * Validates:
 * - startDate and endDate must be valid ISO datetime strings
 * - backupType must be 'full' or 'selective'
 * - status must be a valid backup status
 * 
 * Requirements: 3.3, 3.4, 3.5
 */
export const backupFiltersSchema = z.object({
  startDate: z.string().datetime({
    message: 'Data inicial deve estar no formato ISO 8601',
  }).optional(),
  endDate: z.string().datetime({
    message: 'Data final deve estar no formato ISO 8601',
  }).optional(),
  backupType: z.enum(['full', 'selective']).optional(),
  status: z.enum([
    'pending',
    'in_progress',
    'completed',
    'failed',
    'deleted',
    'corrupted'
  ]).optional(),
});

// ============================================================================
// Schedule Validation Schemas
// ============================================================================

/**
 * Schema for creating a new backup schedule
 * 
 * Validates:
 * - name is required and between 1-255 characters
 * - frequency must be 'daily', 'weekly', or 'monthly'
 * - backupType must be 'full' or 'selective'
 * - For selective backups, at least one table must be specified
 * - retentionDays must be between 1 and 365 (defaults to 30)
 * 
 * Requirements: 2.1, 12.4
 */
export const createScheduleSchema = z.object({
  name: z.string()
    .min(1, 'Nome é obrigatório')
    .max(255, 'Nome deve ter no máximo 255 caracteres'),
  frequency: z.enum(['daily', 'weekly', 'monthly']),
  backupType: z.enum(['full', 'selective']),
  tables: z.array(z.string()).optional(),
  retentionDays: z.number()
    .int('Dias de retenção deve ser um número inteiro')
    .min(1, 'Dias de retenção deve ser no mínimo 1')
    .max(365, 'Dias de retenção deve ser no máximo 365')
    .default(30),
}).refine(
  (data) => data.backupType === 'full' || (data.tables && data.tables.length > 0),
  {
    message: 'Backups seletivos devem incluir pelo menos uma tabela',
    path: ['tables'],
  }
);

/**
 * Schema for updating an existing backup schedule
 * 
 * Validates:
 * - All fields are optional (partial update)
 * - name must be between 1-255 characters if provided
 * - frequency must be valid if provided
 * - backupType must be valid if provided
 * - retentionDays must be between 1 and 365 if provided
 * 
 * Requirements: 2.1
 */
export const updateScheduleSchema = z.object({
  name: z.string()
    .min(1, 'Nome é obrigatório')
    .max(255, 'Nome deve ter no máximo 255 caracteres')
    .optional(),
  frequency: z.enum(['daily', 'weekly', 'monthly']).optional(),
  backupType: z.enum(['full', 'selective']).optional(),
  tables: z.array(z.string()).optional(),
  enabled: z.boolean().optional(),
  retentionDays: z.number()
    .int('Dias de retenção deve ser um número inteiro')
    .min(1, 'Dias de retenção deve ser no mínimo 1')
    .max(365, 'Dias de retenção deve ser no máximo 365')
    .optional(),
});

// ============================================================================
// Type Exports
// ============================================================================

/**
 * Inferred TypeScript types from Zod schemas
 * These can be used for type-safe validation results
 */
export type CreateBackupInput = z.infer<typeof createBackupSchema>;
export type BackupFiltersInput = z.infer<typeof backupFiltersSchema>;
export type CreateScheduleInput = z.infer<typeof createScheduleSchema>;
export type UpdateScheduleInput = z.infer<typeof updateScheduleSchema>;
