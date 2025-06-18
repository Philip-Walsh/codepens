#!/bin/bash

# Example script to import an MCP configuration from a file

# Import the configuration to the global scope
q mcp import --file mcp-config-example.json global

# List all configured MCP servers to verify the import
q mcp list