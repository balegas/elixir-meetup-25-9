import { config } from "../config";

// Create Basic Auth header
export function createAuthHeader(): string {
  const credentials = btoa(`${config.auth.username}:${config.auth.password}`);
  const header = `Basic ${credentials}`;

  return header;
}

// Fetch with authentication
export async function authenticatedFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const headers = new Headers(options.headers);
  headers.set("Authorization", createAuthHeader());
  headers.set("Accept", "application/json");

  return fetch(url, {
    ...options,
    headers,
  });
}
