import { getPlexCollections } from "../../../shared/plex-client";
import { errorMessage, json, type PagesFunctionContext, type PlexPagesEnv } from "../../_lib/pages";

export async function onRequestGet(context: PagesFunctionContext<PlexPagesEnv>) {
  try {
    const url = new URL(context.request.url);
    const sectionId = url.searchParams.get("sectionId") ?? undefined;
    const collections = await getPlexCollections(context.env, { sectionId });
    return json(collections);
  } catch (error) {
    return json(
      {
        message: errorMessage(error, "Plex integration not configured (set PLEX_URL and PLEX_TOKEN)"),
      },
      { status: 501 },
    );
  }
}
