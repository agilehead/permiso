import { updateTenant } from "../../domain/tenant/update-tenant.js";
import { getTenant } from "../../domain/tenant/get-tenant.js";
import type { DataContext } from "../../domain/data-context.js";
import type { UpdateTenantInput } from "../../generated/graphql.js";

export const updateTenantResolver = {
  Mutation: {
    updateTenant: async (
      _: unknown,
      args: { id: string; input: UpdateTenantInput },
      context: DataContext,
    ) => {
      const result = await updateTenant(context, args.id, args.input);
      if (!result.success) {
        throw result.error;
      }

      // Fetch with properties
      const tenantResult = await getTenant(context, args.id);
      if (!tenantResult.success) {
        throw tenantResult.error;
      }
      return tenantResult.data;
    },
  },
};
