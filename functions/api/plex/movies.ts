import { getPlexMovies } from "../../../shared/plex-client";
import { errorMessage, json, type PagesFunctionContext, type PlexPagesEnv } from "../../_lib/pages";

export async function onRequestGet(context: PagesFunctionContext<PlexPagesEnv>) {
  try {
    const url = new URL(context.request.url);
    const limitRaw = Number(url.searchParams.get("limit"));
    const limit = Number.isFinite(limitRaw) ? Math.max(1, Math.min(10_000, Math.trunc(limitRaw))) : undefined;

    const movies = await getPlexMovies(context.env, { limit });
    return json(movies);
  } catch (error) {
    return json(
      {
        message: errorMessage(error, "Plex integration not configured (set PLEX_URL and PLEX_TOKEN)"),
      },
      { status: 501 },
    );
  }
}

