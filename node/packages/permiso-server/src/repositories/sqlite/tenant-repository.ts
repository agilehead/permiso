/**
 * SQLite Tenant Repository
 *
 * Uses Tinqer for type-safe queries. Tenants are globally accessible (not tenant-scoped).
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
  type ITenantRepository,
  type Tenant,
  type TenantFilter,
  type CreateTenantInput,
  type UpdateTenantInput,
  type Property,
  type PropertyInput,
  type PaginationInput,
  type Connection,
  type Result,
} from "../interfaces/index.js";

const logger = createLogger("permiso-server:repos:sqlite:tenant");

function mapTenantFromDb(row: {
  id: string;
  name: string;
  description: string | null;
  created_at: number;
  updated_at: number;
}): Tenant {
  return {
    id: row.id,
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

export function createTenantRepository(
  db: Database,
): ITenantRepository {
  return {
    // eslint-disable-next-line @typescript-eslint/require-await -- Synchronous better-sqlite3 implements async interface
    async create(
      input: CreateTenantInput,
    ): Promise<Result<Tenant>> {
      try {
        const now = Date.now();

        executeInsert(
          db,
          schema,
          (
            q,
            p: {
              id: string;
              name: string;
              description: string | null;
              created_at: number;
              updated_at: number;
            },
          ) =>
            q.insertInto("tenant").values({
              id: p.id,
              name: p.name,
              description: p.description,
              created_at: p.created_at,
              updated_at: p.updated_at,
            }),
          {
            id: input.id,
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
                  name: string;
                  value: string;
                  hidden: number;
                  created_at: number;
                },
              ) =>
                q.insertInto("tenant_property").values({
                  parent_id: p.parent_id,
                  name: p.name,
                  value: p.value,
                  hidden: p.hidden,
                  created_at: p.created_at,
                }),
              {
                parent_id: input.id,
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

        // Get the created tenant
        const rows = executeSelect(
          db,
          schema,
          (q, p: { id: string }) =>
            q.from("tenant").where((o) => o.id === p.id),
          { id: input.id },
        );

        if (rows.length === 0) {
          return {
            success: false,
            error: new Error("Tenant not found after creation"),
          };
        }

        return { success: true, data: mapTenantFromDb(rows[0]) };
      } catch (error) {
        logger.error("Failed to create tenant", { error, input });
        return { success: false, error: normalizeDbError(error) };
      }
    },

    // eslint-disable-next-line @typescript-eslint/require-await -- Synchronous better-sqlite3 implements async interface
    async getById(tenantId: string): Promise<Result<Tenant | null>> {
      try {
        const rows = executeSelect(
          db,
          schema,
          (q, p: { tenantId: string }) =>
            q.from("tenant").where((o) => o.id === p.tenantId),
          { tenantId },
        );
        return {
          success: true,
          data: rows.length > 0 ? mapTenantFromDb(rows[0]) : null,
        };
      } catch (error) {
        logger.error("Failed to get tenant", { error, tenantId });
        return { success: false, error: error as Error };
      }
    },

    // eslint-disable-next-line @typescript-eslint/require-await -- Synchronous better-sqlite3 implements async interface
    async list(
      filter?: TenantFilter,
      pagination?: PaginationInput,
    ): Promise<Result<Connection<Tenant>>> {
      try {
        // Count query - use raw SQL for LIKE
        const filterName = filter?.name;
        const hasName = filterName !== undefined && filterName !== "";
        const countStmt = db.prepare(
          hasName
            ? `SELECT COUNT(*) as count FROM tenant WHERE name LIKE @name`
            : `SELECT COUNT(*) as count FROM tenant`,
        );
        const countResult = countStmt.get(
          hasName ? { name: `%${filterName}%` } : {},
        ) as { count: number };
        const totalCount = countResult.count;

        // Main query - use raw SQL for LIKE, ORDER BY, LIMIT, OFFSET
        const sortDir = pagination?.sortDirection === "DESC" ? "DESC" : "ASC";
        const hasFirst = pagination?.first !== undefined && pagination.first !== 0;
        const hasOffset = pagination?.offset !== undefined && pagination.offset !== 0;
        const stmt = db.prepare(
          `SELECT * FROM tenant${
            hasName ? " WHERE name LIKE @name" : ""
          } ORDER BY id ${sortDir}${hasFirst ? " LIMIT @limit" : ""}${hasOffset ? " OFFSET @offset" : ""}`,
        );
        const rows = stmt.all({
          ...(hasName ? { name: `%${filterName}%` } : {}),
          ...(hasFirst ? { limit: pagination.first } : {}),
          ...(hasOffset ? { offset: pagination.offset } : {}),
        }) as {
          id: string;
          name: string;
          description: string | null;
          created_at: number;
          updated_at: number;
        }[];

        return {
          success: true,
          data: {
            nodes: rows.map(mapTenantFromDb),
            totalCount,
            pageInfo: {
              hasNextPage: hasFirst
                ? rows.length === pagination.first
                : false,
              hasPreviousPage: false,
              startCursor: rows[0]?.id ?? null,
              endCursor: rows[rows.length - 1]?.id ?? null,
            },
          },
        };
      } catch (error) {
        logger.error("Failed to list tenants", { error });
        return { success: false, error: error as Error };
      }
    },

    // eslint-disable-next-line @typescript-eslint/require-await -- Synchronous better-sqlite3 implements async interface
    async update(
      tenantId: string,
      input: UpdateTenantInput,
    ): Promise<Result<Tenant>> {
      try {
        const now = Date.now();

        // Build partial update with raw SQL
        const updates: string[] = ["updated_at = @updated_at"];
        const params: Record<string, unknown> = { tenantId, updated_at: now };

        if (input.name !== undefined) {
          updates.push("name = @name");
          params.name = input.name;
        }
        if (input.description !== undefined) {
          updates.push("description = @description");
          params.description = input.description;
        }

        const stmt = db.prepare(
          `UPDATE tenant SET ${updates.join(", ")} WHERE id = @tenantId`,
        );
        stmt.run(params);

        // Get updated tenant
        const rows = executeSelect(
          db,
          schema,
          (q, p: { tenantId: string }) =>
            q.from("tenant").where((o) => o.id === p.tenantId),
          { tenantId },
        );

        if (rows.length === 0) {
          return { success: false, error: new Error("Tenant not found") };
        }

        return { success: true, data: mapTenantFromDb(rows[0]) };
      } catch (error) {
        logger.error("Failed to update tenant", { error, tenantId });
        return { success: false, error: error as Error };
      }
    },

    // eslint-disable-next-line @typescript-eslint/require-await -- Synchronous better-sqlite3 implements async interface
    async delete(tenantId: string): Promise<Result<boolean>> {
      try {
        // Delete all related data - use raw SQL for transaction
        const deleteAll = db.transaction(() => {
          executeDelete(
            db,
            schema,
            (q, p: { tenantId: string }) =>
              q
                .deleteFrom("tenant_property")
                .where((op) => op.parent_id === p.tenantId),
            { tenantId },
          );
          executeDelete(
            db,
            schema,
            (q, p: { tenantId: string }) =>
              q
                .deleteFrom("user_permission")
                .where((up) => up.tenant_id === p.tenantId),
            { tenantId },
          );
          executeDelete(
            db,
            schema,
            (q, p: { tenantId: string }) =>
              q
                .deleteFrom("role_permission")
                .where((rp) => rp.tenant_id === p.tenantId),
            { tenantId },
          );
          executeDelete(
            db,
            schema,
            (q, p: { tenantId: string }) =>
              q
                .deleteFrom("user_property")
                .where((up) => up.tenant_id === p.tenantId),
            { tenantId },
          );
          executeDelete(
            db,
            schema,
            (q, p: { tenantId: string }) =>
              q
                .deleteFrom("role_property")
                .where((rp) => rp.tenant_id === p.tenantId),
            { tenantId },
          );
          executeDelete(
            db,
            schema,
            (q, p: { tenantId: string }) =>
              q.deleteFrom("user_role").where((ur) => ur.tenant_id === p.tenantId),
            { tenantId },
          );
          executeDelete(
            db,
            schema,
            (q, p: { tenantId: string }) =>
              q.deleteFrom("user").where((u) => u.tenant_id === p.tenantId),
            { tenantId },
          );
          executeDelete(
            db,
            schema,
            (q, p: { tenantId: string }) =>
              q.deleteFrom("role").where((r) => r.tenant_id === p.tenantId),
            { tenantId },
          );
          executeDelete(
            db,
            schema,
            (q, p: { tenantId: string }) =>
              q.deleteFrom("resource").where((r) => r.tenant_id === p.tenantId),
            { tenantId },
          );
          executeDelete(
            db,
            schema,
            (q, p: { tenantId: string }) =>
              q.deleteFrom("tenant").where((o) => o.id === p.tenantId),
            { tenantId },
          );
        });

        deleteAll();
        return { success: true, data: true };
      } catch (error) {
        logger.error("Failed to delete tenant", { error, tenantId });
        return { success: false, error: error as Error };
      }
    },

    // eslint-disable-next-line @typescript-eslint/require-await -- Synchronous better-sqlite3 implements async interface
    async getProperties(tenantId: string): Promise<Result<Property[]>> {
      try {
        const rows = executeSelect(
          db,
          schema,
          (q, p: { tenantId: string }) =>
            q
              .from("tenant_property")
              .where((op) => op.parent_id === p.tenantId),
          { tenantId },
        );
        return { success: true, data: rows.map(mapPropertyFromDb) };
      } catch (error) {
        logger.error("Failed to get tenant properties", { error, tenantId });
        return { success: false, error: error as Error };
      }
    },

    // eslint-disable-next-line @typescript-eslint/require-await -- Synchronous better-sqlite3 implements async interface
    async getProperty(
      tenantId: string,
      name: string,
    ): Promise<Result<Property | null>> {
      try {
        const rows = executeSelect(
          db,
          schema,
          (q, p: { tenantId: string; name: string }) =>
            q
              .from("tenant_property")
              .where((op) => op.parent_id === p.tenantId && op.name === p.name),
          { tenantId, name },
        );
        return {
          success: true,
          data: rows.length > 0 ? mapPropertyFromDb(rows[0]) : null,
        };
      } catch (error) {
        logger.error("Failed to get tenant property", {
          error,
          tenantId,
          name,
        });
        return { success: false, error: error as Error };
      }
    },

    // eslint-disable-next-line @typescript-eslint/require-await -- Synchronous better-sqlite3 implements async interface
    async setProperty(
      tenantId: string,
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
              name: string;
              value: string;
              hidden: number;
              createdAt: number;
            },
          ) =>
            q
              .insertInto("tenant_property")
              .values({
                parent_id: p.parentId,
                name: p.name,
                value: p.value,
                hidden: p.hidden,
                created_at: p.createdAt,
              })
              .onConflict(
                (op) => op.parent_id,
                (op) => op.name,
              )
              .doUpdateSet({
                value: p.value,
                hidden: p.hidden,
              }),
          {
            parentId: tenantId,
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
        logger.error("Failed to set tenant property", {
          error,
          tenantId,
          property,
        });
        return { success: false, error: error as Error };
      }
    },

    // eslint-disable-next-line @typescript-eslint/require-await -- Synchronous better-sqlite3 implements async interface
    async deleteProperty(
      tenantId: string,
      name: string,
    ): Promise<Result<boolean>> {
      try {
        // Use raw SQL to get the number of affected rows
        const stmt = db.prepare(
          `DELETE FROM tenant_property WHERE parent_id = @tenantId AND name = @name`,
        );
        const result = stmt.run({ tenantId, name });
        return { success: true, data: result.changes > 0 };
      } catch (error) {
        logger.error("Failed to delete tenant property", {
          error,
          tenantId,
          name,
        });
        return { success: false, error: error as Error };
      }
    },
  };
}
