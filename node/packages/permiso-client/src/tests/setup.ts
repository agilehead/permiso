import { dirname } from "path";
import {
  TestServer,
  createTestDatabase,
  setupTestDatabase,
  truncateAllTables,
  teardownTestDatabase,
  testLogger,
} from "@codespin/permiso-test-utils";

const externalUrl = process.env.TEST_URL;
const externalDbPath = process.env.TEST_DB_PATH;

// Create test database (uses timestamped .tests/ directory with absolute paths)
const testDb = createTestDatabase(
  testLogger,
  externalDbPath !== undefined && externalDbPath !== ""
    ? externalDbPath
    : undefined,
);

let testServer: TestServer | undefined;

if (externalUrl === undefined || externalUrl === "") {
  testServer = new TestServer({
    port: 5003,
    dataDir: dirname(testDb.dbPath),
    logger: testLogger,
  });
}

export const TEST_BASE_URL =
  externalUrl !== undefined && externalUrl !== ""
    ? externalUrl
    : "http://localhost:5003";

export const TEST_API_KEY =
  externalUrl !== undefined && externalUrl !== ""
    ? "test-api-key"
    : "test-token";

// Setup before all tests
before(async function () {
  this.timeout(60000); // 60 seconds for setup

  // Setup database and run migrations
  await setupTestDatabase(testDb);

  // Start server (only in local mode)
  if (testServer !== undefined) {
    await testServer.start();
  }
});

// Cleanup after each test
afterEach(function () {
  truncateAllTables(testDb);
});

// Teardown after all tests
after(async function () {
  this.timeout(30000); // 30 seconds for teardown

  // Stop server (only in local mode)
  if (testServer !== undefined) {
    await testServer.stop();
  }

  // Teardown database and clean up test directory
  await teardownTestDatabase(testDb);
});
