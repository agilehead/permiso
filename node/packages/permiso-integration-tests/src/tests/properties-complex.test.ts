import { expect } from "chai";
import { gql } from "@apollo/client/core/index.js";
import {
  testDb,
  rootClient,
  createTenantClient,
  truncateAllTables,
} from "../index.js";

describe("Properties - Complex JSON and Initial Values", () => {
  beforeEach(() => {
    truncateAllTables(testDb);
  });

  describe("User Properties - Complex JSON", () => {
    const getTestTenantClient = () => createTenantClient("test-org");

    beforeEach(async () => {
      // Create test tenant using ROOT client
      const createTenantMutation = gql`
        mutation CreateTenant($input: CreateTenantInput!) {
          createTenant(input: $input) {
            id
          }
        }
      `;
      await rootClient.mutate(createTenantMutation, {
        input: { id: "test-org", name: "Test Tenant" },
      });

      // Create tenant-specific client

      const createUserMutation = gql`
        mutation CreateUser($input: CreateUserInput!) {
          createUser(input: $input) {
            id
          }
        }
      `;
      const testTenantClient = getTestTenantClient();
      await testTenantClient.mutate(createUserMutation, {
        input: {
          id: "test-user",
          identityProvider: "test",
          identityProviderUserId: "user123",
        },
      });
    });

    it("should handle complex JSON objects in user properties", async () => {
      const testTenantClient = getTestTenantClient();
      const setPropMutation = gql`
        mutation SetUserProperty($userId: ID!, $name: String!, $value: JSON) {
          setUserProperty(userId: $userId, name: $name, value: $value) {
            name
            value
          }
        }
      `;

      const complexValue = {
        preferences: {
          theme: "dark",
          language: "en",
          notifications: {
            email: true,
            push: false,
            frequency: "daily",
          },
        },
        metadata: {
          lastLogin: "2024-01-01T00:00:00Z",
          loginCount: 42,
          features: ["feature1", "feature2"],
        },
      };

      const result = await testTenantClient.mutate(setPropMutation, {
        userId: "test-user",
        name: "settings",
        value: complexValue,
      });

      expect(result.data?.setUserProperty.value).to.deep.equal(complexValue);
    });
  });

  describe("Role Properties - Complex Arrays", () => {
    const getTestTenantClient = () => createTenantClient("test-org");

    beforeEach(async () => {
      // Create test tenant using ROOT client
      const createTenantMutation = gql`
        mutation CreateTenant($input: CreateTenantInput!) {
          createTenant(input: $input) {
            id
          }
        }
      `;
      await rootClient.mutate(createTenantMutation, {
        input: { id: "test-org", name: "Test Tenant" },
      });

      // Create tenant-specific client

      const createRoleMutation = gql`
        mutation CreateRole($input: CreateRoleInput!) {
          createRole(input: $input) {
            id
          }
        }
      `;
      const testTenantClient = getTestTenantClient();
      await testTenantClient.mutate(createRoleMutation, {
        input: {
          id: "test-role",
          name: "Test Role",
        },
      });
    });

    it("should handle arrays and nested structures in role properties", async () => {
      const testTenantClient = getTestTenantClient();
      const setPropMutation = gql`
        mutation SetRoleProperty($roleId: ID!, $name: String!, $value: JSON) {
          setRoleProperty(roleId: $roleId, name: $name, value: $value) {
            name
            value
          }
        }
      `;

      // Test array of objects
      const permissionsValue = [
        { resource: "/api/users", actions: ["read", "write"] },
        { resource: "/api/products", actions: ["read"] },
        { resource: "/api/admin/*", actions: ["*"] },
      ];

      const result = await testTenantClient.mutate(setPropMutation, {
        roleId: "test-role",
        name: "customPermissions",
        value: permissionsValue,
      });

      expect(result.data?.setRoleProperty.value).to.deep.equal(
        permissionsValue,
      );
    });
  });

  describe("Property creation with initial values", () => {
    it("should create tenant with JSON property values", async () => {
      const mutation = gql`
        mutation CreateTenant($input: CreateTenantInput!) {
          createTenant(input: $input) {
            id
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
          id: "org-with-props",
          name: "Tenant with JSON props",
          properties: [
            { name: "config", value: { tier: "premium", maxUsers: 100 } },
            { name: "features", value: ["feature1", "feature2", "feature3"] },
            { name: "active", value: true },
            { name: "score", value: 98.5 },
          ],
        },
      });

      const props = result.data?.createTenant.properties;
      expect(props).to.have.lengthOf(4);

      const propMap = props.reduce((acc: any, p: any) => {
        acc[p.name] = p.value;
        return acc;
      }, {});

      expect(propMap.config).to.deep.equal({ tier: "premium", maxUsers: 100 });
      expect(propMap.features).to.deep.equal([
        "feature1",
        "feature2",
        "feature3",
      ]);
      expect(propMap.active).to.equal(true);
      expect(propMap.score).to.equal(98.5);
    });

    it("should create user with JSON property values", async () => {
      // First create tenant using ROOT client
      await rootClient.mutate(
        gql`
          mutation CreateTenant($input: CreateTenantInput!) {
            createTenant(input: $input) {
              id
            }
          }
        `,
        {
          input: { id: "test-org", name: "Test Tenant" },
        },
      );

      // Create tenant-specific client
      const testTenantClient = createTenantClient("test-org");

      const mutation = gql`
        mutation CreateUser($input: CreateUserInput!) {
          createUser(input: $input) {
            id
            properties {
              name
              value
            }
          }
        }
      `;

      const result = await testTenantClient.mutate(mutation, {
        input: {
          id: "user-with-props",
          identityProvider: "test",
          identityProviderUserId: "user456",
          properties: [
            {
              name: "profile",
              value: { firstName: "John", lastName: "Doe", age: 30 },
            },
            { name: "tags", value: ["admin", "developer"] },
          ],
        },
      });

      const props = result.data?.createUser.properties;
      expect(props).to.have.lengthOf(2);

      const profileProp = props.find((p: any) => p.name === "profile");
      expect(profileProp?.value).to.deep.equal({
        firstName: "John",
        lastName: "Doe",
        age: 30,
      });

      const tagsProp = props.find((p: any) => p.name === "tags");
      expect(tagsProp?.value).to.deep.equal(["admin", "developer"]);
    });
  });
});
