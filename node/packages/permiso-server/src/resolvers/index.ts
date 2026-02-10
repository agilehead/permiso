import { scalarResolvers } from "./scalars.js";

import {
  getTenantResolver,
  getTenantsResolver,
  createTenantResolver,
  updateTenantResolver,
  deleteTenantResolver,
  getTenantPropertyResolver,
  setTenantPropertyResolver,
  deleteTenantPropertyResolver,
  tenantFieldResolvers,
} from "./tenant/index.js";

import {
  getUserResolver,
  getUsersResolver,
  getUsersByIdentityResolver,
  createUserResolver,
  updateUserResolver,
  deleteUserResolver,
  getUserPropertyResolver,
  setUserPropertyResolver,
  deleteUserPropertyResolver,
  assignUserRoleResolver,
  unassignUserRoleResolver,
  userFieldResolvers,
} from "./user/index.js";

import {
  getRoleResolver,
  getRolesResolver,
  createRoleResolver,
  updateRoleResolver,
  deleteRoleResolver,
  getRolePropertyResolver,
  setRolePropertyResolver,
  deleteRolePropertyResolver,
  roleFieldResolvers,
} from "./role/index.js";

import {
  getResourceResolver,
  getResourcesResolver,
  resourcesByIdPrefixResolver,
  createResourceResolver,
  updateResourceResolver,
  deleteResourceResolver,
  resourceFieldResolvers,
} from "./resource/index.js";

import {
  grantUserPermissionResolver,
  revokeUserPermissionResolver,
  getUserPermissionsResolver,
  grantRolePermissionResolver,
  revokeRolePermissionResolver,
  getRolePermissionsResolver,
  getEffectivePermissionsResolver,
  getEffectivePermissionsByPrefixResolver,
  hasPermissionResolver,
  permissionFieldResolvers,
} from "./permission/index.js";

function mergeResolvers(
  ...resolvers: unknown[]
): Record<string, unknown> {
  const merged: Record<string, unknown> = {
    Query: {},
    Mutation: {},
  };

  for (const resolver of resolvers) {
    const resolverObj = resolver as Record<string, unknown>;
    if (resolverObj.Query !== undefined) {
      Object.assign(merged.Query as Record<string, unknown>, resolverObj.Query);
    }
    if (resolverObj.Mutation !== undefined) {
      Object.assign(
        merged.Mutation as Record<string, unknown>,
        resolverObj.Mutation,
      );
    }
    // Copy field resolvers (like User, Tenant, etc.)
    for (const key of Object.keys(resolverObj)) {
      if (key !== "Query" && key !== "Mutation") {
        merged[key] = resolverObj[key];
      }
    }
  }

  return merged;
}

export const resolvers = mergeResolvers(
  // Scalar resolvers
  scalarResolvers,

  // Tenant resolvers
  getTenantResolver,
  getTenantsResolver,
  createTenantResolver,
  updateTenantResolver,
  deleteTenantResolver,
  getTenantPropertyResolver,
  setTenantPropertyResolver,
  deleteTenantPropertyResolver,
  tenantFieldResolvers,

  // User resolvers
  getUserResolver,
  getUsersResolver,
  getUsersByIdentityResolver,
  createUserResolver,
  updateUserResolver,
  deleteUserResolver,
  getUserPropertyResolver,
  setUserPropertyResolver,
  deleteUserPropertyResolver,
  assignUserRoleResolver,
  unassignUserRoleResolver,
  userFieldResolvers,

  // Role resolvers
  getRoleResolver,
  getRolesResolver,
  createRoleResolver,
  updateRoleResolver,
  deleteRoleResolver,
  getRolePropertyResolver,
  setRolePropertyResolver,
  deleteRolePropertyResolver,
  roleFieldResolvers,

  // Resource resolvers
  getResourceResolver,
  getResourcesResolver,
  resourcesByIdPrefixResolver,
  createResourceResolver,
  updateResourceResolver,
  deleteResourceResolver,
  resourceFieldResolvers,

  // Permission resolvers
  grantUserPermissionResolver,
  revokeUserPermissionResolver,
  getUserPermissionsResolver,
  grantRolePermissionResolver,
  revokeRolePermissionResolver,
  getRolePermissionsResolver,
  getEffectivePermissionsResolver,
  getEffectivePermissionsByPrefixResolver,
  hasPermissionResolver,
  permissionFieldResolvers,
);
