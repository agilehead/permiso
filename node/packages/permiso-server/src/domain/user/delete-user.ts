import { createLogger } from "@codespin/permiso-logger";
import type { Result } from "@codespin/permiso-core";
import type { DataContext } from "../data-context.js";

const logger = createLogger("permiso-server:users");

export async function deleteUser(
  ctx: DataContext,
  userId: string,
): Promise<Result<boolean>> {
  try {
    const result = await ctx.repos.user.delete(ctx.tenantId, userId);
    return result;
  } catch (error) {
    logger.error("Failed to delete user", { error, userId });
    return { success: false, error: error as Error };
  }
}
