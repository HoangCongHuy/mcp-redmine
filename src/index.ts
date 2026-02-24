#!/usr/bin/env node

/**
 * MCP Server for Redmine
 *
 * Connects AI agents to a Redmine instance via the Model Context Protocol.
 * Supports API Key and Basic Auth authentication.
 *
 * Configuration via environment variables:
 *   REDMINE_URL       - Base URL of the Redmine instance (required)
 *   REDMINE_API_KEY   - API key for authentication
 *   REDMINE_USERNAME  - Username for basic auth
 *   REDMINE_PASSWORD  - Password for basic auth
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { loadConfig } from "./config.js";
import { RedmineClient } from "./redmine-client.js";
import { registerIssueTools } from "./tools/issues.js";
import { registerProjectTools } from "./tools/projects.js";
import { registerUserTools } from "./tools/users.js";
import { registerTimeEntryTools } from "./tools/time-entries.js";
import { registerWikiTools } from "./tools/wiki.js";
import { registerSearchTools } from "./tools/search.js";

async function main(): Promise<void> {
  // Load and validate configuration
  const config = loadConfig();

  // Create the Redmine API client
  const redmineClient = new RedmineClient(config);

  // Create the MCP server
  const server = new McpServer({
    name: "mcp-redmine",
    version: "1.0.0",
  });

  // Register all tools
  registerIssueTools(server, redmineClient);
  registerProjectTools(server, redmineClient);
  registerUserTools(server, redmineClient);
  registerTimeEntryTools(server, redmineClient);
  registerWikiTools(server, redmineClient);
  registerSearchTools(server, redmineClient);

  // Connect via stdio
  const transport = new StdioServerTransport();
  await server.connect(transport);

  // Log to stderr (stdout is reserved for MCP protocol)
  console.error("mcp-redmine server started");
  console.error(`Connected to: ${config.url}`);
  console.error(
    `Auth method: ${config.apiKey ? "API Key" : "Basic Auth"}`
  );
}

// Handle graceful shutdown
process.on("SIGINT", () => {
  console.error("mcp-redmine server shutting down...");
  process.exit(0);
});

process.on("SIGTERM", () => {
  console.error("mcp-redmine server shutting down...");
  process.exit(0);
});

// Start the server
main().catch((error) => {
  console.error("Failed to start mcp-redmine server:", error.message);
  process.exit(1);
});
