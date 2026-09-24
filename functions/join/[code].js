import { referralLandingResponse } from "../../shared/portal/referrals.js";

export async function onRequest({ request, env, params }) {
  return referralLandingResponse(request, env, params.code);
}
