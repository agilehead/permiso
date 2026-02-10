import { createTenant } from "../../domain/tenant/create-tenant.js";
import { getTenant } from "../../domain/tenant/get-tenant.js";
import type { DataContext } from "../../domain/data-context.js";
import type { CreateTenantInput } from "../../generated/graphql.js";

export const createTenantResolver = {
  Mutation: {
    createTenant: async (
      _: unknown,
      args: { input: CreateTenantInput },
      context: DataContext,
    ) => {
      const result = await createTenant(context, args.input);
      if (!result.success) {
        throw result.error;
      }

      // Fetch with properties
      const tenantResult = await getTenant(context, result.data.id);
      if (!tenantResult.success) {
        throw tenantResult.error;
      }
      return tenantResult.data;
    },
  },
};
