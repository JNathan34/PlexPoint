import { billingResponse } from "../../../shared/portal/billing.js";

export async function onRequest({ request, env }) {
  return billingResponse(request, env);
}
