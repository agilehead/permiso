#!/usr/bin/env bash

# Docker push script for Permiso - pushes to GitHub Container Registry (GHCR)
# Usage: ./docker-push.sh [tag]
#
# Prerequisites:
# - Docker logged into GHCR: docker login ghcr.io -u USERNAME
# - Or use GITHUB_TOKEN: echo $GITHUB_TOKEN | docker login ghcr.io -u USERNAME --password-stdin

set -euo pipefail

# Configuration
REGISTRY="ghcr.io"
ORG="codespin-ai"
IMAGE_NAME="permiso"
DEFAULT_TAG="latest"
TAG="${1:-$DEFAULT_TAG}"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Full image names
LOCAL_IMAGE="${IMAGE_NAME}:${TAG}"
REMOTE_IMAGE="${REGISTRY}/${ORG}/${IMAGE_NAME}:${TAG}"

echo -e "${GREEN}Pushing Permiso Docker image to GHCR...${NC}"

# Get git commit hash
GIT_COMMIT=$(git rev-parse --short HEAD 2>/dev/null || echo "unknown")
REMOTE_IMAGE_COMMIT="${REGISTRY}/${ORG}/${IMAGE_NAME}:${GIT_COMMIT}"

# Check if local image exists
if ! docker image inspect "${LOCAL_IMAGE}" &>/dev/null; then
    echo -e "${RED}Error: Local image ${LOCAL_IMAGE} not found!${NC}"
    echo -e "${YELLOW}Run ./scripts/docker-build.sh first${NC}"
    exit 1
fi

# Tag for GHCR
echo -e "${YELLOW}Tagging image for GHCR...${NC}"
docker tag "${LOCAL_IMAGE}" "${REMOTE_IMAGE}"
docker tag "${LOCAL_IMAGE}" "${REMOTE_IMAGE_COMMIT}"

# Push to GHCR
echo -e "${YELLOW}Pushing ${REMOTE_IMAGE}...${NC}"
docker push "${REMOTE_IMAGE}"

echo -e "${YELLOW}Pushing ${REMOTE_IMAGE_COMMIT}...${NC}"
docker push "${REMOTE_IMAGE_COMMIT}"

echo -e "${GREEN}Successfully pushed to GHCR!${NC}"
echo -e "${GREEN}Images:${NC}"
echo -e "  ${REMOTE_IMAGE}"
echo -e "  ${REMOTE_IMAGE_COMMIT}"
