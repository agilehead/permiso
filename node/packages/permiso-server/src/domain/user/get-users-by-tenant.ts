import { createLogger } from "@codespin/permiso-logger";
import type { Result } from "@codespin/permiso-core";
import type { DataContext } from "../data-context.js";
import type { UserWithProperties, Property } from "../../types.js";

const logger = createLogger("permiso-server:users");

/**
 * Get users from a specific tenant
 * Used by tenant field resolvers
 */
export async function getUsersByTenant(
  ctx: DataContext,
  tenantId: string,
  filter?: {
    properties?: { name: string; value: unknown }[];
    ids?: string[];
    identityProvider?: string;
    identityProviderUserId?: string;
  },
  pagination?: {
    limit?: number;
    offset?: number;
    sortDirection?: "ASC" | "DESC";
  },
): Promise<Result<UserWithProperties[]>> {
  try {
    // Get users with optional identity provider filter
    const listResult = await ctx.repos.user.list(
      tenantId,
      filter?.identityProvider !== undefined && filter.identityProvider !== ""
        ? { identityProvider: filter.identityProvider }
        : undefined,
      pagination
        ? {
            first: pagination.limit,
            offset: pagination.offset,
            sortDirection: pagination.sortDirection,
          }
        : undefined,
    );

    if (!listResult.success) {
      return listResult;
    }

    let users = listResult.data.nodes;

    // Apply ID filter if provided
    if (filter?.ids && filter.ids.length > 0) {
      const idSet = new Set(filter.ids);
      users = users.filter((user) => idSet.has(user.id));
    }

    // Apply identity provider user ID filter if provided
    if (
      filter?.identityProviderUserId !== undefined &&
      filter.identityProviderUserId !== ""
    ) {
      users = users.filter(
        (user) => user.identityProviderUserId === filter.identityProviderUserId,
      );
    }

    // Build result with properties and role IDs
    const result = await Promise.all(
      users.map(async (user) => {
        const [propertiesResult, roleIdsResult] = await Promise.all([
          ctx.repos.user.getProperties(tenantId, user.id),
          ctx.repos.user.getRoleIds(tenantId, user.id),
        ]);

        const properties = propertiesResult.success
          ? propertiesResult.data
          : [];

        // Apply property filters if provided
        if (filter?.properties && filter.properties.length > 0) {
          const propMap = new Map(properties.map((p) => [p.name, p.value]));
          const matches = filter.properties.every((f) => {
            const propValue = propMap.get(f.name);
            return JSON.stringify(propValue) === JSON.stringify(f.value);
          });
          if (!matches) {
            return null;
          }
        }

        return {
          ...user,
          roleIds: roleIdsResult.success ? roleIdsResult.data : [],
          properties: properties.reduce<Record<string, unknown>>(
            (acc: Record<string, unknown>, prop: Property) => {
              acc[prop.name] = prop.value;
              return acc;
            },
            {},
          ),
        };
      }),
    );

    // Filter out nulls (users that didn't match property filters)
    const filteredResult = result.filter(
      (user): user is UserWithProperties => user !== null,
    );

    return { success: true, data: filteredResult };
  } catch (error) {
    logger.error("Failed to get users by tenant", { error, tenantId });
    return { success: false, error: error as Error };
  }
}
