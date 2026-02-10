import { setupGlobalHooks } from "./test-setup.js";

// Import all test files
import "./tests/tenants.test.js";
import "./tests/users.test.js";
import "./tests/roles.test.js";
import "./tests/resources.test.js";
import "./tests/permissions.test.js";
import "./tests/bearer-auth.test.js";
import "./tests/properties-complex.test.js";
import "./tests/batch-queries.test.js";
import "./tests/pagination-filtering.test.js";
import "./tests/property-operations.test.js";
import "./tests/edge-cases.test.js";
import "./tests/field-resolvers.test.js";

// Re-export for tests
export { testDb, server, rootClient, createTenantClient } from "./test-setup.js";
export { truncateAllTables } from "@codespin/permiso-test-utils";

// Setup global hooks for full test suite
setupGlobalHooks();
