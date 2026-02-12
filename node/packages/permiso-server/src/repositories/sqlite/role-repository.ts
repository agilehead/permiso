/**
 * SQLite Role Repository
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
import {
  normalizeDbError,
  type IRoleRepository,
  type Role,
  type RoleFilter,
  type CreateRoleInput,
  type UpdateRoleInput,
  type Property,
  type PropertyInput,
  type PaginationInput,
  type Connection,
  type Result,
} from "../interfaces/index.js";

const logger = createLogger("permiso-server:repos:sqlite:role");

function mapRoleFromDb(row: {
  id: string;
  tenant_id: string;
  name: string;
  description: string | null;
  created_at: number;
  updated_at: number;
}): Role {
  return {
    id: row.id,
    tenantId: row.tenant_id,
    name: row.name,
    description: row.description,
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

export function createRoleRepository(
  db: Database,
  _tenantId: string,
): IRoleRepository {
  return {
    // eslint-disable-next-line @typescript-eslint/require-await -- Synchronous better-sqlite3 implements async interface
    async create(
      inputTenantId: string,
      input: CreateRoleInput,
    ): Promise<Result<Role>> {
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
              name: string;
              description: string | null;
              created_at: number;
              updated_at: number;
            },
          ) =>
            q.insertInto("role").values({
              id: p.id,
              tenant_id: p.tenant_id,
              name: p.name,
              description: p.description,
              created_at: p.created_at,
              updated_at: p.updated_at,
            }),
          {
            id: input.id,
            tenant_id: inputTenantId,
            name: input.name,
            description: input.description ?? null,
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
                q.insertInto("role_property").values({
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

        // Get the created role
        const rows = executeSelect(
          db,
          schema,
          (q, p: { id: string; tenant_id: string }) =>
            q
              .from("role")
              .where((r) => r.id === p.id && r.tenant_id === p.tenant_id),
          { id: input.id, tenant_id: inputTenantId },
        );

        if (rows.length === 0) {
          return {
            success: false,
            error: new Error("Role not found after creation"),
          };
        }

        return { success: true, data: mapRoleFromDb(rows[0]) };
      } catch (error) {
        logger.error("Failed to create role", { error, input });
        return { success: false, error: normalizeDbError(error) };
      }
    },

    // eslint-disable-next-line @typescript-eslint/require-await -- Synchronous better-sqlite3 implements async interface
    async getById(
      inputTenantId: string,
      roleId: string,
    ): Promise<Result<Role | null>> {
      try {
        const rows = executeSelect(
          db,
          schema,
          (q, p: { roleId: string; tenantId: string }) =>
            q
              .from("role")
              .where((r) => r.id === p.roleId && r.tenant_id === p.tenantId),
          { roleId, tenantId: inputTenantId },
        );
        return {
          success: true,
          data: rows.length > 0 ? mapRoleFromDb(rows[0]) : null,
        };
      } catch (error) {
        logger.error("Failed to get role", { error, roleId });
        return { success: false, error: error as Error };
      }
    },

    // eslint-disable-next-line @typescript-eslint/require-await -- Synchronous better-sqlite3 implements async interface
    async list(
      inputTenantId: string,
      filter?: RoleFilter,
      pagination?: PaginationInput,
    ): Promise<Result<Connection<Role>>> {
      try {
        // Count and list with raw SQL for LIKE support
        const filterName = filter?.name;
        const hasName = filterName !== undefined && filterName !== "";
        const countStmt = db.prepare(
          hasName
            ? `SELECT COUNT(*) as count FROM role WHERE tenant_id = @tenantId AND name LIKE @name`
            : `SELECT COUNT(*) as count FROM role WHERE tenant_id = @tenantId`,
        );
        const countResult = countStmt.get({
          tenantId: inputTenantId,
          ...(hasName ? { name: `%${filterName}%` } : {}),
        }) as { count: number };
        const totalCount = countResult.count;

        const sortDir = pagination?.sortDirection === "DESC" ? "DESC" : "ASC";
        const hasFirst =
          pagination?.first !== undefined && pagination.first !== 0;
        const hasOffset =
          pagination?.offset !== undefined && pagination.offset !== 0;
        const stmt = db.prepare(
          `SELECT * FROM role WHERE tenant_id = @tenantId${
            hasName ? " AND name LIKE @name" : ""
          } ORDER BY id ${sortDir}${hasFirst ? " LIMIT @limit" : ""}${hasOffset ? " OFFSET @offset" : ""}`,
        );
        const rows = stmt.all({
          tenantId: inputTenantId,
          ...(hasName ? { name: `%${filterName}%` } : {}),
          ...(hasFirst ? { limit: pagination.first } : {}),
          ...(hasOffset ? { offset: pagination.offset } : {}),
        }) as {
          id: string;
          tenant_id: string;
          name: string;
          description: string | null;
          created_at: number;
          updated_at: number;
        }[];

        return {
          success: true,
          data: {
            nodes: rows.map(mapRoleFromDb),
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
        logger.error("Failed to list roles", { error });
        return { success: false, error: error as Error };
      }
    },

    async listByTenant(
      inputTenantId: string,
      pagination?: PaginationInput,
    ): Promise<Result<Connection<Role>>> {
      return this.list(inputTenantId, undefined, pagination);
    },

    // eslint-disable-next-line @typescript-eslint/require-await -- Synchronous better-sqlite3 implements async interface
    async update(
      inputTenantId: string,
      roleId: string,
      input: UpdateRoleInput,
    ): Promise<Result<Role>> {
      try {
        const now = Date.now();

        // Build partial update with raw SQL
        const updates: string[] = ["updated_at = @updated_at"];
        const params: Record<string, unknown> = {
          roleId,
          tenantId: inputTenantId,
          updated_at: now,
        };

        if (input.name !== undefined) {
          updates.push("name = @name");
          params.name = input.name;
        }
        if (input.description !== undefined) {
          updates.push("description = @description");
          params.description = input.description;
        }

        const stmt = db.prepare(
          `UPDATE role SET ${updates.join(", ")} WHERE id = @roleId AND tenant_id = @tenantId`,
        );
        stmt.run(params);

        // Get updated role
        const rows = executeSelect(
          db,
          schema,
          (q, p: { roleId: string; tenantId: string }) =>
            q
              .from("role")
              .where((r) => r.id === p.roleId && r.tenant_id === p.tenantId),
          { roleId, tenantId: inputTenantId },
        );

        if (rows.length === 0) {
          return { success: false, error: new Error("Role not found") };
        }

        return { success: true, data: mapRoleFromDb(rows[0]) };
      } catch (error) {
        logger.error("Failed to update role", { error, roleId });
        return { success: false, error: error as Error };
      }
    },

    // eslint-disable-next-line @typescript-eslint/require-await -- Synchronous better-sqlite3 implements async interface
    async delete(
      inputTenantId: string,
      roleId: string,
    ): Promise<Result<boolean>> {
      try {
        const deleteAll = db.transaction(() => {
          executeDelete(
            db,
            schema,
            (q, p: { roleId: string; tenantId: string }) =>
              q
                .deleteFrom("role_property")
                .where(
                  (rp) =>
                    rp.parent_id === p.roleId && rp.tenant_id === p.tenantId,
                ),
            { roleId, tenantId: inputTenantId },
          );
          executeDelete(
            db,
            schema,
            (q, p: { roleId: string; tenantId: string }) =>
              q
                .deleteFrom("role_permission")
                .where(
                  (rp) =>
                    rp.role_id === p.roleId && rp.tenant_id === p.tenantId,
                ),
            { roleId, tenantId: inputTenantId },
          );
          executeDelete(
            db,
            schema,
            (q, p: { roleId: string; tenantId: string }) =>
              q
                .deleteFrom("user_role")
                .where(
                  (ur) =>
                    ur.role_id === p.roleId && ur.tenant_id === p.tenantId,
                ),
            { roleId, tenantId: inputTenantId },
          );
          executeDelete(
            db,
            schema,
            (q, p: { roleId: string; tenantId: string }) =>
              q
                .deleteFrom("role")
                .where((r) => r.id === p.roleId && r.tenant_id === p.tenantId),
            { roleId, tenantId: inputTenantId },
          );
        });

        deleteAll();
        return { success: true, data: true };
      } catch (error) {
        logger.error("Failed to delete role", { error, roleId });
        return { success: false, error: error as Error };
      }
    },

    // eslint-disable-next-line @typescript-eslint/require-await -- Synchronous better-sqlite3 implements async interface
    async getUserIds(
      inputTenantId: string,
      roleId: string,
    ): Promise<Result<string[]>> {
      try {
        const rows = executeSelect(
          db,
          schema,
          (q, p: { roleId: string; tenantId: string }) =>
            q
              .from("user_role")
              .where(
                (ur) => ur.role_id === p.roleId && ur.tenant_id === p.tenantId,
              ),
          { roleId, tenantId: inputTenantId },
        );
        return { success: true, data: rows.map((r) => r.user_id) };
      } catch (error) {
        logger.error("Failed to get role users", { error, roleId });
        return { success: false, error: error as Error };
      }
    },

    // eslint-disable-next-line @typescript-eslint/require-await -- Synchronous better-sqlite3 implements async interface
    async getProperties(
      inputTenantId: string,
      roleId: string,
    ): Promise<Result<Property[]>> {
      try {
        const rows = executeSelect(
          db,
          schema,
          (q, p: { roleId: string; tenantId: string }) =>
            q
              .from("role_property")
              .where(
                (rp) =>
                  rp.parent_id === p.roleId && rp.tenant_id === p.tenantId,
              ),
          { roleId, tenantId: inputTenantId },
        );
        return { success: true, data: rows.map(mapPropertyFromDb) };
      } catch (error) {
        logger.error("Failed to get role properties", { error, roleId });
        return { success: false, error: error as Error };
      }
    },

    // eslint-disable-next-line @typescript-eslint/require-await -- Synchronous better-sqlite3 implements async interface
    async getProperty(
      inputTenantId: string,
      roleId: string,
      name: string,
    ): Promise<Result<Property | null>> {
      try {
        const rows = executeSelect(
          db,
          schema,
          (q, p: { roleId: string; tenantId: string; name: string }) =>
            q
              .from("role_property")
              .where(
                (rp) =>
                  rp.parent_id === p.roleId &&
                  rp.tenant_id === p.tenantId &&
                  rp.name === p.name,
              ),
          { roleId, tenantId: inputTenantId, name },
        );
        return {
          success: true,
          data: rows.length > 0 ? mapPropertyFromDb(rows[0]) : null,
        };
      } catch (error) {
        logger.error("Failed to get role property", { error, roleId, name });
        return { success: false, error: error as Error };
      }
    },

    // eslint-disable-next-line @typescript-eslint/require-await -- Synchronous better-sqlite3 implements async interface
    async setProperty(
      inputTenantId: string,
      roleId: string,
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
              .insertInto("role_property")
              .values({
                parent_id: p.parentId,
                tenant_id: p.tenantId,
                name: p.name,
                value: p.value,
                hidden: p.hidden,
                created_at: p.createdAt,
              })
              .onConflict(
                (rp) => rp.parent_id,
                (rp) => rp.tenant_id,
                (rp) => rp.name,
              )
              .doUpdateSet({
                value: p.value,
                hidden: p.hidden,
              }),
          {
            parentId: roleId,
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
        logger.error("Failed to set role property", {
          error,
          roleId,
          property,
        });
        return { success: false, error: error as Error };
      }
    },

    // eslint-disable-next-line @typescript-eslint/require-await -- Synchronous better-sqlite3 implements async interface
    async deleteProperty(
      inputTenantId: string,
      roleId: string,
      name: string,
    ): Promise<Result<boolean>> {
      try {
        executeDelete(
          db,
          schema,
          (q, p: { roleId: string; tenantId: string; name: string }) =>
            q
              .deleteFrom("role_property")
              .where(
                (rp) =>
                  rp.parent_id === p.roleId &&
                  rp.tenant_id === p.tenantId &&
                  rp.name === p.name,
              ),
          { roleId, tenantId: inputTenantId, name },
        );
        return { success: true, data: true };
      } catch (error) {
        logger.error("Failed to delete role property", { error, roleId, name });
        return { success: false, error: error as Error };
      }
    },
  };
}
