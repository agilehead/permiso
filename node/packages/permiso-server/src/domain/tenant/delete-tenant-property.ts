import { createLogger } from "@codespin/permiso-logger";
import type { Result } from "@codespin/permiso-core";
import type { DataContext } from "../data-context.js";

const logger = createLogger("permiso-server:tenants");

export async function deleteTenantProperty(
  ctx: DataContext,
  tenantId: string,
  name: string,
): Promise<Result<boolean>> {
  try {
    const result = await ctx.repos.tenant.deleteProperty(tenantId, name);
    return result;
  } catch (error) {
    logger.error("Failed to delete tenant property", {
      error,
      tenantId,
      name,
    });
    return { success: false, error: error as Error };
  }
}
