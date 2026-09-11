import { defaultLinks, defaultArticles } from "../../assets/portal-content.js";
import { normalizeContent } from "../../assets/portal-utils.js";

export const publicContentQueries = {
  links: "SELECT id, title, description, url FROM service_links WHERE enabled = 1 ORDER BY sort_order, title LIMIT 100",
  articles: "SELECT slug, title, summary, body_markdown, category FROM help_articles WHERE published = 1 ORDER BY sort_order, title LIMIT 200",
};

export async function loadPublicContent(database) {
  if (!database) {
    return { ...normalizeContent({ links: defaultLinks, articles: defaultArticles }), source: "bundled" };
  }
  const [links, articles] = await Promise.all([
    database.prepare(publicContentQueries.links).all(),
    database.prepare(publicContentQueries.articles).all(),
  ]);
  if (links.success === false || articles.success === false) throw new Error("Content query failed");
  return { ...normalizeContent({ links: links.results, articles: articles.results }), source: "database" };
}

export async function publicContentResponse(env) {
  try {
    return Response.json(await loadPublicContent(env.PORTAL_DB), {
      headers: { "Cache-Control": "public, max-age=60", "X-Content-Type-Options": "nosniff" },
    });
  } catch {
    return Response.json({ message: "Updated guides are temporarily unavailable." }, {
      status: 503, headers: { "Cache-Control": "no-store" },
    });
  }
}
