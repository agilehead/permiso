import { createLogger } from "@codespin/permiso-logger";
import type { Result } from "@codespin/permiso-core";
import type { DataContext } from "../data-context.js";
import type { Resource } from "../../repositories/interfaces/index.js";
import type { UpdateResourceInput } from "../../generated/graphql.js";

const logger = createLogger("permiso-server:resources");

export async function updateResource(
  ctx: DataContext,
  resourceId: string,
  input: UpdateResourceInput,
): Promise<Result<Resource>> {
  try {
    const result = await ctx.repos.resource.update(ctx.tenantId, resourceId, {
      name: input.name ?? undefined,
      description: input.description ?? undefined,
    });

    if (!result.success) {
      return { success: false, error: result.error };
    }

    return {
      success: true,
      data: {
        id: result.data.id,
        tenantId: result.data.tenantId,
        name: result.data.name,
        description: result.data.description,
        createdAt: result.data.createdAt,
        updatedAt: result.data.updatedAt,
      },
    };
  } catch (error) {
    logger.error("Failed to update resource", { error, resourceId, input });
    return { success: false, error: error as Error };
  }
}
