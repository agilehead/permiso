import { getUserPermissions } from "../../domain/permission/get-user-permissions.js";
import type { DataContext } from "../../domain/data-context.js";

export const getUserPermissionsResolver = {
  Query: {
    userPermissions: async (
      _: unknown,
      args: {
        tenantId: string;
        userId?: string;
        resourceId?: string;
        action?: string;
      },
      context: DataContext,
    ) => {
      const result = await getUserPermissions(
        context,
        args.userId,
        args.resourceId,
        args.action,
      );
      if (!result.success) {
        throw result.error;
      }
      return result.data;
    },
  },
};
