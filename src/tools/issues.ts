import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { RedmineClient } from "../redmine-client.js";
import { RedmineIssue } from "../types.js";

/**
 * Register Issue-related tools with the MCP server.
 */
export function registerIssueTools(
  server: McpServer,
  client: RedmineClient
): void {
  // --- List Issues ---
  server.tool(
    "list-issues",
    "List issues from Redmine with optional filters",
    {
      project_id: z
        .string()
        .optional()
        .describe("Project ID or identifier to filter by"),
      status_id: z
        .string()
        .optional()
        .describe(
          "Status filter: 'open', 'closed', '*' for all, or a specific status ID"
        ),
      tracker_id: z
        .number()
        .optional()
        .describe("Tracker ID to filter by"),
      assigned_to_id: z
        .string()
        .optional()
        .describe("Assignee user ID, or 'me' for current user"),
      query_id: z
        .number()
        .optional()
        .describe("Saved query ID to use"),
      sort: z
        .string()
        .optional()
        .describe(
          "Sort field and direction, e.g. 'updated_on:desc', 'priority:asc'"
        ),
      limit: z
        .number()
        .min(1)
        .max(100)
        .optional()
        .describe("Max results to return (1-100, default 25)"),
      offset: z
        .number()
        .min(0)
        .optional()
        .describe("Offset for pagination"),
    },
    async (args) => {
      const data = await client.get<{
        issues: RedmineIssue[];
        total_count: number;
        offset: number;
        limit: number;
      }>("/issues.json", {
        project_id: args.project_id,
        status_id: args.status_id,
        tracker_id: args.tracker_id,
        assigned_to_id: args.assigned_to_id,
        query_id: args.query_id,
        sort: args.sort,
        limit: args.limit ?? 25,
        offset: args.offset ?? 0,
      });

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(
              {
                issues: data.issues,
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

  // --- Get Issue ---
  server.tool(
    "get-issue",
    "Get a single Redmine issue by ID with full details",
    {
      issue_id: z.number().describe("Issue ID"),
      include: z
        .string()
        .optional()
        .describe(
          "Comma-separated list of associations to include: children, attachments, relations, changesets, journals, watchers, allowed_statuses"
        ),
    },
    async (args) => {
      const data = await client.get<{ issue: RedmineIssue }>(
        `/issues/${args.issue_id}.json`,
        {
          include: args.include,
        }
      );

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(data.issue, null, 2),
          },
        ],
      };
    }
  );

  // --- Create Issue ---
  server.tool(
    "create-issue",
    "Create a new issue in Redmine",
    {
      project_id: z
        .string()
        .describe("Project ID or identifier (required)"),
      subject: z.string().describe("Issue subject/title"),
      description: z
        .string()
        .optional()
        .describe("Issue description (supports Textile/Markdown)"),
      tracker_id: z.number().optional().describe("Tracker ID"),
      status_id: z.number().optional().describe("Status ID"),
      priority_id: z.number().optional().describe("Priority ID"),
      assigned_to_id: z
        .number()
        .optional()
        .describe("User ID to assign to"),
      category_id: z
        .number()
        .optional()
        .describe("Issue category ID"),
      fixed_version_id: z
        .number()
        .optional()
        .describe("Target version ID"),
      parent_issue_id: z
        .number()
        .optional()
        .describe("Parent issue ID"),
      estimated_hours: z
        .number()
        .optional()
        .describe("Estimated hours"),
      start_date: z
        .string()
        .optional()
        .describe("Start date (YYYY-MM-DD)"),
      due_date: z
        .string()
        .optional()
        .describe("Due date (YYYY-MM-DD)"),
      is_private: z
        .boolean()
        .optional()
        .describe("Whether the issue is private"),
    },
    async (args) => {
      const { project_id, ...issueFields } = args;
      const data = await client.post<{ issue: RedmineIssue }>(
        "/issues.json",
        {
          issue: {
            project_id,
            ...issueFields,
          },
        }
      );

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(data.issue, null, 2),
          },
        ],
      };
    }
  );

  // --- Update Issue ---
  server.tool(
    "update-issue",
    "Update an existing Redmine issue",
    {
      issue_id: z.number().describe("Issue ID to update"),
      subject: z.string().optional().describe("New subject/title"),
      description: z
        .string()
        .optional()
        .describe("New description"),
      status_id: z.number().optional().describe("New status ID"),
      priority_id: z
        .number()
        .optional()
        .describe("New priority ID"),
      assigned_to_id: z
        .number()
        .optional()
        .describe("New assignee user ID"),
      tracker_id: z
        .number()
        .optional()
        .describe("New tracker ID"),
      category_id: z
        .number()
        .optional()
        .describe("New category ID"),
      fixed_version_id: z
        .number()
        .optional()
        .describe("New target version ID"),
      done_ratio: z
        .number()
        .min(0)
        .max(100)
        .optional()
        .describe("Completion percentage (0-100)"),
      estimated_hours: z
        .number()
        .optional()
        .describe("New estimated hours"),
      notes: z
        .string()
        .optional()
        .describe("Comment/note to add to the issue"),
      private_notes: z
        .boolean()
        .optional()
        .describe("Whether the note is private"),
    },
    async (args) => {
      const { issue_id, ...issueFields } = args;
      await client.put(`/issues/${issue_id}.json`, {
        issue: issueFields,
      });

      return {
        content: [
          {
            type: "text" as const,
            text: `Issue #${issue_id} updated successfully.`,
          },
        ],
      };
    }
  );
}
