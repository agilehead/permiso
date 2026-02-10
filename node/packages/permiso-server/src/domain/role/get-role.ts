import { createLogger } from "@codespin/permiso-logger";
import type { Result } from "@codespin/permiso-core";
import type { DataContext } from "../data-context.js";
import type { RoleWithProperties, Property } from "../../types.js";

const logger = createLogger("permiso-server:roles");

export async function getRole(
  ctx: DataContext,
  roleId: string,
  tenantId?: string,
): Promise<Result<RoleWithProperties | null>> {
  try {
    const effectiveTenantId = tenantId ?? ctx.tenantId;
    const roleResult = await ctx.repos.role.getById(effectiveTenantId, roleId);

    if (!roleResult.success) {
      return { success: false, error: roleResult.error };
    }

    if (!roleResult.data) {
      return { success: true, data: null };
    }

    const propertiesResult = await ctx.repos.role.getProperties(
      effectiveTenantId,
      roleId,
    );

    const properties = propertiesResult.success ? propertiesResult.data : [];

    const result: RoleWithProperties = {
      id: roleResult.data.id,
      tenantId: roleResult.data.tenantId,
      name: roleResult.data.name,
      description: roleResult.data.description,
      createdAt: roleResult.data.createdAt,
      updatedAt: roleResult.data.updatedAt,
      properties: properties.reduce<Record<string, unknown>>(
        (acc: Record<string, unknown>, prop: Property) => {
          acc[prop.name] = prop.value;
          return acc;
        },
        {},
      ),
    };

    return { success: true, data: result };
  } catch (error) {
    logger.error("Failed to get role", { error, roleId });
    return { success: false, error: error as Error };
  }
}
