import { typeUtils } from "@codespin/permiso-core";
import type {
  Tenant,
  TenantDbRow,
  Property,
  PropertyDbRow,
  Role,
  RoleDbRow,
  User,
  UserDbRow,
  Resource,
  ResourceDbRow,
  UserRole,
  UserRoleDbRow,
  UserPermissionWithTenantId,
  UserPermissionDbRow,
  RolePermissionWithTenantId,
  RolePermissionDbRow,
} from "./types.js";

// Tenant mappers
export function mapTenantFromDb(row: TenantDbRow): Tenant {
  return {
    ...typeUtils.toCamelCase(row),
    __typename: "Tenant",
    // These will be populated by GraphQL resolvers
    properties: [],
    resources: {
      __typename: "ResourceConnection",
      nodes: [],
      totalCount: 0,
      pageInfo: {
        __typename: "PageInfo",
        hasNextPage: false,
        hasPreviousPage: false,
        startCursor: null,
        endCursor: null,
      },
    },
    roles: {
      __typename: "RoleConnection",
      nodes: [],
      totalCount: 0,
      pageInfo: {
        __typename: "PageInfo",
        hasNextPage: false,
        hasPreviousPage: false,
        startCursor: null,
        endCursor: null,
      },
    },
    users: {
      __typename: "UserConnection",
      nodes: [],
      totalCount: 0,
      pageInfo: {
        __typename: "PageInfo",
        hasNextPage: false,
        hasPreviousPage: false,
        startCursor: null,
        endCursor: null,
      },
    },
  };
}

// Unified Property mapper
export function mapPropertyFromDb(row: PropertyDbRow): Property {
  // Cannot use toCamelCase here because PropertyDbRow has parent_id and tenant_id
  // which are not part of the Property type
  return {
    name: row.name,
    value: row.value,
    hidden: row.hidden,
    createdAt: row.created_at,
  };
}

// Legacy mappers for backward compatibility
export const mapTenantPropertyFromDb = mapPropertyFromDb;
export const mapRolePropertyFromDb = mapPropertyFromDb;
export const mapUserPropertyFromDb = mapPropertyFromDb;

// Role mappers
export function mapRoleFromDb(row: RoleDbRow): Role {
  return {
    ...typeUtils.toCamelCase(row),
    __typename: "Role",
    // tenant, permissions, properties, users
    // are NOT set here - they must be populated by GraphQL field resolvers
  } as Role;
}

// User mappers
export function mapUserFromDb(row: UserDbRow): User {
  return {
    ...typeUtils.toCamelCase(row),
    __typename: "User",
    // tenant, roles, permissions, properties, effectivePermissions
    // are NOT set here - they must be populated by GraphQL field resolvers
  } as User;
}

// Resource mappers
export function mapResourceFromDb(row: ResourceDbRow): Resource {
  return {
    ...typeUtils.toCamelCase(row),
    __typename: "Resource",
    // tenant, permissions
    // are NOT set here - they must be populated by GraphQL field resolvers
  } as Resource;
}

// User Role mappers
export function mapUserRoleFromDb(row: UserRoleDbRow): UserRole {
  return typeUtils.toCamelCase(row);
}

export function mapUserRoleToDb(userRole: UserRole): UserRoleDbRow {
  return typeUtils.toSnakeCase(userRole);
}

// User Permission mappers
export function mapUserPermissionFromDb(
  row: UserPermissionDbRow,
): UserPermissionWithTenantId {
  return typeUtils.toCamelCase(row);
}

export function mapUserPermissionToDb(
  perm: UserPermissionWithTenantId,
): UserPermissionDbRow {
  return typeUtils.toSnakeCase(perm);
}

// Role Permission mappers
export function mapRolePermissionFromDb(
  row: RolePermissionDbRow,
): RolePermissionWithTenantId {
  return typeUtils.toCamelCase(row);
}

export function mapRolePermissionToDb(
  perm: RolePermissionWithTenantId,
): RolePermissionDbRow {
  return typeUtils.toSnakeCase(perm);
}
