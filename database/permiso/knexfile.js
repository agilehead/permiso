import "dotenv/config";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Get data directory from environment or use default
const dataDir = process.env.PERMISO_DATA_DIR || "./data";

export default {
  client: "better-sqlite3",
  connection: {
    filename: join(dataDir, "permiso.db"),
  },
  useNullAsDefault: true,
  migrations: {
    directory: join(__dirname, "migrations"),
    extension: "js",
  },
  pool: {
    afterCreate: (conn, cb) => {
      conn.pragma("journal_mode = WAL");
      conn.pragma("foreign_keys = ON");
      cb();
    },
  },
};
