import type { UserWithProperties } from "../../types.js";
import { getUserProperties } from "../../domain/user/get-user-properties.js";
import { getRoles } from "../../domain/role/get-roles.js";
import { getEffectivePermissions } from "../../domain/permission/get-effective-permissions.js";
import { getTenant } from "../../domain/tenant/get-tenant.js";
import { getUserPermissions } from "../../domain/permission/get-user-permissions.js";
import type { DataContext } from "../../domain/data-context.js";

export const userFieldResolvers = {
  User: {
    tenant: async (
      parent: UserWithProperties,
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
      parent: UserWithProperties,
      _: unknown,
      context: DataContext,
    ) => {
      const result = await getUserProperties(context, parent.id);
      if (!result.success) {
        throw result.error;
      }
      return result.data;
    },

    roles: async (
      parent: UserWithProperties,
      _: unknown,
      context: DataContext,
    ) => {
      if (parent.roleIds.length === 0) {
        return [];
      }

      const result = await getRoles(
        context,
        { ids: parent.roleIds },
        undefined,
        parent.tenantId,
      );
      if (!result.success) {
        throw result.error;
      }
      return result.data;
    },

    permissions: async (
      parent: UserWithProperties,
      _: unknown,
      context: DataContext,
    ) => {
      const result = await getUserPermissions(
        context,
        parent.id,
        undefined,
        undefined,
        parent.tenantId,
      );
      if (!result.success) {
        throw result.error;
      }
      return result.data;
    },

    effectivePermissions: async (
      parent: UserWithProperties,
      args: { resourceId?: string; action?: string },
      context: DataContext,
    ) => {
      const result = await getEffectivePermissions(
        context,
        parent.id,
        args.resourceId,
        args.action,
        parent.tenantId,
      );
      if (!result.success) {
        throw result.error;
      }
      return result.data;
    },
  },
};
