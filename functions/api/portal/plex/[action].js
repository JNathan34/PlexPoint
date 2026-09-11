import { plexAuthResponse } from "../../../../shared/portal/plex-auth.js";

export async function onRequest({ request, env, params }) {
  return plexAuthResponse(request, env, params.action);
}
