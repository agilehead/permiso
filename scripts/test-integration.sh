#!/usr/bin/env bash
# -------------------------------------------------------------------
# test-integration.sh – Run integration tests for Permiso
#
# Usage:
#   ./scripts/test-integration.sh local    # Run tests locally
#   ./scripts/test-integration.sh compose  # Run tests with Docker Compose
# -------------------------------------------------------------------
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

print_info() { echo -e "\033[0;34m$1\033[0m"; }
print_success() { echo -e "\033[0;32m✓ $1\033[0m"; }
print_error() { echo -e "\033[0;31m✗ $1\033[0m"; }

usage() {
    echo "Usage: $0 <mode>"
    echo ""
    echo "Modes:"
    echo "  local    - Run tests with local database"
    echo "  compose  - Run tests with Docker Compose"
    exit 1
}

if [ $# -lt 1 ]; then
    usage
fi

MODE=$1

case "$MODE" in
    local)
        print_info "=== Running Local Integration Tests ==="
        echo ""

        # Stop any existing services
        "$SCRIPT_DIR/stop-all.sh"

        # Build if needed
        if [ ! -d "$PROJECT_ROOT/node/packages/permiso-server/dist" ]; then
            print_info "Building project..."
            "$SCRIPT_DIR/build.sh" --install
        fi

        # Run tests
        print_info "Running tests..."
        cd "$PROJECT_ROOT"
        npm test

        print_success "Local tests completed!"
        ;;

    compose)
        print_info "=== Running Docker Compose Integration Tests ==="
        echo ""

        # Stop any existing services
        "$SCRIPT_DIR/stop-all.sh"

        # Create temp dir for test
        TIMESTAMP=$(date +%s)
        TEST_DIR="$PROJECT_ROOT/.tests/compose-test-${TIMESTAMP}"
        mkdir -p "$TEST_DIR"
        HOST_DB_DIR="$TEST_DIR/data/permiso/db"
        mkdir -p "$HOST_DB_DIR"
        HOST_DB_PATH="$HOST_DB_DIR/permiso.db"

        # Cleanup function
        cleanup() {
            print_info "Cleaning up..."
            cd "$PROJECT_ROOT"
            PERMISO_DATA_HOST_DIR="$HOST_DB_DIR" ENV_FILE="$TEST_DIR/.env.test" \
                docker compose -f devenv/docker-compose.yml down 2>/dev/null || true
            rm -rf "$TEST_DIR"
        }
        trap cleanup EXIT

        # Generate .env.test
        cat > "$TEST_DIR/.env.test" << EOF
PERMISO_DATA_DIR=/app/data/permiso/db
PERMISO_SERVER_HOST=0.0.0.0
PERMISO_SERVER_PORT=5001
PERMISO_API_KEY=test-api-key
PERMISO_API_KEY_ENABLED=true
LOG_LEVEL=info
EOF

        # Export for docker-compose
        export PERMISO_DATA_HOST_DIR="$HOST_DB_DIR"
        export ENV_FILE="$TEST_DIR/.env.test"

        cd "$PROJECT_ROOT"

        # Run migrations
        print_info "Running migrations..."
        docker compose -f devenv/docker-compose.yml run --rm permiso-migrations

        # Start server
        print_info "Starting server..."
        docker compose -f devenv/docker-compose.yml up -d permiso

        # Wait for health
        print_info "Waiting for server to be ready..."
        for i in $(seq 1 30); do
            if curl -sf http://localhost:5001/health >/dev/null 2>&1; then
                print_success "Server is ready"
                break
            fi
            if [ "$i" -eq 30 ]; then
                print_error "Server failed to start"
                echo ""
                print_info "Migration logs:"
                docker compose -f devenv/docker-compose.yml logs permiso-migrations
                echo ""
                print_info "Server logs:"
                docker compose -f devenv/docker-compose.yml logs permiso
                exit 1
            fi
            echo -n "."
            sleep 2
        done
        echo ""

        # Run tests against the running server
        print_info "Running tests..."
        TEST_URL="http://localhost:5001" TEST_DB_PATH="$HOST_DB_PATH" npm test

        print_success "Docker Compose tests completed!"
        ;;

    *)
        print_error "Unknown mode: $MODE"
        usage
        ;;
esac

echo ""
print_success "All tests completed successfully!"
