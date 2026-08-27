import { getPlexAnimeMovies } from "../../../shared/plex-client";
import { cachedJson, type PagesFunctionContext, type PlexPagesEnv } from "../../_lib/pages";

export async function onRequestGet(context: PagesFunctionContext<PlexPagesEnv>) {
  const url = new URL(context.request.url);
  const limitParam = url.searchParams.get("limit");
  const limitRaw = limitParam == null ? NaN : Number(limitParam);
  const limit = Number.isFinite(limitRaw)
    ? Math.max(1, Math.min(10_000, Math.trunc(limitRaw)))
    : undefined;

  return cachedJson(context, {
    cacheName: "plex-api",
    cacheKey: context.request.url,
    load: () => getPlexAnimeMovies(context.env, { limit }),
    fallbackMessage: "The Plex anime movies library is not configured",
  });
}
