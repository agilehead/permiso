import { expect } from "chai";
import { createPermisoClient, createNoOpPermisoClient } from "../client.js";
import type { PermisoConfig } from "../types.js";

type FetchCall = { url: string; init: RequestInit };

describe("PermisoClient (factory pattern)", () => {
  let fetchCalls: FetchCall[];
  let fetchResponse: { status: number; body: unknown };
  const originalFetch = globalThis.fetch;

  const config: PermisoConfig = {
    endpoint: "http://localhost:5003",
    apiKey: "test-key",
    tenantId: "test-tenant",
  };

  beforeEach(() => {
    fetchCalls = [];
    fetchResponse = { status: 200, body: {} };
    globalThis.fetch = (async (
      input: string | URL | Request,
      init?: RequestInit,
    ) => {
      fetchCalls.push({ url: String(input), init: init ?? {} });
      return new Response(JSON.stringify(fetchResponse.body), {
        status: fetchResponse.status,
        headers: { "Content-Type": "application/json" },
      });
    }) as typeof fetch;
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  describe("createPermisoClient", () => {
    describe("tenant methods", () => {
      it("should get a tenant by id", async () => {
        const tenant = {
          id: "t-1",
          name: "Test",
          description: null,
          properties: [],
          createdAt: 1000,
          updatedAt: 1000,
        };
        fetchResponse = {
          status: 200,
          body: { data: { tenant } },
        };

        const client = createPermisoClient(config);
        const result = await client.getTenant("t-1");

        expect(result.success).to.equal(true);
        if (result.success) {
          expect(result.data).to.not.be.null;
          expect(result.data!.id).to.equal("t-1");
        }

        expect(fetchCalls).to.have.length(1);
        expect(fetchCalls[0]!.url).to.equal("http://localhost:5003/graphql");

        const headers = fetchCalls[0]!.init.headers as Record<string, string>;
        expect(headers["x-tenant-id"]).to.equal("test-tenant");
        expect(headers.authorization).to.equal("Bearer test-key");
      });

      it("should create a tenant", async () => {
        const tenant = {
          id: "t-2",
          name: "New Tenant",
          description: null,
          properties: [],
          createdAt: 1000,
          updatedAt: 1000,
        };
        fetchResponse = {
          status: 200,
          body: { data: { createTenant: tenant } },
        };

        const client = createPermisoClient(config);
        const result = await client.createTenant({
          id: "t-2",
          name: "New Tenant",
        });

        expect(result.success).to.equal(true);
        if (result.success) {
          expect(result.data.id).to.equal("t-2");
        }

        const body = JSON.parse(fetchCalls[0]!.init.body as string) as {
          variables: { input: { id: string; name: string } };
        };
        expect(body.variables.input.id).to.equal("t-2");
      });

      it("should set tenant property", async () => {
        const prop = {
          name: "key",
          value: "val",
          hidden: false,
          createdAt: 1000,
        };
        fetchResponse = {
          status: 200,
          body: { data: { setTenantProperty: prop } },
        };

        const client = createPermisoClient(config);
        const result = await client.setTenantProperty(
          "t-1",
          "key",
          "val",
          false,
        );

        expect(result.success).to.equal(true);
        if (result.success) {
          expect(result.data.name).to.equal("key");
        }
      });
    });

    describe("user methods", () => {
      it("should get a user", async () => {
        const user = {
          id: "u-1",
          tenantId: "test-tenant",
          identityProvider: "google",
          identityProviderUserId: "google-123",
          properties: [],
          roles: [],
          createdAt: 1000,
          updatedAt: 1000,
        };
        fetchResponse = {
          status: 200,
          body: { data: { user } },
        };

        const client = createPermisoClient(config);
        const result = await client.getUser("u-1");

        expect(result.success).to.equal(true);
        if (result.success) {
          expect(result.data).to.not.be.null;
          expect(result.data!.id).to.equal("u-1");
        }
      });

      it("should assign user role", async () => {
        const user = {
          id: "u-1",
          tenantId: "test-tenant",
          identityProvider: "google",
          identityProviderUserId: "google-123",
          properties: [],
          roles: [{ id: "r-1", name: "admin", description: null }],
          createdAt: 1000,
          updatedAt: 1000,
        };
        fetchResponse = {
          status: 200,
          body: { data: { assignUserRole: user } },
        };

        const client = createPermisoClient(config);
        const result = await client.assignUserRole("u-1", "r-1");

        expect(result.success).to.equal(true);
        if (result.success) {
          expect(result.data.roles).to.have.length(1);
        }
      });
    });

    describe("role methods", () => {
      it("should create a role", async () => {
        const role = {
          id: "r-1",
          tenantId: "test-tenant",
          name: "admin",
          description: null,
          properties: [],
          createdAt: 1000,
          updatedAt: 1000,
        };
        fetchResponse = {
          status: 200,
          body: { data: { createRole: role } },
        };

        const client = createPermisoClient(config);
        const result = await client.createRole({
          id: "r-1",
          name: "admin",
        });

        expect(result.success).to.equal(true);
        if (result.success) {
          expect(result.data.name).to.equal("admin");
        }
      });
    });

    describe("resource methods", () => {
      it("should create a resource", async () => {
        const resource = {
          id: "res-1",
          tenantId: "test-tenant",
          name: "documents",
          description: null,
          createdAt: 1000,
          updatedAt: 1000,
        };
        fetchResponse = {
          status: 200,
          body: { data: { createResource: resource } },
        };

        const client = createPermisoClient(config);
        const result = await client.createResource({
          id: "res-1",
          name: "documents",
        });

        expect(result.success).to.equal(true);
        if (result.success) {
          expect(result.data.id).to.equal("res-1");
        }
      });

      it("should get resources by id prefix", async () => {
        fetchResponse = {
          status: 200,
          body: {
            data: {
              resourcesByIdPrefix: [
                {
                  id: "doc/1",
                  tenantId: "t",
                  name: "Doc 1",
                  description: null,
                  createdAt: 1000,
                  updatedAt: 1000,
                },
              ],
            },
          },
        };

        const client = createPermisoClient(config);
        const result = await client.getResourcesByIdPrefix("doc/");

        expect(result.success).to.equal(true);
        if (result.success) {
          expect(result.data).to.have.length(1);
        }
      });
    });

    describe("permission methods", () => {
      it("should check hasPermission", async () => {
        fetchResponse = {
          status: 200,
          body: { data: { hasPermission: true } },
        };

        const client = createPermisoClient(config);
        const result = await client.hasPermission({
          userId: "u-1",
          resourceId: "res-1",
          action: "read",
        });

        expect(result.success).to.equal(true);
        if (result.success) {
          expect(result.data).to.equal(true);
        }
      });

      it("should grant user permission", async () => {
        const perm = {
          userId: "u-1",
          resourceId: "res-1",
          action: "write",
          createdAt: 1000,
          user: {
            id: "u-1",
            identityProvider: "g",
            identityProviderUserId: "g1",
          },
          resource: { id: "res-1", name: "Doc", description: null },
        };
        fetchResponse = {
          status: 200,
          body: { data: { grantUserPermission: perm } },
        };

        const client = createPermisoClient(config);
        const result = await client.grantUserPermission({
          userId: "u-1",
          resourceId: "res-1",
          action: "write",
        });

        expect(result.success).to.equal(true);
        if (result.success) {
          expect(result.data.action).to.equal("write");
        }
      });

      it("should get effective permissions", async () => {
        fetchResponse = {
          status: 200,
          body: {
            data: {
              effectivePermissions: [
                {
                  resourceId: "res-1",
                  action: "read",
                  source: "user",
                  sourceId: "u-1",
                  createdAt: 1000,
                },
              ],
            },
          },
        };

        const client = createPermisoClient(config);
        const result = await client.getEffectivePermissions({
          userId: "u-1",
          resourceId: "res-1",
        });

        expect(result.success).to.equal(true);
        if (result.success) {
          expect(result.data).to.have.length(1);
          expect(result.data[0]!.action).to.equal("read");
        }
      });
    });

    describe("error handling", () => {
      it("should return failure on GraphQL error", async () => {
        fetchResponse = {
          status: 200,
          body: {
            errors: [{ message: "Tenant not found" }],
            data: null,
          },
        };

        const client = createPermisoClient(config);
        const result = await client.getTenant("bad-id");

        expect(result.success).to.equal(false);
        if (!result.success) {
          expect(result.error.message).to.include("Tenant not found");
        }
      });

      it("should return failure on network error", async () => {
        globalThis.fetch = (() => {
          return Promise.reject(new Error("Connection refused"));
        }) as typeof fetch;

        const client = createPermisoClient(config);
        const result = await client.getTenant("t-1");

        expect(result.success).to.equal(false);
        if (!result.success) {
          expect(result.error.message).to.include("Connection refused");
        }
      });

      it("should work without tenantId or apiKey", async () => {
        fetchResponse = {
          status: 200,
          body: { data: { tenant: null } },
        };

        const noAuthConfig: PermisoConfig = {
          endpoint: "http://localhost:5003",
        };
        const client = createPermisoClient(noAuthConfig);
        await client.getTenant("t-1");

        const headers = fetchCalls[0]!.init.headers as Record<string, string>;
        expect(headers["x-tenant-id"]).to.be.undefined;
        expect(headers.authorization).to.be.undefined;
      });
    });
  });

  describe("createNoOpPermisoClient", () => {
    it("should return null for get methods", async () => {
      const client = createNoOpPermisoClient();

      const tenant = await client.getTenant("t-1");
      expect(tenant.success).to.equal(true);
      if (tenant.success) expect(tenant.data).to.be.null;

      const user = await client.getUser("u-1");
      expect(user.success).to.equal(true);
      if (user.success) expect(user.data).to.be.null;

      const role = await client.getRole("r-1");
      expect(role.success).to.equal(true);
      if (role.success) expect(role.data).to.be.null;

      const resource = await client.getResource("res-1");
      expect(resource.success).to.equal(true);
      if (resource.success) expect(resource.data).to.be.null;
    });

    it("should return empty arrays for list methods", async () => {
      const client = createNoOpPermisoClient();

      const tenants = await client.getTenantsByIds(["t-1"]);
      expect(tenants.success).to.equal(true);

      const users = await client.getUsersByIds(["u-1"]);
      expect(users.success).to.equal(true);

      const roles = await client.getRolesByIds(["r-1"]);
      expect(roles.success).to.equal(true);
    });

    it("should return false for hasPermission", async () => {
      const client = createNoOpPermisoClient();
      const result = await client.hasPermission({
        userId: "u-1",
        resourceId: "res-1",
        action: "read",
      });

      expect(result.success).to.equal(true);
      if (result.success) {
        expect(result.data).to.equal(false);
      }
    });

    it("should return failure for write operations", async () => {
      const client = createNoOpPermisoClient();

      const create = await client.createTenant({
        id: "t-1",
        name: "Test",
      });
      expect(create.success).to.equal(false);

      const grant = await client.grantUserPermission({
        userId: "u-1",
        resourceId: "res-1",
        action: "read",
      });
      expect(grant.success).to.equal(false);

      const del = await client.deleteUser("u-1");
      expect(del.success).to.equal(false);
    });

    it("should log warnings when logger provided", async () => {
      const warnings: unknown[][] = [];
      const logger = {
        debug: () => {},
        info: () => {},
        warn: (...args: unknown[]) => {
          warnings.push(args);
        },
        error: () => {},
      };

      const client = createNoOpPermisoClient(logger);
      await client.getTenant("t-1");
      await client.createTenant({ id: "t-1", name: "Test" });

      expect(warnings).to.have.length(2);
      expect(warnings[0]![0]).to.include("not configured");
      expect(warnings[1]![0]).to.include("not configured");
    });
  });
});
