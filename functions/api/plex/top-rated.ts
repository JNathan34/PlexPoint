import { getTopRated } from "../../../shared/plex-client";
import { cachedJson, type PagesFunctionContext, type PlexPagesEnv } from "../../_lib/pages";

export async function onRequestGet(context: PagesFunctionContext<PlexPagesEnv>) {
  const url = new URL(context.request.url);
  const typeParam = String(url.searchParams.get("type") ?? "tv").toLowerCase();
  const type = typeParam === "movie" ? "movie" : "tv";
  const limitParam = url.searchParams.get("limit");
  const limitRaw = limitParam == null ? NaN : Number(limitParam);
  const limit = Number.isFinite(limitRaw) ? Math.max(1, Math.min(30, Math.trunc(limitRaw))) : 12;

  return cachedJson(context, {
    cacheName: "plex-api",
    cacheKey: context.request.url,
    load: () => getTopRated(context.env, { type, limit }),
    fallbackMessage: "Plex integration not configured (set PLEX_URL and PLEX_TOKEN)",
  });
}
