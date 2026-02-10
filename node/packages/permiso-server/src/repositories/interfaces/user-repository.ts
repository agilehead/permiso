/**
 * User Repository Interface
 * Database-agnostic contract for user data access
 */

import type {
  Result,
  PaginationInput,
  Connection,
  PropertyInput,
  Property,
} from "./types.js";

// User entity (domain model, not GraphQL)
export type User = {
  id: string;
  tenantId: string;
  identityProvider: string;
  identityProviderUserId: string;
  createdAt: number;
  updatedAt: number;
};

// Filter for listing users
export type UserFilter = {
  identityProvider?: string;
};

// Input for creating a user
export type CreateUserInput = {
  id: string;
  identityProvider: string;
  identityProviderUserId: string;
  properties?: PropertyInput[];
  roleIds?: string[];
};

// Input for updating a user
export type UpdateUserInput = {
  identityProvider?: string;
  identityProviderUserId?: string;
};

export type IUserRepository = {
  // CRUD operations
  create(tenantId: string, input: CreateUserInput): Promise<Result<User>>;
  getById(tenantId: string, userId: string): Promise<Result<User | null>>;
  getByIdentity(
    tenantId: string,
    identityProvider: string,
    identityProviderUserId: string,
  ): Promise<Result<User | null>>;
  list(
    tenantId: string,
    filter?: UserFilter,
    pagination?: PaginationInput,
  ): Promise<Result<Connection<User>>>;
  listByTenant(
    tenantId: string,
    pagination?: PaginationInput,
  ): Promise<Result<Connection<User>>>;
  update(
    tenantId: string,
    userId: string,
    input: UpdateUserInput,
  ): Promise<Result<User>>;
  delete(tenantId: string, userId: string): Promise<Result<boolean>>;

  // Role assignments
  assignRole(
    tenantId: string,
    userId: string,
    roleId: string,
  ): Promise<Result<void>>;
  unassignRole(
    tenantId: string,
    userId: string,
    roleId: string,
  ): Promise<Result<void>>;
  getRoleIds(tenantId: string, userId: string): Promise<Result<string[]>>;

  // Properties
  getProperties(tenantId: string, userId: string): Promise<Result<Property[]>>;
  getProperty(
    tenantId: string,
    userId: string,
    name: string,
  ): Promise<Result<Property | null>>;
  setProperty(
    tenantId: string,
    userId: string,
    property: PropertyInput,
  ): Promise<Result<Property>>;
  deleteProperty(
    tenantId: string,
    userId: string,
    name: string,
  ): Promise<Result<boolean>>;
};
