import { getTenant } from "../../domain/tenant/get-tenant.js";
import type { DataContext } from "../../domain/data-context.js";

export const getTenantResolver = {
  Query: {
    tenant: async (_: unknown, args: { id: string }, context: DataContext) => {
      const result = await getTenant(context, args.id);
      if (!result.success) {
        throw result.error;
      }
      return result.data;
    },
  },
};
