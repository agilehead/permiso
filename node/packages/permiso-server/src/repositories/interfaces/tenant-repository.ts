/**
 * Tenant Repository Interface
 * Database-agnostic contract for tenant data access
 *
 * Note: Tenants are not RLS-protected - they are globally accessible.
 * The tenantId parameter is not used for filtering in most operations.
 */

import type {
  Result,
  PaginationInput,
  Connection,
  PropertyInput,
  Property,
} from "./types.js";

// Tenant entity (domain model, not GraphQL)
export type Tenant = {
  id: string;
  name: string;
  description: string | null;
  createdAt: number;
  updatedAt: number;
};

// Filter for listing tenants
export type TenantFilter = {
  name?: string;
};

// Input for creating a tenant
export type CreateTenantInput = {
  id: string;
  name: string;
  description?: string;
  properties?: PropertyInput[];
};

// Input for updating a tenant
export type UpdateTenantInput = {
  name?: string;
  description?: string;
};

export type ITenantRepository = {
  // CRUD operations (tenants are not tenant-scoped)
  create(input: CreateTenantInput): Promise<Result<Tenant>>;
  getById(tenantId: string): Promise<Result<Tenant | null>>;
  list(
    filter?: TenantFilter,
    pagination?: PaginationInput,
  ): Promise<Result<Connection<Tenant>>>;
  update(tenantId: string, input: UpdateTenantInput): Promise<Result<Tenant>>;
  delete(tenantId: string): Promise<Result<boolean>>;

  // Properties
  getProperties(tenantId: string): Promise<Result<Property[]>>;
  getProperty(tenantId: string, name: string): Promise<Result<Property | null>>;
  setProperty(
    tenantId: string,
    property: PropertyInput,
  ): Promise<Result<Property>>;
  deleteProperty(tenantId: string, name: string): Promise<Result<boolean>>;
};
