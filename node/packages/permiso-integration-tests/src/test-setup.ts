import { dirname } from "path";
import {
  type TestDatabase,
  getTestDatabaseInstance,
  getExternalTestDatabaseInstance,
  setupTestDatabase,
  teardownTestDatabase,
  TestServer,
  testLogger,
} from "@codespin/permiso-test-utils";
import { GraphQLClient } from "./utils/graphql-client.js";

const externalUrl = process.env.TEST_URL;
const externalDbPath = process.env.TEST_DB_PATH;

export let testDb: TestDatabase;
export let server: TestServer | undefined;
export let rootClient: GraphQLClient; // For tenant management (ROOT operations)

export async function setupTests() {
  if (externalUrl !== undefined && externalUrl !== "") {
    // External mode: connect to running server (Docker Compose)
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- validated by TEST_URL check above
    testDb = getExternalTestDatabaseInstance(externalDbPath!, testLogger);
    await setupTestDatabase(testDb);

    rootClient = new GraphQLClient(externalUrl + "/graphql", {
      headers: {
        authorization: "Bearer test-api-key",
      },
      logger: testLogger,
    });
  } else {
    // Local mode (current behavior)
    testDb = getTestDatabaseInstance(testLogger);
    await setupTestDatabase(testDb);

    server = new TestServer({
      port: 5002,
      dataDir: dirname(testDb.dbPath),
      logger: testLogger,
    });
    await server.start();

    rootClient = new GraphQLClient("http://localhost:5002/graphql", {
      headers: {
        authorization: "Bearer test-token",
      },
      logger: testLogger,
    });
  }

  testLogger.info("Test environment ready");
}

/**
 * Create a GraphQL client for a specific tenant context
 * Use this for operations within a specific tenant
 */
export function createTenantClient(tenantId: string): GraphQLClient {
  const baseUrl =
    externalUrl !== undefined && externalUrl !== ""
      ? externalUrl
      : "http://localhost:5002";
  const token =
    externalUrl !== undefined && externalUrl !== ""
      ? "test-api-key"
      : "test-token";

  return new GraphQLClient(baseUrl + "/graphql", {
    headers: {
      authorization: `Bearer ${token}`,
      "x-tenant-id": tenantId,
    },
    logger: testLogger,
  });
}

export async function teardownTests() {
  try {
    // Stop GraphQL clients
    await rootClient.stop();

    // Stop server (only in local mode)
    if (server !== undefined) {
      await server.stop();
    }

    // Wait for connections to close
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Teardown database
    await teardownTestDatabase(testDb);

    testLogger.info("Cleanup complete");
  } catch (error) {
    testLogger.error("Error during cleanup:", error);
    process.exit(1);
  }
}

// Global hooks for when running all tests
export function setupGlobalHooks() {
  before(async function () {
    this.timeout(60000);
    await setupTests();
  });

  after(async function () {
    this.timeout(30000);
    await teardownTests();
  });
}
