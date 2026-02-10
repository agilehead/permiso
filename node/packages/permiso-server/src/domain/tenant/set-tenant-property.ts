import { createLogger } from "@codespin/permiso-logger";
import type { Result } from "@codespin/permiso-core";
import type { DataContext } from "../data-context.js";
import type { Property } from "../../types.js";

const logger = createLogger("permiso-server:tenants");

export async function setTenantProperty(
  ctx: DataContext,
  tenantId: string,
  name: string,
  value: unknown,
  hidden = false,
): Promise<Result<Property>> {
  try {
    const result = await ctx.repos.tenant.setProperty(tenantId, {
      name,
      value,
      hidden,
    });
    return result;
  } catch (error) {
    logger.error("Failed to set tenant property", { error, tenantId, name });
    return { success: false, error: error as Error };
  }
}
