import { createClient, type User } from "@supabase/supabase-js";

import { getSupabaseServiceRoleClient, getSupabaseServerClientWithAuth } from "@/lib/supabase/server";
import type { Actor, Role } from "@/server/admin/authz";
import { canManageUsers, canReadUsers, canSetRole, roleRank } from "@/server/admin/authz";

export type UserStatus = "active" | "disabled";

export type UserSummary = {
  id: string;
  email: string;
  name: string | null;
  role: Role;
  status: UserStatus;
  createdAt: string;
};

export type AuditInsert = {
  action: string;
  modelType: string;
  modelId: number;
  oldValues?: Record<string, unknown> | null;
  newValues?: Record<string, unknown> | null;
};

function normalizeSearch(value: string) {
  return value.trim().toLowerCase();
}

function ensureAuthHeader(headers: Headers) {
  const raw = headers.get("authorization") || headers.get("Authorization");
  if (!raw) return null;
  const match = raw.match(/^Bearer\s+(.+)$/i);
  if (!match) return null;
  return match[1];
}

export async function getActorFromRequest(req: Request): Promise<Actor | null> {
  const token = ensureAuthHeader(req.headers);
  if (!token) return null;

  const anon = getSupabaseServerClientWithAuth(token);
  const service = getSupabaseServiceRoleClient();
  if (!anon || !service) return null;

  const { data: userData, error: userErr } = await anon.auth.getUser();
  if (userErr || !userData.user) return null;

  const user = userData.user;
  const { data: profileData, error: profileErr } = await service
    .from("profiles")
    .select("id, name, role, active")
    .eq("id", user.id)
    .maybeSingle();

  if (profileErr) return null;

  const role = (profileData?.role ?? "operator") as Role;
  const active = profileData?.active ?? true;

  return {
    id: user.id,
    email: user.email ?? null,
    role,
    active,
    name: profileData?.name ?? (typeof user.user_metadata?.name === "string" ? user.user_metadata.name : null),
  };
}

export async function insertAuditLog(actor: Actor, entry: AuditInsert) {
  const service = getSupabaseServiceRoleClient();
  if (!service) throw new Error("SUPABASE_SERVICE_ROLE_KEY não configurado");

  const payload = {
    user_id: actor.id,
    action: entry.action,
    model_type: entry.modelType,
    model_id: entry.modelId,
    old_values: entry.oldValues ?? null,
    new_values: {
      actorEmail: actor.email,
      actorRole: actor.role,
      ...(entry.newValues ?? {}),
    },
  };

  const { error } = await service.from("audit_logs").insert(payload);
  if (error) throw new Error(error.message);
}

async function listAllAuthUsers(service: NonNullable<ReturnType<typeof getSupabaseServiceRoleClient>>) {
  const perPage = 200;
  const users: User[] = [];
  let page = 1;

  for (;;) {
    const { data, error } = await service.auth.admin.listUsers({
      page,
      perPage,
    });
    if (error) throw new Error(error.message);

    users.push(...data.users);
    if (users.length >= data.total) break;
    if (data.users.length === 0) break;
    page += 1;
  }

  return users;
}

export async function listUsers(opts: {
  actor: Actor;
  search?: string;
  role?: Role;
  status?: UserStatus;
  page: number;
  pageSize: number;
}) {
  const { actor } = opts;
  if (!canReadUsers(actor)) throw new Error("Sem permissão");

  const service = getSupabaseServiceRoleClient();
  if (!service) throw new Error("SUPABASE_SERVICE_ROLE_KEY não configurado");

  const authUsers = await listAllAuthUsers(service);
  const ids = authUsers.map((u) => u.id);

  const { data: profilesData, error: profilesErr } = await service
    .from("profiles")
    .select("id, name, role, active")
    .in("id", ids);
  if (profilesErr) throw new Error(profilesErr.message);

  const profilesById = new Map(
    (profilesData ?? []).map((p) => [p.id as string, p])
  );

  const merged: UserSummary[] = authUsers.map((u) => {
    const p = profilesById.get(u.id);
    const role = ((p?.role ?? "operator") as Role) ?? "operator";
    const active = p?.active ?? true;

    return {
      id: u.id,
      email: u.email ?? "",
      name:
        (p?.name as string | null | undefined) ??
        (typeof u.user_metadata?.name === "string" ? u.user_metadata.name : null),
      role,
      status: active ? "active" : "disabled",
      createdAt: u.created_at,
    };
  });

  const s = opts.search ? normalizeSearch(opts.search) : "";

  const filtered = merged
    .filter((u) => {
      if (opts.role && u.role !== opts.role) return false;
      if (opts.status && u.status !== opts.status) return false;

      if (s.length > 0) {
        const name = (u.name ?? "").toLowerCase();
        const email = (u.email ?? "").toLowerCase();
        if (!name.includes(s) && !email.includes(s)) return false;
      }

      return true;
    })
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  const total = filtered.length;
  const start = (opts.page - 1) * opts.pageSize;
  const items = filtered.slice(start, start + opts.pageSize);

  return {
    items,
    total,
    page: opts.page,
    pageSize: opts.pageSize,
  };
}

