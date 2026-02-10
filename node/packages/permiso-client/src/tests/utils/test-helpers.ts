import type { PermisoConfig } from "../../types.js";
import { testLogger } from "@codespin/permiso-test-utils";
import { TEST_BASE_URL, TEST_API_KEY } from "../setup.js";

export function getTestConfig(): PermisoConfig {
  return {
    endpoint: TEST_BASE_URL,
    apiKey: TEST_API_KEY,
    // No tenantId = ROOT context for cross-tenant operations
    timeout: 30000,
    logger: testLogger,
  };
}

export function generateTestId(prefix: string): string {
  return `${prefix}-${String(Date.now())}-${Math.random().toString(36).substring(7)}`;
}
