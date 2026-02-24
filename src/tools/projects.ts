import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { RedmineClient } from "../redmine-client.js";
import { RedmineProject } from "../types.js";

/**
 * Register Project-related tools with the MCP server.
 */
export function registerProjectTools(
  server: McpServer,
  client: RedmineClient
): void {
  // --- List Projects ---
  server.tool(
    "list-projects",
    "List all accessible projects in Redmine",
    {
      include: z
        .string()
        .optional()
        .describe(
          "Comma-separated associations: trackers, issue_categories, enabled_modules, time_entry_activities"
        ),
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
      const data = await client.get<{
        projects: RedmineProject[];
        total_count: number;
        offset: number;
        limit: number;
      }>("/projects.json", {
        include: args.include,
        limit: args.limit ?? 25,
        offset: args.offset ?? 0,
      });

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(
              {
                projects: data.projects,
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

  // --- Get Project ---
  server.tool(
    "get-project",
    "Get a single Redmine project by ID or identifier",
    {
      project_id: z
        .string()
        .describe("Project numeric ID or string identifier"),
      include: z
        .string()
        .optional()
        .describe(
          "Comma-separated associations: trackers, issue_categories, enabled_modules, time_entry_activities"
        ),
    },
    async (args) => {
      const data = await client.get<{ project: RedmineProject }>(
        `/projects/${args.project_id}.json`,
        {
          include: args.include,
        }
      );

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(data.project, null, 2),
          },
        ],
      };
    }
  );
}
