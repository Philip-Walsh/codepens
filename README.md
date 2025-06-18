# Amazon Q Developer Command Line MCP Configuration

This guide explains how to configure Model Context Protocol (MCP) servers for Amazon Q Developer in the command line.

## What is MCP?

The Model Context Protocol (MCP) is an open standard that enables AI assistants to interact with external tools and services. Amazon Q Developer CLI supports MCP, allowing you to extend Q's capabilities by connecting it to custom tools and services.

## Configuration File Locations

MCP client configuration in Amazon Q Developer is stored in JSON format, in a file named `mcp.json`. There are two levels of configuration:

1. **Global Configuration**: `~/.aws/amazonq/mcp.json` - Applies to all workspaces
2. **Workspace Configuration**: `.amazonq/mcp.json` - Specific to the current workspace

## Configuration File Structure

The MCP configuration file uses a JSON format with the following structure:

```json
{
  "mcpServers": {
    "server-name": {
      "command": "command-to-run",
      "args": ["arg1", "arg2"],
      "env": {
        "ENV_VAR1": "value1",
        "ENV_VAR2": "value2"
      },
      "timeout": 60000
    }
  }
}
```

## Command Line Configuration

You can manage MCP servers using the following commands:

### Add a Server

```bash
q mcp add --name "server-name" \
          --command "command-to-run" \
          --env "KEY1=value1,KEY2=value2" \
          --scope global \
          --timeout 60000
```

### Remove a Server

```bash
q mcp remove --name "server-name" --scope global
```

### List Servers

```bash
q mcp list [global|workspace]
```

### Import Configuration

```bash
q mcp import --file config.json [global|workspace]
```

### Check Server Status

```bash
q mcp status --name "server-name"
```

## Examples

See the included example files:
- `mcp-config-example.json`: Example MCP configuration file
- `add-mcp-server.sh`: Script demonstrating how to add MCP servers
- `import-mcp-config.sh`: Script demonstrating how to import MCP configuration

## Best Practices

1. Use descriptive names for your MCP servers
2. Use global configuration for servers you want to use across all projects
3. Use workspace-specific configuration for project-specific servers
4. Adjust timeout values based on the expected response time of each server
5. Regularly check for updates to your MCP servers

## Security Considerations

- MCP servers execute with your user permissions
- Be careful with servers that might expose sensitive information
- Consider disabling servers when not needed
- Don't use servers to run commands that could modify your system without your knowledge
- Never include credentials directly in your MCP configuration files