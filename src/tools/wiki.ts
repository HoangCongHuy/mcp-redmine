import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { RedmineClient } from "../redmine-client.js";
import { RedmineWikiPage, RedmineWikiPageIndex } from "../types.js";

/**
 * Register Wiki-related tools with the MCP server.
 */
export function registerWikiTools(
  server: McpServer,
  client: RedmineClient
): void {
  // --- Get Wiki Page ---
  server.tool(
    "get-wiki-page",
    "Get a wiki page from a Redmine project",
    {
      project_id: z
        .string()
        .describe("Project ID or identifier"),
      title: z
        .string()
        .describe("Wiki page title (use 'Wiki' for the main page)"),
      version: z
        .number()
        .optional()
        .describe("Specific version number to retrieve"),
    },
    async (args) => {
      const path = args.version
        ? `/projects/${args.project_id}/wiki/${encodeURIComponent(args.title)}/${args.version}.json`
        : `/projects/${args.project_id}/wiki/${encodeURIComponent(args.title)}.json`;

      const data = await client.get<{ wiki_page: RedmineWikiPage }>(path);

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(data.wiki_page, null, 2),
          },
        ],
      };
    }
  );

  // --- List Wiki Pages ---
  server.tool(
    "list-wiki-pages",
    "List all wiki pages in a Redmine project",
    {
      project_id: z
        .string()
        .describe("Project ID or identifier"),
    },
    async (args) => {
      const data = await client.get<{
        wiki_pages: RedmineWikiPageIndex[];
      }>(`/projects/${args.project_id}/wiki/index.json`);

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(data.wiki_pages, null, 2),
          },
        ],
      };
    }
  );
}
