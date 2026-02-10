import { createLogger } from "@codespin/permiso-logger";
import type { Result } from "@codespin/permiso-core";
import type { DataContext } from "../data-context.js";
import type { Property } from "../../types.js";

const logger = createLogger("permiso-server:tenants");

export async function getTenantProperties(
  ctx: DataContext,
  tenantId: string,
  includeHidden = true,
): Promise<Result<Property[]>> {
  try {
    const result = await ctx.repos.tenant.getProperties(tenantId);
    if (!result.success) {
      return result;
    }

    // Filter out hidden properties if requested
    const properties = includeHidden
      ? result.data
      : result.data.filter((p) => !p.hidden);

    return { success: true, data: properties };
  } catch (error) {
    logger.error("Failed to get tenant properties", { error, tenantId });
    return { success: false, error: error as Error };
  }
}
