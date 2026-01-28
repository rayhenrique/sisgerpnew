import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import type { AuditLogItem, PagedResult, Role, UserStatus, UserSummary } from "@/features/adminUsers/types";

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

  if (res.status === 204) return undefined as unknown as T;

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

export async function fetchUsers(params: {
  search?: string;
  role?: Role | "";
  status?: UserStatus | "";
  page: number;
  pageSize: number;
}): Promise<PagedResult<UserSummary>> {
  const sp = new URLSearchParams();
  if (params.search && params.search.trim()) sp.set("search", params.search.trim());
  if (params.role) sp.set("role", params.role);
  if (params.status) sp.set("status", params.status);
  sp.set("page", String(params.page));
  sp.set("pageSize", String(params.pageSize));

  return apiFetch<PagedResult<UserSummary>>(`/api/admin/users?${sp.toString()}`);
}

export async function createUser(body: {
  email: string;
  name?: string;
  role: Role;
  password: string;
}): Promise<UserSummary> {
  return apiFetch<UserSummary>("/api/admin/users", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function updateUser(id: string, body: {
  name?: string;
  role?: Role;
  status?: UserStatus;
  currentPassword?: string;
  newPassword?: string;
}): Promise<UserSummary> {
  return apiFetch<UserSummary>(`/api/admin/users/${id}`,
    { method: "PATCH", body: JSON.stringify(body) }
  );
}

export async function disableUser(id: string): Promise<void> {
  return apiFetch<void>(`/api/admin/users/${id}`, { method: "DELETE" });
}

export async function fetchAuditLogs(params: {
  page: number;
  pageSize: number;
  action?: string;
}): Promise<PagedResult<AuditLogItem>> {
  const sp = new URLSearchParams();
  sp.set("page", String(params.page));
  sp.set("pageSize", String(params.pageSize));
  if (params.action) sp.set("action", params.action);

  return apiFetch<PagedResult<AuditLogItem>>(`/api/admin/audit-logs?${sp.toString()}`);
}

