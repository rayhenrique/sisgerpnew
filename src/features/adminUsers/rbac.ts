import type { Role } from "@/features/adminUsers/types";

export function roleRank(role: Role) {
  if (role === "superadmin") return 3;
  if (role === "admin") return 2;
  return 1;
}

export function canManageUsers(role: Role) {
  return roleRank(role) >= 2;
}

export function canSetRole(actorRole: Role, targetRole: Role) {
  if (!canManageUsers(actorRole)) return false;
  if (actorRole === "admin") return targetRole !== "superadmin";
  return true;
}

