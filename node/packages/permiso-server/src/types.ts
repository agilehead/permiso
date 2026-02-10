// Re-export all GraphQL generated types
export * from "./generated/graphql.js";

// Permission types with tenantId (for internal use, since GraphQL doesn't have tenantId)
export type UserPermissionWithTenantId = {
  userId: string;
  tenantId: string;
  resourceId: string;
  action: string;
  createdAt: number;
};

export type RolePermissionWithTenantId = {
  roleId: string;
  tenantId: string;
  resourceId: string;
  action: string;
  createdAt: number;
};

// Database row types (snake_case)
export type TenantDbRow = {
  id: string;
  name: string;
  description: string | null;
  created_at: number;
  updated_at: number;
};

export type PropertyDbRow = {
  parent_id: string;
  tenant_id?: string; // Only for user_property and role_property
  name: string;
  value: unknown; // JSONB value
  hidden: boolean;
  created_at: number;
};

// Legacy type aliases for backward compatibility during migration
export type TenantPropertyDbRow = PropertyDbRow;
export type UserPropertyDbRow = PropertyDbRow;
export type RolePropertyDbRow = PropertyDbRow;

export type RoleDbRow = {
  id: string;
  tenant_id: string;
  name: string;
  description: string | null;
  created_at: number;
  updated_at: number;
};

export type UserDbRow = {
  id: string;
  tenant_id: string;
  identity_provider: string;
  identity_provider_user_id: string;
  created_at: number;
  updated_at: number;
};

export type ResourceDbRow = {
  id: string;
  tenant_id: string;
  name: string | null;
  description: string | null;
  created_at: number;
  updated_at: number;
};

export type UserRoleDbRow = {
  user_id: string;
  role_id: string;
  tenant_id: string;
  created_at: number;
};

export type UserPermissionDbRow = {
  user_id: string;
  tenant_id: string;
  resource_id: string;
  action: string;
  created_at: number;
};

export type RolePermissionDbRow = {
  role_id: string;
  tenant_id: string;
  resource_id: string;
  action: string;
  created_at: number;
};

// Domain-specific types that bridge database and GraphQL

// Join table type
export type UserRole = {
  userId: string;
  roleId: string;
  tenantId: string;
  createdAt: number;
};

// Extended types with properties as Record (for internal use)
export type TenantWithProperties = {
  id: string;
  name: string;
  description?: string | null;
  createdAt: number;
  updatedAt: number;
  properties: Record<string, unknown>;
};

export type RoleWithProperties = {
  id: string;
  tenantId: string;
  name: string;
  description?: string | null;
  createdAt: number;
  updatedAt: number;
  properties: Record<string, unknown>;
};

export type UserWithProperties = {
  id: string;
  tenantId: string;
  identityProvider: string;
  identityProviderUserId: string;
  createdAt: number;
  updatedAt: number;
  properties: Record<string, unknown>;
  roleIds: string[];
};
