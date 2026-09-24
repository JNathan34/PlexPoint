import { adminReferralsResponse } from "../../../../shared/portal/referrals.js";

export async function onRequest({ request, env }) {
  return adminReferralsResponse(request, env);
}
