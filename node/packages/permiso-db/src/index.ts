import Database from "better-sqlite3";
import { mkdirSync } from "fs";
import { dirname } from "path";

export * as sql from "./sql.js";
export { runMigrations, rollbackMigrations, getMigrationStatus } from "./migrations.js";

export type SQLiteDatabase = Database.Database;

/**
 * Initialize an SQLite database connection.
 * Creates the directory if needed, enables foreign keys and WAL mode.
 */
export function initSQLiteDatabase(dbPath: string): SQLiteDatabase {
  mkdirSync(dirname(dbPath), { recursive: true });
  const db = new Database(dbPath);
  db.pragma("foreign_keys = ON");
  db.pragma("journal_mode = WAL");
  return db;
}

/**
 * Close an SQLite database connection.
 */
export function closeSQLiteDatabase(db: SQLiteDatabase): void {
  db.close();
}
