/**
 * SQLite Repositories
 *
 * Creates all repository implementations for SQLite.
 * Uses Tinqer for type-safe queries with explicit tenant_id filtering (no RLS).
 */

import type { Database } from "better-sqlite3";
import type { Repositories } from "../interfaces/index.js";
import { createUserRepository } from "./user-repository.js";
import { createTenantRepository } from "./tenant-repository.js";
import { createRoleRepository } from "./role-repository.js";
import { createResourceRepository } from "./resource-repository.js";
import { createPermissionRepository } from "./permission-repository.js";

export type SQLiteDb = Database;

export function createSqliteRepositories(
  db: SQLiteDb,
  tenantId: string,
): Repositories {
  return {
    user: createUserRepository(db, tenantId),
    tenant: createTenantRepository(db),
    role: createRoleRepository(db, tenantId),
    resource: createResourceRepository(db, tenantId),
    permission: createPermissionRepository(db, tenantId),
  };
}
