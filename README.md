# mcp-redmine

An [MCP (Model Context Protocol)](https://modelcontextprotocol.io) server that connects AI agents to **Redmine** project management. Lets AI assistants list issues, create tasks, search projects, log time, read wikis, and more — all through Redmine's REST API.

## Features

- 🔑 **Flexible authentication** — API Key or Basic Auth (username/password)
- 📋 **Issues** — list, get, create, update (with filters, pagination, journals)
- 📁 **Projects** — list and get project details
- 👤 **Users** — get current user, list users (admin)
- ⏱️ **Time tracking** — list and create time entries
- 📖 **Wiki** — get and list wiki pages
- 🔍 **Search** — full-text search across Redmine

## Prerequisites

- **Node.js** ≥ 18
- A **Redmine** instance with REST API enabled  
  *(Administration → Settings → API → Enable REST API)*

## Installation

```bash
git clone https://github.com/your-username/mcp-redmine.git
cd mcp-redmine
npm install
npm run build
```

## Configuration

Set the following environment variables:

| Variable | Required | Description |
|----------|----------|-------------|
| `REDMINE_URL` | ✅ | Base URL of your Redmine instance (e.g. `https://redmine.example.com`) |
| `REDMINE_API_KEY` | ⚡ | API key (found in My Account → API access key) |
| `REDMINE_USERNAME` | ⚡ | Username for basic authentication |
| `REDMINE_PASSWORD` | ⚡ | Password for basic authentication |

> ⚡ Either `REDMINE_API_KEY` **or** `REDMINE_USERNAME` + `REDMINE_PASSWORD` is required.

## Usage

### Direct run

```bash
REDMINE_URL=https://redmine.example.com \
REDMINE_API_KEY=your-api-key \
node dist/index.js
```

### VS Code (Gemini / Copilot)

Add to `.vscode/mcp.json`:

```json
{
  "servers": {
    "mcp-redmine": {
      "command": "node",
      "args": ["/absolute/path/to/mcp-redmine/dist/index.js"],
      "env": {
        "REDMINE_URL": "https://redmine.example.com",
        "REDMINE_API_KEY": "your-api-key"
      }
    }
  }
}
```

### Claude Desktop

Add to `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "mcp-redmine": {
      "command": "node",
      "args": ["/absolute/path/to/mcp-redmine/dist/index.js"],
      "env": {
        "REDMINE_URL": "https://redmine.example.com",
        "REDMINE_API_KEY": "your-api-key"
      }
    }
  }
}
```

## Available Tools

| Tool | Description |
|------|-------------|
| `list-issues` | List issues with filters (project, status, tracker, assignee, sort) |
| `get-issue` | Get a single issue with full details and associations |
| `create-issue` | Create a new issue |
| `update-issue` | Update an existing issue (fields, status, notes) |
| `list-projects` | List all accessible projects |
| `get-project` | Get project details |
| `get-current-user` | Get the authenticated user's info |
| `list-users` | List users (admin only) |
| `list-time-entries` | List time entries with filters |
| `create-time-entry` | Log time against an issue or project |
| `get-wiki-page` | Get a wiki page's content |
| `list-wiki-pages` | List wiki pages in a project |
| `search-redmine` | Full-text search across Redmine |

## Development

```bash
npm run dev    # Watch mode (auto-recompile on changes)
npm run build  # One-time build
npm start      # Run the built server
```

## License

MIT
