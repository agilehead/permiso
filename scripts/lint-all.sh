#!/usr/bin/env bash
# -------------------------------------------------------------------
# lint-all.sh – Run ESLint across all packages
#
# Usage:
#   ./scripts/lint-all.sh       # Run lint
#   ./scripts/lint-all.sh --fix # Run lint with auto-fix
# -------------------------------------------------------------------
set -euo pipefail

# Change to the project root directory
cd "$(dirname "$0")/.."

echo "=== Linting Permiso ==="

# Define the package order
PACKAGES=(
  "permiso-core"
  "permiso-logger"
  "permiso-db"
  "permiso-test-utils"
  "permiso-server"
  "permiso-client"
  "permiso-integration-tests"
)

# Determine if --fix flag is passed
FIX_FLAG=""
if [[ "$*" == *--fix* ]]; then
  FIX_FLAG="--fix"
fi

# Loop through each package and run lint
for pkg_name in "${PACKAGES[@]}"; do
  pkg="node/packages/$pkg_name"
  if [[ ! -d "$pkg" ]]; then
    echo "Package $pkg not found, skipping."
    continue
  fi
  # Check if lint script exists
  if node -e "process.exit(require('./$pkg/package.json').scripts?.lint ? 0 : 1)"; then
    echo "Linting $pkg…"
    (cd "$pkg" && npm run lint $FIX_FLAG) || exit 1
  fi
done

echo "=== Linting completed ==="
