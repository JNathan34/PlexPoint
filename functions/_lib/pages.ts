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
const PLEX_API_CACHE_VERSION = "v4-optional-limit-parsing";

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

function cloneWithHeader(response: Response, name: string, value: string) {
  const headers = new Headers(response.headers);
  headers.set(name, value);

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

function cachedJsonResponse(data: unknown, cacheStatus: "miss" | "refresh") {
  return json(data, {
    headers: {
      "Cache-Control": "public, max-age=60, s-maxage=86400, stale-while-revalidate=86400",
      "X-PlexPoint-Cache": cacheStatus,
      "X-PlexPoint-Cached-At": new Date().toISOString(),
    },
  });
}

export async function cachedJson<T>(
  context: PagesFunctionContext,
  options: {
    cacheName: string;
    cacheKey: RequestInfo | URL;
    load: () => Promise<T>;
    fallbackMessage: string;
  },
) {
  const cache = await caches.open(options.cacheName);
  const cacheUrl = new URL(String(options.cacheKey));
  cacheUrl.searchParams.set("__plexpoint_cache", PLEX_API_CACHE_VERSION);
  const cacheKey = new Request(cacheUrl.toString(), { method: "GET" });
  const cached = await cache.match(cacheKey);

  if (cached) {
    context.waitUntil(
      options
        .load()
        .then((data) => cache.put(cacheKey, cachedJsonResponse(data, "refresh")))
        .catch(() => undefined),
    );

    return cloneWithHeader(cached, "X-PlexPoint-Cache", "hit");
  }

  try {
    const data = await options.load();
    const response = cachedJsonResponse(data, "miss");
    context.waitUntil(cache.put(cacheKey, response.clone()));
    return response;
  } catch (error) {
    return json(
      {
        message: errorMessage(error, options.fallbackMessage),
      },
      { status: 501 },
    );
  }
}
