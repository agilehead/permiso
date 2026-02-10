import { createLogger } from "@codespin/permiso-logger";
import type { Result } from "@codespin/permiso-core";
import type { DataContext } from "../data-context.js";
import type { Tenant } from "../../repositories/interfaces/index.js";
import type { CreateTenantInput } from "../../generated/graphql.js";

const logger = createLogger("permiso-server:tenants");

export async function createTenant(
  ctx: DataContext,
  input: CreateTenantInput,
): Promise<Result<Tenant>> {
  try {
    const result = await ctx.repos.tenant.create({
      id: input.id,
      name: input.name,
      description: input.description ?? undefined,
      properties: input.properties?.map((p) => ({
        name: p.name,
        value: p.value,
        hidden: p.hidden ?? false,
      })),
    });

    if (!result.success) {
      return result;
    }

    return { success: true, data: result.data };
  } catch (error) {
    logger.error("Failed to create tenant", { error, input });
    return { success: false, error: error as Error };
  }
}
