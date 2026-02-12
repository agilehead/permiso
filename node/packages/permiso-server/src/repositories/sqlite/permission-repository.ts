/**
 * SQLite Permission Repository
 *
 * Uses Tinqer for type-safe queries with app-level tenant filtering.
 * Handles both user permissions and role permissions.
 * Includes wildcard matching for resource paths (e.g., /india/* matches /india/data)
 */

import { createLogger } from "@codespin/permiso-logger";
import {
  executeSelect,
  executeDelete,
  executeInsert,
} from "@tinqerjs/better-sqlite3-adapter";
import type { Database } from "better-sqlite3";
import { schema } from "./tinqer-schema.js";
import type {
  IPermissionRepository,
  UserPermission,
  RolePermission,
  EffectivePermission,
  GrantPermissionInput,
  Result,
} from "../interfaces/index.js";

const logger = createLogger("permiso-server:repos:sqlite:permission");

function mapUserPermissionFromDb(row: {
  user_id: string;
  tenant_id: string;
  resource_id: string;
  action: string;
  created_at: number;
}): UserPermission {
  return {
    userId: row.user_id,
    tenantId: row.tenant_id,
    resourceId: row.resource_id,
    action: row.action,
    createdAt: row.created_at,
  };
}

function mapRolePermissionFromDb(row: {
  role_id: string;
  tenant_id: string;
  resource_id: string;
  action: string;
  created_at: number;
}): RolePermission {
  return {
    roleId: row.role_id,
    tenantId: row.tenant_id,
    resourceId: row.resource_id,
    action: row.action,
    createdAt: row.created_at,
  };
}

/**
 * Check if a resource ID matches a pattern (supports wildcard *)
 * Pattern "/india/*" matches "/india/data", "/india/foo/bar"
 */
function matchesPattern(pattern: string, resourceId: string): boolean {
  if (pattern === resourceId) return true;
  if (!pattern.includes("*")) return false;

  const prefix = pattern.replace("*", "");
  return resourceId.startsWith(prefix);
}

