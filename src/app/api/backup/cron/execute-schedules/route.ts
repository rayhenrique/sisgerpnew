/**
 * API Route: Execute Due Backup Schedules
 * 
 * This endpoint is designed to be called by external cron services (e.g., Vercel Cron,
 * GitHub Actions, or external cron jobs) to execute backup schedules that are due.
 * 
 * Security: This endpoint should be protected with an API key or secret token
 * to prevent unauthorized execution.
 * 
 * Requirements: 2.2, 2.4
 */

import { NextRequest, NextResponse } from 'next/server';
import { scheduleService } from '@/server/backup/services/scheduleService';
import { isProduction } from "@/lib/env";

/**
 * POST /api/backup/cron/execute-schedules
 * 
 * Execute all backup schedules that are due to run
 * 
 * Headers:
 * - Authorization: Bearer <CRON_SECRET> (required)
 * 
 * Returns:
 * - 200: Schedules executed successfully
 * - 401: Unauthorized (missing or invalid secret)
 * - 500: Internal server error
 */
export async function POST(request: NextRequest) {
  try {
    const verbose = !isProduction();

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

    // Get all schedules that are due to run
    const dueSchedules = await scheduleService.getDueSchedules();

    if (verbose) console.log(`Found ${dueSchedules.length} due schedules to execute`);

    const results = {
      total: dueSchedules.length,
      successful: 0,
      failed: 0,
      errors: [] as Array<{ scheduleId: string; scheduleName: string; error: string }>,
    };

    // Execute each due schedule
    for (const schedule of dueSchedules) {
      try {
        if (verbose) console.log(`Executing schedule: ${schedule.name} (${schedule.id})`);
        await scheduleService.executeSchedule(schedule);
        results.successful++;
        if (verbose) console.log(`Successfully executed schedule: ${schedule.name}`);
      } catch (error) {
        results.failed++;
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        results.errors.push({
          scheduleId: schedule.id,
          scheduleName: schedule.name,
          error: errorMessage,
        });
        console.error(`Failed to execute schedule ${schedule.name}:`, errorMessage);
      }
    }

    // Log summary
    console.log('Schedule execution summary:', {
      total: results.total,
      successful: results.successful,
      failed: results.failed,
    });

    return NextResponse.json({
      message: 'Schedule execution completed',
      results,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Failed to execute schedules:', message);
    return NextResponse.json(
      { error: 'Failed to execute schedules', details: message },
      { status: 500 }
    );
  }
}
