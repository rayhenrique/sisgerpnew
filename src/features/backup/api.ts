/**
 * API client functions for the Backup Module
 * 
 * This file provides functions to interact with the backup API routes.
 * All requests include authentication tokens and handle errors gracefully.
 * 
 * Requirements: 1.1, 3.1, 4.1, 5.1, 6.1, 2.1
 */

import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import type {
  Backup,
  BackupFilters,
  BackupSchedule,
  CreateBackupOptions,
  CreateScheduleInput,
  TableInfo,
  UpdateScheduleInput,
} from "./types";

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get the current user's access token from Supabase session
 */
async function getAccessToken(): Promise<string> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    throw new Error("Supabase não configurado");
  }

  const { data, error } = await supabase.auth.getSession();
  if (error) {
    throw new Error(`Erro ao obter sessão: ${error.message}`);
  }

  const token = data.session?.access_token;
  if (!token) {
    throw new Error("Sessão expirada. Faça login novamente.");
  }

  return token;
}

/**
 * Generic API fetch function with authentication and error handling
 */
async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const token = await getAccessToken();
  
  const res = await fetch(path, {
    ...init,
    headers: {
      ...(init?.headers ?? {}),
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  const json = (await res.json().catch(() => null)) as unknown;
  
  if (!res.ok) {
    // Extract error message from response
    const msg =
      json &&
      typeof json === "object" &&
      !Array.isArray(json) &&
      "message" in json &&
      typeof (json as Record<string, unknown>).message === "string"
        ? ((json as Record<string, unknown>).message as string)
        : "Erro na API";
    throw new Error(msg);
  }
  
  return json as T;
}

// ============================================================================
// Backup Operations
// ============================================================================

/**
 * List backups with optional filters
 * 
 * @param filters - Optional filters for date range, type, and status
 * @returns Array of backups for the user's organization
 * 
 * Requirements: 3.1, 3.3, 3.4, 3.5
 */
export async function listBackups(filters?: BackupFilters): Promise<Backup[]> {
  const params = new URLSearchParams();
  
  if (filters?.startDate) {
    params.append("startDate", filters.startDate);
  }
  if (filters?.endDate) {
    params.append("endDate", filters.endDate);
  }
  if (filters?.backupType) {
    params.append("backupType", filters.backupType);
  }
  if (filters?.status) {
    params.append("status", filters.status);
  }

  const queryString = params.toString();
  const url = `/api/backup${queryString ? `?${queryString}` : ""}`;
  
  const res = await apiFetch<{ backups: Backup[] }>(url);
  return res.backups;
}

/**
 * Create a new backup
 * 
 * @param options - Backup creation options (type and optional tables)
 * @returns The created backup record
 * 
 * Requirements: 1.1, 1.2, 1.3
 */
export async function createBackup(options: CreateBackupOptions): Promise<Backup> {
  const res = await apiFetch<{ backup: Backup }>("/api/backup", {
    method: "POST",
    body: JSON.stringify(options),
  });
  return res.backup;
}

/**
 * Get backup details by ID
 * 
 * @param backupId - The backup ID
 * @returns The backup record
 * 
 * Requirements: 3.1
 */
export async function getBackup(backupId: string): Promise<Backup> {
  const res = await apiFetch<{ backup: Backup }>(`/api/backup/${backupId}`);
  return res.backup;
}

/**
 * Delete a backup
 * 
 * @param backupId - The backup ID to delete
 * 
 * Requirements: 6.1
 */
export async function deleteBackup(backupId: string): Promise<void> {
  await apiFetch<{ ok: true }>(`/api/backup/${backupId}`, {
    method: "DELETE",
  });
}

/**
 * Restore from a backup
 * 
 * @param backupId - The backup ID to restore from
 * 
 * Requirements: 5.1
 */
export async function restoreBackup(backupId: string): Promise<void> {
  await apiFetch<{ ok: true }>(`/api/backup/${backupId}/restore`, {
    method: "POST",
    body: JSON.stringify({ confirmed: true }),
  });
}

/**
 * Get a signed download URL for a backup file
 * 
 * @param backupId - The backup ID to download
 * @returns The signed download URL and expiration time
 * 
 * Requirements: 4.1
 */
export async function downloadBackup(backupId: string): Promise<string> {
  const res = await apiFetch<{ url: string; expiresInSeconds: number }>(
    `/api/backup/${backupId}/download`
  );
  return res.url;
}

/**
 * Get list of available tables for backup
 * 
 * @returns Array of table information
 * 
 * Requirements: 12.3
 */
export async function getAvailableTables(): Promise<TableInfo[]> {
  const res = await apiFetch<{ tables: TableInfo[] }>("/api/backup/tables");
  return res.tables;
}

// ============================================================================
// Schedule Operations
// ============================================================================

/**
 * List all backup schedules for the organization
 * 
 * @returns Array of backup schedules
 * 
 * Requirements: 2.1
 */
export async function listSchedules(): Promise<BackupSchedule[]> {
  const res = await apiFetch<{ schedules: BackupSchedule[] }>("/api/backup/schedules");
  return res.schedules;
}

/**
 * Create a new backup schedule
 * 
 * @param input - Schedule configuration
 * @returns The created schedule
 * 
 * Requirements: 2.1
 */
export async function createSchedule(input: CreateScheduleInput): Promise<BackupSchedule> {
  const res = await apiFetch<{ schedule: BackupSchedule }>("/api/backup/schedules", {
    method: "POST",
    body: JSON.stringify(input),
  });
  return res.schedule;
}

/**
 * Update an existing backup schedule
 * 
 * @param scheduleId - The schedule ID to update
 * @param updates - Partial schedule updates
 * @returns The updated schedule
 * 
 * Requirements: 2.1
 */
export async function updateSchedule(
  scheduleId: string,
  updates: UpdateScheduleInput
): Promise<BackupSchedule> {
  const res = await apiFetch<{ schedule: BackupSchedule }>("/api/backup/schedules", {
    method: "PUT",
    body: JSON.stringify({ id: scheduleId, ...updates }),
  });
  return res.schedule;
}

/**
 * Delete a backup schedule
 * 
 * @param scheduleId - The schedule ID to delete
 * 
 * Requirements: 2.1
 */
export async function deleteSchedule(scheduleId: string): Promise<void> {
  await apiFetch<{ ok: true }>("/api/backup/schedules", {
    method: "DELETE",
    body: JSON.stringify({ id: scheduleId }),
  });
}
