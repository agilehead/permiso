import { createLogger } from "@codespin/permiso-logger";
import type { Result } from "@codespin/permiso-core";
import type { DataContext } from "../data-context.js";
import type { Property } from "../../types.js";

const logger = createLogger("permiso-server:tenants");

export async function getTenantProperty(
  ctx: DataContext,
  tenantId: string,
  name: string,
): Promise<Result<Property | null>> {
  try {
    const result = await ctx.repos.tenant.getProperty(tenantId, name);
    return result;
  } catch (error) {
    logger.error("Failed to get tenant property", { error, tenantId, name });
    return { success: false, error: error as Error };
  }
}
