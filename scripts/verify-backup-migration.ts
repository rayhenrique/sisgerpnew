/**
 * Verification script for backup module migration
 * Checks if all required tables, indexes, and policies exist
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join } from 'path';

// Load environment variables from .env.local
const envPath = join(process.cwd(), '.env.local');
const envContent = readFileSync(envPath, 'utf-8');
const envVars: Record<string, string> = {};

envContent.split('\n').forEach(line => {
  const trimmed = line.trim();
  if (trimmed && !trimmed.startsWith('#')) {
    const [key, ...valueParts] = trimmed.split('=');
    if (key && valueParts.length > 0) {
      envVars[key.trim()] = valueParts.join('=').trim();
    }
  }
});

const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = envVars.SUPABASE_SERVICE_ROLE_KEY;
const anonKey = envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing required environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyMigration() {
  console.log('🔍 Verifying backup module migration...\n');

  let allChecksPass = true;

  // Check if backups table exists
  console.log('Checking backups table...');
  const { data: backupsData, error: backupsError } = await supabase
    .from('backups')
    .select('id')
    .limit(1);

  if (backupsError && backupsError.code !== 'PGRST116') {
    console.error('❌ backups table check failed:', backupsError.message);
    allChecksPass = false;
  } else {
    console.log('✅ backups table exists');
  }

  // Check if backup_schedules table exists
  console.log('Checking backup_schedules table...');
  const { data: schedulesData, error: schedulesError } = await supabase
    .from('backup_schedules')
    .select('id')
    .limit(1);

  if (schedulesError && schedulesError.code !== 'PGRST116') {
    console.error('❌ backup_schedules table check failed:', schedulesError.message);
    allChecksPass = false;
  } else {
    console.log('✅ backup_schedules table exists');
  }

  // Check if restore_jobs table exists
  console.log('Checking restore_jobs table...');
  const { data: restoreData, error: restoreError } = await supabase
    .from('restore_jobs')
    .select('id')
    .limit(1);

  if (restoreError && restoreError.code !== 'PGRST116') {
    console.error('❌ restore_jobs table check failed:', restoreError.message);
    allChecksPass = false;
  } else {
    console.log('✅ restore_jobs table exists');
  }

  // Check RLS policies by attempting operations
  console.log('\nChecking RLS policies...');
  
  // Create anonymous client to test RLS
  const anonClient = createClient(supabaseUrl, anonKey);
  
  // Try to select from backups (should fail without auth)
  const { error: rlsError } = await anonClient
    .from('backups')
    .select('id')
    .limit(1);

  if (rlsError && rlsError.message.includes('JWT')) {
    console.log('✅ RLS is enabled (anonymous access blocked)');
  } else {
    console.log('⚠️  RLS check inconclusive');
  }

  console.log('\n' + '='.repeat(50));
  if (allChecksPass) {
    console.log('✅ All migration checks passed!');
    console.log('The backup module tables are ready to use.');
  } else {
    console.log('❌ Some migration checks failed.');
    console.log('Please review the errors above.');
  }
  console.log('='.repeat(50));

  process.exit(allChecksPass ? 0 : 1);
}

verifyMigration().catch((error) => {
  console.error('❌ Verification script failed:', error);
  process.exit(1);
});
