import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { RedmineClient } from "../redmine-client.js";
import { RedmineUser } from "../types.js";

/**
 * Register User-related tools with the MCP server.
 */
export function registerUserTools(
  server: McpServer,
  client: RedmineClient
): void {
  // --- Get Current User ---
  server.tool(
    "get-current-user",
    "Get the currently authenticated Redmine user",
    {},
    async () => {
      const data = await client.get<{ user: RedmineUser }>(
        "/users/current.json",
        {
          include: "memberships,groups",
        }
      );

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(data.user, null, 2),
          },
        ],
      };
    }
  );

  // --- List Users ---
  server.tool(
    "list-users",
    "List Redmine users (requires admin privileges)",
    {
      status: z
        .number()
        .optional()
        .describe(
          "Filter by status: 0=anonymous, 1=active, 2=registered, 3=locked"
        ),
      name: z
        .string()
        .optional()
        .describe("Filter by name or login (partial match)"),
      group_id: z
        .number()
        .optional()
        .describe("Filter by group ID"),
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
        users: RedmineUser[];
        total_count: number;
        offset: number;
        limit: number;
      }>("/users.json", {
        status: args.status,
        name: args.name,
        group_id: args.group_id,
        limit: args.limit ?? 25,
        offset: args.offset ?? 0,
      });

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(
              {
                users: data.users,
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
