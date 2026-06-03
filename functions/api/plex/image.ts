import { plexFetchImage } from "../../../shared/plex-client";
import { errorMessage, json, type PagesFunctionContext, type PlexPagesEnv } from "../../_lib/pages";

export async function onRequestGet(context: PagesFunctionContext<PlexPagesEnv>) {
  try {
    const url = new URL(context.request.url);
    const path = url.searchParams.get("path");

    if (typeof path !== "string" || !path.startsWith("/")) {
      return json({ message: "Query param 'path' must be a Plex path starting with '/'" }, { status: 400 });
    }

    const widthRaw = Number(url.searchParams.get("w"));
    const heightRaw = Number(url.searchParams.get("h"));
    const width = Number.isFinite(widthRaw) && widthRaw > 0 ? Math.max(40, Math.min(2000, Math.trunc(widthRaw))) : undefined;
    const height = Number.isFinite(heightRaw) && heightRaw > 0 ? Math.max(40, Math.min(2000, Math.trunc(heightRaw))) : undefined;

    const cacheKey = new Request(url.toString(), context.request);
    const cache = await caches.open("plex-images");
    const cached = await cache.match(cacheKey);
    if (cached) return cached;

    const upstream = await plexFetchImage(context.env, path, { width, height });
    if (!upstream.ok) {
      const body = (await upstream.text().catch(() => "")) || upstream.statusText;
      return new Response(body, {
        status: upstream.status,
        headers: upstream.headers,
      });
    }

    const headers = new Headers(upstream.headers);
    headers.set("Cache-Control", "public, max-age=604800, stale-while-revalidate=86400, immutable");

    const response = new Response(upstream.body, {
      status: upstream.status,
      headers,
    });

    context.waitUntil(cache.put(cacheKey, response.clone()));
    return response;
  } catch (error) {
    return json(
      {
        message: errorMessage(error, "Plex integration not configured (set PLEX_URL and PLEX_TOKEN)"),
      },
      { status: 501 },
    );
  }
}
