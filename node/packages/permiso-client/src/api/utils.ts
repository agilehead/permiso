import type { PermisoConfig } from "../types.js";

/**
 * Build headers for GraphQL requests
 */
export function buildHeaders(config: PermisoConfig): Record<string, string> {
  const headers: Record<string, string> = {};

  if (config.tenantId != null && config.tenantId !== "") {
    headers["x-tenant-id"] = config.tenantId;
  }

  if (config.apiKey != null && config.apiKey !== "") {
    headers.authorization = `Bearer ${config.apiKey}`;
  }

  return headers;
}
