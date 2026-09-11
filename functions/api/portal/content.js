import { publicContentResponse } from "../../../shared/portal/content.js";

export async function onRequestGet(context) {
  return publicContentResponse(context.env);
}
