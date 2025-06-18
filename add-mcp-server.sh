#!/bin/bash

# Example script to add an MCP server to Amazon Q Developer CLI

# Add a server to the global configuration
q mcp add --name "markdown-tools" \
          --command "npx" \
          --env "DEBUG=true" \
          --scope global \
          --timeout 30000

# Add a server to the workspace configuration
q mcp add --name "git-tools" \
          --command "npx" \
          --env "API_KEY=your-api-key,DEBUG=true" \
          --scope workspace \
          --timeout 60000

# List all configured MCP servers
q mcp list

# Check the status of a specific server
q mcp status --name "markdown-tools"