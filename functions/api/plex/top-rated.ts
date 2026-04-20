import { getTopRated } from "../../../shared/plex-client";
import { errorMessage, json, type PagesFunctionContext, type PlexPagesEnv } from "../../_lib/pages";

export async function onRequestGet(context: PagesFunctionContext<PlexPagesEnv>) {
  try {
    const url = new URL(context.request.url);
    const typeParam = String(url.searchParams.get("type") ?? "tv").toLowerCase();
    const type = typeParam === "movie" ? "movie" : "tv";
    const limitRaw = Number(url.searchParams.get("limit"));
    const limit = Number.isFinite(limitRaw) ? Math.max(1, Math.min(30, Math.trunc(limitRaw))) : 12;

    const items = await getTopRated(context.env, { type, limit });
    return json(items);
  } catch (error) {
    return json(
      {
        message: errorMessage(error, "Plex integration not configured (set PLEX_URL and PLEX_TOKEN)"),
      },
      { status: 501 },
    );
  }
}
