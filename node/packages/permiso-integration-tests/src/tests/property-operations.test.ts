import { expect } from "chai";
import { gql } from "@apollo/client/core/index.js";
import {
  testDb,
  rootClient,
  createTenantClient,
  truncateAllTables,
} from "../index.js";

describe("Property Operations", () => {
  let testTenantClientInstance:
    | ReturnType<typeof createTenantClient>
    | undefined;

  const testTenantClient = () => {
    if (!testTenantClientInstance) {
      throw new Error(
        "testTenantClient not initialized. Make sure beforeEach has run.",
      );
    }
    return testTenantClientInstance;
  };

  beforeEach(async () => {
    truncateAllTables(testDb);

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

    // Create tenant-specific client
    testTenantClientInstance = createTenantClient("test-org");
  });

  describe("Tenant Properties", () => {
    beforeEach(async () => {
      // Add a property to the test tenant
      const setPropMutation = gql`
        mutation SetTenantProperty(
          $tenantId: ID!
          $name: String!
          $value: JSON
        ) {
          setTenantProperty(tenantId: $tenantId, name: $name, value: $value) {
            name
          }
        }
      `;

      await testTenantClient().mutate(setPropMutation, {
        tenantId: "test-org",
        name: "existing_prop",
        value: "initial_value",
      });
    });

    describe("tenantProperty query", () => {
      it("should retrieve a single tenant property", async () => {
        const query = gql`
          query GetTenantProperty($tenantId: ID!, $propertyName: String!) {
            tenantProperty(tenantId: $tenantId, propertyName: $propertyName) {
              name
              value
              hidden
              createdAt
            }
          }
        `;

        const result = await testTenantClient().query(query, {
          tenantId: "test-org",
          propertyName: "existing_prop",
        });

        expect(result.data?.tenantProperty).to.not.be.null;
        expect(result.data?.tenantProperty?.name).to.equal("existing_prop");
        expect(result.data?.tenantProperty?.value).to.equal("initial_value");
        expect(result.data?.tenantProperty?.hidden).to.be.false;
        expect(result.data?.tenantProperty?.createdAt).to.be.a("number");
      });

      it("should return null for non-existent property", async () => {
        const query = gql`
          query GetTenantProperty($tenantId: ID!, $propertyName: String!) {
            tenantProperty(tenantId: $tenantId, propertyName: $propertyName) {
              name
              value
            }
          }
        `;

        const result = await testTenantClient().query(query, {
          tenantId: "test-org",
          propertyName: "non_existent",
        });

        expect(result.data?.tenantProperty).to.be.null;
      });
    });

    describe("setTenantProperty mutation", () => {
      it("should create a new tenant property", async () => {
        const mutation = gql`
          mutation SetTenantProperty(
            $tenantId: ID!
            $name: String!
            $value: JSON
            $hidden: Boolean
          ) {
            setTenantProperty(
              tenantId: $tenantId
              name: $name
              value: $value
              hidden: $hidden
            ) {
              name
              value
              hidden
            }
          }
        `;

        const result = await testTenantClient().mutate(mutation, {
          tenantId: "test-org",
          name: "new_prop",
          value: { complex: "object", with: ["array", "values"] },
          hidden: false,
        });

        expect(result.data?.setTenantProperty?.name).to.equal("new_prop");
        expect(result.data?.setTenantProperty?.value).to.deep.equal({
          complex: "object",
          with: ["array", "values"],
        });
        expect(result.data?.setTenantProperty?.hidden).to.be.false;
      });

      it("should update an existing tenant property", async () => {
        const mutation = gql`
          mutation SetTenantProperty(
            $tenantId: ID!
            $name: String!
            $value: JSON
            $hidden: Boolean
          ) {
            setTenantProperty(
              tenantId: $tenantId
              name: $name
              value: $value
              hidden: $hidden
            ) {
              name
              value
              hidden
            }
          }
        `;

        const result = await testTenantClient().mutate(mutation, {
          tenantId: "test-org",
          name: "existing_prop",
          value: "updated_value",
          hidden: true,
        });

        expect(result.data?.setTenantProperty?.value).to.equal("updated_value");
        expect(result.data?.setTenantProperty?.hidden).to.be.true;

        // Verify it was updated
        const query = gql`
          query GetTenant($id: ID!) {
            tenant(id: $id) {
              properties {
                name
                value
                hidden
              }
            }
          }
        `;

        const queryResult = await testTenantClient().query(query, {
          id: "test-org",
        });
        expect(queryResult.data?.tenant?.properties).to.have.lengthOf(1);
        expect(queryResult.data?.tenant?.properties[0]).to.deep.include({
          name: "existing_prop",
          value: "updated_value",
          hidden: true,
        });
      });

      it("should handle null values", async () => {
        const mutation = gql`
          mutation SetTenantProperty(
            $tenantId: ID!
            $name: String!
            $value: JSON
          ) {
            setTenantProperty(tenantId: $tenantId, name: $name, value: $value) {
              name
              value
            }
          }
        `;

        const result = await testTenantClient().mutate(mutation, {
          tenantId: "test-org",
          name: "null_prop",
          value: null,
        });

        expect(result.data?.setTenantProperty?.value).to.be.null;
      });

      it("should handle various JSON types", async () => {
        const mutation = gql`
          mutation SetTenantProperty(
            $tenantId: ID!
            $name: String!
            $value: JSON
          ) {
            setTenantProperty(tenantId: $tenantId, name: $name, value: $value) {
              name
              value
            }
          }
        `;

        // Test number
        const result = await testTenantClient().mutate(mutation, {
          tenantId: "test-org",
          name: "number_prop",
          value: 42.5,
        });
        expect(result.data?.setTenantProperty?.value).to.equal(42.5);

        // Test boolean
        const boolResult = await testTenantClient().mutate(mutation, {
          tenantId: "test-org",
          name: "bool_prop",
          value: true,
        });
        expect(boolResult.data?.setTenantProperty?.value).to.equal(true);

        // Test array
        const arrayResult = await testTenantClient().mutate(mutation, {
          tenantId: "test-org",
          name: "array_prop",
          value: [1, "two", { three: 3 }, null],
        });
        expect(arrayResult.data?.setTenantProperty?.value).to.deep.equal([
          1,
          "two",
          { three: 3 },
          null,
        ]);

        // Test nested object
        const nestedResult = await testTenantClient().mutate(mutation, {
          tenantId: "test-org",
          name: "nested_prop",
          value: {
            level1: {
              level2: {
                level3: "deep",
                array: [1, 2, 3],
              },
            },
          },
        });
        expect(nestedResult.data?.setTenantProperty?.value).to.deep.equal({
          level1: {
            level2: {
              level3: "deep",
              array: [1, 2, 3],
            },
          },
        });
      });
    });

    describe("deleteTenantProperty mutation", () => {
      it("should delete an existing tenant property", async () => {
        // First add a property
        const setPropMutation = gql`
          mutation SetTenantProperty(
            $tenantId: ID!
            $name: String!
            $value: JSON
          ) {
            setTenantProperty(tenantId: $tenantId, name: $name, value: $value) {
              name
            }
          }
        `;

        await testTenantClient().mutate(setPropMutation, {
          tenantId: "test-org",
          name: "to_delete",
          value: "delete_me",
        });

        // Delete the property
        const deleteMutation = gql`
          mutation DeleteTenantProperty($tenantId: ID!, $name: String!) {
            deleteTenantProperty(tenantId: $tenantId, name: $name)
          }
        `;

        const result = await testTenantClient().mutate(deleteMutation, {
          tenantId: "test-org",
          name: "to_delete",
        });

        expect(result.data?.deleteTenantProperty).to.be.true;

        // Verify it's deleted
        const query = gql`
          query GetTenantProperty($tenantId: ID!, $propertyName: String!) {
            tenantProperty(tenantId: $tenantId, propertyName: $propertyName) {
              name
            }
          }
        `;

        const queryResult = await testTenantClient().query(query, {
          tenantId: "test-org",
          propertyName: "to_delete",
        });

        expect(queryResult.data?.tenantProperty).to.be.null;
      });

      it("should return false when deleting non-existent property", async () => {
        const mutation = gql`
          mutation DeleteTenantProperty($tenantId: ID!, $name: String!) {
            deleteTenantProperty(tenantId: $tenantId, name: $name)
          }
        `;

        const result = await testTenantClient().mutate(mutation, {
          tenantId: "test-org",
          name: "non_existent",
        });

        expect(result.data?.deleteTenantProperty).to.be.false;
      });
    });
  });

  describe("User Properties", () => {
    beforeEach(async () => {
      // Create test user
      const userMutation = gql`
        mutation CreateUser($input: CreateUserInput!) {
          createUser(input: $input) {
            id
          }
        }
      `;

      await testTenantClient().mutate(userMutation, {
        input: {
          id: "test-user",
          identityProvider: "auth0",
          identityProviderUserId: "auth0|12345",
          properties: [{ name: "existing_prop", value: "initial_value" }],
        },
      });
    });

    describe("userProperty query", () => {
      it("should retrieve a single user property", async () => {
        const query = gql`
          query GetUserProperty($userId: ID!, $propertyName: String!) {
            userProperty(userId: $userId, propertyName: $propertyName) {
              name
              value
              hidden
              createdAt
            }
          }
        `;

        const result = await testTenantClient().query(query, {
          userId: "test-user",
          propertyName: "existing_prop",
        });

        expect(result.data?.userProperty).to.not.be.null;
        expect(result.data?.userProperty?.name).to.equal("existing_prop");
        expect(result.data?.userProperty?.value).to.equal("initial_value");
        expect(result.data?.userProperty?.hidden).to.be.false;
      });

      it("should return null for non-existent property", async () => {
        const query = gql`
          query GetUserProperty($userId: ID!, $propertyName: String!) {
            userProperty(userId: $userId, propertyName: $propertyName) {
              name
            }
          }
        `;

        const result = await testTenantClient().query(query, {
          userId: "test-user",
          propertyName: "non_existent",
        });

        expect(result.data?.userProperty).to.be.null;
      });
    });

    describe("deleteUserProperty mutation", () => {
      it("should delete an existing user property", async () => {
        // First add a property
        const setPropMutation = gql`
          mutation SetUserProperty($userId: ID!, $name: String!, $value: JSON) {
            setUserProperty(userId: $userId, name: $name, value: $value) {
              name
            }
          }
        `;

        await testTenantClient().mutate(setPropMutation, {
          userId: "test-user",
          name: "to_delete",
          value: "delete_me",
        });

        // Delete the property
        const deleteMutation = gql`
          mutation DeleteUserProperty($userId: ID!, $name: String!) {
            deleteUserProperty(userId: $userId, name: $name)
          }
        `;

        const result = await testTenantClient().mutate(deleteMutation, {
          userId: "test-user",
          name: "to_delete",
        });

        expect(result.data?.deleteUserProperty).to.be.true;

        // Verify it's deleted
        const query = gql`
          query GetUserProperty($userId: ID!, $propertyName: String!) {
            userProperty(userId: $userId, propertyName: $propertyName) {
              name
            }
          }
        `;

        const queryResult = await testTenantClient().query(query, {
          userId: "test-user",
          propertyName: "to_delete",
        });

        expect(queryResult.data?.userProperty).to.be.null;
      });
    });
  });

  describe("Role Properties", () => {
    beforeEach(async () => {
      // Create test role
      const roleMutation = gql`
        mutation CreateRole($input: CreateRoleInput!) {
          createRole(input: $input) {
            id
          }
        }
      `;

      await testTenantClient().mutate(roleMutation, {
        input: {
          id: "test-role",
          name: "Test Role",
          properties: [{ name: "existing_prop", value: "initial_value" }],
        },
      });
    });

    describe("roleProperty query", () => {
      it("should retrieve a single role property", async () => {
        const query = gql`
          query GetRoleProperty($roleId: ID!, $propertyName: String!) {
            roleProperty(roleId: $roleId, propertyName: $propertyName) {
              name
              value
              hidden
              createdAt
            }
          }
        `;

        const result = await testTenantClient().query(query, {
          roleId: "test-role",
          propertyName: "existing_prop",
        });

        expect(result.data?.roleProperty).to.not.be.null;
        expect(result.data?.roleProperty?.name).to.equal("existing_prop");
        expect(result.data?.roleProperty?.value).to.equal("initial_value");
        expect(result.data?.roleProperty?.hidden).to.be.false;
      });
    });

    describe("setRoleProperty mutation", () => {
      it("should create and update role properties", async () => {
        const mutation = gql`
          mutation SetRoleProperty(
            $roleId: ID!
            $name: String!
            $value: JSON
            $hidden: Boolean
          ) {
            setRoleProperty(
              roleId: $roleId
              name: $name
              value: $value
              hidden: $hidden
            ) {
              name
              value
              hidden
            }
          }
        `;

        const result = await testTenantClient().mutate(mutation, {
          roleId: "test-role",
          name: "permissions_config",
          value: {
            maxApiCalls: 10000,
            allowedRegions: ["us-east", "eu-west"],
            features: {
              billing: true,
              reporting: false,
            },
          },
          hidden: false,
        });

        expect(result.data?.setRoleProperty?.name).to.equal(
          "permissions_config",
        );
        expect(result.data?.setRoleProperty?.value).to.deep.equal({
          maxApiCalls: 10000,
          allowedRegions: ["us-east", "eu-west"],
          features: {
            billing: true,
            reporting: false,
          },
        });
      });
    });

    describe("deleteRoleProperty mutation", () => {
      it("should delete an existing role property", async () => {
        // First add a property
        const setPropMutation = gql`
          mutation SetRoleProperty($roleId: ID!, $name: String!, $value: JSON) {
            setRoleProperty(roleId: $roleId, name: $name, value: $value) {
              name
            }
          }
        `;

        await testTenantClient().mutate(setPropMutation, {
          roleId: "test-role",
          name: "to_delete",
          value: "delete_me",
        });

        // Delete the property
        const deleteMutation = gql`
          mutation DeleteRoleProperty($roleId: ID!, $name: String!) {
            deleteRoleProperty(roleId: $roleId, name: $name)
          }
        `;

        const result = await testTenantClient().mutate(deleteMutation, {
          roleId: "test-role",
          name: "to_delete",
        });

        expect(result.data?.deleteRoleProperty).to.be.true;
      });
    });
  });

  describe("Property Edge Cases", () => {
    it("should handle very large JSON objects", async () => {
      const largeObject: any = {};
      for (let i = 0; i < 100; i++) {
        largeObject[`key_${String(i)}`] = {
          value: i,
          nested: {
            data: `Some data string ${String(i)}`,
            array: Array(10).fill(i),
          },
        };
      }

      const mutation = gql`
        mutation SetTenantProperty(
          $tenantId: ID!
          $name: String!
          $value: JSON
        ) {
          setTenantProperty(tenantId: $tenantId, name: $name, value: $value) {
            name
            value
          }
        }
      `;

      const result = await testTenantClient().mutate(mutation, {
        tenantId: "test-org",
        name: "large_object",
        value: largeObject,
      });

      expect(result.data?.setTenantProperty?.value).to.deep.equal(largeObject);
    });

    it("should handle deeply nested JSON structures", async () => {
      const deepObject: any = { level: 1 };
      let current = deepObject;
      for (let i = 2; i <= 10; i++) {
        current.nested = { level: i };
        current = current.nested;
      }
      current.value = "deep value";

      const mutation = gql`
        mutation SetTenantProperty(
          $tenantId: ID!
          $name: String!
          $value: JSON
        ) {
          setTenantProperty(tenantId: $tenantId, name: $name, value: $value) {
            name
            value
          }
        }
      `;

      const result = await testTenantClient().mutate(mutation, {
        tenantId: "test-org",
        name: "deep_object",
        value: deepObject,
      });

      expect(result.data?.setTenantProperty?.value).to.deep.equal(deepObject);
    });

    it("should handle special characters in property names", async () => {
      const mutation = gql`
        mutation SetTenantProperty(
          $tenantId: ID!
          $name: String!
          $value: JSON
        ) {
          setTenantProperty(tenantId: $tenantId, name: $name, value: $value) {
            name
            value
          }
        }
      `;

      const specialNames = [
        "prop.with.dots",
        "prop-with-dashes",
        "prop_with_underscores",
        "prop@with@at",
        "prop#with#hash",
        "prop$with$dollar",
        "prop%with%percent",
      ];

      for (const name of specialNames) {
        const result = await testTenantClient().mutate(mutation, {
          tenantId: "test-org",
          name: name,
          value: `value for ${name}`,
        });

        expect(result.data?.setTenantProperty?.name).to.equal(name);
        expect(result.data?.setTenantProperty?.value).to.equal(
          `value for ${name}`,
        );
      }
    });

    it("should handle empty strings and whitespace", async () => {
      const mutation = gql`
        mutation SetTenantProperty(
          $tenantId: ID!
          $name: String!
          $value: JSON
        ) {
          setTenantProperty(tenantId: $tenantId, name: $name, value: $value) {
            name
            value
          }
        }
      `;

      // Empty string value
      const result = await testTenantClient().mutate(mutation, {
        tenantId: "test-org",
        name: "empty_string",
        value: "",
      });
      expect(result.data?.setTenantProperty?.value).to.equal("");

      // Whitespace value
      const whitespaceResult = await testTenantClient().mutate(mutation, {
        tenantId: "test-org",
        name: "whitespace",
        value: "   ",
      });
      expect(whitespaceResult.data?.setTenantProperty?.value).to.equal("   ");
    });

    it("should handle unicode and emoji in values", async () => {
      const mutation = gql`
        mutation SetTenantProperty(
          $tenantId: ID!
          $name: String!
          $value: JSON
        ) {
          setTenantProperty(tenantId: $tenantId, name: $name, value: $value) {
            name
            value
          }
        }
      `;

      const result = await testTenantClient().mutate(mutation, {
        tenantId: "test-org",
        name: "unicode_prop",
        value: {
          emoji: "🚀🌟😊",
          chinese: "你好世界",
          arabic: "مرحبا بالعالم",
          russian: "Привет мир",
        },
      });

      expect(result.data?.setTenantProperty?.value).to.deep.equal({
        emoji: "🚀🌟😊",
        chinese: "你好世界",
        arabic: "مرحبا بالعالم",
        russian: "Привет мир",
      });
    });
  });
});
