import { join } from "path";
import { config as dotenvConfig } from "dotenv";

dotenvConfig();

function required(name: string): string {
  const value = process.env[name];
  if (value === undefined || value === "") {
    console.error(`ERROR: Required environment variable ${name} is not set`);
    process.exit(1);
  }
  return value;
}

function optional(name: string, defaultValue: string): string {
  const value = process.env[name];
  return value !== undefined && value !== "" ? value : defaultValue;
}

function optionalInt(name: string, defaultValue: number): number {
  const value = process.env[name];
  return value !== undefined && value !== ""
    ? parseInt(value, 10)
    : defaultValue;
}

export const config = {
  isProduction: process.env.NODE_ENV === "production",
  isTest: process.env.NODE_ENV === "test",
  nodeEnv: optional("NODE_ENV", "development"),
  server: {
    host: required("PERMISO_SERVER_HOST"),
    port: optionalInt("PERMISO_SERVER_PORT", 5001),
  },
  db: {
    dataDir: required("PERMISO_DATA_DIR"),
    dbPath: join(required("PERMISO_DATA_DIR"), "permiso.db"),
  },
  logging: {
    level: optional("LOG_LEVEL", "info"),
  },
  apiKey: {
    key: process.env.PERMISO_API_KEY,
    enabled: process.env.PERMISO_API_KEY_ENABLED === "true",
  },
};

export type Config = typeof config;
