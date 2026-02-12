import { expect } from "chai";
import { gql } from "@apollo/client/core/index.js";
import {
  testDb,
  rootClient,
  createTenantClient,
  truncateAllTables,
} from "../index.js";

describe("Batch Queries", () => {
  beforeEach(() => {
    truncateAllTables(testDb);
  });

  describe("tenantsByIds", () => {
    it("should fetch multiple tenants by IDs", async () => {
      // Create test tenants
      const createMutation = gql`
        mutation CreateTenant($input: CreateTenantInput!) {
          createTenant(input: $input) {
            id
          }
        }
      `;

      await rootClient.mutate(createMutation, {
        input: { id: "org-1", name: "Tenant 1" },
      });
      await rootClient.mutate(createMutation, {
        input: { id: "org-2", name: "Tenant 2" },
      });
      await rootClient.mutate(createMutation, {
        input: { id: "org-3", name: "Tenant 3" },
      });

      // Query by IDs
      const query = gql`
        query GetTenantsByIds($ids: [ID!]!) {
          tenantsByIds(ids: $ids) {
            id
            name
          }
        }
      `;

      const result = await rootClient.query(query, { ids: ["org-1", "org-3"] });

      expect(result.data?.tenantsByIds).to.have.lengthOf(2);
      const tenantIds = result.data?.tenantsByIds.map((o: any) => o.id);
      expect(tenantIds).to.include.members(["org-1", "org-3"]);
      expect(tenantIds).to.not.include("org-2");
    });

    it("should return empty array for non-existent IDs", async () => {
      const query = gql`
        query GetTenantsByIds($ids: [ID!]!) {
          tenantsByIds(ids: $ids) {
            id
          }
        }
      `;

      const result = await rootClient.query(query, {
        ids: ["non-existent-1", "non-existent-2"],
      });

      expect(result.data?.tenantsByIds).to.deep.equal([]);
    });

    it("should handle mixed existing and non-existing IDs", async () => {
      // Create one tenant
      const createMutation = gql`
        mutation CreateTenant($input: CreateTenantInput!) {
          createTenant(input: $input) {
            id
          }
        }
      `;

      await rootClient.mutate(createMutation, {
        input: { id: "org-exists", name: "Existing Org" },
      });

      // Query with mixed IDs
      const query = gql`
        query GetTenantsByIds($ids: [ID!]!) {
          tenantsByIds(ids: $ids) {
            id
            name
          }
        }
      `;

      const result = await rootClient.query(query, {
        ids: ["org-exists", "org-not-exists"],
      });

      expect(result.data?.tenantsByIds).to.have.lengthOf(1);
      expect(result.data?.tenantsByIds[0].id).to.equal("org-exists");
    });
  });

  describe("usersByIds", () => {
    const getTestTenantClient = () => createTenantClient("test-org");

    beforeEach(async () => {
      // Create test tenant using ROOT client
      const tenantMutation = gql`
        mutation CreateTenant($input: CreateTenantInput!) {
          createTenant(input: $input) {
            id
          }
        }
      `;

      await rootClient.mutate(tenantMutation, {
        input: { id: "test-org", name: "Test Tenant" },
      });

      // Create tenant-specific client for RLS operations
    });

    it("should fetch multiple users by IDs within a tenant", async () => {
      const testTenantClient = getTestTenantClient();
      // Create test users
      const createMutation = gql`
        mutation CreateUser($input: CreateUserInput!) {
          createUser(input: $input) {
            id
          }
        }
      `;

      await testTenantClient.mutate(createMutation, {
        input: {
          id: "user-1",
          identityProvider: "auth0",
          identityProviderUserId: "auth0|1",
        },
      });
      await testTenantClient.mutate(createMutation, {
        input: {
          id: "user-2",
          identityProvider: "auth0",
          identityProviderUserId: "auth0|2",
        },
      });
      await testTenantClient.mutate(createMutation, {
        input: {
          id: "user-3",
          identityProvider: "auth0",
          identityProviderUserId: "auth0|3",
        },
      });

      // Query by IDs
      const query = gql`
        query GetUsersByIds($ids: [ID!]!) {
          usersByIds(ids: $ids) {
            id
            tenantId
            identityProvider
          }
        }
      `;

      const result = await testTenantClient.query(query, {
        ids: ["user-1", "user-3"],
      });

      expect(result.data?.usersByIds).to.have.lengthOf(2);
      const userIds = result.data?.usersByIds.map((u: any) => u.id);
      expect(userIds).to.include.members(["user-1", "user-3"]);
      expect(userIds).to.not.include("user-2");
    });

    it("should not return users from different tenants", async () => {
      const testTenantClient = getTestTenantClient();
      // Create another tenant
      const tenantMutation = gql`
        mutation CreateTenant($input: CreateTenantInput!) {
          createTenant(input: $input) {
            id
          }
        }
      `;

      await rootClient.mutate(tenantMutation, {
        input: { id: "other-org", name: "Other Tenant" },
      });

      // Create user in current org (test-org)
      const createMutation = gql`
        mutation CreateUser($input: CreateUserInput!) {
          createUser(input: $input) {
            id
          }
        }
      `;

      await testTenantClient.mutate(createMutation, {
        input: {
          id: "user-test-org",
          identityProvider: "auth0",
          identityProviderUserId: "auth0|test",
        },
      });

      // Create user in other-org context
      const otherTenantClient = createTenantClient("other-org");
      await otherTenantClient.mutate(createMutation, {
        input: {
          id: "user-other-org",
          identityProvider: "auth0",
          identityProviderUserId: "auth0|other",
        },
      });

      // Query should only return user from test-org
      const query = gql`
        query GetUsersByIds($ids: [ID!]!) {
          usersByIds(ids: $ids) {
            id
            tenantId
          }
        }
      `;

      const result = await testTenantClient.query(query, {
        ids: ["user-test-org", "user-other-org"],
      });

      expect(result.data?.usersByIds).to.have.lengthOf(1);
      expect(result.data?.usersByIds[0].id).to.equal("user-test-org");
      expect(result.data?.usersByIds[0].tenantId).to.equal("test-org");
    });
  });

  describe("rolesByIds", () => {
    const getTestTenantClient = () => createTenantClient("test-org");

    beforeEach(async () => {
      // Create test tenant using ROOT client
      const tenantMutation = gql`
        mutation CreateTenant($input: CreateTenantInput!) {
          createTenant(input: $input) {
            id
          }
        }
      `;

      await rootClient.mutate(tenantMutation, {
        input: { id: "test-org", name: "Test Tenant" },
      });

      // Create tenant-specific client for RLS operations
    });

    it("should fetch multiple roles by IDs within a tenant", async () => {
      const testTenantClient = getTestTenantClient();
      // Create test roles
      const createMutation = gql`
        mutation CreateRole($input: CreateRoleInput!) {
          createRole(input: $input) {
            id
          }
        }
      `;

      await testTenantClient.mutate(createMutation, {
        input: {
          id: "admin",
          name: "Administrator",
        },
      });
      await testTenantClient.mutate(createMutation, {
        input: {
          id: "editor",
          name: "Editor",
        },
      });
      await testTenantClient.mutate(createMutation, {
        input: {
          id: "viewer",
          name: "Viewer",
        },
      });

      // Query by IDs
      const query = gql`
        query GetRolesByIds($ids: [ID!]!) {
          rolesByIds(ids: $ids) {
            id
            tenantId
            name
          }
        }
      `;

      const result = await testTenantClient.query(query, {
        ids: ["admin", "viewer"],
      });

      expect(result.data?.rolesByIds).to.have.lengthOf(2);
      const roleIds = result.data?.rolesByIds.map((r: any) => r.id);
      expect(roleIds).to.include.members(["admin", "viewer"]);
      expect(roleIds).to.not.include("editor");
    });
  });

  describe("usersByIdentity", () => {
    beforeEach(async () => {
      // Create test tenants using ROOT client
      const tenantMutation = gql`
        mutation CreateTenant($input: CreateTenantInput!) {
          createTenant(input: $input) {
            id
          }
        }
      `;

      await rootClient.mutate(tenantMutation, {
        input: { id: "org-1", name: "Tenant 1" },
      });
      await rootClient.mutate(tenantMutation, {
        input: { id: "org-2", name: "Tenant 2" },
      });
    });

    it("should find users by identity provider across tenants", async () => {
      // Create users with same identity in different orgs
      const createMutation = gql`
        mutation CreateUser($input: CreateUserInput!) {
          createUser(input: $input) {
            id
          }
        }
      `;

      // Create user in org-1
      const tenant1Client = createTenantClient("org-1");
      await tenant1Client.mutate(createMutation, {
        input: {
          id: "user-org1",
          identityProvider: "google",
          identityProviderUserId: "google|12345",
        },
      });

      // Create user in org-2
      const tenant2Client = createTenantClient("org-2");
      await tenant2Client.mutate(createMutation, {
        input: {
          id: "user-org2",
          identityProvider: "google",
          identityProviderUserId: "google|12345",
        },
      });

      // Query by identity
      const query = gql`
        query GetUsersByIdentity(
          $identityProvider: String!
          $identityProviderUserId: String!
        ) {
          usersByIdentity(
            identityProvider: $identityProvider
            identityProviderUserId: $identityProviderUserId
          ) {
            id
            tenantId
            identityProvider
            identityProviderUserId
          }
        }
      `;

      const result = await rootClient.query(query, {
        identityProvider: "google",
        identityProviderUserId: "google|12345",
      });

      expect(result.data?.usersByIdentity).to.have.lengthOf(2);
      const tenantIds = result.data?.usersByIdentity.map(
        (u: any) => u.tenantId,
      );
      expect(tenantIds).to.include.members(["org-1", "org-2"]);
    });

    it("should return empty array for non-existent identity", async () => {
      const query = gql`
        query GetUsersByIdentity(
          $identityProvider: String!
          $identityProviderUserId: String!
        ) {
          usersByIdentity(
            identityProvider: $identityProvider
            identityProviderUserId: $identityProviderUserId
          ) {
            id
          }
        }
      `;

      const result = await rootClient.query(query, {
        identityProvider: "auth0",
        identityProviderUserId: "auth0|nonexistent",
      });

      expect(result.data?.usersByIdentity).to.deep.equal([]);
    });

    it("should only return users matching both provider and ID", async () => {
      // Create users with different providers
      const createMutation = gql`
        mutation CreateUser($input: CreateUserInput!) {
          createUser(input: $input) {
            id
          }
        }
      `;

      // Create users in org-1
      const tenant1Client = createTenantClient("org-1");
      await tenant1Client.mutate(createMutation, {
        input: {
          id: "user-google",
          identityProvider: "google",
          identityProviderUserId: "user123",
        },
      });
      await tenant1Client.mutate(createMutation, {
        input: {
          id: "user-auth0",
          identityProvider: "auth0",
          identityProviderUserId: "user123",
        },
      });

      // Query should only return google user
      const query = gql`
        query GetUsersByIdentity(
          $identityProvider: String!
          $identityProviderUserId: String!
        ) {
          usersByIdentity(
            identityProvider: $identityProvider
            identityProviderUserId: $identityProviderUserId
          ) {
            id
            identityProvider
          }
        }
      `;

      const result = await rootClient.query(query, {
        identityProvider: "google",
        identityProviderUserId: "user123",
      });

      expect(result.data?.usersByIdentity).to.have.lengthOf(1);
      expect(result.data?.usersByIdentity[0].id).to.equal("user-google");
      expect(result.data?.usersByIdentity[0].identityProvider).to.equal(
        "google",
      );
    });
  });
});
