/**
 * Role Repository Interface
 * Database-agnostic contract for role data access
 */

import type {
  Result,
  PaginationInput,
  Connection,
  PropertyInput,
  Property,
} from "./types.js";

// Role entity (domain model, not GraphQL)
export type Role = {
  id: string;
  tenantId: string;
  name: string;
  description: string | null;
  createdAt: number;
  updatedAt: number;
};

// Filter for listing roles
export type RoleFilter = {
  name?: string;
};

// Input for creating a role
export type CreateRoleInput = {
  id: string;
  name: string;
  description?: string;
  properties?: PropertyInput[];
};

// Input for updating a role
export type UpdateRoleInput = {
  name?: string;
  description?: string;
};

export type IRoleRepository = {
  // CRUD operations
  create(tenantId: string, input: CreateRoleInput): Promise<Result<Role>>;
  getById(tenantId: string, roleId: string): Promise<Result<Role | null>>;
  list(
    tenantId: string,
    filter?: RoleFilter,
    pagination?: PaginationInput,
  ): Promise<Result<Connection<Role>>>;
  listByTenant(
    tenantId: string,
    pagination?: PaginationInput,
  ): Promise<Result<Connection<Role>>>;
  update(
    tenantId: string,
    roleId: string,
    input: UpdateRoleInput,
  ): Promise<Result<Role>>;
  delete(tenantId: string, roleId: string): Promise<Result<boolean>>;

  // User assignments
  getUserIds(tenantId: string, roleId: string): Promise<Result<string[]>>;

  // Properties
  getProperties(tenantId: string, roleId: string): Promise<Result<Property[]>>;
  getProperty(
    tenantId: string,
    roleId: string,
    name: string,
  ): Promise<Result<Property | null>>;
  setProperty(
    tenantId: string,
    roleId: string,
    property: PropertyInput,
  ): Promise<Result<Property>>;
  deleteProperty(
    tenantId: string,
    roleId: string,
    name: string,
  ): Promise<Result<boolean>>;
};
