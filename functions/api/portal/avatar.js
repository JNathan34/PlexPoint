import { avatarResponse } from "../../../shared/portal/overseerr.js";

export async function onRequest({ request, env }) {
  return avatarResponse(request, env);
}
