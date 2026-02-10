import type { Resource } from "../../types.js";
import { getTenant } from "../../domain/tenant/get-tenant.js";
import { getPermissionsByResource } from "../../domain/permission/get-permissions-by-resource.js";
import type { DataContext } from "../../domain/data-context.js";

export const resourceFieldResolvers = {
  Resource: {
    tenant: async (
      parent: Resource,
      _: unknown,
      context: DataContext,
    ) => {
      const result = await getTenant(context, parent.tenantId);
      if (!result.success) {
        throw result.error;
      }
      return result.data;
    },

    permissions: async (parent: Resource, _: unknown, context: DataContext) => {
      const result = await getPermissionsByResource(context, parent.id);

      if (!result.success) {
        throw result.error;
      }

      return result.data;
    },
  },
};
