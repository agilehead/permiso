/**
 * Repository Factory
 *
 * Creates SQLite repository implementations with app-level tenant filtering.
 */

import type { Repositories } from "./interfaces/index.js";
import { createSqliteRepositories, type SQLiteDb } from "./sqlite/index.js";

/**
 * Create repositories for a given tenant.
 */
export function createRepositories(
  db: SQLiteDb,
  tenantId: string,
): Repositories {
  return createSqliteRepositories(db, tenantId);
}

// Re-export types
export type { Repositories };
