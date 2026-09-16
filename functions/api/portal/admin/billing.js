import { adminBillingResponse } from "../../../../shared/portal/billing.js";

export async function onRequest({ request, env }) {
  return adminBillingResponse(request, env);
}
