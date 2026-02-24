# Brainstorm: MCP Server for Redmine

## Goal

Build an MCP (Model Context Protocol) server that allows AI agents (e.g. Gemini, Claude, Copilot) to interact with a Redmine instance via its REST API. The server must support configurable domain, Basic Auth (username/password), and API Key authentication.

## Constraints

- **Tech stack**: TypeScript, `@modelcontextprotocol/sdk`, Node.js
- **Transport**: stdio (standard for local MCP integrations with editors/agents)
- **Auth**: Must support both HTTP Basic Auth (username + password) and API Key auth (`X-Redmine-API-Key` header)
- **Config**: Domain, auth method, and credentials must be configurable (env vars or CLI args)
- **Redmine API**: JSON format; REST endpoints for issues, projects, users, time entries, wikis, etc.
- **Safety**: Never log secrets; fail safely on API errors; handle rate limits and timeouts
- **Compatibility**: Should work with any Redmine instance that has REST API enabled (Redmine 3.x+)

## Known context

- **Project state**: Empty repo — greenfield project
- **Redmine REST API** supports:
  - Auth via Basic Auth (login/password) or API Key (`X-Redmine-API-Key` header or `key` query param)
  - Endpoints: `/issues.json`, `/projects.json`, `/users.json`, `/time_entries.json`, `/wiki/{page}.json`, `/issue_statuses.json`, `/trackers.json`, etc.
  - CRUD operations (GET/POST/PUT/DELETE) with `Content-Type: application/json`
  - Pagination via `offset` and `limit` params
  - User impersonation via `X-Redmine-Switch-User` header (admin only)
- **MCP TypeScript SDK** (`@modelcontextprotocol/sdk`):
  - `McpServer` class with `registerTool()` using Zod schemas for input/output validation
  - `StdioServerTransport` for stdio-based communication
  - Tools return `{ content: [{ type: 'text', text: '...' }] }`

## Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Credentials leaked in logs/errors | High | Never log auth headers; sanitize error messages |
| Redmine API changes across versions | Medium | Target stable REST API v1; handle unknown fields gracefully |
| Large responses (e.g. 1000+ issues) | Medium | Enforce pagination; cap `limit` per request |
| Network timeouts / unreachable Redmine | Medium | Add timeouts + retries with exponential backoff |
| User sends destructive operations (delete project) | High | Separate read-only and write tools; consider a `readOnly` mode |

## Options (3)

### Option A: Monolithic single-file server

- **Summary**: One `index.ts` file with all tools registered inline
- **Pros**: Simple to start; easy to understand; fast to build
- **Cons**: Gets unwieldy beyond ~10 tools; hard to test individual tools
- **Complexity**: Low
- **Risk**: Low initially, grows with scope

### Option B: Modular server with tool-per-file architecture

- **Summary**: Core server in `src/index.ts`, Redmine API client in `src/redmine-client.ts`, each tool group (issues, projects, users, etc.) in separate files under `src/tools/`
- **Pros**: Clean separation; easy to test; easy to add new tools; follows SRP
- **Cons**: Slightly more boilerplate upfront
- **Complexity**: Medium
- **Risk**: Low

### Option C: Plugin-based dynamic tool loading

- **Summary**: Tools are discovered and loaded dynamically from a `plugins/` directory at runtime
- **Pros**: Maximum extensibility; hot-reload potential
- **Cons**: Over-engineered for this scope; harder to debug; type safety challenges
- **Complexity**: High
- **Risk**: Medium — unnecessary complexity for an MCP server

## Recommendation

**Option B — Modular server with tool-per-file architecture.**

It provides the right balance of simplicity and maintainability. The Redmine API client can be tested independently, tools are isolated and easy to add/remove, and the structure scales well as we add more Redmine endpoints. The initial boilerplate is minimal (a few extra files) and pays off immediately when we want to test or extend.

### Proposed structure

```
src/
  index.ts              # McpServer setup + transport + tool registration
  redmine-client.ts     # HTTP client wrapper (auth, base URL, error handling)
  types.ts              # Shared TypeScript types
  tools/
    issues.ts           # list, get, create, update issues
    projects.ts         # list, get projects
    users.ts            # list, get current user
    time-entries.ts     # list, create time entries
    wiki.ts             # get, update wiki pages
```

### Auth config via environment variables

```
REDMINE_URL=https://redmine.example.com
REDMINE_AUTH_TYPE=apikey|basic
REDMINE_API_KEY=abc123
REDMINE_USERNAME=user
REDMINE_PASSWORD=pass
```

## Acceptance criteria

- [ ] MCP server starts via stdio and is discoverable by AI agents (e.g. VS Code MCP config)
- [ ] Supports configuring Redmine domain via `REDMINE_URL` env var
- [ ] Supports API Key auth via `REDMINE_API_KEY` env var
- [ ] Supports Basic Auth via `REDMINE_USERNAME` + `REDMINE_PASSWORD` env vars
- [ ] Exposes at minimum: list issues, get issue, create issue, update issue
- [ ] Exposes at minimum: list projects, get project
- [ ] All tools use Zod schemas for input validation
- [ ] Error responses from Redmine are handled gracefully (no crashes, clear error messages)
- [ ] Secrets are never logged or exposed in tool output
- [ ] Pagination is supported for list endpoints
- [ ] Project builds and runs without errors (`npm run build`, `node dist/index.js`)
- [ ] README with setup instructions and MCP client configuration example
