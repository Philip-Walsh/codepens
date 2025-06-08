#!/bin/bash

# Simple script to update the project index
# Usage: 
#   ./update-index.sh         - Build once
#   ./update-index.sh watch   - Watch for changes and rebuild

if [ "$1" = "watch" ]; then
    echo "👀 Starting watch mode..."
    python3 build-index.py --watch
else
    echo "🏗️  Building project index..."
    python3 build-index.py
fi 