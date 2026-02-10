#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default configuration
CONTAINER_NAME="permiso-test-$$"
TEST_TENANT_ID="test-tenant-$$"
TEST_PORT=${2:-5099}
TIMEOUT=30
TESTS_PASSED=0
TESTS_FAILED=0

# Create a temp directory for SQLite data (world-writable for container user)
TEST_DATA_DIR=$(mktemp -d)
chmod 777 "$TEST_DATA_DIR"

# Function to print colored output
print_info() {
    echo -e "${BLUE}$1${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}! $1${NC}"
}

# Function to cleanup on exit
cleanup() {
    print_info "Cleaning up..."

    # Stop and remove test container
    if docker ps -a | grep -q $CONTAINER_NAME; then
        docker rm -f $CONTAINER_NAME >/dev/null 2>&1
        print_success "Removed test container"
    fi

    # Remove temp data directory
    if [ -d "$TEST_DATA_DIR" ]; then
        rm -rf "$TEST_DATA_DIR"
        print_success "Removed temp data directory"
    fi
}

# Set trap to cleanup on exit
trap cleanup EXIT

# Function to wait for service
wait_for_service() {
    local host=$1
    local port=$2
    local service=$3
    local max_attempts=15
    local attempt=1

    print_info "Waiting for $service to be ready..."

    while [ $attempt -le $max_attempts ]; do
        if curl -s http://$host:$port/health >/dev/null 2>&1; then
            print_success "$service is ready"
            return 0
        fi
        echo -n "."
        sleep 2
        attempt=$((attempt + 1))
    done

    print_error "$service failed to start after $max_attempts attempts"
    return 1
}

# Function to run GraphQL query
run_graphql_query() {
    local query=$1
    local expected_pattern=$2
    local description=$3
    local tenant_id=$4

    print_info "Testing: $description"

    local tenant_header=""
    if [ -n "$tenant_id" ]; then
        tenant_header="-H x-tenant-id:$tenant_id"
    fi

    local response=$(curl -s -X POST http://localhost:$TEST_PORT/graphql \
        -H "Content-Type: application/json" \
        $tenant_header \
        -d "{\"query\": \"$query\"}" 2>/dev/null)

    if [ -z "$response" ]; then
        print_error "No response received"
        return 1
    fi

    if echo "$response" | grep -q "errors"; then
        print_error "GraphQL error: $response"
        return 1
    fi

    if echo "$response" | grep -q "$expected_pattern"; then
        print_success "$description"
        return 0
    else
        print_error "Unexpected response: $response"
        return 1
    fi
}

# Show usage if help is requested
if [ "$1" = "-h" ] || [ "$1" = "--help" ]; then
    echo "Usage: $0 [IMAGE] [PORT]"
    echo ""
    echo "Arguments:"
    echo "  IMAGE  Docker image to test (default: permiso:latest)"
    echo "  PORT   Port to expose the service on (default: 5099)"
    echo ""
    echo "Examples:"
    echo "  $0                                    # Test permiso:latest on port 5099"
    echo "  $0 ghcr.io/codespin-ai/permiso:latest # Test specific image"
    echo "  $0 permiso:latest 5001                # Test on specific port"
    exit 0
fi

# Parse command line arguments
IMAGE_TO_TEST=${1:-"permiso:latest"}
TEST_PORT=${2:-5099}

# Main test script
print_info "=== Permiso Docker Image Test ==="
echo

print_info "Testing image: $IMAGE_TO_TEST on port $TEST_PORT"
print_info "SQLite data directory: $TEST_DATA_DIR"
echo

# Start the container with SQLite
print_info "Starting Permiso container..."
docker run -d --rm \
    --name $CONTAINER_NAME \
    -p $TEST_PORT:5001 \
    -v "$TEST_DATA_DIR:/app/data" \
    -e PERMISO_DATA_DIR=/app/data \
    -e PERMISO_SERVER_HOST=0.0.0.0 \
    -e PERMISO_SERVER_PORT=5001 \
    $IMAGE_TO_TEST >/dev/null 2>&1

if [ $? -ne 0 ]; then
    print_error "Failed to start container"
    exit 1
fi

print_success "Container started"

# Wait for the service to be ready
if ! wait_for_service localhost $TEST_PORT "Permiso GraphQL server"; then
    print_error "Server failed to start. Checking logs..."
    docker logs $CONTAINER_NAME
    exit 1
fi

# Give the server a moment to fully initialize
print_info "Waiting for server to fully initialize..."
sleep 3

echo
print_info "=== Running Tests ==="
echo

