/**
 * Integration tests for backup cron job endpoints
 * 
 * These tests verify that the cron endpoints work correctly with proper authentication
 * and execute the expected operations.
 */

import { describe, it, expect, beforeAll, vi } from 'vitest';

describe('Backup Cron Jobs', () => {
  const MOCK_CRON_SECRET = 'test-cron-secret-12345';

  beforeAll(() => {
    // Set the CRON_SECRET for testing
    process.env.CRON_SECRET = MOCK_CRON_SECRET;
  });

  describe('POST /api/backup/cron/execute-schedules', () => {
    it('should reject requests without authorization header', async () => {
      const { POST } = await import('../execute-schedules/route');
      const request = new Request('http://localhost:3000/api/backup/cron/execute-schedules', {
        method: 'POST',
      });

      const response = await POST(request as any);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('should reject requests with invalid authorization header', async () => {
      const { POST } = await import('../execute-schedules/route');
      const request = new Request('http://localhost:3000/api/backup/cron/execute-schedules', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer wrong-secret',
        },
      });

      const response = await POST(request as any);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('should accept requests with valid authorization header', async () => {
      const { POST } = await import('../execute-schedules/route');
      const request = new Request('http://localhost:3000/api/backup/cron/execute-schedules', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${MOCK_CRON_SECRET}`,
        },
      });

      const response = await POST(request as any);
      const data = await response.json();

      // In test environment without Supabase, we expect 500 with specific error
      // In production with Supabase configured, we expect 200
      if (response.status === 500) {
        expect(data.error).toBe('Failed to execute schedules');
        expect(data.details).toContain('Supabase service role client not configured');
      } else {
        expect(response.status).toBe(200);
        expect(data.message).toBe('Schedule execution completed');
        expect(data.results).toBeDefined();
        expect(data.results.total).toBeGreaterThanOrEqual(0);
        expect(data.results.successful).toBeGreaterThanOrEqual(0);
        expect(data.results.failed).toBeGreaterThanOrEqual(0);
      }
    });
  });

  describe('POST /api/backup/cron/apply-retention', () => {
    it('should reject requests without authorization header', async () => {
      const { POST } = await import('../apply-retention/route');
      const request = new Request('http://localhost:3000/api/backup/cron/apply-retention', {
        method: 'POST',
      });

      const response = await POST(request as any);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('should reject requests with invalid authorization header', async () => {
      const { POST } = await import('../apply-retention/route');
      const request = new Request('http://localhost:3000/api/backup/cron/apply-retention', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer wrong-secret',
        },
      });

      const response = await POST(request as any);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('should accept requests with valid authorization header', async () => {
      const { POST } = await import('../apply-retention/route');
      const request = new Request('http://localhost:3000/api/backup/cron/apply-retention', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${MOCK_CRON_SECRET}`,
        },
      });

      const response = await POST(request as any);
      const data = await response.json();

      // In test environment without Supabase, we expect 500 with specific error
      // In production with Supabase configured, we expect 200
      if (response.status === 500) {
        expect(data.error).toBe('Failed to apply retention policy');
        expect(data.details).toContain('Supabase service role client not configured');
      } else {
        expect(response.status).toBe(200);
        expect(data.message).toBe('Retention policy applied successfully');
        expect(data.results).toBeDefined();
        expect(data.results.totalOrganizations).toBeGreaterThanOrEqual(0);
        expect(data.results.totalDeleted).toBeGreaterThanOrEqual(0);
      }
    });
  });

  describe('CRON_SECRET configuration', () => {
    it('should return 500 if CRON_SECRET is not configured', async () => {
      // Temporarily remove CRON_SECRET
      const originalSecret = process.env.CRON_SECRET;
      delete process.env.CRON_SECRET;

      // Re-import to get fresh module
      vi.resetModules();
      const { POST } = await import('../execute-schedules/route');
      
      const request = new Request('http://localhost:3000/api/backup/cron/execute-schedules', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer any-secret',
        },
      });

      const response = await POST(request as any);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Cron job not configured');

      // Restore CRON_SECRET
      process.env.CRON_SECRET = originalSecret;
    });
  });
});
