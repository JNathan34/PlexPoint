import { authResponse } from "../../../../shared/portal/auth.js";

export async function onRequest({ request, env, params }) {
  return authResponse(request, env, params.action);
}
