export type Role = "operator" | "admin" | "superadmin";

export type Actor = {
  id: string;
  email: string | null;
  role: Role;
  active: boolean;
  name: string | null;
};

export function roleRank(role: Role) {
  if (role === "superadmin") return 3;
  if (role === "admin") return 2;
  return 1;
}

export function canReadUsers(actor: Actor) {
  return actor.active && roleRank(actor.role) >= 1;
}

export function canManageUsers(actor: Actor) {
  return actor.active && roleRank(actor.role) >= 2;
}

export function canSetRole(actor: Actor, targetRole: Role) {
  if (!canManageUsers(actor)) return false;
  if (actor.role === "admin") return targetRole !== "superadmin";
  return true;
}

