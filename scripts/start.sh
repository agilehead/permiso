#!/bin/bash

# Start script for Permiso server
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

# Check if we're in Docker (scripts in /app/scripts)
if [ -f "/app/node/packages/permiso-server/dist/bin/server.js" ]; then
    cd /app/node/packages/permiso-server
elif [ -d "$SCRIPT_DIR/../node/packages/permiso-server" ]; then
    cd "$SCRIPT_DIR/../node/packages/permiso-server"
else
    echo "Error: Cannot find permiso-server package"
    exit 1
fi

# Start the server
node dist/bin/server.js
