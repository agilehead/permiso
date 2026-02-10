import { createLogger } from "@codespin/permiso-logger";
import type { Result } from "@codespin/permiso-core";
import type { DataContext } from "../data-context.js";
import type { Resource } from "../../repositories/interfaces/index.js";

const logger = createLogger("permiso-server:resources");

/**
 * ROOT-ONLY function to get resources from a specific tenant
 * Used by tenant field resolvers that run in unrestricted context
 */
export async function getResourcesByTenant(
  ctx: DataContext,
  tenantId: string,
  filter?: { idPrefix?: string },
  pagination?: {
    limit?: number;
    offset?: number;
    sortDirection?: "ASC" | "DESC";
  },
): Promise<Result<Resource[]>> {
  try {
    // If id prefix filter is provided, use the prefix method
    if (filter?.idPrefix !== undefined && filter.idPrefix !== "") {
      const prefixResult = await ctx.repos.resource.listByIdPrefix(
        tenantId,
        filter.idPrefix,
      );
      if (!prefixResult.success) {
        return prefixResult;
      }

      // Apply pagination manually if needed
      let resources = prefixResult.data;
      if (pagination?.offset !== undefined && pagination.offset !== 0) {
        resources = resources.slice(pagination.offset);
      }
      if (pagination?.limit !== undefined && pagination.limit !== 0) {
        resources = resources.slice(0, pagination.limit);
      }

      return { success: true, data: resources };
    }

    // Otherwise list all resources by tenant
    const result = await ctx.repos.resource.listByTenant(
      tenantId,
      pagination
        ? {
            first: pagination.limit,
            offset: pagination.offset,
            sortDirection: pagination.sortDirection,
          }
        : undefined,
    );

    if (!result.success) {
      return result;
    }

    return { success: true, data: result.data.nodes };
  } catch (error) {
    logger.error("Failed to get resources by tenant", { error, tenantId });
    return { success: false, error: error as Error };
  }
}
