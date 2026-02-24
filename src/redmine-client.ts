import { RedmineConfig } from "./types.js";

/**
 * HTTP client for the Redmine REST API.
 * Handles authentication (API Key or Basic Auth), request/response formatting,
 * error handling, and pagination.
 */
export class RedmineClient {
  private baseUrl: string;
  private headers: Record<string, string>;
  private timeoutMs: number;

  constructor(config: RedmineConfig, timeoutMs = 30000) {
    this.baseUrl = config.url;
    this.timeoutMs = timeoutMs;
    this.headers = {
      "Content-Type": "application/json",
      Accept: "application/json",
    };

    if (config.apiKey) {
      this.headers["X-Redmine-API-Key"] = config.apiKey;
    } else if (config.username && config.password) {
      const credentials = Buffer.from(
        `${config.username}:${config.password}`
      ).toString("base64");
      this.headers["Authorization"] = `Basic ${credentials}`;
    }
  }

  /**
   * Perform a GET request to the Redmine API.
   */
  async get<T>(
    path: string,
    params?: Record<string, string | number | undefined>
  ): Promise<T> {
    const url = this.buildUrl(path, params);
    return this.request<T>("GET", url);
  }

  /**
   * Perform a POST request to the Redmine API.
   */
  async post<T>(path: string, body: unknown): Promise<T> {
    const url = this.buildUrl(path);
    return this.request<T>("POST", url, body);
  }

  /**
   * Perform a PUT request to the Redmine API.
   */
  async put<T>(path: string, body: unknown): Promise<T> {
    const url = this.buildUrl(path);
    return this.request<T>("PUT", url, body);
  }

  /**
   * Perform a DELETE request to the Redmine API.
   */
  async delete<T>(path: string): Promise<T> {
    const url = this.buildUrl(path);
    return this.request<T>("DELETE", url);
  }

  /**
   * Build a full URL with query parameters.
   */
  private buildUrl(
    path: string,
    params?: Record<string, string | number | undefined>
  ): string {
    const url = new URL(`${this.baseUrl}${path}`);
    if (params) {
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== null && value !== "") {
          url.searchParams.set(key, String(value));
        }
      }
    }
    return url.toString();
  }

  /**
   * Perform an HTTP request with timeout and error handling.
   */
  private async request<T>(
    method: string,
    url: string,
    body?: unknown
  ): Promise<T> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await fetch(url, {
        method,
        headers: this.headers,
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });

      if (!response.ok) {
        const errorBody = await this.safeReadBody(response);
        throw new RedmineApiError(
          `Redmine API error: ${response.status} ${response.statusText}`,
          response.status,
          errorBody
        );
      }

      // Some endpoints (PUT, DELETE) may return empty body
      const text = await response.text();
      if (!text) {
        return {} as T;
      }

      return JSON.parse(text) as T;
    } catch (error) {
      if (error instanceof RedmineApiError) {
        throw error;
      }
      if (error instanceof Error) {
        if (error.name === "AbortError") {
          throw new RedmineApiError(
            `Request to Redmine timed out after ${this.timeoutMs}ms`,
            408
          );
        }
        throw new RedmineApiError(
          `Failed to connect to Redmine: ${error.message}`,
          0
        );
      }
      throw new RedmineApiError("Unknown error connecting to Redmine", 0);
    } finally {
      clearTimeout(timeout);
    }
  }

  /**
   * Safely read the response body for error messages, never exposing auth info.
   */
  private async safeReadBody(
    response: Response
  ): Promise<string | undefined> {
    try {
      const text = await response.text();
      // Try to parse and extract error messages
      try {
        const json = JSON.parse(text);
        if (json.errors) {
          return Array.isArray(json.errors)
            ? json.errors.join(", ")
            : String(json.errors);
        }
        return text;
      } catch {
        return text;
      }
    } catch {
      return undefined;
    }
  }
}

/**
 * Custom error class for Redmine API errors.
 * Never includes auth credentials in error messages.
 */
export class RedmineApiError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly details?: string
  ) {
    super(details ? `${message} — ${details}` : message);
    this.name = "RedmineApiError";
  }
}
