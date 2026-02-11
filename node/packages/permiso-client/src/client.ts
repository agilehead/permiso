import type { PermisoConfig, Logger, Result } from "./types.js";
import { failure } from "./types.js";
import * as tenantApi from "./api/tenants.js";
import * as userApi from "./api/users.js";
import * as roleApi from "./api/roles.js";
import * as resourceApi from "./api/resources.js";
import * as permissionApi from "./api/permissions.js";
import type {
  Tenant,
  User,
  Role,
  Resource,
  Property,
  CreateTenantInput,
  UpdateTenantInput,
  CreateUserInput,
  UpdateUserInput,
  CreateRoleInput,
  UpdateRoleInput,
  CreateResourceInput,
  UpdateResourceInput,
  GrantUserPermissionInput,
  GrantRolePermissionInput,
  UserPermission,
  RolePermission,
  EffectivePermission,
  TenantFilter,
  UserFilter,
  RoleFilter,
  ResourceFilter,
  PaginationInput,
} from "./generated/types.js";

export type ConnectionPage<T> = {
  nodes: T[];
  totalCount: number;
  pageInfo: {
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    startCursor?: string;
    endCursor?: string;
  };
};

export type PermisoClient = {
  // Tenants
  getTenant(id: string): Promise<Result<Tenant | null>>;
  listTenants(options?: {
    filter?: TenantFilter;
    pagination?: PaginationInput;
  }): Promise<Result<ConnectionPage<Tenant>>>;
  getTenantsByIds(ids: string[]): Promise<Result<Tenant[]>>;
  createTenant(input: CreateTenantInput): Promise<Result<Tenant>>;
  updateTenant(
    id: string,
    input: UpdateTenantInput,
  ): Promise<Result<Tenant>>;
  deleteTenant(id: string, safetyKey?: string): Promise<Result<boolean>>;
  getTenantProperty(
    tenantId: string,
    name: string,
  ): Promise<Result<Property | null>>;
  setTenantProperty(
    tenantId: string,
    name: string,
    value: unknown,
    hidden?: boolean,
  ): Promise<Result<Property>>;
  deleteTenantProperty(
    tenantId: string,
    name: string,
  ): Promise<Result<boolean>>;

  // Users
  getUser(userId: string): Promise<Result<User | null>>;
  listUsers(options?: {
    filter?: UserFilter;
    pagination?: PaginationInput;
  }): Promise<Result<ConnectionPage<User>>>;
  getUsersByIds(ids: string[]): Promise<Result<User[]>>;
  getUsersByIdentity(
    identityProvider: string,
    identityProviderUserId: string,
  ): Promise<Result<User[]>>;
  createUser(input: CreateUserInput): Promise<Result<User>>;
  updateUser(
    userId: string,
    input: UpdateUserInput,
  ): Promise<Result<User>>;
  deleteUser(userId: string): Promise<Result<boolean>>;
  getUserProperty(
    userId: string,
    name: string,
  ): Promise<Result<Property | null>>;
  setUserProperty(
    userId: string,
    name: string,
    value: unknown,
    hidden?: boolean,
  ): Promise<Result<Property>>;
  deleteUserProperty(
    userId: string,
    name: string,
  ): Promise<Result<boolean>>;
  assignUserRole(
    userId: string,
    roleId: string,
  ): Promise<Result<User>>;
  unassignUserRole(
    userId: string,
    roleId: string,
  ): Promise<Result<User>>;

  // Roles
  getRole(roleId: string): Promise<Result<Role | null>>;
  listRoles(options?: {
    filter?: RoleFilter;
    pagination?: PaginationInput;
  }): Promise<Result<ConnectionPage<Role>>>;
  getRolesByIds(ids: string[]): Promise<Result<Role[]>>;
  createRole(input: CreateRoleInput): Promise<Result<Role>>;
  updateRole(
    roleId: string,
    input: UpdateRoleInput,
  ): Promise<Result<Role>>;
  deleteRole(roleId: string): Promise<Result<boolean>>;
  getRoleProperty(
    roleId: string,
    name: string,
  ): Promise<Result<Property | null>>;
  setRoleProperty(
    roleId: string,
    name: string,
    value: unknown,
    hidden?: boolean,
  ): Promise<Result<Property>>;
  deleteRoleProperty(
    roleId: string,
    name: string,
  ): Promise<Result<boolean>>;

  // Resources
  getResource(resourceId: string): Promise<Result<Resource | null>>;
  listResources(options?: {
    filter?: ResourceFilter;
    pagination?: PaginationInput;
  }): Promise<Result<ConnectionPage<Resource>>>;
  getResourcesByIdPrefix(idPrefix: string): Promise<Result<Resource[]>>;
  createResource(input: CreateResourceInput): Promise<Result<Resource>>;
  updateResource(
    resourceId: string,
    input: UpdateResourceInput,
  ): Promise<Result<Resource>>;
  deleteResource(resourceId: string): Promise<Result<boolean>>;

  // Permissions
  hasPermission(params: {
    userId: string;
    resourceId: string;
    action: string;
  }): Promise<Result<boolean>>;
  getUserPermissions(params: {
    userId: string;
    resourceId?: string;
    action?: string;
  }): Promise<Result<UserPermission[]>>;
  getRolePermissions(params: {
    roleId: string;
    resourceId?: string;
    action?: string;
  }): Promise<Result<RolePermission[]>>;
  getEffectivePermissions(params: {
    userId: string;
    resourceId: string;
    action?: string;
  }): Promise<Result<EffectivePermission[]>>;
  getEffectivePermissionsByPrefix(params: {
    userId: string;
    resourceIdPrefix: string;
    action?: string;
  }): Promise<Result<EffectivePermission[]>>;
  grantUserPermission(
    input: GrantUserPermissionInput,
  ): Promise<Result<UserPermission>>;
  revokeUserPermission(params: {
    userId: string;
    resourceId: string;
    action: string;
  }): Promise<Result<boolean>>;
  grantRolePermission(
    input: GrantRolePermissionInput,
  ): Promise<Result<RolePermission>>;
  revokeRolePermission(params: {
    roleId: string;
    resourceId: string;
    action: string;
  }): Promise<Result<boolean>>;
};

