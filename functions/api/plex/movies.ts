import { getPlexMovies } from "../../../shared/plex-client";
import { cachedJson, type PagesFunctionContext, type PlexPagesEnv } from "../../_lib/pages";

export async function onRequestGet(context: PagesFunctionContext<PlexPagesEnv>) {
  const url = new URL(context.request.url);
  const limitRaw = Number(url.searchParams.get("limit"));
  const limit = Number.isFinite(limitRaw) ? Math.max(1, Math.min(10_000, Math.trunc(limitRaw))) : undefined;

  return cachedJson(context, {
    cacheName: "plex-api",
    cacheKey: context.request.url,
    load: () => getPlexMovies(context.env, { limit }),
    fallbackMessage: "Plex integration not configured (set PLEX_URL and PLEX_TOKEN)",
  });
}
