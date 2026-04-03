# Database MCP

Database MCP is an MCP server for SQL Server, PostgreSQL, and MySQL.

It provides tools for:
- `connect`
- `health_check`
- `list_schemas`
- `list_tables`
- `describe_table`
- `query` (single SELECT only)

## Release

Current release:
- NPM package: `@kingsnow129/database-mcp@0.4.6`
- MCP server name: `database-mcp`
- VSIX helper: `database-mcp-helper@0.4.6`

## What Is New In 0.4.6

- Fixed SQL Server integrated-auth instance routing bug: when the configured port can connect but resolves to a different SQL instance, MCP now verifies `@@SERVERNAME`, closes the wrong connection, and continues probing candidate ports until it matches the requested `server\\instance`.

## What Is New In 0.4.5

- Added SQL Server integrated-auth instance fallback logic: when `host` uses `server\\instance` and direct connect fails, MCP probes candidate ports and validates `@@SERVERNAME` to resolve the expected instance.
- Added `DB_INSTANCE_PROBE_PORTS` environment variable for custom probe port lists.

## What Is New In 0.4.4

- Fixed SQL Server `integratedAuth` connection handling by building explicit ODBC connection strings for `msnodesqlv8`.
- Added optional `database` parameter on `query` to support dynamic database switching in one call.
- Updated VSIX helper to auto-install MCP runtime on startup activation.

## What Is New In 0.4.3

- Removed legacy naming references to `sqlserver-mcp`.
- MCP registration now keeps only the `databaseMcp` server key.

## What Was New In 0.4.2

- Added SQL Server Windows integrated auth support with `integratedAuth`.
- Added `--integratedAuth` CLI override handling in `connect` flow.
- Added optional dependency `msnodesqlv8` for integrated auth SQL Server driver.

## What Was Introduced In 0.4.0

- Multi-database profile model (`servers` + `databases`) is now the primary config.
- Automatic profile resolution during `connect`:
  - by `alias`
  - by `serverName`
  - by `host`
  - fallback to `currentServer`, `defaultServer`, then legacy alias
- User install directory moved to:
  - `${userHome}/.mcp-servers/database-mcp`
- VS Code helper command set simplified and includes:
  - `Database MCP: Manage Databases`
  - `Database MCP: Open MCP Server List`
  - `Database MCP: Uninstall (User)`
- Only `databaseMcp` key is written to MCP config.

## Quick Start (MCP Config)

Example user/workspace MCP config:

```json
{
  "servers": {
    "databaseMcp": {
      "type": "stdio",
      "command": "node",
      "args": [
        "${userHome}/.mcp-servers/database-mcp/node_modules/@kingsnow129/database-mcp/dist/server.js",
        "--profilesFile",
        "${userHome}/.mcp-servers/database-mcp/profiles.json"
      ]
    }
  }
}
```

You can also run directly with NPX:

```json
{
  "mcpServers": {
    "database-mcp": {
      "command": "npx",
      "args": ["-y", "@kingsnow129/database-mcp"]
    }
  }
}
```

## User-Level Install (Windows)

Run:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\install-user.ps1
```

This installs to the user profile directory and updates user MCP config.

Recommended cross-platform path notation:
- In MCP JSON config: `${userHome}/.mcp-servers/database-mcp/...` (preferred)
- In terminal commands: `%USERPROFILE%\\.mcp-servers\\database-mcp\\...` (Windows cmd), `$env:USERPROFILE\\.mcp-servers\\database-mcp\\...` (Windows PowerShell), or `$HOME/.mcp-servers/database-mcp/...` (macOS/Linux)

Windows actual paths:
- MCP install folder: `C:\\Users\\<your-user>\\.mcp-servers\\database-mcp`
- Profiles file: `C:\\Users\\<your-user>\\.mcp-servers\\database-mcp\\profiles.json`
- MCP config: `%APPDATA%\\Code\\User\\mcp.json`

Note: `${userHome}` is the preferred placeholder inside MCP config files. `USERPROFILE` (used as `%USERPROFILE%` in cmd and `$env:USERPROFILE` in PowerShell) and `$HOME` are shell environment variables for terminal usage.

## User-Level Install (macOS / Linux)

`install-user.ps1` is Windows-only. On macOS/Linux, install and configure manually:

```bash
mkdir -p ~/.mcp-servers/database-mcp
cd ~/.mcp-servers/database-mcp
npm init -y
npm install --save-exact @kingsnow129/database-mcp@0.4.6
```

Create `~/.mcp-servers/database-mcp/profiles.json` (example):

```json
{
  "defaultServer": "local-server",
  "servers": {
    "local-server": {
      "engine": "sqlserver",
      "host": "localhost",
      "port": 1433,
      "integratedAuth": false,
      "user": "sa",
      "password": "",
      "encrypt": true,
      "trustServerCertificate": true,
      "databases": [
        { "name": "master", "readOnly": true, "maxRows": 200 }
      ]
    }
  }
}
```

Then register MCP in your user MCP config (for example `~/.config/Code/User/mcp.json` on Linux, `~/Library/Application Support/Code/User/mcp.json` on macOS):

```json
{
  "servers": {
    "databaseMcp": {
      "type": "stdio",
      "command": "node",
      "args": [
        "${userHome}/.mcp-servers/database-mcp/node_modules/@kingsnow129/database-mcp/dist/server.js",
        "--profilesFile",
        "${userHome}/.mcp-servers/database-mcp/profiles.json"
      ]
    }
  }
}
```

## Profiles Format

`profiles.json` now uses server-level config with database entries:

```json
{
  "defaultServer": "local-server",
  "currentServer": "local-server",
  "currentDatabase": "master",
  "servers": {
    "local-server": {
      "engine": "sqlserver",
      "host": "localhost",
      "port": 1433,
      "integratedAuth": false,
      "user": "sa",
      "password": "",
      "encrypt": true,
      "trustServerCertificate": true,
      "databases": [
        { "name": "master", "readOnly": true, "maxRows": 200 }
      ]
    }
  }
}
```

## VSIX Helper Extension

Build and install locally:

```bash
cd vscode-extension
npm install
npm run package
code --install-extension database-mcp-helper-0.4.6.vsix --force
```

## Safety Defaults

- Read-only mode is hard-enforced (`connect.readOnly` overrides are ignored)
- Query tool only accepts one SELECT statement
- Semicolons are blocked
- Stored procedure execution (`exec`, `execute`, `sp_*`, `xp_*`) is blocked
- Function-call style execution patterns like `schema.fn(...)` are blocked
- Returned rows are capped (default `200`)

## Development

```bash
npm install
npm run build
npm run dev
```

## Publish

NPM publish flow:

```bash
npm run build
npm publish --access public
```

VSIX package flow:

```bash
cd vscode-extension
npm run package
```
