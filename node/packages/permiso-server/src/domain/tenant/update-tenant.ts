import { createLogger } from "@codespin/permiso-logger";
import type { Result } from "@codespin/permiso-core";
import type { DataContext } from "../data-context.js";
import type { Tenant } from "../../repositories/interfaces/index.js";
import type { UpdateTenantInput } from "../../generated/graphql.js";

const logger = createLogger("permiso-server:tenants");

export async function updateTenant(
  ctx: DataContext,
  id: string,
  input: UpdateTenantInput,
): Promise<Result<Tenant>> {
  try {
    const result = await ctx.repos.tenant.update(id, {
      name: input.name ?? undefined,
      description: input.description ?? undefined,
    });

    if (!result.success) {
      return result;
    }

    return { success: true, data: result.data };
  } catch (error) {
    logger.error("Failed to update tenant", { error, id, input });
    return { success: false, error: error as Error };
  }
}
