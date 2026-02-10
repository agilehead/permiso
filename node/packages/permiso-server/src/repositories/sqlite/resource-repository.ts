/**
 * SQLite Resource Repository
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
  type IResourceRepository,
  type Resource,
  type ResourceFilter,
  type CreateResourceInput,
  type UpdateResourceInput,
  type PaginationInput,
  type Connection,
  type Result,
} from "../interfaces/index.js";

const logger = createLogger("permiso-server:repos:sqlite:resource");

function mapResourceFromDb(row: {
  id: string;
  tenant_id: string;
  name: string | null;
  description: string | null;
  created_at: number;
  updated_at: number;
}): Resource {
  return {
    id: row.id,
    tenantId: row.tenant_id,
    name: row.name,
    description: row.description,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function createResourceRepository(
  db: Database,
  _tenantId: string,
): IResourceRepository {
  return {
    // eslint-disable-next-line @typescript-eslint/require-await -- Synchronous better-sqlite3 implements async interface
    async create(
      inputTenantId: string,
      input: CreateResourceInput,
    ): Promise<Result<Resource>> {
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
              name: string | null;
              description: string | null;
              created_at: number;
              updated_at: number;
            },
          ) =>
            q.insertInto("resource").values({
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
            name: input.name ?? null,
            description: input.description ?? null,
            created_at: now,
            updated_at: now,
          },
        );

        // Get the created resource
        const rows = executeSelect(
          db,
          schema,
          (q, p: { id: string; tenant_id: string }) =>
            q
              .from("resource")
              .where((r) => r.id === p.id && r.tenant_id === p.tenant_id),
          { id: input.id, tenant_id: inputTenantId },
        );

        if (rows.length === 0) {
          return {
            success: false,
            error: new Error("Resource not found after creation"),
          };
        }

        return { success: true, data: mapResourceFromDb(rows[0]) };
      } catch (error) {
        logger.error("Failed to create resource", { error, input });
        return { success: false, error: normalizeDbError(error) };
      }
    },

    // eslint-disable-next-line @typescript-eslint/require-await -- Synchronous better-sqlite3 implements async interface
    async getById(
      inputTenantId: string,
      resourceId: string,
    ): Promise<Result<Resource | null>> {
      try {
        const rows = executeSelect(
          db,
          schema,
          (q, p: { resourceId: string; tenantId: string }) =>
            q
              .from("resource")
              .where((r) => r.id === p.resourceId && r.tenant_id === p.tenantId),
          { resourceId, tenantId: inputTenantId },
        );
        return {
          success: true,
          data: rows.length > 0 ? mapResourceFromDb(rows[0]) : null,
        };
      } catch (error) {
        logger.error("Failed to get resource", { error, resourceId });
        return { success: false, error: error as Error };
      }
    },

    // eslint-disable-next-line @typescript-eslint/require-await -- Synchronous better-sqlite3 implements async interface
    async list(
      inputTenantId: string,
      filter?: ResourceFilter,
      pagination?: PaginationInput,
    ): Promise<Result<Connection<Resource>>> {
      try {
        // Count and list with raw SQL for LIKE support
        const idPrefix = filter?.idPrefix;
        const hasIdPrefix = idPrefix !== undefined && idPrefix !== "";
        const countStmt = db.prepare(
          hasIdPrefix
            ? `SELECT COUNT(*) as count FROM resource WHERE tenant_id = @tenantId AND id LIKE @idPrefix`
            : `SELECT COUNT(*) as count FROM resource WHERE tenant_id = @tenantId`,
        );
        const countResult = countStmt.get({
          tenantId: inputTenantId,
          ...(hasIdPrefix ? { idPrefix: `${idPrefix}%` } : {}),
        }) as { count: number };
        const totalCount = countResult.count;

        const sortDir = pagination?.sortDirection === "DESC" ? "DESC" : "ASC";
        const hasFirst = pagination?.first !== undefined && pagination.first !== 0;
        const hasOffset = pagination?.offset !== undefined && pagination.offset !== 0;
        const stmt = db.prepare(
          `SELECT * FROM resource WHERE tenant_id = @tenantId${
            hasIdPrefix ? " AND id LIKE @idPrefix" : ""
          } ORDER BY id ${sortDir}${hasFirst ? " LIMIT @limit" : ""}${hasOffset ? " OFFSET @offset" : ""}`,
        );
        const rows = stmt.all({
          tenantId: inputTenantId,
          ...(hasIdPrefix ? { idPrefix: `${idPrefix}%` } : {}),
          ...(hasFirst ? { limit: pagination.first } : {}),
          ...(hasOffset ? { offset: pagination.offset } : {}),
        }) as {
          id: string;
          tenant_id: string;
          name: string | null;
          description: string | null;
          created_at: number;
          updated_at: number;
        }[];

        return {
          success: true,
          data: {
            nodes: rows.map(mapResourceFromDb),
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
        logger.error("Failed to list resources", { error });
        return { success: false, error: error as Error };
      }
    },

    async listByTenant(
      inputTenantId: string,
      pagination?: PaginationInput,
    ): Promise<Result<Connection<Resource>>> {
      return this.list(inputTenantId, undefined, pagination);
    },

    // eslint-disable-next-line @typescript-eslint/require-await -- Synchronous better-sqlite3 implements async interface
    async listByIdPrefix(
      inputTenantId: string,
      idPrefix: string,
    ): Promise<Result<Resource[]>> {
      try {
        // Use raw SQL for LIKE
        const stmt = db.prepare(
          `SELECT * FROM resource WHERE tenant_id = @tenantId AND id LIKE @idPrefix ORDER BY id ASC`,
        );
        const rows = stmt.all({
          tenantId: inputTenantId,
          idPrefix: `${idPrefix}%`,
        }) as {
          id: string;
          tenant_id: string;
          name: string | null;
          description: string | null;
          created_at: number;
          updated_at: number;
        }[];
        return { success: true, data: rows.map(mapResourceFromDb) };
      } catch (error) {
        logger.error("Failed to list resources by prefix", { error, idPrefix });
        return { success: false, error: error as Error };
      }
    },

    // eslint-disable-next-line @typescript-eslint/require-await -- Synchronous better-sqlite3 implements async interface
    async update(
      inputTenantId: string,
      resourceId: string,
      input: UpdateResourceInput,
    ): Promise<Result<Resource>> {
      try {
        const now = Date.now();

        // Build partial update with raw SQL
        const updates: string[] = ["updated_at = @updated_at"];
        const params: Record<string, unknown> = {
          resourceId,
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
          `UPDATE resource SET ${updates.join(", ")} WHERE id = @resourceId AND tenant_id = @tenantId`,
        );
        stmt.run(params);

        // Get updated resource
        const rows = executeSelect(
          db,
          schema,
          (q, p: { resourceId: string; tenantId: string }) =>
            q
              .from("resource")
              .where((r) => r.id === p.resourceId && r.tenant_id === p.tenantId),
          { resourceId, tenantId: inputTenantId },
        );

        if (rows.length === 0) {
          return { success: false, error: new Error("Resource not found") };
        }

        return { success: true, data: mapResourceFromDb(rows[0]) };
      } catch (error) {
        logger.error("Failed to update resource", { error, resourceId });
        return { success: false, error: error as Error };
      }
    },

    // eslint-disable-next-line @typescript-eslint/require-await -- Synchronous better-sqlite3 implements async interface
    async delete(
      inputTenantId: string,
      resourceId: string,
    ): Promise<Result<boolean>> {
      try {
        const deleteAll = db.transaction(() => {
          executeDelete(
            db,
            schema,
            (q, p: { resourceId: string; tenantId: string }) =>
              q
                .deleteFrom("user_permission")
                .where(
                  (up) =>
                    up.resource_id === p.resourceId && up.tenant_id === p.tenantId,
                ),
            { resourceId, tenantId: inputTenantId },
          );
          executeDelete(
            db,
            schema,
            (q, p: { resourceId: string; tenantId: string }) =>
              q
                .deleteFrom("role_permission")
                .where(
                  (rp) =>
                    rp.resource_id === p.resourceId && rp.tenant_id === p.tenantId,
                ),
            { resourceId, tenantId: inputTenantId },
          );
          executeDelete(
            db,
            schema,
            (q, p: { resourceId: string; tenantId: string }) =>
              q
                .deleteFrom("resource")
                .where((r) => r.id === p.resourceId && r.tenant_id === p.tenantId),
            { resourceId, tenantId: inputTenantId },
          );
        });

        deleteAll();
        return { success: true, data: true };
      } catch (error) {
        logger.error("Failed to delete resource", { error, resourceId });
        return { success: false, error: error as Error };
      }
    },

    // eslint-disable-next-line @typescript-eslint/require-await -- Synchronous better-sqlite3 implements async interface
    async deleteByIdPrefix(
      inputTenantId: string,
      idPrefix: string,
    ): Promise<Result<number>> {
      try {
        const result = db.transaction(() => {
          // Get all resource IDs matching the prefix
          const stmt = db.prepare(
            `SELECT id FROM resource WHERE tenant_id = @tenantId AND id LIKE @idPrefix`,
          );
          const resources = stmt.all({
            tenantId: inputTenantId,
            idPrefix: `${idPrefix}%`,
          }) as { id: string }[];

          if (resources.length === 0) {
            return 0;
          }

          // Delete related permissions for each resource
          for (const res of resources) {
            executeDelete(
              db,
              schema,
              (q, p: { resId: string; tenantId: string }) =>
                q
                  .deleteFrom("user_permission")
                  .where(
                    (up) => up.resource_id === p.resId && up.tenant_id === p.tenantId,
                  ),
              { resId: res.id, tenantId: inputTenantId },
            );
            executeDelete(
              db,
              schema,
              (q, p: { resId: string; tenantId: string }) =>
                q
                  .deleteFrom("role_permission")
                  .where(
                    (rp) => rp.resource_id === p.resId && rp.tenant_id === p.tenantId,
                  ),
              { resId: res.id, tenantId: inputTenantId },
            );
          }

          // Delete resources using raw SQL for LIKE
          const deleteStmt = db.prepare(
            `DELETE FROM resource WHERE tenant_id = @tenantId AND id LIKE @idPrefix`,
          );
          const deleteResult = deleteStmt.run({
            tenantId: inputTenantId,
            idPrefix: `${idPrefix}%`,
          });

          return deleteResult.changes;
        })();

        return { success: true, data: result };
      } catch (error) {
        logger.error("Failed to delete resources by prefix", {
          error,
          idPrefix,
        });
        return { success: false, error: error as Error };
      }
    },
  };
}
