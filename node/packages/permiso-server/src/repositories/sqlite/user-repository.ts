/**
 * SQLite User Repository
 *
 * Uses Tinqer for type-safe queries with app-level tenant filtering.
 */

import { createLogger } from "@codespin/permiso-logger";
import {
  executeSelect,
  executeInsert,
  executeDelete,
} from "@tinqerjs/better-sqlite3-adapter";
import type { Database } from "better-sqlite3";
import { schema } from "./tinqer-schema.js";
import type {
  IUserRepository,
  User,
  UserFilter,
  CreateUserInput,
  UpdateUserInput,
  Property,
  PropertyInput,
  PaginationInput,
  Connection,
  Result,
} from "../interfaces/index.js";

const logger = createLogger("permiso-server:repos:sqlite:user");

function mapUserFromDb(row: {
  id: string;
  tenant_id: string;
  identity_provider: string;
  identity_provider_user_id: string;
  created_at: number;
  updated_at: number;
}): User {
  return {
    id: row.id,
    tenantId: row.tenant_id,
    identityProvider: row.identity_provider,
    identityProviderUserId: row.identity_provider_user_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapPropertyFromDb(row: {
  name: string;
  value: string;
  hidden: number;
  created_at: number;
}): Property {
  return {
    name: row.name,
    value: typeof row.value === "string" ? JSON.parse(row.value) : row.value,
    hidden: Boolean(row.hidden),
    createdAt: row.created_at,
  };
}

export function createUserRepository(
  db: Database,
  _tenantId: string,
): IUserRepository {
  return {
    // eslint-disable-next-line @typescript-eslint/require-await -- Synchronous better-sqlite3 implements async interface
    async create(
      inputTenantId: string,
      input: CreateUserInput,
    ): Promise<Result<User>> {
      try {
        const now = Date.now();

        executeInsert(
          db,
          schema,
          (
            q,
            p: {
              id: string;
              tenant_id: string;
              identity_provider: string;
              identity_provider_user_id: string;
              created_at: number;
              updated_at: number;
            },
          ) =>
            q.insertInto("user").values({
              id: p.id,
              tenant_id: p.tenant_id,
              identity_provider: p.identity_provider,
              identity_provider_user_id: p.identity_provider_user_id,
              created_at: p.created_at,
              updated_at: p.updated_at,
            }),
          {
            id: input.id,
            tenant_id: inputTenantId,
            identity_provider: input.identityProvider,
            identity_provider_user_id: input.identityProviderUserId,
            created_at: now,
            updated_at: now,
          },
        );

        // Handle properties if provided
        if (input.properties !== undefined && input.properties.length > 0) {
          for (const prop of input.properties) {
            executeInsert(
              db,
              schema,
              (
                q,
                p: {
                  parent_id: string;
                  tenant_id: string;
                  name: string;
                  value: string;
                  hidden: number;
                  created_at: number;
                },
              ) =>
                q.insertInto("user_property").values({
                  parent_id: p.parent_id,
                  tenant_id: p.tenant_id,
                  name: p.name,
                  value: p.value,
                  hidden: p.hidden,
                  created_at: p.created_at,
                }),
              {
                parent_id: input.id,
                tenant_id: inputTenantId,
                name: prop.name,
                value:
                  prop.value === undefined
                    ? "null"
                    : JSON.stringify(prop.value),
                hidden: prop.hidden === true ? 1 : 0,
                created_at: now,
              },
            );
          }
        }

        // Handle role assignments if provided
        if (input.roleIds !== undefined && input.roleIds.length > 0) {
          for (const roleId of input.roleIds) {
            executeInsert(
              db,
              schema,
              (
                q,
                p: {
                  user_id: string;
                  role_id: string;
                  tenant_id: string;
                  created_at: number;
                },
              ) =>
                q.insertInto("user_role").values({
                  user_id: p.user_id,
                  role_id: p.role_id,
                  tenant_id: p.tenant_id,
                  created_at: p.created_at,
                }),
              {
                user_id: input.id,
                role_id: roleId,
                tenant_id: inputTenantId,
                created_at: now,
              },
            );
          }
        }

        // Get the created user
        const rows = executeSelect(
          db,
          schema,
          (q, p: { id: string; tenant_id: string }) =>
            q
              .from("user")
              .where((u) => u.id === p.id && u.tenant_id === p.tenant_id),
          { id: input.id, tenant_id: inputTenantId },
        );

        if (rows.length === 0) {
          return {
            success: false,
            error: new Error("User not found after creation"),
          };
        }

        return { success: true, data: mapUserFromDb(rows[0]) };
      } catch (error) {
        logger.error("Failed to create user", { error, input });
        return { success: false, error: error as Error };
      }
    },

    // eslint-disable-next-line @typescript-eslint/require-await -- Synchronous better-sqlite3 implements async interface
    async getById(
      inputTenantId: string,
      userId: string,
    ): Promise<Result<User | null>> {
      try {
        const rows = executeSelect(
          db,
          schema,
          (q, p: { userId: string; tenantId: string }) =>
            q
              .from("user")
              .where((u) => u.id === p.userId && u.tenant_id === p.tenantId),
          { userId, tenantId: inputTenantId },
        );
        return {
          success: true,
          data: rows.length > 0 ? mapUserFromDb(rows[0]) : null,
        };
      } catch (error) {
        logger.error("Failed to get user", { error, userId });
        return { success: false, error: error as Error };
      }
    },

    // eslint-disable-next-line @typescript-eslint/require-await -- Synchronous better-sqlite3 implements async interface
    async getByIdentity(
      inputTenantId: string,
      identityProvider: string,
      identityProviderUserId: string,
    ): Promise<Result<User | null>> {
      try {
        const rows = executeSelect(
          db,
          schema,
          (
            q,
            p: {
              tenantId: string;
              identityProvider: string;
              identityProviderUserId: string;
            },
          ) =>
            q
              .from("user")
              .where(
                (u) =>
                  u.tenant_id === p.tenantId &&
                  u.identity_provider === p.identityProvider &&
                  u.identity_provider_user_id === p.identityProviderUserId,
              ),
          { tenantId: inputTenantId, identityProvider, identityProviderUserId },
        );
        return {
          success: true,
          data: rows.length > 0 ? mapUserFromDb(rows[0]) : null,
        };
      } catch (error) {
        logger.error("Failed to get user by identity", {
          error,
          identityProvider,
          identityProviderUserId,
        });
        return { success: false, error: error as Error };
      }
    },

    // eslint-disable-next-line @typescript-eslint/require-await -- Synchronous better-sqlite3 implements async interface
    async list(
      inputTenantId: string,
      filter?: UserFilter,
      pagination?: PaginationInput,
    ): Promise<Result<Connection<User>>> {
      try {
        // Count query using raw SQL
        const hasIdentityProvider =
          filter?.identityProvider !== undefined &&
          filter.identityProvider !== "";
        const countStmt = db.prepare(
          hasIdentityProvider
            ? `SELECT COUNT(*) as count FROM "user" WHERE tenant_id = @tenantId AND identity_provider = @identityProvider`
            : `SELECT COUNT(*) as count FROM "user" WHERE tenant_id = @tenantId`,
        );
        const countResult = countStmt.get({
          tenantId: inputTenantId,
          ...(hasIdentityProvider
            ? { identityProvider: filter.identityProvider }
            : {}),
        }) as { count: number };
        const totalCount = countResult.count;

        // Main query - use raw SQL for complex queries
        const sortDir = pagination?.sortDirection === "DESC" ? "DESC" : "ASC";
        const hasFirst =
          pagination?.first !== undefined && pagination.first !== 0;
        const hasOffset =
          pagination?.offset !== undefined && pagination.offset !== 0;
        const stmt = db.prepare(
          `SELECT * FROM "user" WHERE tenant_id = @tenantId${
            hasIdentityProvider
              ? " AND identity_provider = @identityProvider"
              : ""
          } ORDER BY id ${sortDir}${hasFirst ? " LIMIT @limit" : ""}${hasOffset ? " OFFSET @offset" : ""}`,
        );
        const rows = stmt.all({
          tenantId: inputTenantId,
          ...(hasIdentityProvider
            ? { identityProvider: filter.identityProvider }
            : {}),
          ...(hasFirst ? { limit: pagination.first } : {}),
          ...(hasOffset ? { offset: pagination.offset } : {}),
        }) as {
          id: string;
          tenant_id: string;
          identity_provider: string;
          identity_provider_user_id: string;
          created_at: number;
          updated_at: number;
        }[];

        return {
          success: true,
          data: {
            nodes: rows.map(mapUserFromDb),
            totalCount,
            pageInfo: {
              hasNextPage: hasFirst ? rows.length === pagination.first : false,
              hasPreviousPage: false,
              startCursor: rows[0]?.id ?? null,
              endCursor: rows[rows.length - 1]?.id ?? null,
            },
          },
        };
      } catch (error) {
        logger.error("Failed to list users", { error });
        return { success: false, error: error as Error };
      }
    },

    async listByTenant(
      inputTenantId: string,
      pagination?: PaginationInput,
    ): Promise<Result<Connection<User>>> {
      return this.list(inputTenantId, undefined, pagination);
    },

    // eslint-disable-next-line @typescript-eslint/require-await -- Synchronous better-sqlite3 implements async interface
    async update(
      inputTenantId: string,
      userId: string,
      input: UpdateUserInput,
    ): Promise<Result<User>> {
      try {
        const now = Date.now();

        // Build update - Tinqer update requires all fields, so we do partial update with raw SQL
        const updates: string[] = ["updated_at = @updated_at"];
        const params: Record<string, unknown> = {
          userId,
          tenantId: inputTenantId,
          updated_at: now,
        };

        if (input.identityProvider !== undefined) {
          updates.push("identity_provider = @identity_provider");
          params.identity_provider = input.identityProvider;
        }
        if (input.identityProviderUserId !== undefined) {
          updates.push(
            "identity_provider_user_id = @identity_provider_user_id",
          );
          params.identity_provider_user_id = input.identityProviderUserId;
        }

        const stmt = db.prepare(
          `UPDATE "user" SET ${updates.join(", ")} WHERE id = @userId AND tenant_id = @tenantId`,
        );
        stmt.run(params);

        // Get updated user
        const rows = executeSelect(
          db,
          schema,
          (q, p: { userId: string; tenantId: string }) =>
            q
              .from("user")
              .where((u) => u.id === p.userId && u.tenant_id === p.tenantId),
          { userId, tenantId: inputTenantId },
        );

        if (rows.length === 0) {
          return { success: false, error: new Error("User not found") };
        }

        return { success: true, data: mapUserFromDb(rows[0]) };
      } catch (error) {
        logger.error("Failed to update user", { error, userId });
        return { success: false, error: error as Error };
      }
    },

    // eslint-disable-next-line @typescript-eslint/require-await -- Synchronous better-sqlite3 implements async interface
    async delete(
      inputTenantId: string,
      userId: string,
    ): Promise<Result<boolean>> {
      try {
        // Delete related data first
        executeDelete(
          db,
          schema,
          (q, p: { userId: string; tenantId: string }) =>
            q
              .deleteFrom("user_property")
              .where(
                (up) =>
                  up.parent_id === p.userId && up.tenant_id === p.tenantId,
              ),
          { userId, tenantId: inputTenantId },
        );

        executeDelete(
          db,
          schema,
          (q, p: { userId: string; tenantId: string }) =>
            q
              .deleteFrom("user_role")
              .where(
                (ur) => ur.user_id === p.userId && ur.tenant_id === p.tenantId,
              ),
          { userId, tenantId: inputTenantId },
        );

        executeDelete(
          db,
          schema,
          (q, p: { userId: string; tenantId: string }) =>
            q
              .deleteFrom("user_permission")
              .where(
                (up) => up.user_id === p.userId && up.tenant_id === p.tenantId,
              ),
          { userId, tenantId: inputTenantId },
        );

        executeDelete(
          db,
          schema,
          (q, p: { userId: string; tenantId: string }) =>
            q
              .deleteFrom("user")
              .where((u) => u.id === p.userId && u.tenant_id === p.tenantId),
          { userId, tenantId: inputTenantId },
        );

        return { success: true, data: true };
      } catch (error) {
        logger.error("Failed to delete user", { error, userId });
        return { success: false, error: error as Error };
      }
    },

    // eslint-disable-next-line @typescript-eslint/require-await -- Synchronous better-sqlite3 implements async interface
    async assignRole(
      inputTenantId: string,
      userId: string,
      roleId: string,
    ): Promise<Result<void>> {
      try {
        const now = Date.now();
        executeInsert(
          db,
          schema,
          (
            q,
            p: {
              userId: string;
              roleId: string;
              tenantId: string;
              createdAt: number;
            },
          ) =>
            q
              .insertInto("user_role")
              .values({
                user_id: p.userId,
                role_id: p.roleId,
                tenant_id: p.tenantId,
                created_at: p.createdAt,
              })
              .onConflict(
                (ur) => ur.user_id,
                (ur) => ur.role_id,
                (ur) => ur.tenant_id,
              )
              .doNothing(),
          { userId, roleId, tenantId: inputTenantId, createdAt: now },
        );
        return { success: true, data: undefined };
      } catch (error) {
        logger.error("Failed to assign role", { error, userId, roleId });
        return { success: false, error: error as Error };
      }
    },

    // eslint-disable-next-line @typescript-eslint/require-await -- Synchronous better-sqlite3 implements async interface
    async unassignRole(
      inputTenantId: string,
      userId: string,
      roleId: string,
    ): Promise<Result<void>> {
      try {
        executeDelete(
          db,
          schema,
          (q, p: { userId: string; roleId: string; tenantId: string }) =>
            q
              .deleteFrom("user_role")
              .where(
                (ur) =>
                  ur.user_id === p.userId &&
                  ur.role_id === p.roleId &&
                  ur.tenant_id === p.tenantId,
              ),
          { userId, roleId, tenantId: inputTenantId },
        );
        return { success: true, data: undefined };
      } catch (error) {
        logger.error("Failed to unassign role", { error, userId, roleId });
        return { success: false, error: error as Error };
      }
    },

    // eslint-disable-next-line @typescript-eslint/require-await -- Synchronous better-sqlite3 implements async interface
    async getRoleIds(
      inputTenantId: string,
      userId: string,
    ): Promise<Result<string[]>> {
      try {
        const rows = executeSelect(
          db,
          schema,
          (q, p: { userId: string; tenantId: string }) =>
            q
              .from("user_role")
              .where(
                (ur) => ur.user_id === p.userId && ur.tenant_id === p.tenantId,
              ),
          { userId, tenantId: inputTenantId },
        );
        return { success: true, data: rows.map((r) => r.role_id) };
      } catch (error) {
        logger.error("Failed to get user roles", { error, userId });
        return { success: false, error: error as Error };
      }
    },

    // eslint-disable-next-line @typescript-eslint/require-await -- Synchronous better-sqlite3 implements async interface
    async getProperties(
      inputTenantId: string,
      userId: string,
    ): Promise<Result<Property[]>> {
      try {
        const rows = executeSelect(
          db,
          schema,
          (q, p: { userId: string; tenantId: string }) =>
            q
              .from("user_property")
              .where(
                (up) =>
                  up.parent_id === p.userId && up.tenant_id === p.tenantId,
              ),
          { userId, tenantId: inputTenantId },
        );
        return { success: true, data: rows.map(mapPropertyFromDb) };
      } catch (error) {
        logger.error("Failed to get user properties", { error, userId });
        return { success: false, error: error as Error };
      }
    },

    // eslint-disable-next-line @typescript-eslint/require-await -- Synchronous better-sqlite3 implements async interface
    async getProperty(
      inputTenantId: string,
      userId: string,
      name: string,
    ): Promise<Result<Property | null>> {
      try {
        const rows = executeSelect(
          db,
          schema,
          (q, p: { userId: string; tenantId: string; name: string }) =>
            q
              .from("user_property")
              .where(
                (up) =>
                  up.parent_id === p.userId &&
                  up.tenant_id === p.tenantId &&
                  up.name === p.name,
              ),
          { userId, tenantId: inputTenantId, name },
        );
        return {
          success: true,
          data: rows.length > 0 ? mapPropertyFromDb(rows[0]) : null,
        };
      } catch (error) {
        logger.error("Failed to get user property", { error, userId, name });
        return { success: false, error: error as Error };
      }
    },

    // eslint-disable-next-line @typescript-eslint/require-await -- Synchronous better-sqlite3 implements async interface
    async setProperty(
      inputTenantId: string,
      userId: string,
      property: PropertyInput,
    ): Promise<Result<Property>> {
      try {
        const now = Date.now();
        const valueStr =
          property.value === undefined
            ? "null"
            : JSON.stringify(property.value);
        const hiddenInt = property.hidden === true ? 1 : 0;

        executeInsert(
          db,
          schema,
          (
            q,
            p: {
              parentId: string;
              tenantId: string;
              name: string;
              value: string;
              hidden: number;
              createdAt: number;
            },
          ) =>
            q
              .insertInto("user_property")
              .values({
                parent_id: p.parentId,
                tenant_id: p.tenantId,
                name: p.name,
                value: p.value,
                hidden: p.hidden,
                created_at: p.createdAt,
              })
              .onConflict(
                (up) => up.parent_id,
                (up) => up.tenant_id,
                (up) => up.name,
              )
              .doUpdateSet({
                value: p.value,
                hidden: p.hidden,
              }),
          {
            parentId: userId,
            tenantId: inputTenantId,
            name: property.name,
            value: valueStr,
            hidden: hiddenInt,
            createdAt: now,
          },
        );

        return {
          success: true,
          data: {
            name: property.name,
            value: property.value,
            hidden: property.hidden ?? false,
            createdAt: now,
          },
        };
      } catch (error) {
        logger.error("Failed to set user property", {
          error,
          userId,
          property,
        });
        return { success: false, error: error as Error };
      }
    },

    // eslint-disable-next-line @typescript-eslint/require-await -- Synchronous better-sqlite3 implements async interface
    async deleteProperty(
      inputTenantId: string,
      userId: string,
      name: string,
    ): Promise<Result<boolean>> {
      try {
        executeDelete(
          db,
          schema,
          (q, p: { userId: string; tenantId: string; name: string }) =>
            q
              .deleteFrom("user_property")
              .where(
                (up) =>
                  up.parent_id === p.userId &&
                  up.tenant_id === p.tenantId &&
                  up.name === p.name,
              ),
          { userId, tenantId: inputTenantId, name },
        );
        return { success: true, data: true };
      } catch (error) {
        logger.error("Failed to delete user property", { error, userId, name });
        return { success: false, error: error as Error };
      }
    },
  };
}
