import { graphqlRequest } from "../http-client.js";
import type { Result, PermisoConfig } from "../types.js";
import { buildHeaders } from "./utils.js";
import type {
  Tenant,
  CreateTenantInput,
  UpdateTenantInput,
  TenantFilter,
  PaginationInput,
  Property,
} from "../generated/types.js";

/**
 * Get a tenant by ID
 */
export async function getTenant(
  config: PermisoConfig,
  id: string,
): Promise<Result<Tenant | null>> {
  const query = `
    query GetTenant($id: ID!) {
      tenant(id: $id) {
        id
        name
        description
        properties {
          name
          value
          hidden
          createdAt
        }
        createdAt
        updatedAt
      }
    }
  `;

  const result = await graphqlRequest<{ tenant: Tenant | null }>({
    endpoint: `${config.endpoint}/graphql`,
    query,
    variables: { id },
    headers: buildHeaders(config),
    timeout: config.timeout,
    logger: config.logger,
  });

  if (!result.success) {
    return result;
  }

  return { success: true, data: result.data.tenant };
}

/**
 * List all tenants with optional filtering and pagination
 */
export async function listTenants(
  config: PermisoConfig,
  options?: {
    filter?: TenantFilter;
    pagination?: PaginationInput;
  },
): Promise<
  Result<
    {
      nodes: Tenant[];
      totalCount: number;
      pageInfo: {
        hasNextPage: boolean;
        hasPreviousPage: boolean;
        startCursor?: string;
        endCursor?: string;
      };
    }
  >
> {
  const query = `
    query ListTenants($filter: TenantFilter, $pagination: PaginationInput) {
      tenants(filter: $filter, pagination: $pagination) {
        nodes {
          id
          name
          description
          properties {
            name
            value
            hidden
            createdAt
          }
          createdAt
          updatedAt
        }
        totalCount
        pageInfo {
          hasNextPage
          hasPreviousPage
          startCursor
          endCursor
        }
      }
    }
  `;

  const result = await graphqlRequest<{
    tenants: {
      nodes: Tenant[];
      totalCount: number;
      pageInfo: {
        hasNextPage: boolean;
        hasPreviousPage: boolean;
        startCursor?: string;
        endCursor?: string;
      };
    };
  }>({
    endpoint: `${config.endpoint}/graphql`,
    query,
    variables: {
      filter: options?.filter,
      pagination: options?.pagination,
    },
    headers: buildHeaders(config),
    timeout: config.timeout,
    logger: config.logger,
  });

  if (!result.success) {
    return result;
  }

  return { success: true, data: result.data.tenants };
}

/**
 * Get tenants by IDs
 */
export async function getTenantsByIds(
  config: PermisoConfig,
  ids: string[],
): Promise<Result<Tenant[]>> {
  const query = `
    query GetTenantsByIds($ids: [ID!]!) {
      tenantsByIds(ids: $ids) {
        id
        name
        description
        properties {
          name
          value
          hidden
          createdAt
        }
        createdAt
        updatedAt
      }
    }
  `;

  const result = await graphqlRequest<{ tenantsByIds: Tenant[] }>({
    endpoint: `${config.endpoint}/graphql`,
    query,
    variables: { ids },
    headers: buildHeaders(config),
    timeout: config.timeout,
    logger: config.logger,
  });

  if (!result.success) {
    return result;
  }

  return { success: true, data: result.data.tenantsByIds };
}

/**
 * Create a new tenant
 */
export async function createTenant(
  config: PermisoConfig,
  input: CreateTenantInput,
): Promise<Result<Tenant>> {
  const mutation = `
    mutation CreateTenant($input: CreateTenantInput!) {
      createTenant(input: $input) {
        id
        name
        description
        properties {
          name
          value
          hidden
          createdAt
        }
        createdAt
        updatedAt
      }
    }
  `;

  const result = await graphqlRequest<{ createTenant: Tenant }>({
    endpoint: `${config.endpoint}/graphql`,
    query: mutation,
    variables: { input },
    headers: buildHeaders(config),
    timeout: config.timeout,
    logger: config.logger,
  });

  if (!result.success) {
    return result;
  }

  return { success: true, data: result.data.createTenant };
}

