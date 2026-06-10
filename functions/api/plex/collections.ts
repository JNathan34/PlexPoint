import { getPlexCollections } from "../../../shared/plex-client";
import { cachedJson, type PagesFunctionContext, type PlexPagesEnv } from "../../_lib/pages";

export async function onRequestGet(context: PagesFunctionContext<PlexPagesEnv>) {
  const url = new URL(context.request.url);
  const sectionId = url.searchParams.get("sectionId") ?? undefined;

  return cachedJson(context, {
    cacheName: "plex-api",
    cacheKey: context.request.url,
    load: () => getPlexCollections(context.env, { sectionId }),
    fallbackMessage: "Plex integration not configured (set PLEX_URL and PLEX_TOKEN)",
  });
}
