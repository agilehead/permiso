import { createLogger } from "@codespin/permiso-logger";
import type { Result } from "@codespin/permiso-core";
import type { DataContext } from "../data-context.js";
import type { UserWithProperties, Property } from "../../types.js";

const logger = createLogger("permiso-server:users");

export async function getUsersByIdentity(
  ctx: DataContext,
  identityProvider: string,
  identityProviderUserId: string,
): Promise<Result<UserWithProperties[]>> {
  try {
    // This operation needs to search across all tenants
    // We use the user repository's getByIdentity method for each tenant
    // For now, we need to list all tenants and search in each one

    // Get all tenants
    const tenantsResult = await ctx.repos.tenant.list();
    if (!tenantsResult.success) {
      return { success: false, error: tenantsResult.error };
    }

    const users: UserWithProperties[] = [];

    for (const tenant of tenantsResult.data.nodes) {
      const userResult = await ctx.repos.user.getByIdentity(
        tenant.id,
        identityProvider,
        identityProviderUserId,
      );

      if (userResult.success && userResult.data) {
        const [propertiesResult, roleIdsResult] = await Promise.all([
          ctx.repos.user.getProperties(tenant.id, userResult.data.id),
          ctx.repos.user.getRoleIds(tenant.id, userResult.data.id),
        ]);

        const properties = propertiesResult.success
          ? propertiesResult.data
          : [];

        users.push({
          ...userResult.data,
          roleIds: roleIdsResult.success ? roleIdsResult.data : [],
          properties: properties.reduce<Record<string, unknown>>(
            (acc: Record<string, unknown>, prop: Property) => {
              acc[prop.name] = prop.value;
              return acc;
            },
            {},
          ),
        });
      }
    }

    return { success: true, data: users };
  } catch (error) {
    logger.error("Failed to get users by identity", {
      error,
      identityProvider,
      identityProviderUserId,
    });
    return { success: false, error: error as Error };
  }
}
