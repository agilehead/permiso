import { createLogger } from "@codespin/permiso-logger";
import type { Result } from "@codespin/permiso-core";
import type { DataContext } from "../data-context.js";
import type { UserWithProperties, Property } from "../../types.js";

const logger = createLogger("permiso-server:users");

export async function getUser(
  ctx: DataContext,
  userId: string,
  tenantId?: string,
): Promise<Result<UserWithProperties | null>> {
  try {
    const effectiveTenantId = tenantId ?? ctx.tenantId;
    const userResult = await ctx.repos.user.getById(effectiveTenantId, userId);
    if (!userResult.success) {
      return userResult;
    }

    if (!userResult.data) {
      return { success: true, data: null };
    }

    const [propertiesResult, roleIdsResult] = await Promise.all([
      ctx.repos.user.getProperties(effectiveTenantId, userId),
      ctx.repos.user.getRoleIds(effectiveTenantId, userId),
    ]);

    if (!propertiesResult.success) {
      return { success: false, error: propertiesResult.error };
    }

    const result: UserWithProperties = {
      ...userResult.data,
      roleIds: roleIdsResult.success ? roleIdsResult.data : [],
      properties: propertiesResult.data.reduce<Record<string, unknown>>(
        (acc: Record<string, unknown>, prop: Property) => {
          acc[prop.name] = prop.value;
          return acc;
        },
        {},
      ),
    };

    return { success: true, data: result };
  } catch (error) {
    logger.error("Failed to get user", { error, userId });
    return { success: false, error: error as Error };
  }
}
