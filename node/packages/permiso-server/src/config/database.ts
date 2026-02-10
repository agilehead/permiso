/**
 * Database Configuration
 *
 * Initializes SQLite database and provides repository creation.
 */

import { createLogger } from "@codespin/permiso-logger";
import {
  initSQLiteDatabase,
  closeSQLiteDatabase,
  type SQLiteDatabase,
} from "@codespin/permiso-db";
import { type Repositories } from "../repositories/interfaces/index.js";
import { createRepositories } from "../repositories/factory.js";
import { config } from "../config.js";

const logger = createLogger("permiso-server:config:database");

let _db: SQLiteDatabase | null = null;

/**
 * Initialize database configuration.
 * Must be called at startup before any database operations.
 */
export function initializeDatabaseConfig(): void {
  _db = initSQLiteDatabase(config.db.dbPath);
  logger.info(`SQLite database: ${config.db.dbPath}`);
}

/**
 * Create repositories for the current request.
 */
export function createRequestRepositories(tenantId?: string): Repositories {
  if (_db === null) {
    throw new Error(
      "Database not initialized. Call initializeDatabaseConfig() first.",
    );
  }
  return createRepositories(_db, tenantId ?? "");
}

/**
 * Get the raw SQLite database for health checks.
 */
export function getHealthCheckDb(): SQLiteDatabase | null {
  return _db;
}

/**
 * Close database connections on shutdown.
 */
export function closeDatabaseConnections(): void {
  if (_db !== null) {
    closeSQLiteDatabase(_db);
    _db = null;
  }
}
