import { expect } from "chai";
import {
  createTenant,
  getTenant,
  listTenants,
  getTenantsByIds,
  updateTenant,
  deleteTenant,
  setTenantProperty,
  getTenantProperty,
  deleteTenantProperty,
} from "../api/tenants.js";
import { getTestConfig, generateTestId } from "./utils/test-helpers.js";
import "./setup.js";

describe("Tenants API", () => {
  const config = getTestConfig();

  describe("createTenant", () => {
    it("should create a tenant successfully", async () => {
      const tenantId = generateTestId("tenant");
      const result = await createTenant(config, {
        id: tenantId,
        name: "Test Tenant",
        description: "A test tenant",
        properties: [
          { name: "industry", value: "technology" },
          { name: "size", value: "small" },
        ],
      });

      expect(result.success).to.be.true;
      if (result.success) {
        expect(result.data.id).to.equal(tenantId);
        expect(result.data.name).to.equal("Test Tenant");
        expect(result.data.description).to.equal("A test tenant");
        expect(result.data.properties).to.have.lengthOf(2);
        expect(result.data.properties[0]?.name).to.equal("industry");
        expect(result.data.properties[0]?.value).to.equal("technology");
      }
    });

    it("should handle duplicate tenant creation", async () => {
      const tenantId = generateTestId("tenant");

      // Create first tenant
      const result1 = await createTenant(config, {
        id: tenantId,
        name: "Test Tenant",
      });
      expect(result1.success).to.be.true;

      // Try to create duplicate
      const result2 = await createTenant(config, {
        id: tenantId,
        name: "Duplicate Tenant",
      });
      expect(result2.success).to.be.false;
      if (!result2.success) {
        expect(result2.error.message).to.include("duplicate key");
      }
    });
  });

  describe("getTenant", () => {
    it("should retrieve an existing tenant", async () => {
      const tenantId = generateTestId("tenant");

      // Create tenant
      const createResult = await createTenant(config, {
        id: tenantId,
        name: "Test Tenant",
      });
      expect(createResult.success).to.be.true;

      // Get tenant
      const getResult = await getTenant(config, tenantId);
      expect(getResult.success).to.be.true;
      if (getResult.success) {
        expect(getResult.data?.id).to.equal(tenantId);
        expect(getResult.data?.name).to.equal("Test Tenant");
      }
    });

    it("should return null for non-existent tenant", async () => {
      const result = await getTenant(config, "non-existent-tenant");
      expect(result.success).to.be.true;
      if (result.success) {
        expect(result.data).to.be.null;
      }
    });
  });

  describe("listTenants", () => {
    it("should list tenants with pagination", async () => {
      // Create multiple tenants
      const tenantIds = [];
      for (let i = 0; i < 5; i++) {
        const tenantId = generateTestId(`tenant-${String(i)}`);
        tenantIds.push(tenantId);
        const result = await createTenant(config, {
          id: tenantId,
          name: `Test Tenant ${String(i)}`,
        });
        expect(result.success).to.be.true;
      }

      // List with pagination
      const listResult = await listTenants(config, {
        pagination: { limit: 3, offset: 0 },
      });

      expect(listResult.success).to.be.true;
      if (listResult.success) {
        expect(listResult.data.nodes).to.have.lengthOf(3);
        expect(listResult.data.totalCount).to.be.at.least(5);
        expect(listResult.data.pageInfo.hasNextPage).to.be.true;
      }
    });

    it("should list tenants with descending sort", async () => {
      // Create tenants with specific IDs to test sorting
      const tenantIds = ["z-tenant", "a-tenant", "m-tenant"];
      for (const tenantId of tenantIds) {
        const result = await createTenant(config, {
          id: tenantId,
          name: `Test ${tenantId}`,
        });
        expect(result.success).to.be.true;
      }

      // List with DESC sort
      const listResult = await listTenants(config, {
        pagination: { sortDirection: "DESC" },
      });

      expect(listResult.success).to.be.true;
      if (listResult.success) {
        const ids = listResult.data.nodes.map((t) => t.id);
        const zIndex = ids.indexOf("z-tenant");
        const aIndex = ids.indexOf("a-tenant");
        if (zIndex !== -1 && aIndex !== -1) {
          expect(zIndex).to.be.lessThan(aIndex);
        }
      }
    });
  });

  describe("getTenantsByIds", () => {
    it("should retrieve multiple tenants by IDs", async () => {
      const tenantIds = [];
      for (let i = 0; i < 3; i++) {
        const tenantId = generateTestId(`tenant-${String(i)}`);
        tenantIds.push(tenantId);
        const result = await createTenant(config, {
          id: tenantId,
          name: `Test Tenant ${String(i)}`,
        });
        expect(result.success).to.be.true;
      }

      const result = await getTenantsByIds(config, tenantIds);
      expect(result.success).to.be.true;
      if (result.success) {
        expect(result.data).to.have.lengthOf(3);
        const retrievedIds = result.data.map((t) => t.id);
        expect(retrievedIds).to.have.members(tenantIds);
      }
    });
  });

  describe("updateTenant", () => {
    it("should update a tenant", async () => {
      const tenantId = generateTestId("tenant");

      // Create tenant
      const createResult = await createTenant(config, {
        id: tenantId,
        name: "Original Name",
        description: "Original description",
      });
      expect(createResult.success).to.be.true;

      // Update tenant
      const updateResult = await updateTenant(config, tenantId, {
        name: "Updated Name",
        description: "Updated description",
      });
      expect(updateResult.success).to.be.true;
      if (updateResult.success) {
        expect(updateResult.data.name).to.equal("Updated Name");
        expect(updateResult.data.description).to.equal("Updated description");
      }
    });
  });

  describe("Tenant Properties", () => {
    it("should set and get tenant properties", async () => {
      const tenantId = generateTestId("tenant");

      // Create tenant
      const createResult = await createTenant(config, {
        id: tenantId,
        name: "Test Tenant",
      });
      expect(createResult.success).to.be.true;

      // Set property with complex JSON value
      const propertyValue = {
        settings: {
          theme: "dark",
          notifications: true,
        },
        limits: {
          maxUsers: 100,
          maxStorage: "10GB",
        },
      };

      const setPropResult = await setTenantProperty(
        config,
        tenantId,
        "config",
        propertyValue,
        false,
      );
      expect(setPropResult.success).to.be.true;
      if (setPropResult.success) {
        expect(setPropResult.data.name).to.equal("config");
        expect(setPropResult.data.value).to.deep.equal(propertyValue);
        expect(setPropResult.data.hidden).to.be.false;
      }

      // Get property
      const getPropResult = await getTenantProperty(
        config,
        tenantId,
        "config",
      );
      expect(getPropResult.success).to.be.true;
      if (getPropResult.success) {
        expect(getPropResult.data?.name).to.equal("config");
        expect(getPropResult.data?.value).to.deep.equal(propertyValue);
      }
    });

    it("should handle hidden properties", async () => {
      const tenantId = generateTestId("tenant");

      // Create tenant
      const createResult = await createTenant(config, {
        id: tenantId,
        name: "Test Tenant",
      });
      expect(createResult.success).to.be.true;

      // Set hidden property
      const setPropResult = await setTenantProperty(
        config,
        tenantId,
        "apiKey",
        "secret-key-123",
        true,
      );
      expect(setPropResult.success).to.be.true;
      if (setPropResult.success) {
        expect(setPropResult.data.hidden).to.be.true;
      }
    });

    it("should delete tenant properties", async () => {
      const tenantId = generateTestId("tenant");

      // Create tenant with property
      const createResult = await createTenant(config, {
        id: tenantId,
        name: "Test Tenant",
        properties: [{ name: "toDelete", value: "temporary" }],
      });
      expect(createResult.success).to.be.true;

      // Delete property
      const deleteResult = await deleteTenantProperty(
        config,
        tenantId,
        "toDelete",
      );
      expect(deleteResult.success).to.be.true;
      if (deleteResult.success) {
        expect(deleteResult.data).to.be.true;
      }

      // Verify property is deleted
      const getPropResult = await getTenantProperty(
        config,
        tenantId,
        "toDelete",
      );
      expect(getPropResult.success).to.be.true;
      if (getPropResult.success) {
        expect(getPropResult.data).to.be.null;
      }
    });
  });

  describe("deleteTenant", () => {
    it("should delete a tenant", async () => {
      const tenantId = generateTestId("tenant");

      // Create tenant
      const createResult = await createTenant(config, {
        id: tenantId,
        name: "To Delete",
      });
      expect(createResult.success).to.be.true;

      // Delete tenant
      const deleteResult = await deleteTenant(config, tenantId);
      expect(deleteResult.success).to.be.true;
      if (deleteResult.success) {
        expect(deleteResult.data).to.be.true;
      }

      // Verify tenant is deleted
      const getResult = await getTenant(config, tenantId);
      expect(getResult.success).to.be.true;
      if (getResult.success) {
        expect(getResult.data).to.be.null;
      }
    });
  });
});
