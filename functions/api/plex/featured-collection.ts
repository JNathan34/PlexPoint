import { getFeaturedCollection } from "../../../shared/plex-client";
import { cachedJson, type PagesFunctionContext, type PlexPagesEnv } from "../../_lib/pages";

export async function onRequestGet(context: PagesFunctionContext<PlexPagesEnv>) {
  const url = new URL(context.request.url);
  const collectionId = url.searchParams.get("id") ?? undefined;
  const collectionTitle = url.searchParams.get("title") ?? undefined;
  const limitParam = url.searchParams.get("limit");
  const limitRaw = limitParam == null ? NaN : Number(limitParam);
  const limit = Number.isFinite(limitRaw) ? Math.max(1, Math.min(500, Math.trunc(limitRaw))) : undefined;

  return cachedJson(context, {
    cacheName: "plex-api",
    cacheKey: context.request.url,
    load: () =>
      getFeaturedCollection(context.env, {
        collectionId,
        collectionTitle,
        limit,
      }),
    fallbackMessage: "Plex integration not configured (set PLEX_URL, PLEX_TOKEN, and a collection id or title)",
  });
}
