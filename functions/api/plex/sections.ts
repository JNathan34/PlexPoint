import { getPlexSections } from "../../../shared/plex-client";
import { errorMessage, json, type PagesFunctionContext, type PlexPagesEnv } from "../../_lib/pages";

export async function onRequestGet(context: PagesFunctionContext<PlexPagesEnv>) {
  try {
    const sections = await getPlexSections(context.env);
    return json(sections);
  } catch (error) {
    return json(
      {
        message: errorMessage(error, "Plex integration not configured (set PLEX_URL and PLEX_TOKEN)"),
      },
      { status: 501 },
    );
  }
}
