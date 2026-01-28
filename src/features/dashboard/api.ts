import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import type { DashboardOverview } from "@/features/dashboard/types";

async function getAccessToken() {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) throw new Error("Supabase não configurado");

  const { data, error } = await supabase.auth.getSession();
  if (error) throw new Error(error.message);
  const token = data.session?.access_token;
  if (!token) throw new Error("Sessão expirada. Faça login novamente.");
  return token;
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const token = await getAccessToken();

  const res = await fetch(path, {
    ...init,
    headers: {
      ...(init?.headers ?? {}),
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  const json = (await res.json().catch(() => null)) as unknown;
  if (!res.ok) {
    const msg =
      json &&
      typeof json === "object" &&
      !Array.isArray(json) &&
      "message" in json &&
      typeof (json as Record<string, unknown>).message === "string"
        ? ((json as Record<string, unknown>).message as string)
        : "Erro na API";

    throw new Error(msg);
  }
  return json as T;
}

export async function fetchDashboardOverview(params?: { year?: number }): Promise<DashboardOverview> {
  const sp = new URLSearchParams();
  if (params?.year) sp.set("year", String(params.year));
  const qs = sp.toString();
  return apiFetch<DashboardOverview>(`/api/dashboard/overview${qs ? `?${qs}` : ""}`);
}

