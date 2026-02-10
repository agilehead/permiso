/**
 * Permission Repository Interface
 * Database-agnostic contract for permission data access
 *
 * Handles both user permissions and role permissions.
 */

import type { Result } from "./types.js";

// User permission entity
export type UserPermission = {
  userId: string;
  tenantId: string;
  resourceId: string;
  action: string;
  createdAt: number;
};

// Role permission entity
export type RolePermission = {
  roleId: string;
  tenantId: string;
  resourceId: string;
  action: string;
  createdAt: number;
};

// Effective permission (computed from user + role permissions)
export type EffectivePermission = {
  resourceId: string;
  action: string;
  source: "user" | "role";
  sourceId: string | null; // userId or roleId
  createdAt: number;
};

// Input for granting a permission
export type GrantPermissionInput = {
  resourceId: string;
  action: string;
};

export type IPermissionRepository = {
  // User permissions
  grantUserPermission(
    tenantId: string,
    userId: string,
    input: GrantPermissionInput,
  ): Promise<Result<UserPermission>>;
  revokeUserPermission(
    tenantId: string,
    userId: string,
    resourceId: string,
    action: string,
  ): Promise<Result<boolean>>;
  getUserPermissions(
    tenantId: string,
    userId: string,
  ): Promise<Result<UserPermission[]>>;

  // Role permissions
  grantRolePermission(
    tenantId: string,
    roleId: string,
    input: GrantPermissionInput,
  ): Promise<Result<RolePermission>>;
  revokeRolePermission(
    tenantId: string,
    roleId: string,
    resourceId: string,
    action: string,
  ): Promise<Result<boolean>>;
  getRolePermissions(
    tenantId: string,
    roleId: string,
  ): Promise<Result<RolePermission[]>>;

  // Permission queries
  getPermissionsByResource(
    tenantId: string,
    resourceId: string,
  ): Promise<
    Result<{
      userPermissions: UserPermission[];
      rolePermissions: RolePermission[];
    }>
  >;

  // Effective permissions (includes wildcard matching)
  getEffectivePermissions(
    tenantId: string,
    userId: string,
    resourceId?: string,
    action?: string,
  ): Promise<Result<EffectivePermission[]>>;

  // Permission check (includes wildcard matching)
  hasPermission(
    tenantId: string,
    userId: string,
    resourceId: string,
    action: string,
  ): Promise<Result<boolean>>;

  // Prefix-based queries (for wildcard resources like /india/*)
  getEffectivePermissionsByPrefix(
    tenantId: string,
    userId: string,
    resourceIdPrefix: string,
  ): Promise<Result<EffectivePermission[]>>;
};
