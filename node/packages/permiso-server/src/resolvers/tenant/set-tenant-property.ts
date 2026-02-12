import { setTenantProperty } from "../../domain/tenant/set-tenant-property.js";
import type { DataContext } from "../../domain/data-context.js";

export const setTenantPropertyResolver = {
  Mutation: {
    setTenantProperty: async (
      _: unknown,
      args: {
        tenantId: string;
        name: string;
        value: unknown;
        hidden?: boolean;
      },
      context: DataContext,
    ) => {
      const result = await setTenantProperty(
        context,
        args.tenantId,
        args.name,
        args.value,
        args.hidden ?? false,
      );
      if (!result.success) {
        throw result.error;
      }
      return result.data;
    },
  },
};
