/**
 * Formatting utilities for the Backup Module
 * 
 * This file provides functions to format backup data for display in the UI.
 * 
 * Requirements: 3.7
 */

import type { Backup } from "./types";

/**
 * Format backup type for display
 */
export function formatBackupType(type: Backup['backupType']): string {
  const types: Record<Backup['backupType'], string> = {
    full: "Completo",
    selective: "Seletivo",
  };
  return types[type] || type;
}

/**
 * Format backup status for display
 */
export function formatBackupStatus(status: Backup['status']): string {
  const statuses: Record<Backup['status'], string> = {
    pending: "Pendente",
    in_progress: "Em Progresso",
    completed: "Concluído",
    failed: "Falhou",
    deleted: "Excluído",
    corrupted: "Corrompido",
  };
  return statuses[status] || status;
}

/**
 * Format file size in bytes to human-readable format
 * 
 * Requirements: 3.7
 */
export function formatFileSize(bytes: number | null): string {
  if (bytes === null || bytes === 0) return "-";

  const units = ["B", "KB", "MB", "GB", "TB"];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(2)} ${units[unitIndex]}`;
}

/**
 * Format date/time for display in Brazilian Portuguese format
 */
export function formatDateTime(dateString: string | null): string {
  if (!dateString) return "-";

  const date = new Date(dateString);
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

/**
 * Format schedule frequency for display
 */
export function formatFrequency(frequency: 'daily' | 'weekly' | 'monthly'): string {
  const frequencies = {
    daily: "Diário",
    weekly: "Semanal",
    monthly: "Mensal",
  };
  return frequencies[frequency] || frequency;
}
