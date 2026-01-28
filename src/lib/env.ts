export function isProduction() {
  return process.env.NODE_ENV === "production";
}

export type PublicEnvKey =
  | "NEXT_PUBLIC_SUPABASE_URL"
  | "NEXT_PUBLIC_SUPABASE_ANON_KEY";

export function publicEnv(key: PublicEnvKey) {
  switch (key) {
    case "NEXT_PUBLIC_SUPABASE_URL":
      return process.env.NEXT_PUBLIC_SUPABASE_URL;
    case "NEXT_PUBLIC_SUPABASE_ANON_KEY":
      return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  }
}

export function requiredPublicEnv(key: PublicEnvKey) {
  const value = publicEnv(key);
  if (!value) throw new Error(`Missing environment variable: ${key}`);
  return value;
}

export function requiredPublicEnvInProduction(key: PublicEnvKey) {
  if (isProduction()) return requiredPublicEnv(key);
  return publicEnv(key);
}

export function requiredEnv(key: string) {
  const value = process.env[key];
  if (!value) throw new Error(`Missing environment variable: ${key}`);
  return value;
}

export function requiredEnvInProduction(key: string) {
  if (isProduction()) return requiredEnv(key);
  return process.env[key];
}
