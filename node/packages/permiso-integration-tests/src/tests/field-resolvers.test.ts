import { expect } from "chai";
import { gql } from "@apollo/client/core/index.js";
import {
  testDb,
  rootClient,
  createTenantClient,
  truncateAllTables,
} from "../index.js";

describe("Field Resolvers and Nested Queries", () => {
  const getAcmeClient = () => createTenantClient("acme-corp");

  beforeEach(async () => {
    truncateAllTables(testDb);

    // Create test data
    await setupTestData();
  });

  async function setupTestData() {
    // Create tenants
    const tenantMutation = gql`
      mutation CreateTenant($input: CreateTenantInput!) {
        createTenant(input: $input) {
          id
        }
      }
    `;

    await rootClient.mutate(tenantMutation, {
      input: {
        id: "acme-corp",
        name: "ACME Corporation",
        description: "A test tenant",
        properties: [
          { name: "tier", value: "enterprise" },
          { name: "employees", value: 500 },
        ],
      },
    });

    await rootClient.mutate(tenantMutation, {
      input: {
        id: "startup-inc",
        name: "Startup Inc",
        properties: [{ name: "tier", value: "startup" }],
      },
    });

    // Create acme-corp client for RLS operations
    const acmeClient = getAcmeClient();

    // Create roles
    const roleMutation = gql`
      mutation CreateRole($input: CreateRoleInput!) {
        createRole(input: $input) {
          id
        }
      }
    `;

    await acmeClient.mutate(roleMutation, {
      input: {
        id: "admin",
        name: "Administrator",
        description: "Full system access",
        properties: [{ name: "level", value: "super" }],
      },
    });

    await acmeClient.mutate(roleMutation, {
      input: {
        id: "editor",
        name: "Editor",
        description: "Content management access",
      },
    });

    await acmeClient.mutate(roleMutation, {
      input: {
        id: "viewer",
        name: "Viewer",
        description: "Read-only access",
      },
    });

    // Create users
    const userMutation = gql`
      mutation CreateUser($input: CreateUserInput!) {
        createUser(input: $input) {
          id
        }
      }
    `;

    await acmeClient.mutate(userMutation, {
      input: {
        id: "john-doe",
        identityProvider: "google",
        identityProviderUserId: "google|john",
        properties: [
          { name: "department", value: "engineering" },
          { name: "level", value: "senior" },
          { name: "email", value: "john@acme.com" },
        ],
        roleIds: ["admin", "editor"],
      },
    });

    await acmeClient.mutate(userMutation, {
      input: {
        id: "jane-smith",
        identityProvider: "auth0",
        identityProviderUserId: "auth0|jane",
        properties: [{ name: "department", value: "sales" }],
        roleIds: ["viewer"],
      },
    });

    await acmeClient.mutate(userMutation, {
      input: {
        id: "bob-wilson",
        identityProvider: "google",
        identityProviderUserId: "google|bob",
        roleIds: ["editor"],
      },
    });

    // Create resources
    const resourceMutation = gql`
      mutation CreateResource($input: CreateResourceInput!) {
        createResource(input: $input) {
          id
        }
      }
    `;

    await acmeClient.mutate(resourceMutation, {
      input: {
        id: "/api/users",
        name: "Users API",
        description: "User management endpoints",
      },
    });

    await acmeClient.mutate(resourceMutation, {
      input: {
        id: "/api/users/*",
        name: "User Details API",
      },
    });

    await acmeClient.mutate(resourceMutation, {
      input: {
        id: "/api/posts/*",
        name: "Posts API",
      },
    });

    await acmeClient.mutate(resourceMutation, {
      input: {
        id: "/admin/*",
        name: "Admin Panel",
      },
    });

    // Grant permissions
    const grantUserMutation = gql`
      mutation GrantUserPermission($input: GrantUserPermissionInput!) {
        grantUserPermission(input: $input) {
          userId
        }
      }
    `;

    await acmeClient.mutate(grantUserMutation, {
      input: {
        userId: "john-doe",
        resourceId: "/admin/*",
        action: "admin",
      },
    });

    await acmeClient.mutate(grantUserMutation, {
      input: {
        userId: "jane-smith",
        resourceId: "/api/users",
        action: "read",
      },
    });

    const grantRoleMutation = gql`
      mutation GrantRolePermission($input: GrantRolePermissionInput!) {
        grantRolePermission(input: $input) {
          roleId
        }
      }
    `;

    await acmeClient.mutate(grantRoleMutation, {
      input: {
        roleId: "admin",
        resourceId: "/api/users/*",
        action: "write",
      },
    });

    await acmeClient.mutate(grantRoleMutation, {
      input: {
        roleId: "admin",
        resourceId: "/api/users/*",
        action: "delete",
      },
    });

    await acmeClient.mutate(grantRoleMutation, {
      input: {
        roleId: "editor",
        resourceId: "/api/posts/*",
        action: "write",
      },
    });

    await acmeClient.mutate(grantRoleMutation, {
      input: {
        roleId: "viewer",
        resourceId: "/api/users/*",
        action: "read",
      },
    });

    await acmeClient.mutate(grantRoleMutation, {
      input: {
        roleId: "viewer",
        resourceId: "/api/posts/*",
        action: "read",
      },
    });
  }

  describe("Tenant Field Resolvers", () => {
    it("should resolve nested users with pagination and filtering", async () => {
      const query = gql`
        query GetTenantWithUsers(
          $id: ID!
          $userFilter: UserFilter
          $userPagination: PaginationInput
        ) {
          tenant(id: $id) {
            id
            name
            users(filter: $userFilter, pagination: $userPagination) {
              nodes {
                id
                identityProvider
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
        }
      `;

      // Test with filter
      const result = await rootClient.query(query, {
        id: "acme-corp",
        userFilter: {
          properties: [{ name: "department", value: "engineering" }],
        },
      });

      expect(result.data?.tenant?.users?.nodes).to.have.lengthOf(1);
      expect(result.data?.tenant?.users?.nodes[0].id).to.equal("john-doe");
      expect(result.data?.tenant?.users?.totalCount).to.equal(1);

      // Test with pagination
      const paginatedResult = await rootClient.query(query, {
        id: "acme-corp",
        userPagination: { limit: 2, offset: 0 },
      });

      expect(paginatedResult.data?.tenant?.users?.nodes).to.have.lengthOf(2);
      expect(paginatedResult.data?.tenant?.users?.totalCount).to.equal(3);
      expect(paginatedResult.data?.tenant?.users?.pageInfo?.hasNextPage).to.be
        .true;
    });

    it("should resolve nested roles with filtering", async () => {
      const query = gql`
        query GetTenantWithRoles($id: ID!, $roleFilter: RoleFilter) {
          tenant(id: $id) {
            id
            name
            roles(filter: $roleFilter) {
              nodes {
                id
                name
                description
                properties {
                  name
                  value
                }
              }
              totalCount
            }
          }
        }
      `;

      // Test with property filter
      const result = await rootClient.query(query, {
        id: "acme-corp",
        roleFilter: {
          properties: [{ name: "level", value: "super" }],
        },
      });

      expect(result.data?.tenant?.roles?.nodes).to.have.lengthOf(1);
      expect(result.data?.tenant?.roles?.nodes[0].id).to.equal("admin");
      expect(result.data?.tenant?.roles?.totalCount).to.equal(1);

      // Test without filter
      const allRolesResult = await rootClient.query(query, {
        id: "acme-corp",
      });

      expect(allRolesResult.data?.tenant?.roles?.nodes).to.have.lengthOf(3);
      expect(allRolesResult.data?.tenant?.roles?.totalCount).to.equal(3);
    });

    it("should resolve nested resources with filtering", async () => {
      const acmeClient = getAcmeClient();
      const query = gql`
        query GetTenantWithResources(
          $id: ID!
          $resourceFilter: ResourceFilter
        ) {
          tenant(id: $id) {
            id
            name
            resources(filter: $resourceFilter) {
              nodes {
                id
                name
                description
              }
              totalCount
            }
          }
        }
      `;

      // Test with ID prefix filter
      const result = await acmeClient.query(query, {
        id: "acme-corp",
        resourceFilter: {
          idPrefix: "/api/",
        },
      });

      expect(result.data?.tenant?.resources?.nodes).to.have.lengthOf(3);
      const resourceIds = result.data?.tenant?.resources?.nodes.map(
        (r: any) => r.id,
      );
      expect(resourceIds).to.include.members([
        "/api/users",
        "/api/users/*",
        "/api/posts/*",
      ]);
      expect(resourceIds).to.not.include("/admin/*");
    });
  });

  describe("User Field Resolvers", () => {
    it("should resolve user tenant", async () => {
      const acmeClient = getAcmeClient();
      const query = gql`
        query GetUserWithTenant($userId: ID!) {
          user(userId: $userId) {
            id
            tenant {
              id
              name
              description
              properties {
                name
                value
              }
            }
          }
        }
      `;

      const result = await acmeClient.query(query, {
        userId: "john-doe",
      });

      expect(result.data?.user?.tenant?.id).to.equal("acme-corp");
      expect(result.data?.user?.tenant?.name).to.equal("ACME Corporation");
      expect(result.data?.user?.tenant?.properties).to.have.lengthOf(2);
    });

    it("should resolve user roles", async () => {
      const acmeClient = getAcmeClient();
      const query = gql`
        query GetUserWithRoles($userId: ID!) {
          user(userId: $userId) {
            id
            roles {
              id
              name
              description
              properties {
                name
                value
              }
            }
          }
        }
      `;

      const result = await acmeClient.query(query, {
        userId: "john-doe",
      });

      expect(result.data?.user?.roles).to.have.lengthOf(2);
      const roleIds = result.data?.user?.roles.map((r: any) => r.id);
      expect(roleIds).to.include.members(["admin", "editor"]);

      const adminRole = result.data?.user?.roles.find(
        (r: any) => r.id === "admin",
      );
      expect(adminRole?.properties).to.have.lengthOf(1);
      expect(adminRole?.properties[0]).to.deep.include({
        name: "level",
        value: "super",
      });
    });

    it("should resolve user permissions", async () => {
      const acmeClient = getAcmeClient();
      const query = gql`
        query GetUserWithPermissions($userId: ID!) {
          user(userId: $userId) {
            id
            permissions {
              resourceId
              action
              createdAt
              resource {
                id
                name
                description
              }
            }
          }
        }
      `;

      const result = await acmeClient.query(query, {
        userId: "john-doe",
      });

      expect(result.data?.user?.permissions).to.have.lengthOf(1);
      expect(result.data?.user?.permissions[0].resourceId).to.equal("/admin/*");
      expect(result.data?.user?.permissions[0].action).to.equal("admin");
      expect(result.data?.user?.permissions[0].resource?.name).to.equal(
        "Admin Panel",
      );
    });

    it("should resolve user effective permissions with filtering", async () => {
      const acmeClient = getAcmeClient();
      const query = gql`
        query GetUserEffectivePermissions(
          $userId: ID!
          $resourceId: String
          $action: String
        ) {
          user(userId: $userId) {
            id
            effectivePermissions(resourceId: $resourceId, action: $action) {
              resourceId
              action
              source
              sourceId
            }
          }
        }
      `;

      // Test without filters - should get all effective permissions
      const result = await acmeClient.query(query, {
        userId: "john-doe",
      });

      // john-doe has: direct admin on /admin/*, write and delete on /api/users/* via admin role, write on /api/posts/* via editor role
      expect(result.data?.user?.effectivePermissions.length).to.be.at.least(4);

      // Test with resource filter
      const filteredResult = await acmeClient.query(query, {
        userId: "john-doe",
        resourceId: "/api/users/123",
      });

      const userApiPermissions =
        filteredResult.data?.user?.effectivePermissions;
      const actions = userApiPermissions.map((p: any) => p.action);
      expect(actions).to.include.members(["write", "delete"]);

      // All should be from role 'admin'
      userApiPermissions.forEach((p: any) => {
        if (p.resourceId === "/api/users/*") {
          expect(p.source).to.equal("role");
          expect(p.sourceId).to.equal("admin");
        }
      });

      // Test with action filter
      const actionFilteredResult = await acmeClient.query(query, {
        userId: "john-doe",
        action: "write",
      });

      const writePermissions =
        actionFilteredResult.data?.user?.effectivePermissions;
      writePermissions.forEach((p: any) => {
        expect(p.action).to.equal("write");
      });
    });
  });

  describe("Role Field Resolvers", () => {
    it("should resolve role tenant", async () => {
      const acmeClient = getAcmeClient();
      const query = gql`
        query GetRoleWithTenant($roleId: ID!) {
          role(roleId: $roleId) {
            id
            tenant {
              id
              name
            }
          }
        }
      `;

      const result = await acmeClient.query(query, {
        roleId: "admin",
      });

      expect(result.data?.role?.tenant?.id).to.equal("acme-corp");
      expect(result.data?.role?.tenant?.name).to.equal("ACME Corporation");
    });

    it("should resolve role users", async () => {
      const acmeClient = getAcmeClient();
      const query = gql`
        query GetRoleWithUsers($roleId: ID!) {
          role(roleId: $roleId) {
            id
            users {
              id
              identityProvider
              identityProviderUserId
              properties {
                name
                value
              }
            }
          }
        }
      `;

      const result = await acmeClient.query(query, {
        roleId: "editor",
      });

      expect(result.data?.role?.users).to.have.lengthOf(2);
      const userIds = result.data?.role?.users.map((u: any) => u.id);
      expect(userIds).to.include.members(["john-doe", "bob-wilson"]);
    });

    it("should resolve role permissions", async () => {
      const acmeClient = getAcmeClient();
      const query = gql`
        query GetRoleWithPermissions($roleId: ID!) {
          role(roleId: $roleId) {
            id
            permissions {
              resourceId
              action
              createdAt
              resource {
                id
                name
              }
            }
          }
        }
      `;

      const result = await acmeClient.query(query, {
        roleId: "viewer",
      });

      expect(result.data?.role?.permissions).to.have.lengthOf(2);
      const permissions = result.data?.role?.permissions;
      const actions = permissions.map((p: any) => ({
        resourceId: p.resourceId,
        action: p.action,
      }));

      expect(actions).to.deep.include.members([
        { resourceId: "/api/users/*", action: "read" },
        { resourceId: "/api/posts/*", action: "read" },
      ]);

      // Check nested resource resolution
      permissions.forEach((p: any) => {
        expect(p.resource).to.not.be.null;
        expect(p.resource.id).to.equal(p.resourceId);
      });
    });
  });

  describe("Resource Field Resolvers", () => {
    it("should resolve resource tenant", async () => {
      const acmeClient = getAcmeClient();
      const query = gql`
        query GetResourceWithTenant($resourceId: ID!) {
          resource(resourceId: $resourceId) {
            id
            tenant {
              id
              name
            }
          }
        }
      `;

      const result = await acmeClient.query(query, {
        resourceId: "/api/users/*",
      });

      expect(result.data?.resource?.tenant?.id).to.equal("acme-corp");
      expect(result.data?.resource?.tenant?.name).to.equal("ACME Corporation");
    });

    it("should resolve resource permissions", async () => {
      const acmeClient = getAcmeClient();
      const query = gql`
        query GetResourceWithPermissions($resourceId: ID!) {
          resource(resourceId: $resourceId) {
            id
            permissions {
              __typename
              action
              createdAt
              ... on UserPermission {
                userId
                user {
                  id
                  identityProvider
                }
              }
              ... on RolePermission {
                roleId
                role {
                  id
                  name
                }
              }
            }
          }
        }
      `;

      const result = await acmeClient.query(query, {
        resourceId: "/api/users/*",
      });

      expect(result.data?.resource?.permissions.length).to.be.at.least(3);

      // Check for role permissions (admin role has write and delete)
      const rolePermissions = result.data?.resource?.permissions.filter(
        (p: any) => p.__typename === "RolePermission",
      );
      expect(rolePermissions.length).to.be.at.least(3); // admin has write/delete, viewer has read

      const adminPermissions = rolePermissions.filter(
        (p: any) => p.roleId === "admin",
      );
      const adminActions = adminPermissions.map((p: any) => p.action);
      expect(adminActions).to.include.members(["write", "delete"]);

      // Check nested role resolution
      adminPermissions.forEach((p: any) => {
        expect(p.role?.name).to.equal("Administrator");
      });
    });
  });

  describe("Permission Field Resolvers", () => {
    it("should resolve permission tenant", async () => {
      const acmeClient = getAcmeClient();
      const query = gql`
        query GetUserPermissions($userId: ID!) {
          userPermissions(userId: $userId) {
            resourceId
            action
            tenant {
              id
              name
            }
          }
        }
      `;

      const result = await acmeClient.query(query, {
        userId: "john-doe",
      });

      expect(result.data?.userPermissions).to.have.lengthOf(1);
      expect(result.data?.userPermissions[0].tenant?.id).to.equal("acme-corp");
      expect(result.data?.userPermissions[0].tenant?.name).to.equal(
        "ACME Corporation",
      );
    });

    it("should resolve permission resource", async () => {
      const acmeClient = getAcmeClient();
      const query = gql`
        query GetRolePermissions($roleId: ID!) {
          rolePermissions(roleId: $roleId) {
            resourceId
            action
            resource {
              id
              name
              description
            }
          }
        }
      `;

      const result = await acmeClient.query(query, {
        roleId: "admin",
      });

      expect(result.data?.rolePermissions.length).to.be.at.least(2);
      result.data?.rolePermissions.forEach((p: any) => {
        expect(p.resource).to.not.be.null;
        expect(p.resource.id).to.equal(p.resourceId);
        expect(p.resource.name).to.be.a("string");
      });
    });
  });

  describe("Deep Nested Queries", () => {
    it("should handle deeply nested queries efficiently", async () => {
      const query = gql`
        query DeepNestedQuery(
          $tenantId: ID!
          $userPagination: PaginationInput
        ) {
          tenant(id: $tenantId) {
            id
            name
            users(pagination: $userPagination) {
              nodes {
                id
                roles {
                  id
                  name
                  permissions {
                    resourceId
                    action
                    resource {
                      id
                      name
                      tenant {
                        id
                        name
                      }
                    }
                  }
                }
                permissions {
                  resourceId
                  action
                  resource {
                    id
                    permissions {
                      __typename
                      action
                    }
                  }
                }
                effectivePermissions {
                  resourceId
                  action
                  source
                }
              }
            }
            roles {
              nodes {
                id
                users {
                  id
                  tenant {
                    id
                  }
                }
                permissions {
                  resourceId
                  action
                  resource {
                    id
                  }
                }
              }
            }
          }
        }
      `;

      const result = await rootClient.query(query, {
        tenantId: "acme-corp",
        userPagination: { limit: 5 },
      });

      // Verify the structure is resolved correctly
      const tenantData = result.data?.tenant;
      expect(tenantData?.id).to.equal("acme-corp");

      // Check users
      expect(tenantData?.users?.nodes).to.have.length.at.least(1);
      const user = tenantData?.users?.nodes[0];
      expect(user?.roles).to.have.length.at.least(1);

      // Check role permissions are resolved
      const role = user?.roles[0];
      expect(role?.permissions).to.have.length.at.least(1);
      expect(role?.permissions[0]?.resource?.id).to.be.a("string");
      expect(role?.permissions[0]?.resource?.tenant?.id).to.equal("acme-corp");

      // Check effective permissions
      expect(user?.effectivePermissions).to.have.length.at.least(1);

      // Check roles
      expect(tenantData?.roles?.nodes).to.have.length.at.least(1);
      const tenantRole = tenantData?.roles?.nodes[0];
      expect(tenantRole?.users).to.have.length.at.least(0);
      expect(tenantRole?.permissions).to.have.length.at.least(0);
    });

    it("should handle circular references in nested queries", async () => {
      const acmeClient = getAcmeClient();
      const query = gql`
        query CircularQuery($userId: ID!) {
          user(userId: $userId) {
            id
            tenant {
              id
              users(pagination: { limit: 2 }) {
                nodes {
                  id
                  tenant {
                    id
                    name
                  }
                  roles {
                    id
                    users {
                      id
                      roles {
                        id
                        name
                      }
                    }
                  }
                }
              }
            }
          }
        }
      `;

      const result = await acmeClient.query(query, {
        userId: "john-doe",
      });

      // Verify circular references are handled correctly
      const user = result.data?.user;
      expect(user?.id).to.equal("john-doe");
      expect(user?.tenant?.id).to.equal("acme-corp");

      const orgUsers = user?.tenant?.users?.nodes;
      expect(orgUsers).to.have.length.at.least(1);

      // Check that nested tenant reference works
      orgUsers?.forEach((u: any) => {
        expect(u.tenant?.id).to.equal("acme-corp");

        // Check role users
        u.roles?.forEach((r: any) => {
          expect(r.users).to.have.length.at.least(1);
          r.users?.forEach((ru: any) => {
            expect(ru.roles).to.have.length.at.least(1);
          });
        });
      });
    });
  });

  describe("Complex Query Scenarios", () => {
    it("should handle mixed queries with multiple root fields", async () => {
      // Use tenant client since root-level queries (users, roles, resources) require tenant context
      const acmeClient = getAcmeClient();
      const query = gql`
        query ComplexMultiRootQuery($tenantId: ID!) {
          tenant(id: $tenantId) {
            id
            name
            users {
              totalCount
            }
          }
          users(pagination: { limit: 1 }) {
            nodes {
              id
              roles {
                id
              }
            }
            totalCount
          }
          roles {
            nodes {
              id
              users {
                id
              }
            }
          }
          resources(filter: { idPrefix: "/api/" }) {
            nodes {
              id
              permissions {
                __typename
                action
              }
            }
          }
        }
      `;

      const result = await acmeClient.query(query, { tenantId: "acme-corp" });

      // Verify all root fields resolved
      expect(result.data?.tenant?.id).to.equal("acme-corp");
      expect(result.data?.tenant?.users?.totalCount).to.equal(3);

      expect(result.data?.users?.nodes).to.have.lengthOf(1);
      expect(result.data?.users?.totalCount).to.equal(3);

      expect(result.data?.roles?.nodes).to.have.length.at.least(1);

      expect(result.data?.resources?.nodes).to.have.length.at.least(1);
      result.data?.resources?.nodes.forEach((r: any) => {
        expect(r.id).to.match(/^\/api\//);
      });
    });

    it("should handle field aliases correctly", async () => {
      const acmeClient = getAcmeClient();
      const query = gql`
        query AliasedQuery($userId: ID!) {
          primaryUser: user(userId: $userId) {
            id
            userRoles: roles {
              roleId: id
              roleName: name
            }
            directPerms: permissions {
              res: resourceId
              act: action
            }
          }
          allUsers: users {
            count: totalCount
            items: nodes {
              userId: id
            }
          }
        }
      `;

      const result = await acmeClient.query(query, {
        userId: "john-doe",
      });

      // Check aliases work correctly
      expect(result.data?.primaryUser?.id).to.equal("john-doe");
      expect(result.data?.primaryUser?.userRoles).to.have.length.at.least(1);
      expect(result.data?.primaryUser?.userRoles[0]).to.have.property("roleId");
      expect(result.data?.primaryUser?.userRoles[0]).to.have.property(
        "roleName",
      );

      expect(result.data?.primaryUser?.directPerms).to.have.length.at.least(1);
      expect(result.data?.primaryUser?.directPerms[0]).to.have.property("res");
      expect(result.data?.primaryUser?.directPerms[0]).to.have.property("act");

      expect(result.data?.allUsers?.count).to.equal(3);
      expect(result.data?.allUsers?.items).to.have.lengthOf(3);
      expect(result.data?.allUsers?.items[0]).to.have.property("userId");
    });

    it("should handle fragments correctly", async () => {
      const acmeClient = getAcmeClient();
      const query = gql`
        fragment UserBasics on User {
          id
          identityProvider
          identityProviderUserId
        }

        fragment RoleDetails on Role {
          id
          name
          description
          properties {
            name
            value
          }
        }

        query FragmentQuery {
          users {
            nodes {
              ...UserBasics
              roles {
                ...RoleDetails
              }
            }
          }
          roles {
            nodes {
              ...RoleDetails
              users {
                ...UserBasics
              }
            }
          }
        }
      `;

      const result = await acmeClient.query(query, {});

      // Verify fragments expanded correctly
      expect(result.data?.users?.nodes).to.have.length.at.least(1);
      const user = result.data?.users?.nodes[0];
      expect(user).to.include.all.keys([
        "id",
        "identityProvider",
        "identityProviderUserId",
        "roles",
      ]);

      if (user?.roles?.length > 0) {
        const role = user.roles[0];
        expect(role).to.include.all.keys([
          "id",
          "name",
          "description",
          "properties",
        ]);
      }

      expect(result.data?.roles?.nodes).to.have.length.at.least(1);
      const roleNode = result.data?.roles?.nodes[0];
      expect(roleNode).to.include.all.keys([
        "id",
        "name",
        "description",
        "properties",
        "users",
      ]);
    });
  });
});
