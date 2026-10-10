import { adminOverseerrUsersResponse } from "../../../../shared/portal/admin-overseerr.js";

export async function onRequest({ request, env }) {
  return adminOverseerrUsersResponse(request, env);
}
