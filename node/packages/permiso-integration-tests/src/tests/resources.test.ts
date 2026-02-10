import { expect } from "chai";
import { gql } from "@apollo/client/core/index.js";
import { testDb, rootClient, createTenantClient, truncateAllTables } from "../index.js";

describe("Resources", () => {
  const getTestTenantClient = () => createTenantClient("test-org");

  beforeEach(async () => {
    truncateAllTables(testDb);

    // Create test tenant using ROOT client
    const mutation = gql`
      mutation CreateTenant($input: CreateTenantInput!) {
        createTenant(input: $input) {
          id
        }
      }
    `;

    await rootClient.mutate(mutation, {
      input: {
        id: "test-org",
        name: "Test Tenant",
      },
    });
  });

  describe("createResource", () => {
    it("should create a new resource", async () => {
      const testTenantClient = getTestTenantClient();
      const mutation = gql`
        mutation CreateResource($input: CreateResourceInput!) {
          createResource(input: $input) {
            id
            tenantId
            name
            description
          }
        }
      `;

      const result = await testTenantClient.mutate(mutation, {
        input: {
          id: "/api/users/*",
          name: "User API",
          description: "User management endpoints",
        },
      });

      const resource = result.data?.createResource;
      expect(resource?.id).to.equal("/api/users/*");
      expect(resource?.tenantId).to.equal("test-org");
      expect(resource?.name).to.equal("User API");
      expect(resource?.description).to.equal("User management endpoints");
    });

    it("should fail when trying to access non-existent tenant", async () => {
      // Switch to a non-existent tenant context
      const nonExistentTenantClient = createTenantClient("non-existent-org");

      const mutation = gql`
        mutation CreateResource($input: CreateResourceInput!) {
          createResource(input: $input) {
            id
          }
        }
      `;

      try {
        const result = await nonExistentTenantClient.mutate(mutation, {
          input: {
            id: "/api/users/*",
            name: "User API",
          },
        });

        // Check if there are errors in the response
        if (result.errors && result.errors.length > 0) {
          const errorMessage = result.errors[0].message.toLowerCase();
          expect(errorMessage).to.satisfy(
            (msg: string) =>
              msg.includes("foreign key violation") ||
              msg.includes("is not present in table") ||
              msg.includes("constraint") ||
              msg.includes("tenant") ||
              msg.includes("not found"),
          );
        } else {
          expect.fail("Should have returned an error");
        }
      } catch (error: any) {
        // If an exception was thrown, check it
        const errorMessage =
          error.graphQLErrors?.[0]?.message ?? error.message ?? "";
        expect(errorMessage.toLowerCase()).to.satisfy(
          (msg: string) =>
            msg.includes("foreign key violation") ||
            msg.includes("is not present in table") ||
            msg.includes("constraint") ||
            msg.includes("tenant") ||
            msg.includes("not found"),
        );
      }
    });
  });

  describe("resources query", () => {
    it("should list resources in a tenant", async () => {
      const testTenantClient = getTestTenantClient();
      const createResourceMutation = gql`
        mutation CreateResource($input: CreateResourceInput!) {
          createResource(input: $input) {
            id
          }
        }
      `;

      // Create multiple resources
      await testTenantClient.mutate(createResourceMutation, {
        input: {
          id: "/api/users/*",
          name: "User API",
        },
      });

      await testTenantClient.mutate(createResourceMutation, {
        input: {
          id: "/api/roles/*",
          name: "Role API",
        },
      });

      // Query resources
      const query = gql`
        query ListResources {
          resources {
            nodes {
              id
              tenantId
              name
              description
            }
          }
        }
      `;

      const result = await testTenantClient.query(query, {});

      expect(result.data?.resources?.nodes).to.have.lengthOf(2);
      const resourceIds = result.data?.resources?.nodes.map((r: any) => r.id);
      expect(resourceIds).to.include.members(["/api/users/*", "/api/roles/*"]);
    });
  });

  describe("resource query", () => {
    it("should retrieve a resource by tenant and resourceId", async () => {
      const testTenantClient = getTestTenantClient();
      // Create resource
      const createMutation = gql`
        mutation CreateResource($input: CreateResourceInput!) {
          createResource(input: $input) {
            id
          }
        }
      `;

      await testTenantClient.mutate(createMutation, {
        input: {
          id: "/api/users/*",
          name: "User API",
          description: "User management",
        },
      });

      // Query resource
      const query = gql`
        query GetResource($resourceId: ID!) {
          resource(resourceId: $resourceId) {
            id
            tenantId
            name
            description
            createdAt
            updatedAt
          }
        }
      `;

      const result = await testTenantClient.query(query, {
        resourceId: "/api/users/*",
      });

      expect(result.data?.resource?.id).to.equal("/api/users/*");
      expect(result.data?.resource?.name).to.equal("User API");
      expect(result.data?.resource?.description).to.equal("User management");
    });
  });

  describe("updateResource", () => {
    it("should update resource details", async () => {
      const testTenantClient = getTestTenantClient();
      // Create resource
      const createMutation = gql`
        mutation CreateResource($input: CreateResourceInput!) {
          createResource(input: $input) {
            id
          }
        }
      `;

      await testTenantClient.mutate(createMutation, {
        input: {
          id: "/api/users/*",
          name: "User API",
        },
      });

      // Update resource
      const updateMutation = gql`
        mutation UpdateResource(
          $resourceId: ID!
          $input: UpdateResourceInput!
        ) {
          updateResource(resourceId: $resourceId, input: $input) {
            id
            name
            description
          }
        }
      `;

      const result = await testTenantClient.mutate(updateMutation, {
        resourceId: "/api/users/*",
        input: {
          name: "User API v2",
          description: "Enhanced user management",
        },
      });

      expect(result.data?.updateResource?.id).to.equal("/api/users/*");
      expect(result.data?.updateResource?.name).to.equal("User API v2");
      expect(result.data?.updateResource?.description).to.equal(
        "Enhanced user management",
      );
    });
  });

  describe("deleteResource", () => {
    it("should delete a resource", async () => {
      const testTenantClient = getTestTenantClient();
      // Create resource
      const createMutation = gql`
        mutation CreateResource($input: CreateResourceInput!) {
          createResource(input: $input) {
            id
          }
        }
      `;

      await testTenantClient.mutate(createMutation, {
        input: {
          id: "/api/users/*",
          name: "User API",
        },
      });

      // Delete resource
      const deleteMutation = gql`
        mutation DeleteResource($resourceId: ID!) {
          deleteResource(resourceId: $resourceId)
        }
      `;

      const result = await testTenantClient.mutate(deleteMutation, {
        resourceId: "/api/users/*",
      });

      expect(result.data?.deleteResource).to.be.true;

      // Verify deletion
      const query = gql`
        query GetResource($resourceId: ID!) {
          resource(resourceId: $resourceId) {
            id
          }
        }
      `;

      const queryResult = await testTenantClient.query(query, {
        resourceId: "/api/users/*",
      });

      expect(queryResult.data?.resource).to.be.null;
    });
  });
});
