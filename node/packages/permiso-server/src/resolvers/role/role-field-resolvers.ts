import type { RoleWithProperties } from "../../types.js";
import { getRoleProperties } from "../../domain/role/get-role-properties.js";
import { getRoleUsersByTenant } from "../../domain/role/get-role-users-by-tenant.js";
import { getUsersByTenant } from "../../domain/user/get-users-by-tenant.js";
import { getRolePermissions } from "../../domain/permission/get-role-permissions.js";
import { getTenant } from "../../domain/tenant/get-tenant.js";
import type { DataContext } from "../../domain/data-context.js";

export const roleFieldResolvers = {
  Role: {
    tenant: async (
      parent: RoleWithProperties,
      _: unknown,
      context: DataContext,
    ) => {
      const result = await getTenant(context, parent.tenantId);
      if (!result.success) {
        throw result.error;
      }
      return result.data;
    },

    properties: async (
      parent: RoleWithProperties,
      _: unknown,
      context: DataContext,
    ) => {
      const result = await getRoleProperties(context, parent.id);
      if (!result.success) {
        throw result.error;
      }
      return result.data;
    },

    users: async (
      parent: RoleWithProperties,
      _: unknown,
      context: DataContext,
    ) => {
      // Use parent.tenantId instead of context.tenantId to work with ROOT queries
      const userIdsResult = await getRoleUsersByTenant(
        context,
        parent.tenantId,
        parent.id,
      );
      if (!userIdsResult.success) {
        throw userIdsResult.error;
      }

      if (userIdsResult.data.length === 0) {
        return [];
      }

      const result = await getUsersByTenant(context, parent.tenantId, {
        ids: userIdsResult.data,
      });
      if (!result.success) {
        throw result.error;
      }
      return result.data;
    },

    permissions: async (
      parent: RoleWithProperties,
      args: { resourcePath?: string },
      context: DataContext,
    ) => {
      const result = await getRolePermissions(
        context,
        parent.id,
        args.resourcePath,
        undefined,
        parent.tenantId,
      );
      if (!result.success) {
        throw result.error;
      }
      return result.data;
    },
  },
};
