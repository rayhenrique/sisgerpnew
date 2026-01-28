export type Role = "operator" | "admin" | "superadmin";

export type UserStatus = "active" | "disabled";

export type UserSummary = {
  id: string;
  email: string;
  name: string | null;
  role: Role;
  status: UserStatus;
  createdAt: string;
};

export type AuditLogItem = {
  id: string;
  createdAt: string;
  action: string;
  actorUserId: string;
  actorEmail: string | null;
  actorRole: string | null;
  targetUserId: string | null;
  targetEmail: string | null;
  oldValues: Record<string, unknown> | null;
  newValues: Record<string, unknown> | null;
};

export type PagedResult<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
};

