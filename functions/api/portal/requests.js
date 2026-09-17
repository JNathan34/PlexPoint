import { requestsResponse } from "../../../shared/portal/overseerr.js";

export async function onRequest({ request, env }) {
  return requestsResponse(request, env);
}
