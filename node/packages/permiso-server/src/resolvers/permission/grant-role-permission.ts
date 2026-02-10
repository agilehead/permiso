import { grantRolePermission } from "../../domain/permission/grant-role-permission.js";
import type { DataContext } from "../../domain/data-context.js";

export const grantRolePermissionResolver = {
  Mutation: {
    grantRolePermission: async (
      _: unknown,
      args: {
        input: {
          tenantId: string;
          roleId: string;
          resourceId: string;
          action: string;
        };
      },
      context: DataContext,
    ) => {
      const result = await grantRolePermission(
        context,
        args.input.roleId,
        args.input.resourceId,
        args.input.action,
      );
      if (!result.success) {
        throw result.error;
      }
      return result.data;
    },
  },
};
