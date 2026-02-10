import { createLogger } from "@codespin/permiso-logger";
import type { Result } from "@codespin/permiso-core";
import type { DataContext } from "../data-context.js";

const logger = createLogger("permiso-server:roles");

/**
 * Get user IDs for a role, using explicit tenantId (not context.tenantId)
 * Used by field resolvers that may run in ROOT context
 */
export async function getRoleUsersByTenant(
  ctx: DataContext,
  tenantId: string,
  roleId: string,
): Promise<Result<string[]>> {
  try {
    const result = await ctx.repos.role.getUserIds(tenantId, roleId);
    return result;
  } catch (error) {
    logger.error("Failed to get role users", { error, tenantId, roleId });
    return { success: false, error: error as Error };
  }
}
