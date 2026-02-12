import { expect } from "chai";
import { gql } from "@apollo/client/core/index.js";
import {
  testDb,
  rootClient,
  createTenantClient,
  truncateAllTables,
} from "../index.js";

describe("Pagination and Filtering", () => {
  beforeEach(() => {
    truncateAllTables(testDb);
  });

  describe("Pagination", () => {
    describe("tenants pagination", () => {
      beforeEach(async () => {
        // Create multiple tenants
        const mutation = gql`
          mutation CreateTenant($input: CreateTenantInput!) {
            createTenant(input: $input) {
              id
            }
          }
        `;

        for (let i = 1; i <= 10; i++) {
          await rootClient.mutate(mutation, {
            input: {
              id: `org-${i.toString().padStart(2, "0")}`,
              name: `Tenant ${String(i)}`,
              properties: [
                { name: "tier", value: i <= 5 ? "free" : "premium" },
                { name: "size", value: i * 10 },
              ],
            },
          });
        }
      });

      it("should paginate tenants with limit", async () => {
        const query = gql`
          query ListTenants($pagination: PaginationInput) {
            tenants(pagination: $pagination) {
              nodes {
                id
                name
              }
              totalCount
              pageInfo {
                hasNextPage
                hasPreviousPage
              }
            }
          }
        `;

        const result = await rootClient.query(query, {
          pagination: { limit: 3 },
        });

        expect(result.data?.tenants?.nodes).to.have.lengthOf(3);
        expect(result.data?.tenants?.totalCount).to.equal(10);
        expect(result.data?.tenants?.pageInfo?.hasNextPage).to.be.true;
        expect(result.data?.tenants?.pageInfo?.hasPreviousPage).to.be.false;
      });

      it("should paginate tenants with offset and limit", async () => {
        const query = gql`
          query ListTenants($pagination: PaginationInput) {
            tenants(pagination: $pagination) {
              nodes {
                id
              }
              totalCount
              pageInfo {
                hasNextPage
                hasPreviousPage
              }
            }
          }
        `;

        const result = await rootClient.query(query, {
          pagination: { offset: 5, limit: 3 },
        });

        expect(result.data?.tenants?.nodes).to.have.lengthOf(3);
        expect(result.data?.tenants?.totalCount).to.equal(10);
        expect(result.data?.tenants?.pageInfo?.hasNextPage).to.be.true;
        expect(result.data?.tenants?.pageInfo?.hasPreviousPage).to.be.true;

        // Verify we got the right tenants
        const ids = result.data?.tenants?.nodes.map((o: any) => o.id);
        expect(ids).to.deep.equal(["org-06", "org-07", "org-08"]);
      });

      it("should handle last page correctly", async () => {
        const query = gql`
          query ListTenants($pagination: PaginationInput) {
            tenants(pagination: $pagination) {
              nodes {
                id
              }
              pageInfo {
                hasNextPage
                hasPreviousPage
              }
            }
          }
        `;

        const result = await rootClient.query(query, {
          pagination: { offset: 8, limit: 5 },
        });

        expect(result.data?.tenants?.nodes).to.have.lengthOf(2); // Only 2 remaining
        expect(result.data?.tenants?.pageInfo?.hasNextPage).to.be.false;
        expect(result.data?.tenants?.pageInfo?.hasPreviousPage).to.be.true;
      });
    });

    describe("users pagination", () => {
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

        // Switch to tenant context for RLS operations
        const testTenantClient = getTestTenantClient();

        // Create multiple users
        const userMutation = gql`
          mutation CreateUser($input: CreateUserInput!) {
            createUser(input: $input) {
              id
            }
          }
        `;

        for (let i = 1; i <= 15; i++) {
          await testTenantClient.mutate(userMutation, {
            input: {
              id: `user-${i.toString().padStart(2, "0")}`,
              identityProvider: i % 2 === 0 ? "google" : "auth0",
              identityProviderUserId: `user${String(i)}`,
              properties: [
                {
                  name: "department",
                  value:
                    i <= 5 ? "engineering" : i <= 10 ? "sales" : "marketing",
                },
                { name: "level", value: (i % 3) + 1 },
              ],
            },
          });
        }
      });

      it("should paginate users within tenant", async () => {
        const testTenantClient = getTestTenantClient();
        const query = gql`
          query ListUsers($pagination: PaginationInput) {
            users(pagination: $pagination) {
              nodes {
                id
              }
              totalCount
              pageInfo {
                hasNextPage
                hasPreviousPage
              }
            }
          }
        `;

        const result = await testTenantClient.query(query, {
          pagination: { offset: 5, limit: 5 },
        });

        expect(result.data?.users?.nodes).to.have.lengthOf(5);
        expect(result.data?.users?.totalCount).to.equal(15);
        expect(result.data?.users?.pageInfo?.hasNextPage).to.be.true;
        expect(result.data?.users?.pageInfo?.hasPreviousPage).to.be.true;
      });
    });
  });

  describe("Filtering", () => {
    describe("tenant filtering by properties", () => {
      beforeEach(async () => {
        // Create tenants with different properties
        const mutation = gql`
          mutation CreateTenant($input: CreateTenantInput!) {
            createTenant(input: $input) {
              id
            }
          }
        `;

        await rootClient.mutate(mutation, {
          input: {
            id: "org-free-small",
            name: "Free Small Tenant",
            properties: [
              { name: "tier", value: "free" },
              { name: "size", value: "small" },
              { name: "active", value: true },
            ],
          },
        });

        await rootClient.mutate(mutation, {
          input: {
            id: "org-free-large",
            name: "Free Large Tenant",
            properties: [
              { name: "tier", value: "free" },
              { name: "size", value: "large" },
              { name: "active", value: false },
            ],
          },
        });

        await rootClient.mutate(mutation, {
          input: {
            id: "org-premium-small",
            name: "Premium Small Tenant",
            properties: [
              { name: "tier", value: "premium" },
              { name: "size", value: "small" },
              { name: "active", value: true },
            ],
          },
        });
      });

      it("should filter tenants by single property", async () => {
        const query = gql`
          query ListTenants($filter: TenantFilter) {
            tenants(filter: $filter) {
              nodes {
                id
                name
                properties {
                  name
                  value
                }
              }
            }
          }
        `;

        const result = await rootClient.query(query, {
          filter: {
            properties: [{ name: "tier", value: "free" }],
          },
        });

        expect(result.data?.tenants?.nodes).to.have.lengthOf(2);
        const ids = result.data?.tenants?.nodes.map((o: any) => o.id);
        expect(ids).to.include.members(["org-free-small", "org-free-large"]);
        expect(ids).to.not.include("org-premium-small");
      });

      it("should filter tenants by multiple properties (AND condition)", async () => {
        const query = gql`
          query ListTenants($filter: TenantFilter) {
            tenants(filter: $filter) {
              nodes {
                id
                name
              }
            }
          }
        `;

        const result = await rootClient.query(query, {
          filter: {
            properties: [
              { name: "tier", value: "free" },
              { name: "size", value: "small" },
            ],
          },
        });

        expect(result.data?.tenants?.nodes).to.have.lengthOf(1);
        expect(result.data?.tenants?.nodes[0].id).to.equal("org-free-small");
      });

      it("should filter with boolean property values", async () => {
        const query = gql`
          query ListTenants($filter: TenantFilter) {
            tenants(filter: $filter) {
              nodes {
                id
              }
            }
          }
        `;

        const result = await rootClient.query(query, {
          filter: {
            properties: [{ name: "active", value: true }],
          },
        });

        expect(result.data?.tenants?.nodes).to.have.lengthOf(2);
        const ids = result.data?.tenants?.nodes.map((o: any) => o.id);
        expect(ids).to.include.members(["org-free-small", "org-premium-small"]);
      });
    });

    describe("user filtering", () => {
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

        // Switch to tenant context for RLS operations
        const testTenantClient = getTestTenantClient();

        // Create users with different properties
        const userMutation = gql`
          mutation CreateUser($input: CreateUserInput!) {
            createUser(input: $input) {
              id
            }
          }
        `;

        await testTenantClient.mutate(userMutation, {
          input: {
            id: "user-eng-senior",
            identityProvider: "google",
            identityProviderUserId: "google|1",
            properties: [
              { name: "department", value: "engineering" },
              { name: "level", value: "senior" },
            ],
          },
        });

        await testTenantClient.mutate(userMutation, {
          input: {
            id: "user-eng-junior",
            identityProvider: "auth0",
            identityProviderUserId: "auth0|2",
            properties: [
              { name: "department", value: "engineering" },
              { name: "level", value: "junior" },
            ],
          },
        });

        await testTenantClient.mutate(userMutation, {
          input: {
            id: "user-sales-senior",
            identityProvider: "google",
            identityProviderUserId: "google|3",
            properties: [
              { name: "department", value: "sales" },
              { name: "level", value: "senior" },
            ],
          },
        });
      });

      it("should filter users by properties", async () => {
        const testTenantClient = getTestTenantClient();
        const query = gql`
          query ListUsers($filter: UserFilter) {
            users(filter: $filter) {
              nodes {
                id
                properties {
                  name
                  value
                }
              }
            }
          }
        `;

        const result = await testTenantClient.query(query, {
          filter: {
            properties: [{ name: "department", value: "engineering" }],
          },
        });

        expect(result.data?.users?.nodes).to.have.lengthOf(2);
        const ids = result.data?.users?.nodes?.map((u: any) => u.id) ?? [];
        expect(ids).to.include.members(["user-eng-senior", "user-eng-junior"]);
      });

      it("should filter users by identity provider", async () => {
        const testTenantClient = getTestTenantClient();
        const query = gql`
          query ListUsers($filter: UserFilter) {
            users(filter: $filter) {
              nodes {
                id
                identityProvider
              }
            }
          }
        `;

        const result = await testTenantClient.query(query, {
          filter: {
            identityProvider: "google",
          },
        });

        expect(result.data?.users?.nodes).to.have.lengthOf(2);
        const ids = result.data?.users?.nodes.map((u: any) => u.id);
        expect(ids).to.include.members([
          "user-eng-senior",
          "user-sales-senior",
        ]);
      });

      it("should filter users by multiple criteria", async () => {
        const testTenantClient = getTestTenantClient();
        const query = gql`
          query ListUsers($filter: UserFilter) {
            users(filter: $filter) {
              nodes {
                id
              }
            }
          }
        `;

        const result = await testTenantClient.query(query, {
          filter: {
            identityProvider: "google",
            properties: [{ name: "level", value: "senior" }],
          },
        });

        expect(result.data?.users?.nodes).to.have.lengthOf(2);
        const ids = result.data?.users?.nodes.map((u: any) => u.id);
        expect(ids).to.include.members([
          "user-eng-senior",
          "user-sales-senior",
        ]);
      });
    });

    describe("role filtering", () => {
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

        // Switch to tenant context for RLS operations
        const testTenantClient = getTestTenantClient();

        // Create roles with different properties
        const roleMutation = gql`
          mutation CreateRole($input: CreateRoleInput!) {
            createRole(input: $input) {
              id
            }
          }
        `;

        await testTenantClient.mutate(roleMutation, {
          input: {
            id: "admin-full",
            name: "Full Admin",
            properties: [
              { name: "access_level", value: "full" },
              { name: "department", value: "all" },
            ],
          },
        });

        await testTenantClient.mutate(roleMutation, {
          input: {
            id: "admin-limited",
            name: "Limited Admin",
            properties: [
              { name: "access_level", value: "limited" },
              { name: "department", value: "engineering" },
            ],
          },
        });

        await testTenantClient.mutate(roleMutation, {
          input: {
            id: "viewer",
            name: "Viewer",
            properties: [
              { name: "access_level", value: "read_only" },
              { name: "department", value: "all" },
            ],
          },
        });
      });

      it("should filter roles by properties", async () => {
        const testTenantClient = getTestTenantClient();
        const query = gql`
          query ListRoles($filter: RoleFilter) {
            roles(filter: $filter) {
              nodes {
                id
                name
              }
            }
          }
        `;

        const result = await testTenantClient.query(query, {
          filter: {
            properties: [{ name: "department", value: "all" }],
          },
        });

        expect(result.data?.roles?.nodes).to.have.lengthOf(2);
        const ids = result.data?.roles?.nodes.map((r: any) => r.id);
        expect(ids).to.include.members(["admin-full", "viewer"]);
      });
    });

    describe("resource filtering", () => {
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

        // Switch to tenant context for RLS operations
        const testTenantClient = getTestTenantClient();

        // Create resources with different ID patterns
        const resourceMutation = gql`
          mutation CreateResource($input: CreateResourceInput!) {
            createResource(input: $input) {
              id
            }
          }
        `;

        await testTenantClient.mutate(resourceMutation, {
          input: {
            id: "/api/users",
            name: "Users API",
          },
        });

        await testTenantClient.mutate(resourceMutation, {
          input: {
            id: "/api/users/*",
            name: "User API Wildcard",
          },
        });

        await testTenantClient.mutate(resourceMutation, {
          input: {
            id: "/api/posts",
            name: "Posts API",
          },
        });

        await testTenantClient.mutate(resourceMutation, {
          input: {
            id: "/api/posts/*",
            name: "Post API Wildcard",
          },
        });

        await testTenantClient.mutate(resourceMutation, {
          input: {
            id: "/admin/settings",
            name: "Admin Settings",
          },
        });
      });

      it("should filter resources by ID prefix", async () => {
        const testTenantClient = getTestTenantClient();
        const query = gql`
          query ListResources($filter: ResourceFilter) {
            resources(filter: $filter) {
              nodes {
                id
                name
              }
            }
          }
        `;

        const result = await testTenantClient.query(query, {
          filter: {
            idPrefix: "/api/",
          },
        });

        expect(result.data?.resources?.nodes).to.have.lengthOf(4);
        const ids = result.data?.resources?.nodes.map((r: any) => r.id);
        expect(ids).to.include.members([
          "/api/users",
          "/api/users/*",
          "/api/posts",
          "/api/posts/*",
        ]);
        expect(ids).to.not.include("/admin/settings");
      });

      it("should filter resources by more specific prefix", async () => {
        const testTenantClient = getTestTenantClient();
        const query = gql`
          query ListResources($filter: ResourceFilter) {
            resources(filter: $filter) {
              nodes {
                id
              }
            }
          }
        `;

        const result = await testTenantClient.query(query, {
          filter: {
            idPrefix: "/api/users",
          },
        });

        expect(result.data?.resources?.nodes).to.have.lengthOf(2);
        const ids = result.data?.resources?.nodes.map((r: any) => r.id);
        expect(ids).to.include.members(["/api/users", "/api/users/*"]);
      });
    });

    describe("combined pagination and filtering", () => {
      beforeEach(async () => {
        // Create tenants with properties
        const mutation = gql`
          mutation CreateTenant($input: CreateTenantInput!) {
            createTenant(input: $input) {
              id
            }
          }
        `;

        for (let i = 1; i <= 20; i++) {
          await rootClient.mutate(mutation, {
            input: {
              id: `org-${i.toString().padStart(2, "0")}`,
              name: `Tenant ${String(i)}`,
              properties: [
                { name: "tier", value: i % 3 === 0 ? "premium" : "free" },
                { name: "active", value: i % 2 === 0 },
              ],
            },
          });
        }
      });

      it("should apply both filtering and pagination", async () => {
        const query = gql`
          query ListTenants(
            $filter: TenantFilter
            $pagination: PaginationInput
          ) {
            tenants(filter: $filter, pagination: $pagination) {
              nodes {
                id
                properties {
                  name
                  value
                }
              }
              totalCount
              pageInfo {
                hasNextPage
                hasPreviousPage
              }
            }
          }
        `;

        // Filter for premium tier (should be orgs 3, 6, 9, 12, 15, 18)
        const result = await rootClient.query(query, {
          filter: {
            properties: [{ name: "tier", value: "premium" }],
          },
          pagination: { offset: 2, limit: 2 },
        });

        expect(result.data?.tenants?.nodes).to.have.lengthOf(2);
        expect(result.data?.tenants?.totalCount).to.equal(6); // Total premium orgs
        expect(result.data?.tenants?.pageInfo?.hasNextPage).to.be.true;
        expect(result.data?.tenants?.pageInfo?.hasPreviousPage).to.be.true;

        // Should get orgs 9 and 12 (skipping 3 and 6)
        const ids = result.data?.tenants?.nodes.map((o: any) => o.id);
        expect(ids).to.deep.equal(["org-09", "org-12"]);
      });
    });
  });

  describe("Sorting", () => {
    describe("tenants sorting", () => {
      beforeEach(async () => {
        // Create tenants with specific IDs to test sorting
        const mutation = gql`
          mutation CreateTenant($input: CreateTenantInput!) {
            createTenant(input: $input) {
              id
            }
          }
        `;

        const tenantIds = [
          "org-charlie",
          "org-alpha",
          "org-delta",
          "org-bravo",
        ];
        for (const tenantId of tenantIds) {
          await rootClient.mutate(mutation, {
            input: {
              id: tenantId,
              name: `Tenant ${tenantId}`,
            },
          });
        }
      });

      it("should sort tenants by id ASC (default)", async () => {
        const query = gql`
          query ListTenants($pagination: PaginationInput) {
            tenants(pagination: $pagination) {
              nodes {
                id
              }
            }
          }
        `;

        const result = await rootClient.query(query, {
          pagination: { limit: 10 },
        });

        const ids = result.data?.tenants?.nodes.map((o: any) => o.id);
        expect(ids).to.deep.equal([
          "org-alpha",
          "org-bravo",
          "org-charlie",
          "org-delta",
        ]);
      });

      it("should sort tenants by id DESC", async () => {
        const query = gql`
          query ListTenants($pagination: PaginationInput) {
            tenants(pagination: $pagination) {
              nodes {
                id
              }
            }
          }
        `;

        const result = await rootClient.query(query, {
          pagination: { limit: 10, sortDirection: "DESC" },
        });

        const ids = result.data?.tenants?.nodes.map((o: any) => o.id);
        expect(ids).to.deep.equal([
          "org-delta",
          "org-charlie",
          "org-bravo",
          "org-alpha",
        ]);
      });
    });

    describe("users sorting", () => {
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

        // Switch to tenant context for RLS operations
        const testTenantClient = getTestTenantClient();

        // Create users with specific IDs to test sorting
        const userMutation = gql`
          mutation CreateUser($input: CreateUserInput!) {
            createUser(input: $input) {
              id
            }
          }
        `;

        const users = ["user-zulu", "user-alpha", "user-mike", "user-bravo"];
        for (const userId of users) {
          await testTenantClient.mutate(userMutation, {
            input: {
              id: userId,
              identityProvider: "auth0",
              identityProviderUserId: userId,
            },
          });
        }
      });

      it("should sort users by id ASC", async () => {
        const testTenantClient = getTestTenantClient();
        const query = gql`
          query ListUsers($pagination: PaginationInput) {
            users(pagination: $pagination) {
              nodes {
                id
              }
            }
          }
        `;

        const result = await testTenantClient.query(query, {
          pagination: { limit: 10, sortDirection: "ASC" },
        });

        const ids = result.data?.users?.nodes.map((u: any) => u.id);
        expect(ids).to.deep.equal([
          "user-alpha",
          "user-bravo",
          "user-mike",
          "user-zulu",
        ]);
      });

      it("should sort users by id DESC", async () => {
        const testTenantClient = getTestTenantClient();
        const query = gql`
          query ListUsers($pagination: PaginationInput) {
            users(pagination: $pagination) {
              nodes {
                id
              }
            }
          }
        `;

        const result = await testTenantClient.query(query, {
          pagination: { limit: 10, sortDirection: "DESC" },
        });

        const ids = result.data?.users?.nodes.map((u: any) => u.id);
        expect(ids).to.deep.equal([
          "user-zulu",
          "user-mike",
          "user-bravo",
          "user-alpha",
        ]);
      });
    });

    describe("roles sorting", () => {
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

        // Switch to tenant context for RLS operations
        const testTenantClient = getTestTenantClient();

        // Create roles with specific IDs to test sorting
        const roleMutation = gql`
          mutation CreateRole($input: CreateRoleInput!) {
            createRole(input: $input) {
              id
            }
          }
        `;

        const roles = [
          "role-viewer",
          "role-admin",
          "role-editor",
          "role-contributor",
        ];
        for (const roleId of roles) {
          await testTenantClient.mutate(roleMutation, {
            input: {
              id: roleId,
              name: roleId,
            },
          });
        }
      });

      it("should sort roles by id with pagination", async () => {
        const testTenantClient = getTestTenantClient();
        const query = gql`
          query ListRoles($pagination: PaginationInput) {
            roles(pagination: $pagination) {
              nodes {
                id
              }
            }
          }
        `;

        // Test DESC with limit
        const result = await testTenantClient.query(query, {
          pagination: { limit: 2, sortDirection: "DESC" },
        });

        const ids = result.data?.roles?.nodes.map((r: any) => r.id);
        expect(ids).to.deep.equal(["role-viewer", "role-editor"]);
      });
    });

    describe("resources sorting", () => {
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

        // Switch to tenant context for RLS operations
        const testTenantClient = getTestTenantClient();

        // Create resources with specific IDs to test sorting
        const resourceMutation = gql`
          mutation CreateResource($input: CreateResourceInput!) {
            createResource(input: $input) {
              id
            }
          }
        `;

        const resources = [
          "/api/zoo",
          "/api/aardvark",
          "/api/monkey",
          "/api/bear",
        ];
        for (const resourceId of resources) {
          await testTenantClient.mutate(resourceMutation, {
            input: {
              id: resourceId,
              name: resourceId,
            },
          });
        }
      });

      it("should sort resources by id ASC and DESC", async () => {
        const testTenantClient = getTestTenantClient();
        const query = gql`
          query ListResources($pagination: PaginationInput) {
            resources(pagination: $pagination) {
              nodes {
                id
              }
            }
          }
        `;

        // Test ASC
        const ascResult = await testTenantClient.query(query, {
          pagination: { sortDirection: "ASC" },
        });

        const ascIds = ascResult.data?.resources?.nodes.map((r: any) => r.id);
        expect(ascIds).to.deep.equal([
          "/api/aardvark",
          "/api/bear",
          "/api/monkey",
          "/api/zoo",
        ]);

        // Test DESC
        const descResult = await testTenantClient.query(query, {
          pagination: { sortDirection: "DESC" },
        });

        const descIds = descResult.data?.resources?.nodes.map((r: any) => r.id);
        expect(descIds).to.deep.equal([
          "/api/zoo",
          "/api/monkey",
          "/api/bear",
          "/api/aardvark",
        ]);
      });
    });

    describe("combined sorting, filtering, and pagination", () => {
      beforeEach(async () => {
        // Create tenants with properties
        const mutation = gql`
          mutation CreateTenant($input: CreateTenantInput!) {
            createTenant(input: $input) {
              id
            }
          }
        `;

        const orgs = [
          "premium-zulu",
          "free-alpha",
          "premium-alpha",
          "free-zulu",
          "premium-mike",
          "free-mike",
          "premium-bravo",
          "free-bravo",
        ];

        for (const tenantId of orgs) {
          const tier = tenantId.startsWith("premium") ? "premium" : "free";
          await rootClient.mutate(mutation, {
            input: {
              id: tenantId,
              name: `Tenant ${tenantId}`,
              properties: [{ name: "tier", value: tier }],
            },
          });
        }
      });

      it("should apply filtering, sorting DESC, and pagination together", async () => {
        const query = gql`
          query ListTenants(
            $filter: TenantFilter
            $pagination: PaginationInput
          ) {
            tenants(filter: $filter, pagination: $pagination) {
              nodes {
                id
              }
              totalCount
            }
          }
        `;

        // Filter for premium tier, sort DESC, paginate
        const result = await rootClient.query(query, {
          filter: {
            properties: [{ name: "tier", value: "premium" }],
          },
          pagination: {
            offset: 1,
            limit: 2,
            sortDirection: "DESC",
          },
        });

        expect(result.data?.tenants?.nodes).to.have.lengthOf(2);
        expect(result.data?.tenants?.totalCount).to.equal(4); // Total premium orgs

        // Should get premium-mike and premium-bravo (skipping premium-zulu due to offset)
        const ids = result.data?.tenants?.nodes.map((o: any) => o.id);
        expect(ids).to.deep.equal(["premium-mike", "premium-bravo"]);
      });
    });
  });
});
