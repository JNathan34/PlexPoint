import { activityResponse } from "../../../shared/portal/activity.js";

export async function onRequest({ request, env }) {
  return activityResponse(request, env);
}
