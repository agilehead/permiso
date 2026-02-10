import { createLogger } from "@codespin/permiso-logger";
import type { Result } from "@codespin/permiso-core";
import type { DataContext } from "../data-context.js";
import type { TenantWithProperties } from "../../types.js";
import type { PropertyFilter } from "../../generated/graphql.js";

const logger = createLogger("permiso-server:tenants");

export async function getTenants(
  ctx: DataContext,
  filters?: {
    ids?: string[];
    properties?: PropertyFilter[];
  },
  pagination?: {
    limit?: number;
    offset?: number;
    sortDirection?: "ASC" | "DESC";
  },
): Promise<Result<TenantWithProperties[]>> {
  try {
    // When property filters are provided, we need to fetch all tenants first,
    // apply filters, then paginate. Otherwise pagination breaks.
    const needsFullFetch =
      filters?.properties !== undefined && filters.properties.length > 0;

    // Get tenants - fetch all if we need to filter by properties
    const listResult = await ctx.repos.tenant.list(
      undefined, // no name filter in current interface
      !needsFullFetch && pagination !== undefined
        ? {
            first: pagination.limit,
            offset: pagination.offset,
            sortDirection: pagination.sortDirection,
          }
        : pagination?.sortDirection !== undefined
          ? { sortDirection: pagination.sortDirection }
          : undefined,
    );

    if (!listResult.success) {
      return listResult;
    }

    let tenants = listResult.data.nodes;

    // Apply ID filter if provided
    if (filters?.ids && filters.ids.length > 0) {
      const idSet = new Set(filters.ids);
      tenants = tenants.filter((tenant) => idSet.has(tenant.id));
    }

    // Build result with properties
    const result = await Promise.all(
      tenants.map(async (tenant) => {
        const propsResult = await ctx.repos.tenant.getProperties(tenant.id);
        const properties = propsResult.success ? propsResult.data : [];

        // Apply property filters if provided
        if (filters?.properties && filters.properties.length > 0) {
          const propMap = new Map(properties.map((p) => [p.name, p.value]));
          const matches = filters.properties.every((filter) => {
            const propValue = propMap.get(filter.name);
            return JSON.stringify(propValue) === JSON.stringify(filter.value);
          });
          if (!matches) {
            return null;
          }
        }

        return {
          ...tenant,
          properties: properties.reduce<Record<string, unknown>>(
            (acc, prop) => {
              acc[prop.name] = prop.value;
              return acc;
            },
            {},
          ),
        };
      }),
    );

    // Filter out nulls (tenants that didn't match property filters)
    let filteredResult = result.filter(
      (tenant) => tenant !== null,
    ) as TenantWithProperties[];

    // Apply pagination after filtering if we did a full fetch
    if (needsFullFetch && pagination !== undefined) {
      const offset = pagination.offset ?? 0;
      const limit = pagination.limit;
      if (limit !== undefined) {
        filteredResult = filteredResult.slice(offset, offset + limit);
      } else if (offset > 0) {
        filteredResult = filteredResult.slice(offset);
      }
    }

    return { success: true, data: filteredResult };
  } catch (error) {
    logger.error("Failed to get tenants", { error, filters });
    return { success: false, error: error as Error };
  }
}
