import { adminUsersResponse } from "../../../../shared/portal/admin.js";

export async function onRequest({ request, env }) {
  return adminUsersResponse(request, env);
}
