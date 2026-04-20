import type { PlexEnv } from "../../shared/plex-client";

export type PagesFunctionContext<Env extends Record<string, unknown> = Record<string, unknown>> = {
  request: Request;
  env: Env;
  params: Record<string, string | undefined>;
  data: Record<string, unknown>;
  waitUntil: (promise: Promise<unknown>) => void;
  next: (input?: Request | string) => Promise<Response>;
};

export type PlexPagesEnv = PlexEnv & Record<string, string | undefined>;

export function json(data: unknown, init: ResponseInit = {}) {
  const headers = new Headers(init.headers);
  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json; charset=utf-8");
  }

  return new Response(JSON.stringify(data), {
    ...init,
    headers,
  });
}

export function errorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}
