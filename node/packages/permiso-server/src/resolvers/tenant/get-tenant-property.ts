import { getTenantProperty } from "../../domain/tenant/get-tenant-property.js";
import type { DataContext } from "../../domain/data-context.js";

export const getTenantPropertyResolver = {
  Query: {
    tenantProperty: async (
      _: unknown,
      args: { tenantId: string; propertyName: string },
      context: DataContext,
    ) => {
      const result = await getTenantProperty(
        context,
        args.tenantId,
        args.propertyName,
      );
      if (!result.success) {
        throw result.error;
      }
      return result.data;
    },
  },
};
