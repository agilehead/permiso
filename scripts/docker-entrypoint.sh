#!/bin/bash
set -e

echo "Starting Permiso RBAC Server..."

# Ensure data directory exists for SQLite
mkdir -p "${PERMISO_DATA_DIR:-/app/data}"

# Start the application
exec ./scripts/start.sh
