/**
 * API Route: Apply Retention Policy
 * 
 * This endpoint is designed to be called by external cron services (e.g., Vercel Cron,
 * GitHub Actions, or external cron jobs) to apply retention policies and delete old backups.
 * 
 * This should be run daily to clean up expired backups based on retention periods.
 * 
 * Security: This endpoint should be protected with an API key or secret token
 * to prevent unauthorized execution.
 * 
 * Requirements: 7.4
 */

import { NextRequest, NextResponse } from 'next/server';
import { retentionService } from '@/server/backup/services/retentionService';
import { getSupabaseServiceRoleClient } from '@/lib/supabase/server';

/**
 * POST /api/backup/cron/apply-retention
 * 
 * Apply retention policy to all organizations and delete expired backups
 * 
 * Headers:
 * - Authorization: Bearer <CRON_SECRET> (required)
 * 
 * Returns:
 * - 200: Retention policy applied successfully
 * - 401: Unauthorized (missing or invalid secret)
 * - 500: Internal server error
 */
export async function POST(request: NextRequest) {
  try {
    // Verify cron secret for security
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret) {
      console.error('CRON_SECRET not configured');
      return NextResponse.json(
        { error: 'Cron job not configured' },
        { status: 500 }
      );
    }

    if (!authHeader || authHeader !== `Bearer ${cronSecret}`) {
      console.error('Unauthorized cron job execution attempt');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('Starting retention policy application');

    // Get all organizations (for multi-tenant support)
    const supabase = getSupabaseServiceRoleClient();
    if (!supabase) {
      throw new Error('Supabase service role client not configured');
    }

    // For single-tenant mode, just apply to null organization
    // For multi-tenant, we would query organizations table
    const organizations = [null]; // Single-tenant mode

    const results = {
      totalOrganizations: organizations.length,
      totalDeleted: 0,
      organizationResults: [] as Array<{
        organizationId: string | null;
        deleted: number;
        error?: string;
      }>,
    };

    // Apply retention policy to each organization
    for (const orgId of organizations) {
      try {
        console.log(`Applying retention policy for organization: ${orgId || 'default'}`);
        
        const deletedCount = await retentionService.applyRetentionPolicy(orgId);
        
        results.totalDeleted += deletedCount;
        results.organizationResults.push({
          organizationId: orgId,
          deleted: deletedCount,
        });

        console.log(`Deleted ${deletedCount} expired backups for organization: ${orgId || 'default'}`);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        results.organizationResults.push({
          organizationId: orgId,
          deleted: 0,
          error: errorMessage,
        });
        console.error(`Failed to apply retention policy for organization ${orgId}:`, errorMessage);
      }
    }

    // Log summary
    console.log('Retention policy application summary:', {
      totalOrganizations: results.totalOrganizations,
      totalDeleted: results.totalDeleted,
    });

    return NextResponse.json({
      message: 'Retention policy applied successfully',
      results,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Failed to apply retention policy:', message);
    return NextResponse.json(
      { error: 'Failed to apply retention policy', details: message },
      { status: 500 }
    );
  }
}
