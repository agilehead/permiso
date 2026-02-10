import type {
  UserPermissionWithTenantId,
  RolePermissionWithTenantId,
} from "../../types.js";
import { getTenant } from "../../domain/tenant/get-tenant.js";
import { getResource } from "../../domain/resource/get-resource.js";
import { getUser } from "../../domain/user/get-user.js";
import { getRole } from "../../domain/role/get-role.js";
import type { DataContext } from "../../domain/data-context.js";

export const permissionFieldResolvers = {
  UserPermission: {
    tenant: async (
      parent: UserPermissionWithTenantId,
      _: unknown,
      context: DataContext,
    ) => {
      const result = await getTenant(context, parent.tenantId);
      if (!result.success) {
        throw result.error;
      }
      return result.data;
    },

    resource: async (
      parent: UserPermissionWithTenantId,
      _: unknown,
      context: DataContext,
    ) => {
      const result = await getResource(
        context,
        parent.resourceId,
        parent.tenantId,
      );
      if (!result.success) {
        throw result.error;
      }
      return result.data;
    },

    user: async (
      parent: UserPermissionWithTenantId,
      _: unknown,
      context: DataContext,
    ) => {
      const result = await getUser(context, parent.userId, parent.tenantId);
      if (!result.success) {
        throw result.error;
      }
      return result.data;
    },
  },

  RolePermission: {
    tenant: async (
      parent: RolePermissionWithTenantId,
      _: unknown,
      context: DataContext,
    ) => {
      const result = await getTenant(context, parent.tenantId);
      if (!result.success) {
        throw result.error;
      }
      return result.data;
    },

    resource: async (
      parent: RolePermissionWithTenantId,
      _: unknown,
      context: DataContext,
    ) => {
      const result = await getResource(
        context,
        parent.resourceId,
        parent.tenantId,
      );
      if (!result.success) {
        throw result.error;
      }
      return result.data;
    },

    role: async (
      parent: RolePermissionWithTenantId,
      _: unknown,
      context: DataContext,
    ) => {
      const result = await getRole(context, parent.roleId, parent.tenantId);
      if (!result.success) {
        throw result.error;
      }
      return result.data;
    },
  },
};
