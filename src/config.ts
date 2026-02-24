import { RedmineConfig } from "./types.js";

/**
 * Load and validate Redmine configuration from environment variables.
 *
 * Required:
 *   REDMINE_URL — Base URL of the Redmine instance (e.g. https://redmine.example.com)
 *
 * Auth (one of these is required):
 *   REDMINE_API_KEY — API key for authentication
 *   REDMINE_USERNAME + REDMINE_PASSWORD — Basic auth credentials
 */
export function loadConfig(): RedmineConfig {
  const url = process.env.REDMINE_URL;
  if (!url) {
    throw new Error(
      "REDMINE_URL environment variable is required. " +
        "Set it to your Redmine instance URL (e.g. https://redmine.example.com)"
    );
  }

  // Remove trailing slash
  const normalizedUrl = url.replace(/\/+$/, "");

  const apiKey = process.env.REDMINE_API_KEY;
  const username = process.env.REDMINE_USERNAME;
  const password = process.env.REDMINE_PASSWORD;

  if (!apiKey && !username) {
    throw new Error(
      "Authentication is required. Set either:\n" +
        "  - REDMINE_API_KEY for API key authentication, or\n" +
        "  - REDMINE_USERNAME and REDMINE_PASSWORD for basic authentication"
    );
  }

  if (username && !password) {
    throw new Error(
      "REDMINE_PASSWORD is required when using REDMINE_USERNAME for basic authentication"
    );
  }

  return {
    url: normalizedUrl,
    apiKey,
    username,
    password,
  };
}
