import { referralsResponse } from "../../../shared/portal/referrals.js";

export async function onRequest({ request, env }) {
  return referralsResponse(request, env);
}
