import { deleteTenant } from "../../domain/tenant/delete-tenant.js";
import type { DataContext } from "../../domain/data-context.js";

export const deleteTenantResolver = {
  Mutation: {
    deleteTenant: async (
      _: unknown,
      args: { id: string; safetyKey?: string },
      context: DataContext,
    ) => {
      // If safetyKey is provided, it must match the tenant ID
      if (args.safetyKey !== undefined && args.safetyKey !== args.id) {
        throw new Error("Invalid safety key - must match tenant ID");
      }

      const result = await deleteTenant(context, args.id);
      if (!result.success) {
        throw result.error;
      }
      return result.data;
    },
  },
};