# Test 0: Health check
HEALTH_RESPONSE=$(curl -s http://localhost:$TEST_PORT/health)
if echo "$HEALTH_RESPONSE" | grep -q "\"status\":\"healthy\""; then
    print_success "Health check"
    TESTS_PASSED=$((TESTS_PASSED + 1))
else
    print_error "Health check failed: $HEALTH_RESPONSE"
    TESTS_FAILED=$((TESTS_FAILED + 1))
fi

# Test 1: Create tenant
if run_graphql_query \
    "mutation { createTenant(input: {id: \\\"$TEST_TENANT_ID\\\", name: \\\"Test Tenant\\\"}) { id name } }" \
    "\"id\":\"$TEST_TENANT_ID\"" \
    "Create tenant"; then
    TESTS_PASSED=$((TESTS_PASSED + 1))
else
    TESTS_FAILED=$((TESTS_FAILED + 1))
fi

# Test 2: Set string property
if run_graphql_query \
    "mutation { setTenantProperty(tenantId: \\\"$TEST_TENANT_ID\\\", name: \\\"tier\\\", value: \\\"premium\\\") { name value } }" \
    "\"value\":\"premium\"" \
    "Set string property"; then
    TESTS_PASSED=$((TESTS_PASSED + 1))
else
    TESTS_FAILED=$((TESTS_FAILED + 1))
fi

# Test 3: Set complex JSON property
if run_graphql_query \
    "mutation { setTenantProperty(tenantId: \\\"$TEST_TENANT_ID\\\", name: \\\"config\\\", value: {maxUsers: 100, features: [\\\"sso\\\", \\\"audit\\\"], active: true}) { name value } }" \
    "\"maxUsers\":100" \
    "Set complex JSON property"; then
    TESTS_PASSED=$((TESTS_PASSED + 1))
else
    TESTS_FAILED=$((TESTS_FAILED + 1))
fi

# Test 4: Set array property
if run_graphql_query \
    "mutation { setTenantProperty(tenantId: \\\"$TEST_TENANT_ID\\\", name: \\\"tags\\\", value: [\\\"tag1\\\", \\\"tag2\\\", \\\"tag3\\\"]) { name value } }" \
    "\\[\"tag1\",\"tag2\",\"tag3\"\\]" \
    "Set array property"; then
    TESTS_PASSED=$((TESTS_PASSED + 1))
else
    TESTS_FAILED=$((TESTS_FAILED + 1))
fi

# Test 5: Set number property
if run_graphql_query \
    "mutation { setTenantProperty(tenantId: \\\"$TEST_TENANT_ID\\\", name: \\\"score\\\", value: 98.5) { name value } }" \
    "\"value\":98.5" \
    "Set number property"; then
    TESTS_PASSED=$((TESTS_PASSED + 1))
else
    TESTS_FAILED=$((TESTS_FAILED + 1))
fi

# Test 6: Set boolean property
if run_graphql_query \
    "mutation { setTenantProperty(tenantId: \\\"$TEST_TENANT_ID\\\", name: \\\"active\\\", value: true) { name value } }" \
    "\"value\":true" \
    "Set boolean property"; then
    TESTS_PASSED=$((TESTS_PASSED + 1))
else
    TESTS_FAILED=$((TESTS_FAILED + 1))
fi

# Test 7: Set null property
if run_graphql_query \
    "mutation { setTenantProperty(tenantId: \\\"$TEST_TENANT_ID\\\", name: \\\"deletedAt\\\", value: null) { name value } }" \
    "\"value\":null" \
    "Set null property"; then
    TESTS_PASSED=$((TESTS_PASSED + 1))
else
    TESTS_FAILED=$((TESTS_FAILED + 1))
fi

# Test 8: Query tenant with properties
if run_graphql_query \
    "query { tenant(id: \\\"$TEST_TENANT_ID\\\") { id name properties { name value hidden } } }" \
    "\"properties\":" \
    "Query tenant with properties"; then
    TESTS_PASSED=$((TESTS_PASSED + 1))
else
    TESTS_FAILED=$((TESTS_FAILED + 1))
fi

# Test 9: Create user with properties (requires x-tenant-id header)
if run_graphql_query \
    "mutation { createUser(input: {id: \\\"test-user\\\", identityProvider: \\\"test\\\", identityProviderUserId: \\\"123\\\", properties: [{name: \\\"profile\\\", value: {dept: \\\"eng\\\", level: 3}}]}) { id properties { name value } } }" \
    "\"dept\":\"eng\"" \
    "Create user with JSON properties" \
    "$TEST_TENANT_ID"; then
    TESTS_PASSED=$((TESTS_PASSED + 1))
else
    TESTS_FAILED=$((TESTS_FAILED + 1))
fi

# Test 10: Create role with properties (requires x-tenant-id header)
if run_graphql_query \
    "mutation { createRole(input: {id: \\\"test-role\\\", name: \\\"Admin\\\", properties: [{name: \\\"permissions\\\", value: {canEdit: true, canDelete: false}}]}) { id properties { name value } } }" \
    "\"canEdit\":true" \
    "Create role with JSON properties" \
    "$TEST_TENANT_ID"; then
    TESTS_PASSED=$((TESTS_PASSED + 1))
else
    TESTS_FAILED=$((TESTS_FAILED + 1))
fi

echo
print_info "=== Test Summary ==="
print_success "Tests passed: ${TESTS_PASSED}"
if [ "${TESTS_FAILED}" -gt 0 ]; then
    print_error "Tests failed: $TESTS_FAILED"
else
    print_success "All tests passed!"
fi

echo
print_info "=== Container Health Check ==="
docker logs --tail 10 $CONTAINER_NAME 2>&1 | grep -E "(error|Error|ERROR)" >/dev/null
if [ $? -eq 0 ]; then
    print_warning "Errors found in container logs"
else
    print_success "No errors in container logs"
fi

# Show container info
echo
print_info "=== Container Information ==="
docker ps --filter "name=$CONTAINER_NAME" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

echo
if [ "${TESTS_FAILED}" -eq 0 ]; then
    print_success "Docker image test completed successfully!"
    exit 0
else
    print_error "Docker image test failed!"
    exit 1
fi
