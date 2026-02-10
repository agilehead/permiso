import { deleteTenantProperty } from "../../domain/tenant/delete-tenant-property.js";
import type { DataContext } from "../../domain/data-context.js";

export const deleteTenantPropertyResolver = {
  Mutation: {
    deleteTenantProperty: async (
      _: unknown,
      args: { tenantId: string; name: string },
      context: DataContext,
    ) => {
      const result = await deleteTenantProperty(
        context,
        args.tenantId,
        args.name,
      );
      if (!result.success) {
        throw result.error;
      }
      return result.data;
    },
  },
};
