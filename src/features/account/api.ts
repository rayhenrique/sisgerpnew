import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

async function getAccessToken() {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) throw new Error("Supabase não configurado");

  const { data, error } = await supabase.auth.getSession();
  if (error) throw new Error(error.message);

  const token = data.session?.access_token;
  if (!token) throw new Error("Sessão expirada. Faça login novamente.");
  return token;
}

export async function changeMyPassword(body: {
  currentPassword: string;
  newPassword: string;
}): Promise<void> {
  const token = await getAccessToken();

  const res = await fetch("/api/account/password", {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (res.status === 204) return;

  const json = (await res.json().catch(() => null)) as unknown;
  const message =
    json &&
    typeof json === "object" &&
    !Array.isArray(json) &&
    "message" in json &&
    typeof (json as Record<string, unknown>).message === "string"
      ? ((json as Record<string, unknown>).message as string)
      : "Erro ao alterar senha";

  throw new Error(message);
}
