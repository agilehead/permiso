import { createLogger } from "@codespin/permiso-logger";
import type { Result } from "@codespin/permiso-core";
import type { DataContext } from "../data-context.js";
import type { TenantWithProperties } from "../../types.js";

const logger = createLogger("permiso-server:tenants");

export async function getTenant(
  ctx: DataContext,
  id: string,
): Promise<Result<TenantWithProperties | null>> {
  try {
    const tenantResult = await ctx.repos.tenant.getById(id);
    if (!tenantResult.success) {
      return tenantResult;
    }

    if (!tenantResult.data) {
      return { success: true, data: null };
    }

    const propsResult = await ctx.repos.tenant.getProperties(id);
    if (!propsResult.success) {
      return { success: false, error: propsResult.error };
    }

    const result: TenantWithProperties = {
      ...tenantResult.data,
      properties: propsResult.data.reduce<Record<string, unknown>>(
        (acc, prop) => {
          acc[prop.name] = prop.value;
          return acc;
        },
        {},
      ),
    };

    return { success: true, data: result };
  } catch (error) {
    logger.error("Failed to get tenant", { error, id });
    return { success: false, error: error as Error };
  }
}
