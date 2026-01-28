"use client";

import * as React from "react";

import { Badge } from "@/components/ui/badge";
import type { Role, UserStatus } from "@/features/adminUsers/types";

export function RoleBadge({ role }: { role: Role }) {
  if (role === "superadmin") return <Badge variant="default">superadmin</Badge>;
  if (role === "admin") return <Badge variant="outline">admin</Badge>;
  return <Badge variant="outline">operator</Badge>;
}

export function StatusBadge({ status }: { status: UserStatus }) {
  if (status === "disabled") return <Badge variant="danger">disabled</Badge>;
  return <Badge variant="success">active</Badge>;
}

