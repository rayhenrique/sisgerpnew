import { createClient } from "@supabase/supabase-js";
import { requiredPublicEnvInProduction } from "@/lib/env";

let browserClient: ReturnType<typeof createClient> | null = null;

export function getSupabaseBrowserClient(options?: {
  persistSession?: boolean;
}) {
  const url = requiredPublicEnvInProduction("NEXT_PUBLIC_SUPABASE_URL");
  const anonKey = requiredPublicEnvInProduction("NEXT_PUBLIC_SUPABASE_ANON_KEY");

  if (!url || !anonKey) return null;

  const persistSession = options?.persistSession;

  if (browserClient && typeof persistSession !== "boolean") return browserClient;

  if (typeof persistSession === "boolean") {
    return createClient(url, anonKey, {
      auth: { persistSession },
    });
  }

  browserClient = createClient(url, anonKey);
  return browserClient;
}