/**
 * Update a tenant
 */
export async function updateTenant(
  config: PermisoConfig,
  id: string,
  input: UpdateTenantInput,
): Promise<Result<Tenant>> {
  const mutation = `
    mutation UpdateTenant($id: ID!, $input: UpdateTenantInput!) {
      updateTenant(id: $id, input: $input) {
        id
        name
        description
        properties {
          name
          value
          hidden
          createdAt
        }
        createdAt
        updatedAt
      }
    }
  `;

  const result = await graphqlRequest<{ updateTenant: Tenant }>({
    endpoint: `${config.endpoint}/graphql`,
    query: mutation,
    variables: { id, input },
    headers: buildHeaders(config),
    timeout: config.timeout,
    logger: config.logger,
  });

  if (!result.success) {
    return result;
  }

  return { success: true, data: result.data.updateTenant };
}

/**
 * Delete a tenant
 */
export async function deleteTenant(
  config: PermisoConfig,
  id: string,
  safetyKey?: string,
): Promise<Result<boolean>> {
  const mutation = `
    mutation DeleteTenant($id: ID!, $safetyKey: String) {
      deleteTenant(id: $id, safetyKey: $safetyKey)
    }
  `;

  const result = await graphqlRequest<{ deleteTenant: boolean }>({
    endpoint: `${config.endpoint}/graphql`,
    query: mutation,
    variables: { id, safetyKey },
    headers: buildHeaders(config),
    timeout: config.timeout,
    logger: config.logger,
  });

  if (!result.success) {
    return result;
  }

  return { success: true, data: result.data.deleteTenant };
}

/**
 * Get a specific tenant property
 */
export async function getTenantProperty(
  config: PermisoConfig,
  tenantId: string,
  propertyName: string,
): Promise<Result<Property | null>> {
  const query = `
    query GetTenantProperty($tenantId: ID!, $propertyName: String!) {
      tenantProperty(tenantId: $tenantId, propertyName: $propertyName) {
        name
        value
        hidden
        createdAt
      }
    }
  `;

  const result = await graphqlRequest<{
    tenantProperty: Property | null;
  }>({
    endpoint: `${config.endpoint}/graphql`,
    query,
    variables: { tenantId, propertyName },
    headers: buildHeaders(config),
    timeout: config.timeout,
    logger: config.logger,
  });

  if (!result.success) {
    return result;
  }

  return { success: true, data: result.data.tenantProperty };
}

/**
 * Set a tenant property
 */
export async function setTenantProperty(
  config: PermisoConfig,
  tenantId: string,
  name: string,
  value: unknown,
  hidden?: boolean,
): Promise<Result<Property>> {
  const mutation = `
    mutation SetTenantProperty(
      $tenantId: ID!,
      $name: String!,
      $value: JSON,
      $hidden: Boolean
    ) {
      setTenantProperty(
        tenantId: $tenantId,
        name: $name,
        value: $value,
        hidden: $hidden
      ) {
        name
        value
        hidden
        createdAt
      }
    }
  `;

  const result = await graphqlRequest<{ setTenantProperty: Property }>({
    endpoint: `${config.endpoint}/graphql`,
    query: mutation,
    variables: { tenantId, name, value, hidden },
    headers: buildHeaders(config),
    timeout: config.timeout,
    logger: config.logger,
  });

  if (!result.success) {
    return result;
  }

  return { success: true, data: result.data.setTenantProperty };
}

/**
 * Delete a tenant property
 */
export async function deleteTenantProperty(
  config: PermisoConfig,
  tenantId: string,
  name: string,
): Promise<Result<boolean>> {
  const mutation = `
    mutation DeleteTenantProperty($tenantId: ID!, $name: String!) {
      deleteTenantProperty(tenantId: $tenantId, name: $name)
    }
  `;

  const result = await graphqlRequest<{ deleteTenantProperty: boolean }>({
    endpoint: `${config.endpoint}/graphql`,
    query: mutation,
    variables: { tenantId, name },
    headers: buildHeaders(config),
    timeout: config.timeout,
    logger: config.logger,
  });

  if (!result.success) {
    return result;
  }

  return { success: true, data: result.data.deleteTenantProperty };
}
