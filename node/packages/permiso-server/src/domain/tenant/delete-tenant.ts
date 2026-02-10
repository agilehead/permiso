import { createLogger } from "@codespin/permiso-logger";
import type { Result } from "@codespin/permiso-core";
import type { DataContext } from "../data-context.js";

const logger = createLogger("permiso-server:tenants");

export async function deleteTenant(
  ctx: DataContext,
  id: string,
): Promise<Result<boolean>> {
  try {
    const result = await ctx.repos.tenant.delete(id);
    return result;
  } catch (error) {
    logger.error("Failed to delete tenant", { error, id });
    return { success: false, error: error as Error };
  }
}
