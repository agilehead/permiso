import { createLogger } from "@codespin/permiso-logger";
import type { Result } from "@codespin/permiso-core";
import type { DataContext } from "../data-context.js";
import type { Resource } from "../../repositories/interfaces/index.js";

const logger = createLogger("permiso-server:resources");

export async function getResource(
  ctx: DataContext,
  resourceId: string,
  tenantId?: string,
): Promise<Result<Resource | null>> {
  try {
    const effectiveTenantId = tenantId ?? ctx.tenantId;
    const result = await ctx.repos.resource.getById(effectiveTenantId, resourceId);

    if (!result.success) {
      return { success: false, error: result.error };
    }

    return { success: true, data: result.data };
  } catch (error) {
    logger.error("Failed to get resource", { error, resourceId });
    return { success: false, error: error as Error };
  }
}
