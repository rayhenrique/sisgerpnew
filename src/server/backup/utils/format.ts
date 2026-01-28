/**
 * Formatting utilities for backup module
 * 
 * Provides functions for formatting file sizes and dates in human-readable formats.
 * Follows Brazilian Portuguese conventions for date formatting.
 * 
 * Requirements: 3.7
 */

/**
 * Format file size in bytes to human-readable format
 * 
 * Converts byte values to appropriate units (B, KB, MB, GB, TB) with 2 decimal places.
 * Returns "-" for null or zero values.
 * 
 * @param bytes - File size in bytes (can be null)
 * @returns Formatted string with size and unit (e.g., "1.50 MB")
 * 
 * @example
 * formatFileSize(1024) // Returns "1.00 KB"
 * formatFileSize(1572864) // Returns "1.50 MB"
 * formatFileSize(null) // Returns "-"
 * formatFileSize(0) // Returns "0 B"
 */
export function formatFileSize(bytes: number | null): string {
  // Handle null or undefined
  if (bytes === null || bytes === undefined) {
    return "-";
  }

  // Handle zero
  if (bytes === 0) {
    return "0 B";
  }

  // Handle negative values (shouldn't happen, but be defensive)
  if (bytes < 0) {
    return "-";
  }

  const units = ["B", "KB", "MB", "GB", "TB"];
  let size = bytes;
  let unitIndex = 0;

  // Convert to appropriate unit
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  // Format with 2 decimal places, except for bytes
  const formatted = unitIndex === 0 
    ? size.toString() 
    : size.toFixed(2);

  return `${formatted} ${units[unitIndex]}`;
}

/**
 * Format date and time in Brazilian Portuguese format
 * 
 * Formats ISO date strings to Brazilian format: DD/MM/YYYY HH:MM
 * Returns "-" for null or invalid dates.
 * 
 * @param dateString - ISO date string (e.g., "2024-01-15T10:30:00Z")
 * @returns Formatted date string in pt-BR format
 * 
 * @example
 * formatDateTime("2024-01-15T10:30:00Z") // Returns "15/01/2024 10:30"
 * formatDateTime(null) // Returns "-"
 */
export function formatDateTime(dateString: string | null): string {
  if (!dateString) {
    return "-";
  }

  try {
    const date = new Date(dateString);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return "-";
    }

    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  } catch (error) {
    return "-";
  }
}

/**
 * Format date only (without time) in Brazilian Portuguese format
 * 
 * Formats ISO date strings to Brazilian date format: DD/MM/YYYY
 * Returns "-" for null or invalid dates.
 * 
 * @param dateString - ISO date string
 * @returns Formatted date string in pt-BR format
 * 
 * @example
 * formatDate("2024-01-15T10:30:00Z") // Returns "15/01/2024"
 * formatDate(null) // Returns "-"
 */
export function formatDate(dateString: string | null): string {
  if (!dateString) {
    return "-";
  }

  try {
    const date = new Date(dateString);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return "-";
    }

    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date);
  } catch (error) {
    return "-";
  }
}

/**
 * Format time only in Brazilian Portuguese format
 * 
 * Formats ISO date strings to time format: HH:MM:SS
 * Returns "-" for null or invalid dates.
 * 
 * @param dateString - ISO date string
 * @returns Formatted time string
 * 
 * @example
 * formatTime("2024-01-15T10:30:45Z") // Returns "10:30:45"
 * formatTime(null) // Returns "-"
 */
export function formatTime(dateString: string | null): string {
  if (!dateString) {
    return "-";
  }

  try {
    const date = new Date(dateString);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return "-";
    }

    return new Intl.DateTimeFormat("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }).format(date);
  } catch (error) {
    return "-";
  }
}

/**
 * Format duration in milliseconds to human-readable format
 * 
 * Converts milliseconds to appropriate time units (ms, s, min, h)
 * 
 * @param milliseconds - Duration in milliseconds
 * @returns Formatted duration string
 * 
 * @example
 * formatDuration(500) // Returns "500 ms"
 * formatDuration(5000) // Returns "5.00 s"
 * formatDuration(65000) // Returns "1.08 min"
 * formatDuration(3600000) // Returns "1.00 h"
 */
export function formatDuration(milliseconds: number | null): string {
  if (milliseconds === null || milliseconds === undefined) {
    return "-";
  }

  if (milliseconds < 0) {
    return "-";
  }

  // Less than 1 second - show milliseconds
  if (milliseconds < 1000) {
    return `${milliseconds} ms`;
  }

  // Less than 1 minute - show seconds
  if (milliseconds < 60000) {
    const seconds = milliseconds / 1000;
    return `${seconds.toFixed(2)} s`;
  }

  // Less than 1 hour - show minutes
  if (milliseconds < 3600000) {
    const minutes = milliseconds / 60000;
    return `${minutes.toFixed(2)} min`;
  }

  // Show hours
  const hours = milliseconds / 3600000;
  return `${hours.toFixed(2)} h`;
}
