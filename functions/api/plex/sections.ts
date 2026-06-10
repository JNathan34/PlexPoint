import { getPlexSections } from "../../../shared/plex-client";
import { cachedJson, type PagesFunctionContext, type PlexPagesEnv } from "../../_lib/pages";

export async function onRequestGet(context: PagesFunctionContext<PlexPagesEnv>) {
  return cachedJson(context, {
    cacheName: "plex-api",
    cacheKey: context.request.url,
    load: () => getPlexSections(context.env),
    fallbackMessage: "Plex integration not configured (set PLEX_URL and PLEX_TOKEN)",
  });
}
