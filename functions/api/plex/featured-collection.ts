import { getFeaturedCollection } from "../../../shared/plex-client";
import { errorMessage, json, type PagesFunctionContext, type PlexPagesEnv } from "../../_lib/pages";

export async function onRequestGet(context: PagesFunctionContext<PlexPagesEnv>) {
  try {
    const url = new URL(context.request.url);
    const collectionId = url.searchParams.get("id") ?? undefined;
    const collectionTitle = url.searchParams.get("title") ?? undefined;
    const limitRaw = Number(url.searchParams.get("limit"));
    const limit = Number.isFinite(limitRaw) ? Math.max(1, Math.min(500, Math.trunc(limitRaw))) : undefined;

    const collection = await getFeaturedCollection(context.env, {
      collectionId,
      collectionTitle,
      limit,
    });

    return json(collection);
  } catch (error) {
    return json(
      {
        message: errorMessage(
          error,
          "Plex integration not configured (set PLEX_URL, PLEX_TOKEN, and a collection id or title)",
        ),
      },
      { status: 501 },
    );
  }
}
