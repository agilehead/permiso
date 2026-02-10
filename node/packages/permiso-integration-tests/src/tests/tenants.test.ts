import { expect } from "chai";
import { gql } from "@apollo/client/core/index.js";
import { testDb, rootClient, truncateAllTables } from "../index.js";

describe("Tenants", () => {
  beforeEach(() => {
    truncateAllTables(testDb);
  });

  describe("createTenant", () => {
    it("should create a new tenant", async () => {
      const mutation = gql`
        mutation CreateTenant($input: CreateTenantInput!) {
          createTenant(input: $input) {
            id
            name
            properties {
              name
              value
              hidden
            }
          }
        }
      `;

      const result = await rootClient.mutate(mutation, {
        input: {
          id: "org-123",
          name: "Test Tenant",
          properties: [
            { name: "tier", value: "premium" },
            { name: "apiKey", value: "secret123", hidden: true },
          ],
        },
      });

      const tenant = result.data?.createTenant;
      expect(tenant?.id).to.equal("org-123");
      expect(tenant?.name).to.equal("Test Tenant");
      expect(tenant?.properties).to.have.lengthOf(2);

      const tierProp = tenant?.properties.find((p: any) => p.name === "tier");
      expect(tierProp).to.deep.include({
        name: "tier",
        value: "premium",
        hidden: false,
      });

      const apiKeyProp = tenant?.properties.find((p: any) => p.name === "apiKey");
      expect(apiKeyProp).to.deep.include({
        name: "apiKey",
        value: "secret123",
        hidden: true,
      });
    });

    it("should fail with duplicate tenant ID", async () => {
      const mutation = gql`
        mutation CreateTenant($input: CreateTenantInput!) {
          createTenant(input: $input) {
            id
            name
          }
        }
      `;

      // Create first tenant
      const firstResult = await rootClient.mutate(mutation, {
        input: {
          id: "org-dup-test",
          name: "First Tenant",
        },
      });

      expect(firstResult.data?.createTenant?.id).to.equal("org-dup-test");

      // Try to create duplicate
      try {
        const result = await rootClient.mutate(mutation, {
          input: {
            id: "org-dup-test",
            name: "Duplicate Tenant",
          },
        });

        // Check if there are errors in the result (due to errorPolicy: 'all')
        if (result.errors && result.errors.length > 0) {
          const errorMessage = result.errors[0].message;
          expect(errorMessage.toLowerCase()).to.satisfy(
            (msg: string) =>
              msg.includes("duplicate") ||
              msg.includes("already exists") ||
              msg.includes("unique constraint") || // SQLite error
              msg.includes("23505"),
          );
          return; // Test passes if we got the expected error
        }

        // If we get here, the duplicate was created when it shouldn't have been
        expect.fail(
          "Should have thrown an error for duplicate tenant ID",
        );
      } catch (error: any) {
        // If this is our expect.fail error, re-throw it
        if (
          error.message?.includes(
            "Should have thrown an error for duplicate tenant ID",
          ) === true
        ) {
          throw error;
        }
        // Otherwise check for duplicate key error
        const errorMessage =
          error.graphQLErrors?.[0]?.message ?? error.message ?? "";
        expect(errorMessage.toLowerCase()).to.satisfy(
          (msg: string) =>
            msg.includes("duplicate") ||
            msg.includes("already exists") ||
            msg.includes("unique constraint") || // SQLite error
            msg.includes("23505"),
        );
      }
    });
  });

  describe("tenant query", () => {
    it("should retrieve a tenant by ID", async () => {
      // Create tenant first
      const createMutation = gql`
        mutation CreateTenant($input: CreateTenantInput!) {
          createTenant(input: $input) {
            id
          }
        }
      `;

      await rootClient.mutate(createMutation, {
        input: {
          id: "org-query-test",
          name: "Test Tenant",
          properties: [{ name: "tier", value: "premium" }],
        },
      });

      // Query the tenant
      const query = gql`
        query GetTenant($id: ID!) {
          tenant(id: $id) {
            id
            name
            properties {
              name
              value
              hidden
            }
            createdAt
            updatedAt
          }
        }
      `;

      const result = await rootClient.query(query, { id: "org-query-test" });

      expect(result.data?.tenant?.id).to.equal("org-query-test");
      expect(result.data?.tenant?.name).to.equal("Test Tenant");
      expect(result.data?.tenant?.properties).to.have.lengthOf(1);
      expect(result.data?.tenant?.properties[0]).to.deep.include({
        name: "tier",
        value: "premium",
        hidden: false,
      });
      expect(result.data?.tenant?.createdAt).to.be.a("number");
      expect(result.data?.tenant?.updatedAt).to.be.a("number");
    });

    it("should return null for non-existent tenant", async () => {
      const query = gql`
        query GetTenant($id: ID!) {
          tenant(id: $id) {
            id
            name
          }
        }
      `;

      const result = await rootClient.query(query, { id: "non-existent" });

      expect(result.data?.tenant).to.be.null;
    });
  });

  describe("tenants query", () => {
    it("should list all tenants", async () => {
      // Create multiple tenants
      const mutation = gql`
        mutation CreateTenant($input: CreateTenantInput!) {
          createTenant(input: $input) {
            id
          }
        }
      `;

      await rootClient.mutate(mutation, {
        input: {
          id: "org-1",
          name: "Tenant 1",
        },
      });

      await rootClient.mutate(mutation, {
        input: {
          id: "org-2",
          name: "Tenant 2",
        },
      });

      // Query all tenants
      const query = gql`
        query ListTenants {
          tenants {
            nodes {
              id
              name
            }
          }
        }
      `;

      const result = await rootClient.query(query);

      expect(result.data?.tenants?.nodes).to.have.lengthOf(2);
      const tenantIds = result.data?.tenants?.nodes.map((o: any) => o.id);
      expect(tenantIds).to.include.members(["org-1", "org-2"]);
    });
  });

  describe("updateTenant", () => {
    it("should update tenant name", async () => {
      // Create tenant
      const createMutation = gql`
        mutation CreateTenant($input: CreateTenantInput!) {
          createTenant(input: $input) {
            id
          }
        }
      `;

      await rootClient.mutate(createMutation, {
        input: {
          id: "org-update-test",
          name: "Original Name",
        },
      });

      // Update tenant
      const updateMutation = gql`
        mutation UpdateTenant(
          $id: ID!
          $input: UpdateTenantInput!
        ) {
          updateTenant(id: $id, input: $input) {
            id
            name
          }
        }
      `;

      const result = await rootClient.mutate(updateMutation, {
        id: "org-update-test",
        input: {
          name: "Updated Name",
        },
      });

      expect(result.data?.updateTenant?.name).to.equal("Updated Name");
    });
  });

  describe("deleteTenant", () => {
    it("should delete a tenant", async () => {
      // Create tenant
      const createMutation = gql`
        mutation CreateTenant($input: CreateTenantInput!) {
          createTenant(input: $input) {
            id
          }
        }
      `;

      await rootClient.mutate(createMutation, {
        input: {
          id: "org-delete-test",
          name: "To Be Deleted",
        },
      });

      // Delete tenant
      const deleteMutation = gql`
        mutation DeleteTenant($id: ID!) {
          deleteTenant(id: $id)
        }
      `;

      const result = await rootClient.mutate(deleteMutation, {
        id: "org-delete-test",
      });

      expect(result.data?.deleteTenant).to.be.true;

      // Verify it's deleted
      const query = gql`
        query GetTenant($id: ID!) {
          tenant(id: $id) {
            id
          }
        }
      `;

      const queryResult = await rootClient.query(query, {
        id: "org-delete-test",
      });

      expect(queryResult.data?.tenant).to.be.null;
    });
  });
});
