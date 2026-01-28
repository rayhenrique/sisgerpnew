import { createClient } from "@supabase/supabase-js";
import { requiredEnvInProduction } from "@/lib/env";

export function getSupabaseServiceRoleClient() {
  const url = requiredEnvInProduction("NEXT_PUBLIC_SUPABASE_URL");
  const serviceRoleKey = requiredEnvInProduction("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !serviceRoleKey) return null;
  return createClient(url, serviceRoleKey);
}

export function getSupabaseServerClientWithAuth(accessToken: string) {
  const url = requiredEnvInProduction("NEXT_PUBLIC_SUPABASE_URL");
  const anonKey = requiredEnvInProduction("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  if (!url || !anonKey) return null;

  return createClient(url, anonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
    auth: { persistSession: false },
  });
}

