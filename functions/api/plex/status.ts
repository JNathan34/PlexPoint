import { getPlexLibraryCounts, getPlexSections } from "../../../shared/plex-client";
import { json, type PagesFunctionContext, type PlexPagesEnv } from "../../_lib/pages";

function configured(value: string | undefined) {
  return Boolean(value && value.trim().length > 0);
}

function publicMessage(error: unknown) {
  if (!(error instanceof Error)) {
    return "Cloudflare could not reach Plex.";
  }

  if (error.message.startsWith("Missing required env var:")) {
    return error.message;
  }

  return "Cloudflare could not reach Plex. Check that PLEX_URL is reachable from Cloudflare and PLEX_TOKEN is valid.";
}

export async function onRequestGet(context: PagesFunctionContext<PlexPagesEnv>) {
  const startedAt = Date.now();
  const envStatus = {
    plexUrl: configured(context.env.PLEX_URL),
    plexToken: configured(context.env.PLEX_TOKEN),
    movieSectionId: configured(context.env.PLEX_MOVIE_SECTION_ID),
    tvSectionId: configured(context.env.PLEX_TV_SECTION_ID),
    collectionId: configured(context.env.PLEX_COLLECTION_ID),
    collectionTitle: configured(context.env.PLEX_COLLECTION_TITLE),
  };

  try {
    const [sections, counts] = await Promise.all([
      getPlexSections(context.env),
      getPlexLibraryCounts(context.env),
    ]);

    return json({
      ok: true,
      reachable: true,
      env: envStatus,
      sections: {
        movies: sections.filter((section) => section.type === "movie").length,
        shows: sections.filter((section) => section.type === "show").length,
      },
      counts,
      durationMs: Date.now() - startedAt,
    });
  } catch (error) {
    return json(
      {
        ok: false,
        reachable: false,
        env: envStatus,
        message: publicMessage(error),
        durationMs: Date.now() - startedAt,
      },
      { status: 503 },
    );
  }
}