export function createPermisoClient(inputConfig: PermisoConfig): PermisoClient {
  const config: PermisoConfig = {
    ...inputConfig,
    endpoint: inputConfig.endpoint.endsWith("/")
      ? inputConfig.endpoint.slice(0, -1)
      : inputConfig.endpoint,
  };

  return {
    // Tenants
    getTenant: (id) => tenantApi.getTenant(config, id),
    listTenants: (options) => tenantApi.listTenants(config, options),
    getTenantsByIds: (ids) => tenantApi.getTenantsByIds(config, ids),
    createTenant: (input) => tenantApi.createTenant(config, input),
    updateTenant: (id, input) => tenantApi.updateTenant(config, id, input),
    deleteTenant: (id, safetyKey) =>
      tenantApi.deleteTenant(config, id, safetyKey),
    getTenantProperty: (tenantId, name) =>
      tenantApi.getTenantProperty(config, tenantId, name),
    setTenantProperty: (tenantId, name, value, hidden) =>
      tenantApi.setTenantProperty(config, tenantId, name, value, hidden),
    deleteTenantProperty: (tenantId, name) =>
      tenantApi.deleteTenantProperty(config, tenantId, name),

    // Users
    getUser: (userId) => userApi.getUser(config, userId),
    listUsers: (options) => userApi.listUsers(config, options),
    getUsersByIds: (ids) => userApi.getUsersByIds(config, ids),
    getUsersByIdentity: (provider, providerUserId) =>
      userApi.getUsersByIdentity(config, provider, providerUserId),
    createUser: (input) => userApi.createUser(config, input),
    updateUser: (userId, input) =>
      userApi.updateUser(config, userId, input),
    deleteUser: (userId) => userApi.deleteUser(config, userId),
    getUserProperty: (userId, name) =>
      userApi.getUserProperty(config, userId, name),
    setUserProperty: (userId, name, value, hidden) =>
      userApi.setUserProperty(config, userId, name, value, hidden),
    deleteUserProperty: (userId, name) =>
      userApi.deleteUserProperty(config, userId, name),
    assignUserRole: (userId, roleId) =>
      userApi.assignUserRole(config, userId, roleId),
    unassignUserRole: (userId, roleId) =>
      userApi.unassignUserRole(config, userId, roleId),

    // Roles
    getRole: (roleId) => roleApi.getRole(config, roleId),
    listRoles: (options) => roleApi.listRoles(config, options),
    getRolesByIds: (ids) => roleApi.getRolesByIds(config, ids),
    createRole: (input) => roleApi.createRole(config, input),
    updateRole: (roleId, input) =>
      roleApi.updateRole(config, roleId, input),
    deleteRole: (roleId) => roleApi.deleteRole(config, roleId),
    getRoleProperty: (roleId, name) =>
      roleApi.getRoleProperty(config, roleId, name),
    setRoleProperty: (roleId, name, value, hidden) =>
      roleApi.setRoleProperty(config, roleId, name, value, hidden),
    deleteRoleProperty: (roleId, name) =>
      roleApi.deleteRoleProperty(config, roleId, name),

    // Resources
    getResource: (resourceId) =>
      resourceApi.getResource(config, resourceId),
    listResources: (options) => resourceApi.listResources(config, options),
    getResourcesByIdPrefix: (idPrefix) =>
      resourceApi.getResourcesByIdPrefix(config, idPrefix),
    createResource: (input) => resourceApi.createResource(config, input),
    updateResource: (resourceId, input) =>
      resourceApi.updateResource(config, resourceId, input),
    deleteResource: (resourceId) =>
      resourceApi.deleteResource(config, resourceId),

    // Permissions
    hasPermission: (params) => permissionApi.hasPermission(config, params),
    getUserPermissions: (params) =>
      permissionApi.getUserPermissions(config, params),
    getRolePermissions: (params) =>
      permissionApi.getRolePermissions(config, params),
    getEffectivePermissions: (params) =>
      permissionApi.getEffectivePermissions(config, params),
    getEffectivePermissionsByPrefix: (params) =>
      permissionApi.getEffectivePermissionsByPrefix(config, params),
    grantUserPermission: (input) =>
      permissionApi.grantUserPermission(config, input),
    revokeUserPermission: (params) =>
      permissionApi.revokeUserPermission(config, params),
    grantRolePermission: (input) =>
      permissionApi.grantRolePermission(config, input),
    revokeRolePermission: (params) =>
      permissionApi.revokeRolePermission(config, params),
  };
}

