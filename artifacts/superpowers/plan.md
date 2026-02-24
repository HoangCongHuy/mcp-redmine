# Plan: Build MCP Server for Redmine

## Goal

Create a TypeScript MCP server that lets AI agents interact with Redmine via its REST API, supporting configurable domain, Basic Auth, and API Key authentication.

## Assumptions

- Node.js ≥ 18 is available on the machine
- npm is used as the package manager
- The Redmine instance has REST API enabled
- We use `@modelcontextprotocol/sdk` (latest) for the MCP server
- stdio transport (standard for local MCP integrations)
- All config via environment variables (`REDMINE_URL`, `REDMINE_API_KEY`, `REDMINE_USERNAME`, `REDMINE_PASSWORD`)

## Plan

### 1. Initialize Node.js project + TypeScript config (~5 min)

- **Files**: `package.json`, `tsconfig.json`
- **Change**:
  - `npm init -y` to create `package.json`
  - Install deps: `@modelcontextprotocol/sdk`, `zod`
  - Install dev deps: `typescript`, `@types/node`
  - Create `tsconfig.json` with strict mode, ESM output, `outDir: dist`
  - Add scripts: `build`, `start`, `dev`
- **Verify**:
  ```bash
  npm run build   # should succeed (no src yet, but tsc should not error)
  cat package.json | grep -E '"build"|"start"'
  ```

### 2. Create shared types + config loader (~5 min)

- **Files**: `src/types.ts`, `src/config.ts`
- **Change**:
  - `src/types.ts`: Define TypeScript interfaces for Redmine API responses (Issue, Project, User, TimeEntry, etc.)
  - `src/config.ts`: Load and validate env vars (`REDMINE_URL` required; either `REDMINE_API_KEY` or `REDMINE_USERNAME`+`REDMINE_PASSWORD` required). Throw clear error on missing config.
- **Verify**:
  ```bash
  npm run build   # compiles without errors
  ```

### 3. Build Redmine API client (~10 min)

- **Files**: `src/redmine-client.ts`
- **Change**:
  - Class `RedmineClient` wrapping `fetch()` with:
    - Base URL from config
    - Auth headers (API Key via `X-Redmine-API-Key` or Basic Auth via `Authorization: Basic ...`)
    - JSON content-type headers
    - Timeout handling (e.g. `AbortController` with 30s timeout)
    - Error handling: parse Redmine error responses, throw typed errors
    - Generic `get()`, `post()`, `put()`, `delete()` methods
  - Pagination helper: accept `offset` + `limit`, return `{ items, totalCount }`
- **Verify**:
  ```bash
  npm run build   # compiles without errors
  ```

### 4. Implement Issue tools (~10 min)

- **Files**: `src/tools/issues.ts`
- **Change**:
  - `registerIssueTools(server, client)` function that registers:
    - `list-issues`: list issues with filters (project_id, status, tracker, assigned_to, limit, offset)
    - `get-issue`: get single issue by ID (include journals/relations)
    - `create-issue`: create issue (project_id, subject, description, tracker_id, priority_id, assigned_to_id)
    - `update-issue`: update issue fields (subject, description, status_id, assigned_to_id, notes)
  - All inputs validated via Zod schemas
  - All outputs return `{ content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] }`
- **Verify**:
  ```bash
  npm run build   # compiles without errors
  ```

### 5. Implement Project tools (~5 min)

- **Files**: `src/tools/projects.ts`
- **Change**:
  - `registerProjectTools(server, client)` function that registers:
    - `list-projects`: list all projects (with pagination)
    - `get-project`: get single project by ID or identifier
- **Verify**:
  ```bash
  npm run build   # compiles without errors
  ```

### 6. Implement User tools (~5 min)

- **Files**: `src/tools/users.ts`
- **Change**:
  - `registerUserTools(server, client)` function that registers:
    - `get-current-user`: get the currently authenticated user (`/users/current.json`)
    - `list-users`: list users (admin only, with pagination)
