import { createLogger } from "@codespin/permiso-logger";
import type { Result } from "@codespin/permiso-core";
import { config } from "../config.js";

const logger = createLogger("BearerAuth");

export type BearerAuthConfig = {
  enabled: boolean;
  token?: string;
};

export function getBearerAuthConfig(): BearerAuthConfig {
  const token = config.apiKey.key;
  const enabled = config.apiKey.enabled || token !== undefined;

  return {
    enabled,
    token,
  };
}

export function extractBearerToken(
  authHeader: string | undefined,
): string | undefined {
  if (authHeader === undefined) {
    return undefined;
  }

  if (authHeader.toLowerCase().startsWith("bearer ")) {
    return authHeader.slice(7);
  }

  return undefined;
}

export function validateBearerToken(
  authHeader: string | undefined,
  bearerConfig: BearerAuthConfig,
): Result<void> {
  if (!bearerConfig.enabled) {
    return { success: true, data: undefined };
  }

  if (bearerConfig.token === undefined) {
    logger.error(
      "Bearer authentication is enabled but PERMISO_API_KEY is not set",
    );
    return {
      success: false,
      error: new Error(
        "Server configuration error: Bearer token not configured",
      ),
    };
  }

  const token = extractBearerToken(authHeader);

  if (token === undefined) {
    return {
      success: false,
      error: new Error("Bearer token required but not provided"),
    };
  }

  if (token !== bearerConfig.token) {
    return {
      success: false,
      error: new Error("Invalid Bearer token"),
    };
  }

  return { success: true, data: undefined };
}
