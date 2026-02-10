import { getEffectivePermissionsByPrefix } from "../../domain/permission/get-effective-permissions-by-prefix.js";
import type { DataContext } from "../../domain/data-context.js";

export const getEffectivePermissionsByPrefixResolver = {
  Query: {
    effectivePermissionsByPrefix: async (
      _: unknown,
      args: {
        tenantId: string;
        userId: string;
        resourceIdPrefix: string;
        action?: string;
      },
      context: DataContext,
    ) => {
      const result = await getEffectivePermissionsByPrefix(
        context,
        args.userId,
        args.resourceIdPrefix,
        args.action,
      );
      if (!result.success) {
        throw result.error;
      }
      return result.data;
    },
  },
};
