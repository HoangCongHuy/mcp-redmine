import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { RedmineClient } from "../redmine-client.js";
import { RedmineTimeEntry } from "../types.js";

/**
 * Register Time Entry tools with the MCP server.
 */
export function registerTimeEntryTools(
  server: McpServer,
  client: RedmineClient
): void {
  // --- List Time Entries ---
  server.tool(
    "list-time-entries",
    "List time entries from Redmine with optional filters",
    {
      project_id: z
        .string()
        .optional()
        .describe("Filter by project ID or identifier"),
      user_id: z
        .number()
        .optional()
        .describe("Filter by user ID"),
      from: z
        .string()
        .optional()
        .describe("Start date filter (YYYY-MM-DD)"),
      to: z
        .string()
        .optional()
        .describe("End date filter (YYYY-MM-DD)"),
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
        time_entries: RedmineTimeEntry[];
        total_count: number;
        offset: number;
        limit: number;
      }>("/time_entries.json", {
        project_id: args.project_id,
        user_id: args.user_id,
        from: args.from,
        to: args.to,
        limit: args.limit ?? 25,
        offset: args.offset ?? 0,
      });

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(
              {
                time_entries: data.time_entries,
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

  // --- Create Time Entry ---
  server.tool(
    "create-time-entry",
    "Log time in Redmine",
    {
      issue_id: z
        .number()
        .optional()
        .describe("Issue ID to log time against (either issue_id or project_id required)"),
      project_id: z
        .string()
        .optional()
        .describe("Project ID to log time against (either issue_id or project_id required)"),
      hours: z.number().positive().describe("Number of hours spent"),
      activity_id: z
        .number()
        .optional()
        .describe("Time entry activity ID"),
      comments: z
        .string()
        .optional()
        .describe("Description of the work done"),
      spent_on: z
        .string()
        .optional()
        .describe("Date the time was spent (YYYY-MM-DD, defaults to today)"),
    },
    async (args) => {
      const { ...entryFields } = args;
      const data = await client.post<{ time_entry: RedmineTimeEntry }>(
        "/time_entries.json",
        {
          time_entry: entryFields,
        }
      );

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(data.time_entry, null, 2),
          },
        ],
      };
    }
  );
}
