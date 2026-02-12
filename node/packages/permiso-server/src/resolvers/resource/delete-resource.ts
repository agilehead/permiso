import { deleteResource } from "../../domain/resource/delete-resource.js";
import type { DataContext } from "../../domain/data-context.js";

export const deleteResourceResolver = {
  Mutation: {
    deleteResource: async (
      _: unknown,
      args: { tenantId: string; resourceId: string; safetyKey?: string },
      context: DataContext & { safetyKey?: string },
    ) => {
      if (
        context.safetyKey !== undefined &&
        context.safetyKey !== args.safetyKey
      ) {
        throw new Error("Invalid safety key");
      }

      const result = await deleteResource(context, args.resourceId);
      if (!result.success) {
        throw result.error;
      }
      return result.data;
    },
  },
};
