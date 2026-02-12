import { dirname } from "path";
import { expect } from "chai";
import { gql } from "@apollo/client/core/index.js";
import { testDb, truncateAllTables } from "../index.js";
import { GraphQLClient } from "../utils/graphql-client.js";
import { TestServer } from "@codespin/permiso-test-utils";

describe("Bearer Authentication", () => {
  let authServer: TestServer;
  let authClient: GraphQLClient;
  let unauthClient: GraphQLClient;

  before(async function () {
    this.timeout(60000);

    // Start a server with API key authentication enabled
    authServer = new TestServer({
      port: 5003,
      dataDir: dirname(testDb.dbPath),
    });

    // Set API key for test server
    process.env.PERMISO_API_KEY = "test-secret-key-123";
    process.env.PERMISO_API_KEY_ENABLED = "true";

    await authServer.start();

    // Create clients with and without Bearer token
    authClient = new GraphQLClient("http://localhost:5003/graphql", {
      headers: {
        authorization: "Bearer test-secret-key-123",
        // No x-tenant-id header = ROOT context
      },
    });

    unauthClient = new GraphQLClient("http://localhost:5003/graphql", {
      headers: {
        // No x-tenant-id header = ROOT context
      },
    });
  });

  after(async function () {
    this.timeout(30000);

    // Cleanup
    delete process.env.PERMISO_API_KEY;
    delete process.env.PERMISO_API_KEY_ENABLED;

    await authClient.stop();
    await unauthClient.stop();
    await authServer.stop();
  });

  beforeEach(() => {
    truncateAllTables(testDb);
  });

  describe("with Bearer authentication enabled", () => {
    it("should allow requests with valid Bearer token", async () => {
      const query = gql`
        query {
          tenants {
            nodes {
              id
              name
            }
            totalCount
          }
        }
      `;

      const result = await authClient.query(query);
      expect(result.data).to.exist;
      expect(result.data.tenants.nodes).to.be.an("array");
    });

    it("should reject requests without Bearer token", async () => {
      const query = gql`
        query {
          tenants {
            nodes {
              id
              name
            }
            totalCount
          }
        }
      `;

      try {
        await unauthClient.query(query);
        expect.fail("Should have thrown an error");
      } catch (error: any) {
        // Check for authentication error in network error result
        expect(error.networkError).to.exist;
        expect(error.networkError.statusCode).to.equal(401);
        expect(error.networkError.result.errors[0].message).to.equal(
          "Bearer token required but not provided",
        );
        expect(error.networkError.result.errors[0].extensions.code).to.equal(
          "UNAUTHENTICATED",
        );
      }
    });

    it("should reject requests with invalid Bearer token", async () => {
      const invalidClient = new GraphQLClient("http://localhost:5003/graphql", {
        headers: {
          authorization: "Bearer wrong-key",
        },
      });

      const query = gql`
        query {
          tenants {
            nodes {
              id
              name
            }
            totalCount
          }
        }
      `;

      try {
        await invalidClient.query(query);
        expect.fail("Should have thrown an error");
      } catch (error: any) {
        // Check for authentication error in network error result
        expect(error.networkError).to.exist;
        expect(error.networkError.statusCode).to.equal(401);
        expect(error.networkError.result.errors[0].message).to.equal(
          "Invalid Bearer token",
        );
        expect(error.networkError.result.errors[0].extensions.code).to.equal(
          "UNAUTHENTICATED",
        );
      } finally {
        await invalidClient.stop();
      }
    });

    it("should allow mutations with valid Bearer token", async () => {
      const mutation = gql`
        mutation CreateTenant($input: CreateTenantInput!) {
          createTenant(input: $input) {
            id
            name
          }
        }
      `;

      const result = await authClient.mutate(mutation, {
        input: {
          id: "org-auth-test",
          name: "Auth Test Tenant",
        },
      });

      expect(result.data?.createTenant).to.exist;
      expect(result.data?.createTenant.id).to.equal("org-auth-test");
      expect(result.data?.createTenant.name).to.equal("Auth Test Tenant");
    });

    it("should reject mutations without Bearer token", async () => {
      const mutation = gql`
        mutation CreateTenant($input: CreateTenantInput!) {
          createTenant(input: $input) {
            id
            name
          }
        }
      `;

      try {
        await unauthClient.mutate(mutation, {
          input: {
            id: "org-unauth-test",
            name: "Unauthorized Test Tenant",
          },
        });
        expect.fail("Should have thrown an error");
      } catch (error: any) {
        // Check for authentication error in network error result
        expect(error.networkError).to.exist;
        expect(error.networkError.statusCode).to.equal(401);
        expect(error.networkError.result.errors[0].message).to.equal(
          "Bearer token required but not provided",
        );
        expect(error.networkError.result.errors[0].extensions.code).to.equal(
          "UNAUTHENTICATED",
        );
      }
    });
  });
});
