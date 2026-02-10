# Database Configuration

## SQLite

Permiso uses SQLite as its database. The data directory is configured via environment variable:

```bash
PERMISO_DATA_DIR=./data
```

The database file is stored as `permiso.db` within the data directory.

## Migrations

Migrations are managed with Knex.js using the `better-sqlite3` driver.

### Commands

```bash
# Create migration
npm run migrate:permiso:make add_new_table

# Run migrations
npm run migrate:permiso:latest

# Rollback
npm run migrate:permiso:rollback

# Status
npm run migrate:permiso:status
```

### Structure

```
database/
└── permiso/
    ├── knexfile.js
    └── migrations/
        └── 20250823075842_initial_schema.js
```

## Auto-Migration

For Docker deployments, set `PERMISO_AUTO_MIGRATE=true` to run migrations on container startup.
