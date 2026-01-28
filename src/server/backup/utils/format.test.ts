/**
 * Unit tests for formatting utilities
 * 
 * Tests file size formatting, date formatting, and duration formatting functions.
 * 
 * Requirements: 3.7
 */

import { describe, it, expect } from 'vitest';
import {
  formatFileSize,
  formatDateTime,
  formatDate,
  formatTime,
  formatDuration,
} from './format';

describe('formatFileSize', () => {
  it('should format bytes correctly', () => {
    expect(formatFileSize(0)).toBe('0 B');
    expect(formatFileSize(500)).toBe('500 B');
    expect(formatFileSize(1023)).toBe('1023 B');
  });

  it('should format kilobytes correctly', () => {
    expect(formatFileSize(1024)).toBe('1.00 KB');
    expect(formatFileSize(1536)).toBe('1.50 KB');
    expect(formatFileSize(10240)).toBe('10.00 KB');
  });

  it('should format megabytes correctly', () => {
    expect(formatFileSize(1048576)).toBe('1.00 MB');
    expect(formatFileSize(1572864)).toBe('1.50 MB');
    expect(formatFileSize(10485760)).toBe('10.00 MB');
  });

  it('should format gigabytes correctly', () => {
    expect(formatFileSize(1073741824)).toBe('1.00 GB');
    expect(formatFileSize(1610612736)).toBe('1.50 GB');
    expect(formatFileSize(10737418240)).toBe('10.00 GB');
  });

  it('should format terabytes correctly', () => {
    expect(formatFileSize(1099511627776)).toBe('1.00 TB');
    expect(formatFileSize(1649267441664)).toBe('1.50 TB');
  });

  it('should handle null values', () => {
    expect(formatFileSize(null)).toBe('-');
  });

  it('should handle negative values', () => {
    expect(formatFileSize(-100)).toBe('-');
  });

  it('should handle edge cases', () => {
    // Just under 1 KB
    expect(formatFileSize(1023)).toBe('1023 B');
    // Exactly 1 KB
    expect(formatFileSize(1024)).toBe('1.00 KB');
    // Just under 1 MB
    expect(formatFileSize(1048575)).toBe('1024.00 KB');
  });
});

describe('formatDateTime', () => {
  it('should format date and time in Brazilian Portuguese format', () => {
    const result = formatDateTime('2024-01-15T10:30:00Z');
    // The exact format depends on timezone, but should contain date and time
    expect(result).toMatch(/\d{2}\/\d{2}\/\d{4}/);
    expect(result).toMatch(/\d{2}:\d{2}/);
  });

  it('should handle null values', () => {
    expect(formatDateTime(null)).toBe('-');
  });

  it('should handle invalid date strings', () => {
    expect(formatDateTime('invalid-date')).toBe('-');
  });

  it('should handle empty strings', () => {
    expect(formatDateTime('')).toBe('-');
  });

  it('should format different date formats', () => {
    // ISO format
    const iso = formatDateTime('2024-12-25T15:45:30Z');
    expect(iso).toMatch(/\d{2}\/\d{2}\/\d{4}/);
    
    // Date with milliseconds
    const withMs = formatDateTime('2024-12-25T15:45:30.123Z');
    expect(withMs).toMatch(/\d{2}\/\d{2}\/\d{4}/);
  });
});

describe('formatDate', () => {
  it('should format date only in Brazilian Portuguese format', () => {
    const result = formatDate('2024-01-15T10:30:00Z');
    expect(result).toMatch(/\d{2}\/\d{2}\/\d{4}/);
    // Should not contain time
    expect(result).not.toMatch(/:/);
  });

  it('should handle null values', () => {
    expect(formatDate(null)).toBe('-');
  });

  it('should handle invalid date strings', () => {
    expect(formatDate('invalid-date')).toBe('-');
  });

  it('should format the same date consistently', () => {
    const date1 = formatDate('2024-03-20T08:00:00Z');
    const date2 = formatDate('2024-03-20T20:00:00Z');
    // Both should show the same date (though time is different)
    expect(date1).toMatch(/\d{2}\/\d{2}\/2024/);
    expect(date2).toMatch(/\d{2}\/\d{2}\/2024/);
  });
});

describe('formatTime', () => {
  it('should format time only', () => {
    const result = formatTime('2024-01-15T10:30:45Z');
    expect(result).toMatch(/\d{2}:\d{2}:\d{2}/);
  });

  it('should handle null values', () => {
    expect(formatTime(null)).toBe('-');
  });

  it('should handle invalid date strings', () => {
    expect(formatTime('invalid-date')).toBe('-');
  });
});

describe('formatDuration', () => {
  it('should format milliseconds', () => {
    expect(formatDuration(0)).toBe('0 ms');
    expect(formatDuration(500)).toBe('500 ms');
    expect(formatDuration(999)).toBe('999 ms');
  });

  it('should format seconds', () => {
    expect(formatDuration(1000)).toBe('1.00 s');
    expect(formatDuration(5000)).toBe('5.00 s');
    expect(formatDuration(30000)).toBe('30.00 s');
    expect(formatDuration(59999)).toBe('60.00 s');
  });

  it('should format minutes', () => {
    expect(formatDuration(60000)).toBe('1.00 min');
    expect(formatDuration(65000)).toBe('1.08 min');
    expect(formatDuration(300000)).toBe('5.00 min');
    expect(formatDuration(3599999)).toBe('60.00 min');
  });

  it('should format hours', () => {
    expect(formatDuration(3600000)).toBe('1.00 h');
    expect(formatDuration(7200000)).toBe('2.00 h');
    expect(formatDuration(5400000)).toBe('1.50 h');
  });

  it('should handle null values', () => {
    expect(formatDuration(null)).toBe('-');
  });

  it('should handle negative values', () => {
    expect(formatDuration(-1000)).toBe('-');
  });

  it('should handle edge cases', () => {
    // Just under 1 second
    expect(formatDuration(999)).toBe('999 ms');
    // Exactly 1 second
    expect(formatDuration(1000)).toBe('1.00 s');
    // Just under 1 minute
    expect(formatDuration(59999)).toBe('60.00 s');
    // Exactly 1 minute
    expect(formatDuration(60000)).toBe('1.00 min');
  });
});
