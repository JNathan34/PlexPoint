export function publicHref(value) {
  if (typeof value !== "string" || !value || value !== value.trim() || /[\s\\\u0000-\u001f\u007f]/.test(value)) return null;
  if (value.startsWith("/") && !value.startsWith("//")) return value;
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" || url.username || url.password) return null;
    return url.href;
  } catch { return null; }
}

export function normalizeContent(content) {
  if (!content || !Array.isArray(content.links) || !Array.isArray(content.articles)) {
    throw new TypeError("Invalid portal content");
  }
  const text = (value, limit) => typeof value === "string" && value.trim().length > 0 && value.length <= limit;
  const seenLinks = new Set();
  const seenArticles = new Set();
  return {
    links: content.links.filter((link) => {
      if (!link || !text(link.id, 100) || seenLinks.has(link.id) || !text(link.title, 160)
        || !text(link.description, 1000) || !publicHref(link.url)) return false;
      seenLinks.add(link.id);
      return true;
    }).map(({ id, title, description, url }) => ({ id, title, description, url: publicHref(url) })),
    articles: content.articles.filter((article) => {
      if (!article || typeof article.slug !== 'string' || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(article.slug)
        || article.slug.length > 100 || seenArticles.has(article.slug) || !text(article.title, 160)
        || !text(article.summary, 1000) || !text(article.category, 80) || !text(article.body_markdown, 50000)) return false;
      seenArticles.add(article.slug);
      return true;
    }).map(({ slug, title, summary, category, body_markdown }) => ({ slug, title, summary, category, body_markdown })),
  };
}

export function filterArticles(articles, query = "", category = "all") {
  const words = query.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
  return articles.filter((article) => {
    const haystack = `${article.title} ${article.summary} ${article.body_markdown} ${article.category}`.toLocaleLowerCase();
    return (category === "all" || article.category === category) && words.every((word) => haystack.includes(word));
  });
}

export function guideSlug(hash) {
  if (typeof hash !== "string") return null;
  const match = /^#(?:help\/|guide-)([a-z0-9]+(?:-[a-z0-9]+)*)$/.exec(hash);
  return match ? match[1] : null;
}

// Deliberately small Markdown subset: headings, lists and paragraphs. No raw HTML.
export function articleBlocks(markdown) {
  const blocks = [];
  for (const line of markdown.replace(/\r\n?/g, "\n").split("\n")) {
    const value = line.trim();
    if (!value) { blocks.push({ type: "break" }); continue; }
    const heading = /^(#{2,3})\s+(.+)$/.exec(value);
    const item = /^(?:(\d+)\.\s+|[-*]\s+)(.+)$/.exec(value);
    if (heading) blocks.push({ type: "heading", text: heading[2] });
    else if (item) {
      const type = item[1] ? "ordered" : "unordered";
      const previous = blocks.at(-1);
      if (previous?.type === type) previous.items.push(item[2]);
      else blocks.push({ type, items: [item[2]] });
    } else {
      const previous = blocks.at(-1);
      if (previous?.type === "paragraph") previous.text += ` ${value}`;
      else blocks.push({ type: "paragraph", text: value });
    }
  }
  return blocks.filter((block) => block.type !== "break");
}

export function supportMessage({ topic, device, details }) {
  return [`Hi Jacob,`, "", `I need help with: ${topic.trim() || 'PlexPoint'}.`,
    device.trim() ? `Device: ${device.trim()}` : "", "", details.trim()].filter((line, i, lines) => line || lines[i - 1] !== "").join("\n");
}