export async function createUser(opts: {
  actor: Actor;
  email: string;
  name?: string;
  role: Role;
  password: string;
}) {
  const { actor } = opts;
  if (!canManageUsers(actor)) throw new Error("Sem permissão");
  if (!canSetRole(actor, opts.role)) throw new Error("Sem permissão para esse papel");

  const service = getSupabaseServiceRoleClient();
  if (!service) throw new Error("SUPABASE_SERVICE_ROLE_KEY não configurado");

  const { data, error } = await service.auth.admin.createUser({
    email: opts.email,
    password: opts.password,
    email_confirm: true,
    user_metadata: {
      name: opts.name,
    },
  });

  if (error) throw new Error(error.message);
  if (!data.user) throw new Error("Falha ao criar usuário");

  const now = new Date().toISOString();
  const { error: profileErr } = await service.from("profiles").upsert({
    id: data.user.id,
    name: opts.name ?? null,
    role: opts.role,
    active: true,
    updated_at: now,
  });
  if (profileErr) throw new Error(profileErr.message);

  await insertAuditLog(actor, {
    action: "user.create",
    modelType: "profiles",
    modelId: 0,
    newValues: {
      targetUserId: data.user.id,
      targetEmail: data.user.email,
      role: opts.role,
      name: opts.name ?? null,
    },
  });

  return {
    id: data.user.id,
    email: data.user.email ?? opts.email,
    name: opts.name ?? null,
    role: opts.role,
    status: "active" as const,
    createdAt: data.user.created_at,
  };
}

