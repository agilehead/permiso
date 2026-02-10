#!/usr/bin/env bash
# -------------------------------------------------------------------
# format-all.sh – Run prettier across all TypeScript and JavaScript files
# -------------------------------------------------------------------
set -euo pipefail

# Change to the project root directory
cd "$(dirname "$0")/.."

echo "=== Formatting Permiso ==="

# Build list of files to format
FILES_TO_FORMAT=(
  "node/packages/*/src/**/*.ts"
  "*.json"
  "node/packages/*/*.json"
  "database/**/*.js"
)

# Only add test patterns if tests directory exists (not in Docker builds)
if compgen -G "node/packages/*/tests/**/*.ts" > /dev/null 2>&1; then
  FILES_TO_FORMAT+=("node/packages/*/tests/**/*.ts")
fi

# Run prettier on all relevant files
npx prettier --write "${FILES_TO_FORMAT[@]}" --ignore-unknown

echo "=== Formatting completed ==="
