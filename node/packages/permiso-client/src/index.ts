export type { PermisoConfig, Logger, Result } from "./types.js";
export { success, failure } from "./types.js";

export type {
  Tenant,
  User,
  Role,
  Resource,
  Property,
  Permission,
  UserPermission,
  RolePermission,
  EffectivePermission,
  CreateTenantInput,
  UpdateTenantInput,
  CreateUserInput,
  UpdateUserInput,
  CreateRoleInput,
  UpdateRoleInput,
  CreateResourceInput,
  UpdateResourceInput,
  PropertyInput,
  GrantUserPermissionInput,
  GrantRolePermissionInput,
  TenantFilter,
  UserFilter,
  RoleFilter,
  ResourceFilter,
  PropertyFilter,
  PaginationInput,
  SortDirection,
  TenantConnection,
  UserConnection,
  RoleConnection,
  ResourceConnection,
  PageInfo,
} from "./generated/types.js";

export type { PermisoClient, ConnectionPage } from "./client.js";
export { createPermisoClient, createNoOpPermisoClient } from "./client.js";
