import { adminRequestCreditsResponse } from "../../../../shared/portal/overseerr.js";

export async function onRequest({ request, env }) {
  return adminRequestCreditsResponse(request, env);
}
