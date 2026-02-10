import { createLogger } from "@codespin/permiso-logger";
import type { Result } from "@codespin/permiso-core";
import type { DataContext } from "../data-context.js";
import type { EffectivePermission } from "../../types.js";

const logger = createLogger("permiso-server:permissions");

export async function getEffectivePermissions(
  ctx: DataContext,
  userId: string,
  resourceId?: string,
  action?: string,
  tenantId?: string,
): Promise<Result<EffectivePermission[]>> {
  try {
    const effectiveTenantId = tenantId ?? ctx.tenantId;
    const result = await ctx.repos.permission.getEffectivePermissions(
      effectiveTenantId,
      userId,
      resourceId,
      action,
    );
    return result;
  } catch (error) {
    logger.error("Failed to get effective permissions", {
      error,
      userId,
      resourceId,
      action,
    });
    return { success: false, error: error as Error };
  }
}
