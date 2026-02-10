import { createLogger } from "@codespin/permiso-logger";
import type { Result } from "@codespin/permiso-core";
import type { DataContext } from "../data-context.js";
import type { UserRole } from "../../types.js";

const logger = createLogger("permiso-server:users");

export async function assignUserRole(
  ctx: DataContext,
  userId: string,
  roleId: string,
): Promise<Result<UserRole>> {
  try {
    const result = await ctx.repos.user.assignRole(ctx.tenantId, userId, roleId);
    if (!result.success) {
      return { success: false, error: result.error };
    }

    // Return UserRole object
    return {
      success: true,
      data: {
        userId,
        roleId,
        tenantId: ctx.tenantId,
        createdAt: Date.now(),
      },
    };
  } catch (error) {
    logger.error("Failed to assign user role", {
      error,
      userId,
      roleId,
    });
    return { success: false, error: error as Error };
  }
}