export async function updateUser(opts: {
  actor: Actor;
  targetId: string;
  name?: string;
  role?: Role;
  status?: UserStatus;
  currentPassword?: string;
  newPassword?: string;
}) {
  const { actor } = opts;
  if (!canManageUsers(actor)) throw new Error("Sem permissão");
  if (actor.id === opts.targetId && opts.status === "disabled") {
    throw new Error("Você não pode desativar seu próprio usuário");
  }

  if (opts.role && !canSetRole(actor, opts.role)) {
    throw new Error("Sem permissão para esse papel");
  }

  if (typeof opts.newPassword === "string" && opts.newPassword.length > 0) {
    if (!opts.currentPassword) throw new Error("Informe sua senha atual");
    if (!actor.email) throw new Error("Email do usuário autenticado não encontrado");

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !anonKey) throw new Error("Supabase não configurado");

    const reauth = createClient(url, anonKey, { auth: { persistSession: false } });
    const { error: signInErr } = await reauth.auth.signInWithPassword({
      email: actor.email,
      password: opts.currentPassword,
    });
    if (signInErr) throw new Error("Senha atual inválida");
  }

  const service = getSupabaseServiceRoleClient();
  if (!service) throw new Error("SUPABASE_SERVICE_ROLE_KEY não configurado");

  const { data: userData, error: userErr } =
    await service.auth.admin.getUserById(opts.targetId);
  if (userErr) throw new Error(userErr.message);
  if (!userData.user) throw new Error("Usuário não encontrado");

  const { data: currentProfile, error: profileReadErr } = await service
    .from("profiles")
    .select("id, name, role, active")
    .eq("id", opts.targetId)
    .maybeSingle();
  if (profileReadErr) throw new Error(profileReadErr.message);

  const currentRole = ((currentProfile?.role ?? "operator") as Role) ?? "operator";
  const currentActive = currentProfile?.active ?? true;
  const currentName = currentProfile?.name ?? null;
  const actorRank = roleRank(actor.role);
  const targetRank = roleRank(currentRole);
  if (actor.role !== "superadmin" && actor.id !== opts.targetId && actorRank <= targetRank) {
    throw new Error("Sem permissão");
  }

  const nextActive =
    typeof opts.status === "string" ? opts.status === "active" : undefined;
  const nextRole = opts.role;
  const nextName = opts.name;

  const roleChanged = typeof nextRole === "string" && nextRole !== currentRole;
  const statusChanged = typeof nextActive === "boolean" && nextActive !== currentActive;
  const nameChanged = typeof nextName === "string" && nextName !== currentName;

  const updatePayload: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };
  if (typeof nextName === "string") updatePayload.name = nextName;
  if (typeof nextRole === "string") updatePayload.role = nextRole;
  if (typeof nextActive === "boolean") updatePayload.active = nextActive;

  if (Object.keys(updatePayload).length > 1) {
    const { error: upsertErr } = await service.from("profiles").upsert({
      id: opts.targetId,
      name:
        typeof nextName === "string"
          ? nextName
          : (currentProfile?.name ?? null),
      role:
        typeof nextRole === "string"
          ? nextRole
          : ((currentProfile?.role ?? "operator") as Role),
      active:
        typeof nextActive === "boolean"
          ? nextActive
          : (currentProfile?.active ?? true),
      updated_at: updatePayload.updated_at,
    });
    if (upsertErr) throw new Error(upsertErr.message);
  }

  if (typeof nextName === "string") {
    const { error: authUpdateErr } = await service.auth.admin.updateUserById(
      opts.targetId,
      {
        user_metadata: {
          ...(userData.user.user_metadata ?? {}),
          name: nextName,
        },
      }
    );
    if (authUpdateErr) throw new Error(authUpdateErr.message);
  }

  if (typeof opts.newPassword === "string" && opts.newPassword.length > 0) {
    const { error: authPwdErr } = await service.auth.admin.updateUserById(opts.targetId, {
      password: opts.newPassword,
    });
    if (authPwdErr) throw new Error(authPwdErr.message);
  }

  const nextResolvedRole = typeof nextRole === "string" ? nextRole : currentRole;
  const nextResolvedActive = typeof nextActive === "boolean" ? nextActive : currentActive;
  const nextResolvedName = typeof nextName === "string" ? nextName : currentName;
  const oldStatus: UserStatus = currentActive ? "active" : "disabled";
  const newStatus: UserStatus = nextResolvedActive ? "active" : "disabled";

  const baseOld = {
    targetUserId: opts.targetId,
    targetEmail: userData.user.email,
    name: currentName,
    role: currentRole,
    status: oldStatus,
  };

  const baseNew = {
    targetUserId: opts.targetId,
    targetEmail: userData.user.email,
    name: nextResolvedName,
    role: nextResolvedRole,
    status: newStatus,
  };

  if (roleChanged) {
    await insertAuditLog(actor, {
      action: "user.role.change",
      modelType: "profiles",
      modelId: 0,
      oldValues: baseOld,
      newValues: baseNew,
    });
  }

  if (statusChanged) {
    await insertAuditLog(actor, {
      action: nextResolvedActive ? "user.enable" : "user.disable",
      modelType: "profiles",
      modelId: 0,
      oldValues: baseOld,
      newValues: baseNew,
    });
  }

  if (nameChanged && !roleChanged && !statusChanged) {
    await insertAuditLog(actor, {
      action: "user.update",
      modelType: "profiles",
      modelId: 0,
      oldValues: baseOld,
      newValues: baseNew,
    });
  }

  const refreshedProfile = {
    name:
      nextResolvedName,
    role:
      nextResolvedRole,
    active:
      nextResolvedActive,
  };

  return {
    id: opts.targetId,
    email: userData.user.email ?? "",
    name: refreshedProfile.name,
    role: refreshedProfile.role,
    status: refreshedProfile.active ? ("active" as const) : ("disabled" as const),
    createdAt: userData.user.created_at,
  };
}

export async function disableUser(opts: { actor: Actor; targetId: string }) {
  return updateUser({ actor: opts.actor, targetId: opts.targetId, status: "disabled" });
}

