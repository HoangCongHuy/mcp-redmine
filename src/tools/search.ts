import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { RedmineClient } from "../redmine-client.js";
import { RedmineSearchResult } from "../types.js";

/**
 * Register Search tools with the MCP server.
 */
export function registerSearchTools(
  server: McpServer,
  client: RedmineClient
): void {
  // --- Search Redmine ---
  server.tool(
    "search-redmine",
    "Search across Redmine for issues, projects, wiki pages, and more",
    {
      query: z.string().describe("Search query string"),
      scope: z
        .string()
        .optional()
        .describe(
          "Limit search to a specific project ID or identifier"
        ),
      titles_only: z
        .boolean()
        .optional()
        .describe("Search only in titles (default: false)"),
      open_issues: z
        .boolean()
        .optional()
        .describe("Only return open issues (default: false)"),
      limit: z
        .number()
        .min(1)
        .max(100)
        .optional()
        .describe("Max results (1-100, default 25)"),
      offset: z
        .number()
        .min(0)
        .optional()
        .describe("Offset for pagination"),
    },
    async (args) => {
      const params: Record<string, string | number | undefined> = {
        q: args.query,
        limit: args.limit ?? 25,
        offset: args.offset ?? 0,
      };

      if (args.titles_only) {
        params.titles_only = 1;
      }
      if (args.open_issues) {
        params.open_issues = 1;
      }

      const basePath = args.scope
        ? `/projects/${args.scope}/search.json`
        : "/search.json";

      const data = await client.get<{
        results: RedmineSearchResult[];
        total_count: number;
        offset: number;
        limit: number;
      }>(basePath, params);

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(
              {
                results: data.results,
                total_count: data.total_count,
                offset: data.offset,
                limit: data.limit,
              },
              null,
              2
            ),
          },
        ],
      };
    }
  );
}
