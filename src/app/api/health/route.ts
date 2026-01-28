import { NextResponse } from "next/server";
import { isProduction } from "@/lib/env";

export async function GET() {
  const required = [
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    "SUPABASE_SERVICE_ROLE_KEY",
  ];

  const missing = isProduction() ? required.filter((key) => !process.env[key]) : [];
  const ok = missing.length === 0;

  return NextResponse.json(
    {
      ok,
      missing,
      timestamp: new Date().toISOString(),
    },
    { status: ok ? 200 : 500 }
  );
}
