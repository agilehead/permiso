import { graphqlRequest } from "../http-client.js";
import type { Result, PermisoConfig } from "../types.js";
import { buildHeaders } from "./utils.js";
import type {
  Role,
  CreateRoleInput,
  UpdateRoleInput,
  RoleFilter,
  PaginationInput,
  Property,
} from "../generated/types.js";

/**
 * Get a role by tenant and role ID
 */
export async function getRole(
  config: PermisoConfig,
  roleId: string,
): Promise<Result<Role | null>> {
  const query = `
    query GetRole($roleId: ID!) {
      role(roleId: $roleId) {
        id
        tenantId
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

  const result = await graphqlRequest<{ role: Role | null }>({
    endpoint: `${config.endpoint}/graphql`,
    query,
    variables: { roleId },
    headers: buildHeaders(config),
    timeout: config.timeout,
    logger: config.logger,
  });

  if (!result.success) {
    return result;
  }

  return { success: true, data: result.data.role };
}

/**
 * List roles in a tenant with optional filtering and pagination
 */
export async function listRoles(
  config: PermisoConfig,
  options?: {
    filter?: RoleFilter;
    pagination?: PaginationInput;
  },
): Promise<
  Result<
    {
      nodes: Role[];
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
    query ListRoles($filter: RoleFilter, $pagination: PaginationInput) {
      roles(filter: $filter, pagination: $pagination) {
        nodes {
          id
          tenantId
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
    roles: {
      nodes: Role[];
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

  return { success: true, data: result.data.roles };
}

/**
 * Get roles by IDs
 */
export async function getRolesByIds(
  config: PermisoConfig,
  ids: string[],
): Promise<Result<Role[]>> {
  const query = `
    query GetRolesByIds($ids: [ID!]!) {
      rolesByIds(ids: $ids) {
        id
        tenantId
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

  const result = await graphqlRequest<{ rolesByIds: Role[] }>({
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

  return { success: true, data: result.data.rolesByIds };
}

/**
 * Create a new role
 */
export async function createRole(
  config: PermisoConfig,
  input: CreateRoleInput,
): Promise<Result<Role>> {
  const mutation = `
    mutation CreateRole($input: CreateRoleInput!) {
      createRole(input: $input) {
        id
        tenantId
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

  const result = await graphqlRequest<{ createRole: Role }>({
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

  return { success: true, data: result.data.createRole };
}

/**
 * Update a role
 */
export async function updateRole(
  config: PermisoConfig,
  roleId: string,
  input: UpdateRoleInput,
): Promise<Result<Role>> {
  const mutation = `
    mutation UpdateRole($roleId: ID!, $input: UpdateRoleInput!) {
      updateRole(roleId: $roleId, input: $input) {
        id
        tenantId
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

  const result = await graphqlRequest<{ updateRole: Role }>({
    endpoint: `${config.endpoint}/graphql`,
    query: mutation,
    variables: { roleId, input },
    headers: buildHeaders(config),
    timeout: config.timeout,
    logger: config.logger,
  });

  if (!result.success) {
    return result;
  }

  return { success: true, data: result.data.updateRole };
}

/**
 * Delete a role
 */
export async function deleteRole(
  config: PermisoConfig,
  roleId: string,
): Promise<Result<boolean>> {
  const mutation = `
    mutation DeleteRole($roleId: ID!) {
      deleteRole(roleId: $roleId)
    }
  `;

  const result = await graphqlRequest<{ deleteRole: boolean }>({
    endpoint: `${config.endpoint}/graphql`,
    query: mutation,
    variables: { roleId },
    headers: buildHeaders(config),
    timeout: config.timeout,
    logger: config.logger,
  });

  if (!result.success) {
    return result;
  }

  return { success: true, data: result.data.deleteRole };
}

/**
 * Get a specific role property
 */
export async function getRoleProperty(
  config: PermisoConfig,
  roleId: string,
  propertyName: string,
): Promise<Result<Property | null>> {
  const query = `
    query GetRoleProperty($roleId: ID!, $propertyName: String!) {
      roleProperty(roleId: $roleId, propertyName: $propertyName) {
        name
        value
        hidden
        createdAt
      }
    }
  `;

  const result = await graphqlRequest<{ roleProperty: Property | null }>({
    endpoint: `${config.endpoint}/graphql`,
    query,
    variables: { roleId, propertyName },
    headers: buildHeaders(config),
    timeout: config.timeout,
    logger: config.logger,
  });

  if (!result.success) {
    return result;
  }

  return { success: true, data: result.data.roleProperty };
}

/**
 * Set a role property
 */
export async function setRoleProperty(
  config: PermisoConfig,
  roleId: string,
  name: string,
  value: unknown,
  hidden?: boolean,
): Promise<Result<Property>> {
  const mutation = `
    mutation SetRoleProperty(
      $roleId: ID!,
      $name: String!,
      $value: JSON,
      $hidden: Boolean
    ) {
      setRoleProperty(
        roleId: $roleId,
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

  const result = await graphqlRequest<{ setRoleProperty: Property }>({
    endpoint: `${config.endpoint}/graphql`,
    query: mutation,
    variables: { roleId, name, value, hidden },
    headers: buildHeaders(config),
    timeout: config.timeout,
    logger: config.logger,
  });

  if (!result.success) {
    return result;
  }

  return { success: true, data: result.data.setRoleProperty };
}

/**
 * Delete a role property
 */
export async function deleteRoleProperty(
  config: PermisoConfig,
  roleId: string,
  name: string,
): Promise<Result<boolean>> {
  const mutation = `
    mutation DeleteRoleProperty($roleId: ID!, $name: String!) {
      deleteRoleProperty(roleId: $roleId, name: $name)
    }
  `;

  const result = await graphqlRequest<{ deleteRoleProperty: boolean }>({
    endpoint: `${config.endpoint}/graphql`,
    query: mutation,
    variables: { roleId, name },
    headers: buildHeaders(config),
    timeout: config.timeout,
    logger: config.logger,
  });

  if (!result.success) {
    return result;
  }

  return { success: true, data: result.data.deleteRoleProperty };
}
