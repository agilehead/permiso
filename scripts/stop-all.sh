#!/usr/bin/env bash
# Stop all Permiso services and free ports
set -euo pipefail

# Stop Docker Compose
docker compose -f devenv/docker-compose.yml down 2>/dev/null || true

# Kill local Node processes
pkill -f "node.*permiso" 2>/dev/null || true
sleep 2

# Free ports 5001 (server) and 5002 (test)
for PORT in 5001 5002; do
  PID=$(lsof -ti:$PORT 2>/dev/null || true)
  if [ -n "$PID" ]; then
    kill -9 $PID 2>/dev/null || true
  fi
done
