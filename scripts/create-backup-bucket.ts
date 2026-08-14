import { createClient } from '@supabase/supabase-js';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

const envLocalPath = join(process.cwd(), '.env.local');
const envPath = existsSync(envLocalPath) ? envLocalPath : join(process.cwd(), '.env');
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

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing required environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  console.log('📦 Creating backups storage bucket in Supabase...');
  const { data, error } = await supabase.storage.createBucket('backups', {
    public: false
  });

  if (error) {
    if (error.message.includes('already exists') || error.message.includes('Duplicate')) {
      console.log('✅ Bucket "backups" already exists!');
    } else {
      console.error('❌ Error creating bucket:', error.message);
      process.exit(1);
    }
  } else {
    console.log('✅ Storage bucket "backups" created successfully!');
  }
}

main();