- **Verify**:
  ```bash
  npm run build   # compiles without errors
  ```

### 7. Implement Time Entry tools (~5 min)

- **Files**: `src/tools/time-entries.ts`
- **Change**:
  - `registerTimeEntryTools(server, client)` function that registers:
    - `list-time-entries`: list time entries (filter by project, user, date range)
    - `create-time-entry`: log time (issue_id or project_id, hours, activity_id, comments)
- **Verify**:
  ```bash
  npm run build   # compiles without errors
  ```

### 8. Implement Wiki tools (~5 min)

- **Files**: `src/tools/wiki.ts`
- **Change**:
  - `registerWikiTools(server, client)` function that registers:
    - `get-wiki-page`: get wiki page content by project + title
    - `list-wiki-pages`: list wiki pages in a project
- **Verify**:
  ```bash
  npm run build   # compiles without errors
  ```

### 9. Implement Search tool (~3 min)

- **Files**: `src/tools/search.ts`
- **Change**:
  - `registerSearchTools(server, client)` function that registers:
    - `search-redmine`: search across Redmine (query string, optional scope: issues/projects/wiki)
- **Verify**:
  ```bash
  npm run build   # compiles without errors
  ```

### 10. Wire up the MCP server entry point (~5 min)

- **Files**: `src/index.ts`
- **Change**:
  - Import `McpServer` and `StdioServerTransport` from `@modelcontextprotocol/sdk`
  - Load config from env vars
  - Create `RedmineClient` instance
  - Create `McpServer` with name `mcp-redmine` and version from `package.json`
  - Call all `registerXxxTools()` functions
  - Connect via `StdioServerTransport`
  - Handle graceful shutdown (SIGINT/SIGTERM)
- **Verify**:
  ```bash
  npm run build                   # compiles without errors
  ls dist/index.js                # output exists
  node dist/index.js 2>&1 || true # starts (will error without REDMINE_URL, that's expected)
  ```

### 11. Create README + MCP client config example (~5 min)

- **Files**: `README.md`
- **Change**:
  - Project description
  - Prerequisites (Node.js ≥ 18, Redmine with REST API enabled)
  - Installation: `npm install && npm run build`
  - Configuration: env var table (`REDMINE_URL`, `REDMINE_API_KEY`, `REDMINE_USERNAME`, `REDMINE_PASSWORD`)
  - Usage: how to run (`node dist/index.js`)
  - MCP client config examples (VS Code `.vscode/mcp.json`, Claude Desktop `claude_desktop_config.json`)
  - Available tools list with descriptions
- **Verify**:
  ```bash
  cat README.md | head -20   # sanity check
  ```

### 12. End-to-end verification (~5 min)

- **Files**: (none — verification only)
- **Change**: None
- **Verify**:
  ```bash
  # Full build
  npm run build

  # Check all output files exist
  ls dist/index.js dist/redmine-client.js dist/config.js dist/types.js dist/tools/

  # Dry-run start (will fail without env vars — assert it shows config error, not crash)
  node dist/index.js 2>&1 | head -5

  # If user has a Redmine instance, test with real env vars:
  # REDMINE_URL=https://redmine.example.com REDMINE_API_KEY=xxx node dist/index.js
  ```

## Risks & mitigations

| Risk | Mitigation |
|------|------------|
| `@modelcontextprotocol/sdk` API changes | Pin exact version in `package.json`; check docs before coding |
| Credentials in error output | Sanitize all error messages in `RedmineClient`; never log headers |
| Large API responses overwhelming the agent | Cap `limit` to 25 by default; always paginate |
| Redmine instance unavailable during testing | Steps 1–10 verify compilation only; step 12 is optional live test |
| Destructive API calls (delete) | Only implement create/update in v1; no delete tools |

## Rollback plan

Since this is a greenfield project, rollback is trivial:
- `git reset --hard HEAD` to undo any changes
- Or simply delete the generated files: `rm -rf src/ dist/ node_modules/ package.json tsconfig.json`