export function createNoOpPermisoClient(logger?: Logger): PermisoClient {
  const warn = (method: string): void => {
    logger?.warn(`Permiso service is not configured — ${method} is a no-op`);
  };

  const notConfigured = (method: string): Promise<Result<never>> => {
    warn(method);
    return Promise.resolve(
      failure(new Error("Permiso service is not configured")),
    );
  };

  const nullResult = <T>(
    method: string,
    data: T,
  ): Promise<Result<T>> => {
    warn(method);
    return Promise.resolve({ success: true as const, data });
  };

  return {
    // Tenants — reads return null/empty, writes return failure
    getTenant: (_id) => nullResult("getTenant", null),
    listTenants: (_options) =>
      nullResult("listTenants", {
        nodes: [],
        totalCount: 0,
        pageInfo: { hasNextPage: false, hasPreviousPage: false },
      } as never),
    getTenantsByIds: (_ids) => nullResult("getTenantsByIds", [] as never),
    createTenant: () => notConfigured("createTenant"),
    updateTenant: () => notConfigured("updateTenant"),
    deleteTenant: () => notConfigured("deleteTenant"),
    getTenantProperty: (_tenantId, _name) =>
      nullResult("getTenantProperty", null),
    setTenantProperty: () => notConfigured("setTenantProperty"),
    deleteTenantProperty: () => notConfigured("deleteTenantProperty"),

    // Users
    getUser: (_userId) => nullResult("getUser", null),
    listUsers: (_options) =>
      nullResult("listUsers", {
        nodes: [],
        totalCount: 0,
        pageInfo: { hasNextPage: false, hasPreviousPage: false },
      } as never),
    getUsersByIds: (_ids) => nullResult("getUsersByIds", [] as never),
    getUsersByIdentity: () =>
      nullResult("getUsersByIdentity", [] as never),
    createUser: () => notConfigured("createUser"),
    updateUser: () => notConfigured("updateUser"),
    deleteUser: () => notConfigured("deleteUser"),
    getUserProperty: (_userId, _name) =>
      nullResult("getUserProperty", null),
    setUserProperty: () => notConfigured("setUserProperty"),
    deleteUserProperty: () => notConfigured("deleteUserProperty"),
    assignUserRole: () => notConfigured("assignUserRole"),
    unassignUserRole: () => notConfigured("unassignUserRole"),

    // Roles
    getRole: (_roleId) => nullResult("getRole", null),
    listRoles: (_options) =>
      nullResult("listRoles", {
        nodes: [],
        totalCount: 0,
        pageInfo: { hasNextPage: false, hasPreviousPage: false },
      } as never),
    getRolesByIds: (_ids) => nullResult("getRolesByIds", [] as never),
    createRole: () => notConfigured("createRole"),
    updateRole: () => notConfigured("updateRole"),
    deleteRole: () => notConfigured("deleteRole"),
    getRoleProperty: (_roleId, _name) =>
      nullResult("getRoleProperty", null),
    setRoleProperty: () => notConfigured("setRoleProperty"),
    deleteRoleProperty: () => notConfigured("deleteRoleProperty"),

    // Resources
    getResource: (_resourceId) => nullResult("getResource", null),
    listResources: (_options) =>
      nullResult("listResources", {
        nodes: [],
        totalCount: 0,
        pageInfo: { hasNextPage: false, hasPreviousPage: false },
      } as never),
    getResourcesByIdPrefix: (_idPrefix) =>
      nullResult("getResourcesByIdPrefix", [] as never),
    createResource: () => notConfigured("createResource"),
    updateResource: () => notConfigured("updateResource"),
    deleteResource: () => notConfigured("deleteResource"),

    // Permissions
    hasPermission: (_params) => nullResult("hasPermission", false),
    getUserPermissions: (_params) =>
      nullResult("getUserPermissions", [] as never),
    getRolePermissions: (_params) =>
      nullResult("getRolePermissions", [] as never),
    getEffectivePermissions: (_params) =>
      nullResult("getEffectivePermissions", [] as never),
    getEffectivePermissionsByPrefix: (_params) =>
      nullResult("getEffectivePermissionsByPrefix", [] as never),
    grantUserPermission: () => notConfigured("grantUserPermission"),
    revokeUserPermission: () => notConfigured("revokeUserPermission"),
    grantRolePermission: () => notConfigured("grantRolePermission"),
    revokeRolePermission: () => notConfigured("revokeRolePermission"),
  };
}