export function createPermissionRepository(
  db: Database,
  _tenantId: string,
): IPermissionRepository {
  return {
    // eslint-disable-next-line @typescript-eslint/require-await -- Synchronous better-sqlite3 implements async interface
    async grantUserPermission(
      inputTenantId: string,
      userId: string,
      input: GrantPermissionInput,
    ): Promise<Result<UserPermission>> {
      try {
        const now = Date.now();
        executeInsert(
          db,
          schema,
          (
            q,
            p: {
              userId: string;
              tenantId: string;
              resourceId: string;
              action: string;
              createdAt: number;
            },
          ) =>
            q
              .insertInto("user_permission")
              .values({
                user_id: p.userId,
                tenant_id: p.tenantId,
                resource_id: p.resourceId,
                action: p.action,
                created_at: p.createdAt,
              })
              .onConflict(
                (up) => up.user_id,
                (up) => up.tenant_id,
                (up) => up.resource_id,
                (up) => up.action,
              )
              .doNothing(),
          {
            userId,
            tenantId: inputTenantId,
            resourceId: input.resourceId,
            action: input.action,
            createdAt: now,
          },
        );

        return {
          success: true,
          data: {
            userId,
            tenantId: inputTenantId,
            resourceId: input.resourceId,
            action: input.action,
            createdAt: now,
          },
        };
      } catch (error) {
        logger.error("Failed to grant user permission", {
          error,
          userId,
          input,
        });
        return { success: false, error: error as Error };
      }
    },

    // eslint-disable-next-line @typescript-eslint/require-await -- Synchronous better-sqlite3 implements async interface
    async revokeUserPermission(
      inputTenantId: string,
      userId: string,
      resourceId: string,
      action: string,
    ): Promise<Result<boolean>> {
      try {
        executeDelete(
          db,
          schema,
          (
            q,
            p: {
              userId: string;
              tenantId: string;
              resourceId: string;
              action: string;
            },
          ) =>
            q
              .deleteFrom("user_permission")
              .where(
                (up) =>
                  up.user_id === p.userId &&
                  up.tenant_id === p.tenantId &&
                  up.resource_id === p.resourceId &&
                  up.action === p.action,
              ),
          { userId, tenantId: inputTenantId, resourceId, action },
        );
        return { success: true, data: true };
      } catch (error) {
        logger.error("Failed to revoke user permission", {
          error,
          userId,
          resourceId,
          action,
        });
        return { success: false, error: error as Error };
      }
    },

    // eslint-disable-next-line @typescript-eslint/require-await -- Synchronous better-sqlite3 implements async interface
    async getUserPermissions(
      inputTenantId: string,
      userId: string,
    ): Promise<Result<UserPermission[]>> {
      try {
        const rows = executeSelect(
          db,
          schema,
          (q, p: { userId: string; tenantId: string }) =>
            q
              .from("user_permission")
              .where(
                (up) => up.user_id === p.userId && up.tenant_id === p.tenantId,
              ),
          { userId, tenantId: inputTenantId },
        );
        return { success: true, data: rows.map(mapUserPermissionFromDb) };
      } catch (error) {
        logger.error("Failed to get user permissions", { error, userId });
        return { success: false, error: error as Error };
      }
    },

    // eslint-disable-next-line @typescript-eslint/require-await -- Synchronous better-sqlite3 implements async interface
    async grantRolePermission(
      inputTenantId: string,
      roleId: string,
      input: GrantPermissionInput,
    ): Promise<Result<RolePermission>> {
      try {
        const now = Date.now();
        executeInsert(
          db,
          schema,
          (
            q,
            p: {
              roleId: string;
              tenantId: string;
              resourceId: string;
              action: string;
              createdAt: number;
            },
          ) =>
            q
              .insertInto("role_permission")
              .values({
                role_id: p.roleId,
                tenant_id: p.tenantId,
                resource_id: p.resourceId,
                action: p.action,
                created_at: p.createdAt,
              })
              .onConflict(
                (rp) => rp.role_id,
                (rp) => rp.tenant_id,
                (rp) => rp.resource_id,
                (rp) => rp.action,
              )
              .doNothing(),
          {
            roleId,
            tenantId: inputTenantId,
            resourceId: input.resourceId,
            action: input.action,
            createdAt: now,
          },
        );

        return {
          success: true,
          data: {
            roleId,
            tenantId: inputTenantId,
            resourceId: input.resourceId,
            action: input.action,
            createdAt: now,
          },
        };
      } catch (error) {
        logger.error("Failed to grant role permission", {
          error,
          roleId,
          input,
        });
        return { success: false, error: error as Error };
      }
    },

    // eslint-disable-next-line @typescript-eslint/require-await -- Synchronous better-sqlite3 implements async interface
    async revokeRolePermission(
      inputTenantId: string,
      roleId: string,
      resourceId: string,
      action: string,
    ): Promise<Result<boolean>> {
      try {
        // Use raw SQL to get the number of affected rows
        const stmt = db.prepare(
          `DELETE FROM role_permission WHERE role_id = @roleId AND tenant_id = @tenantId AND resource_id = @resourceId AND action = @action`,
        );
        const result = stmt.run({
          roleId,
          tenantId: inputTenantId,
          resourceId,
          action,
        });
        return { success: true, data: result.changes > 0 };
      } catch (error) {
        logger.error("Failed to revoke role permission", {
          error,
          roleId,
          resourceId,
          action,
        });
        return { success: false, error: error as Error };
      }
    },

    // eslint-disable-next-line @typescript-eslint/require-await -- Synchronous better-sqlite3 implements async interface
    async getRolePermissions(
      inputTenantId: string,
      roleId: string,
    ): Promise<Result<RolePermission[]>> {
      try {
        const rows = executeSelect(
          db,
          schema,
          (q, p: { roleId: string; tenantId: string }) =>
            q
              .from("role_permission")
              .where(
                (rp) => rp.role_id === p.roleId && rp.tenant_id === p.tenantId,
              ),
          { roleId, tenantId: inputTenantId },
        );
        return { success: true, data: rows.map(mapRolePermissionFromDb) };
      } catch (error) {
        logger.error("Failed to get role permissions", { error, roleId });
        return { success: false, error: error as Error };
      }
    },

    // eslint-disable-next-line @typescript-eslint/require-await -- Synchronous better-sqlite3 implements async interface
    async getPermissionsByResource(
      inputTenantId: string,
      resourceId: string,
    ): Promise<
      Result<{
        userPermissions: UserPermission[];
        rolePermissions: RolePermission[];
      }>
    > {
      try {
        const userRows = executeSelect(
          db,
          schema,
          (q, p: { resourceId: string; tenantId: string }) =>
            q
              .from("user_permission")
              .where(
                (up) =>
                  up.resource_id === p.resourceId &&
                  up.tenant_id === p.tenantId,
              ),
          { resourceId, tenantId: inputTenantId },
        );
        const roleRows = executeSelect(
          db,
          schema,
          (q, p: { resourceId: string; tenantId: string }) =>
            q
              .from("role_permission")
              .where(
                (rp) =>
                  rp.resource_id === p.resourceId &&
                  rp.tenant_id === p.tenantId,
              ),
          { resourceId, tenantId: inputTenantId },
        );

        return {
          success: true,
          data: {
            userPermissions: userRows.map(mapUserPermissionFromDb),
            rolePermissions: roleRows.map(mapRolePermissionFromDb),
          },
        };
      } catch (error) {
        logger.error("Failed to get permissions by resource", {
          error,
          resourceId,
        });
        return { success: false, error: error as Error };
      }
    },

    // eslint-disable-next-line @typescript-eslint/require-await -- Synchronous better-sqlite3 implements async interface
    async getEffectivePermissions(
      inputTenantId: string,
      userId: string,
      resourceId?: string,
      action?: string,
    ): Promise<Result<EffectivePermission[]>> {
      try {
        // Get user's role IDs
        const userRoles = executeSelect(
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
        const roleIds = userRoles.map((r) => r.role_id);

        const permissions: EffectivePermission[] = [];

        // Get direct user permissions
        const userPerms = executeSelect(
          db,
          schema,
          (q, p: { userId: string; tenantId: string }) =>
            q
              .from("user_permission")
              .where(
                (up) => up.user_id === p.userId && up.tenant_id === p.tenantId,
              ),
          { userId, tenantId: inputTenantId },
        );

        for (const perm of userPerms) {
          // Apply filters in application code
          if (
            resourceId !== undefined &&
            !matchesPattern(perm.resource_id, resourceId) &&
            perm.resource_id !== resourceId
          ) {
            continue;
          }
          if (
            action !== undefined &&
            perm.action !== action &&
            perm.action !== "*"
          ) {
            continue;
          }

          permissions.push({
            resourceId: perm.resource_id,
            action: perm.action,
            source: "user",
            sourceId: userId,
            createdAt: perm.created_at,
          });
        }

        // Get role permissions
        for (const roleId of roleIds) {
          const rolePerms = executeSelect(
            db,
            schema,
            (q, p: { roleId: string; tenantId: string }) =>
              q
                .from("role_permission")
                .where(
                  (rp) =>
                    rp.role_id === p.roleId && rp.tenant_id === p.tenantId,
                ),
            { roleId, tenantId: inputTenantId },
          );

          for (const perm of rolePerms) {
            // Apply filters in application code
            if (
              resourceId !== undefined &&
              !matchesPattern(perm.resource_id, resourceId) &&
              perm.resource_id !== resourceId
            ) {
              continue;
            }
            if (
              action !== undefined &&
              perm.action !== action &&
              perm.action !== "*"
            ) {
              continue;
            }

            permissions.push({
              resourceId: perm.resource_id,
              action: perm.action,
              source: "role",
              sourceId: perm.role_id,
              createdAt: perm.created_at,
            });
          }
        }

        return { success: true, data: permissions };
      } catch (error) {
        logger.error("Failed to get effective permissions", { error, userId });
        return { success: false, error: error as Error };
      }
    },

    // eslint-disable-next-line @typescript-eslint/require-await -- Synchronous better-sqlite3 implements async interface
    async hasPermission(
      inputTenantId: string,
      userId: string,
      resourceId: string,
      action: string,
    ): Promise<Result<boolean>> {
      try {
        // Get all user permissions and check with wildcard matching
        const userPerms = executeSelect(
          db,
          schema,
          (q, p: { userId: string; tenantId: string }) =>
            q
              .from("user_permission")
              .where(
                (up) => up.user_id === p.userId && up.tenant_id === p.tenantId,
              ),
          { userId, tenantId: inputTenantId },
        );

        for (const perm of userPerms) {
          const resourceMatches =
            matchesPattern(perm.resource_id, resourceId) ||
            perm.resource_id === resourceId;
          const actionMatches = perm.action === action || perm.action === "*";
          if (resourceMatches && actionMatches) {
            return { success: true, data: true };
          }
        }

        // Get user's role IDs
        const userRoles = executeSelect(
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
        const roleIds = userRoles.map((r) => r.role_id);

        // Check role permissions
        for (const roleId of roleIds) {
          const rolePerms = executeSelect(
            db,
            schema,
            (q, p: { roleId: string; tenantId: string }) =>
              q
                .from("role_permission")
                .where(
                  (rp) =>
                    rp.role_id === p.roleId && rp.tenant_id === p.tenantId,
                ),
            { roleId, tenantId: inputTenantId },
          );

          for (const perm of rolePerms) {
            const resourceMatches =
              matchesPattern(perm.resource_id, resourceId) ||
              perm.resource_id === resourceId;
            const actionMatches = perm.action === action || perm.action === "*";
            if (resourceMatches && actionMatches) {
              return { success: true, data: true };
            }
          }
        }

        return { success: true, data: false };
      } catch (error) {
        logger.error("Failed to check permission", {
          error,
          userId,
          resourceId,
          action,
        });
        return { success: false, error: error as Error };
      }
    },

    // eslint-disable-next-line @typescript-eslint/require-await -- Synchronous better-sqlite3 implements async interface
    async getEffectivePermissionsByPrefix(
      inputTenantId: string,
      userId: string,
      resourceIdPrefix: string,
    ): Promise<Result<EffectivePermission[]>> {
      try {
        // Get user's role IDs
        const userRoles = executeSelect(
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
        const roleIds = userRoles.map((r) => r.role_id);

        const permissions: EffectivePermission[] = [];

        // Get direct user permissions matching prefix (use raw SQL for LIKE)
        const userPermsStmt = db.prepare(
          `SELECT * FROM user_permission
           WHERE user_id = @userId AND tenant_id = @tenantId
           AND resource_id LIKE @prefix`,
        );
        const userPerms = userPermsStmt.all({
          userId,
          tenantId: inputTenantId,
          prefix: `${resourceIdPrefix}%`,
        }) as {
          user_id: string;
          tenant_id: string;
          resource_id: string;
          action: string;
          created_at: number;
        }[];

        for (const perm of userPerms) {
          permissions.push({
            resourceId: perm.resource_id,
            action: perm.action,
            source: "user",
            sourceId: userId,
            createdAt: perm.created_at,
          });
        }

        // Get role permissions matching prefix
        for (const roleId of roleIds) {
          const rolePermsStmt = db.prepare(
            `SELECT * FROM role_permission
             WHERE role_id = @roleId AND tenant_id = @tenantId
             AND resource_id LIKE @prefix`,
          );
          const rolePerms = rolePermsStmt.all({
            roleId,
            tenantId: inputTenantId,
            prefix: `${resourceIdPrefix}%`,
          }) as {
            role_id: string;
            tenant_id: string;
            resource_id: string;
            action: string;
            created_at: number;
          }[];

          for (const perm of rolePerms) {
            permissions.push({
              resourceId: perm.resource_id,
              action: perm.action,
              source: "role",
              sourceId: perm.role_id,
              createdAt: perm.created_at,
            });
          }
        }

        return { success: true, data: permissions };
      } catch (error) {
        logger.error("Failed to get permissions by prefix", {
          error,
          userId,
          resourceIdPrefix,
        });
        return { success: false, error: error as Error };
      }
    },
  };
}
