import { getTenants } from "../../domain/tenant/get-tenants.js";
import type { DataContext } from "../../domain/data-context.js";

export const getTenantsResolver = {
  Query: {
    tenants: async (
      _: unknown,
      args: {
        filter?: { properties?: { name: string; value: unknown }[] };
        pagination?: {
          limit?: number;
          offset?: number;
          sortDirection?: "ASC" | "DESC";
        };
      },
      context: DataContext,
    ) => {
      const result = await getTenants(context, args.filter, args.pagination);
      if (!result.success) {
        throw result.error;
      }

      // Get total count without pagination
      let totalCount = result.data.length;
      if (args.pagination) {
        const countResult = await getTenants(context, args.filter);
        if (countResult.success) {
          totalCount = countResult.data.length;
        }
      }

      const offset = args.pagination?.offset ?? 0;
      const hasNextPage =
        args.pagination?.limit !== undefined
          ? offset + args.pagination.limit < totalCount
          : false;
      const hasPreviousPage =
        args.pagination?.offset !== undefined
          ? args.pagination.offset > 0
          : false;

      return {
        nodes: result.data,
        totalCount,
        pageInfo: {
          hasNextPage,
          hasPreviousPage,
          startCursor: null,
          endCursor: null,
        },
      };
    },

    tenantsByIds: async (
      _: unknown,
      args: { ids: string[] },
      context: DataContext,
    ) => {
      const result = await getTenants(context, { ids: args.ids });
      if (!result.success) {
        throw result.error;
      }
      return result.data;
    },
  },
};
