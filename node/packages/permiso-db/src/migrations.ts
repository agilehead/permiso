/**
 * Database migrations runner using Knex
 */

import Knex from "knex";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { createLogger } from "@codespin/permiso-logger";

const logger = createLogger("permiso-migrations");
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const MIGRATIONS_DIR = join(
  __dirname,
  "../../../../database/permiso/migrations",
);

type MigrationResult = [batchNo: number, log: string[]];
type MigrationListResult = [
  completed: { name: string }[],
  pending: { file: string }[],
];

export async function runMigrations(dataDir: string): Promise<void> {
  const dbPath = join(dataDir, "permiso.db");

  const knex = Knex({
    client: "better-sqlite3",
    connection: {
      filename: dbPath,
    },
    useNullAsDefault: true,
    migrations: {
      directory: MIGRATIONS_DIR,
    },
  });

  try {
    const result = (await knex.migrate.latest()) as MigrationResult;
    const [batchNo, log] = result;
    if (log.length === 0) {
      logger.info("Database is up to date");
    } else {
      logger.info(`Migrations applied (batch ${String(batchNo)})`, {
        migrations: log,
      });
    }
  } catch (error) {
    logger.error("Migration failed", { error });
    throw error;
  } finally {
    await knex.destroy();
  }
}

export async function rollbackMigrations(dataDir: string): Promise<void> {
  const dbPath = join(dataDir, "permiso.db");

  const knex = Knex({
    client: "better-sqlite3",
    connection: {
      filename: dbPath,
    },
    useNullAsDefault: true,
    migrations: {
      directory: MIGRATIONS_DIR,
    },
  });

  try {
    const result = (await knex.migrate.rollback()) as MigrationResult;
    const [batchNo, log] = result;
    logger.info(`Rollback complete (batch ${String(batchNo)})`, {
      migrations: log,
    });
  } catch (error) {
    logger.error("Rollback failed", { error });
    throw error;
  } finally {
    await knex.destroy();
  }
}

export async function getMigrationStatus(dataDir: string): Promise<{
  pending: string[];
  completed: string[];
}> {
  const dbPath = join(dataDir, "permiso.db");

  const knex = Knex({
    client: "better-sqlite3",
    connection: {
      filename: dbPath,
    },
    useNullAsDefault: true,
    migrations: {
      directory: MIGRATIONS_DIR,
    },
  });

  try {
    const result = (await knex.migrate.list()) as MigrationListResult;
    const [completed, pending] = result;
    return {
      pending: pending.map((m) => m.file),
      completed: completed.map((m) => m.name),
    };
  } finally {
    await knex.destroy();
  }
}
