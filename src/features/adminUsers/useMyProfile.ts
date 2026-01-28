"use client";

import * as React from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import type { Role } from "@/features/adminUsers/types";

export type MyProfile = {
  id: string;
  email: string | null;
  name: string | null;
  role: Role;
  active: boolean;
};

export function useMyProfile() {
  const [loading, setLoading] = React.useState(true);
  const [profile, setProfile] = React.useState<MyProfile | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const reload = React.useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const supabase = getSupabaseBrowserClient();
      if (!supabase) throw new Error("Supabase não configurado");

      const { data: userData, error: userErr } = await supabase.auth.getUser();
      if (userErr) throw new Error(userErr.message);
      if (!userData.user) throw new Error("Não autenticado");

      const { data: p, error: pErr } = await supabase
        .from("profiles")
        .select("id, name, role, active")
        .eq("id", userData.user.id)
        .maybeSingle();
      if (pErr) throw new Error(pErr.message);

      const role = ((p?.role ?? "operator") as Role) ?? "operator";
      const active = p?.active ?? true;

      setProfile({
        id: userData.user.id,
        email: userData.user.email ?? null,
        name: (p?.name as string | null | undefined) ?? null,
        role,
        active,
      });
    } catch (e) {
      setProfile(null);
      setError(e instanceof Error ? e.message : "Erro ao carregar perfil");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    reload();
  }, [reload]);

  return { loading, profile, error, reload };
}

