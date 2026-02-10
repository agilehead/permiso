#!/bin/bash

# Docker build script for Permiso
# Builds two targets: permiso-migrations, permiso (production)
# Usage: ./docker-build.sh [tag]

set -e

# Default values
DEFAULT_TAG="latest"
TAG="${1:-$DEFAULT_TAG}"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}Building Permiso Docker images...${NC}"

# Get git commit hash for labeling
GIT_COMMIT=$(git rev-parse --short HEAD 2>/dev/null || echo "unknown")
BUILD_DATE=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

build_image() {
  local target="$1"
  local image_name="$2"

  echo -e "${YELLOW}Building image: ${image_name}:${TAG} (target: ${target})${NC}"
  docker build \
    --target "${target}" \
    --build-arg GIT_COMMIT="${GIT_COMMIT}" \
    --build-arg BUILD_DATE="${BUILD_DATE}" \
    --label "git.commit=${GIT_COMMIT}" \
    --label "build.date=${BUILD_DATE}" \
    -t "${image_name}:${TAG}" \
    -t "${image_name}:${GIT_COMMIT}" \
    .

  if [ $? -eq 0 ]; then
    echo -e "${GREEN}Successfully built ${image_name}:${TAG}${NC}"
  else
    echo -e "${RED}Failed to build ${image_name}:${TAG}${NC}"
    exit 1
  fi
}

# Build migrations image
build_image "migrations" "permiso-migrations"

# Build production image
build_image "production" "permiso"

# Show image info
echo -e "\n${YELLOW}Image details:${NC}"
docker images "permiso*" --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}\t{{.CreatedAt}}" | head -5

echo -e "${GREEN}All images built successfully!${NC}"
