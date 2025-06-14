#!/bin/bash

# Script to update the project index
# Usage: 
#   ./update-index.sh         - Build once
#   ./update-index.sh watch   - Watch for changes and rebuild

# Ensure we're in the project root
cd "$(dirname "$0")/.."

if [ "$1" = "watch" ]; then
    echo "👀 Starting watch mode..."
    python3 scripts/build-index.py --watch
else
    echo "🏗️  Building project index..."
    python3 scripts/build-index.py
fi 