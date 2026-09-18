import { defaultLinks, defaultArticles, supportContact } from "./portal-content.js?v=20260916-dashboard-1";
import { normalizeContent, publicHref, filterArticles, guideSlug, articleBlocks, supportMessage } from "./portal-utils.js?v=20260916-dashboard-1";

const iconPaths = {
  home: ["m3 10 9-7 9 7", "M5 9v12h14V9M9 21v-8h6v8"],
  grid: ["M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z"],
  book: ["M12 5v16M12 5C8 2 4 3 2 4v16c3-1 7-1 10 1 3-2 7-2 10-1V4c-2-1-6-2-10 1Z"],
  message: ["M21 11a9 9 0 0 1-9 9H4l-3 2 1-7a9 9 0 1 1 19-4Z", "M7 10h10M7 14h6"],
  play: ["m8 4 12 8-12 8V4Z"],
  watch: ["M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0", "m10 8 6 4-6 4V8Z"],
  info: ["M12 8h.01M12 11v6", "M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0"],
  clock: ["M12 7v5l3 2", "M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0"],
  membership: ["m12 3 9 6-9 12L3 9l9-6Z", "M3 9h18M8 9l4 12 4-12"],
  payment: ["M3 5h18v14H3zM3 10h18M6 15h4"],
  film: ["M3 3h18v18H3zM7 3v18M17 3v18M3 8h4M3 16h4M17 8h4M17 16h4"],
  search: ["m16 16 5 5", "M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0"],
  gift: ["M20 12v9H4v-9M2 7h20v5H2zM12 7v14", "M12 7H8.5a2.5 2.5 0 1 1 3.5-3.5L12 7Zm0 0h3.5A2.5 2.5 0 1 0 12 3.5V7Z"],
};

function element(tag, className = "", text = "") {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text) node.textContent = text;
  return node;
}

function icon(name) {
  const node = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  for (const [key, value] of Object.entries({ viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "1.6", "stroke-linecap": "round", "stroke-linejoin": "round", "aria-hidden": "true", class: "pp-icon" })) node.setAttribute(key, value);
  for (const d of iconPaths[name] || iconPaths.grid) {
    const path = document.createElementNS(node.namespaceURI, "path");
    path.setAttribute("d", d);
    node.append(path);
  }
  return node;
}

document.querySelectorAll("[data-icon]").forEach((node) => node.append(icon(node.dataset.icon)));
let content = normalizeContent({ links: defaultLinks, articles: defaultArticles });
let category = "all";
let query = "";
let loading = false;
const search = document.getElementById("help-search");
const announcements = document.getElementById("portal-announcement");

function serviceCard(link) {
  const card = element("a", "pp-card glass-card pp-service");
  card.href = publicHref(link.url);
  const external = new URL(card.href).origin !== location.origin;
  if (external) { card.target = "_blank"; card.rel = "noopener noreferrer"; }
  const tile = element("span", "pp-icon-tile");
  const name = { plex: "play", requests: "search", library: "film", setup: "book", install: "grid" }[link.id];
  tile.append(icon(name));
  const arrow = element("span", "pp-service-arrow", external ? "↗" : "→");
  arrow.setAttribute("aria-hidden", "true");
  card.append(tile, arrow, element("h3", "", link.title), element("p", "", link.description));
  if (external) card.append(element("span", "pp-external-label", "Opens in a new tab"));
  return card;
}

function renderServices() {
  const container = document.getElementById("service-links");
  container.replaceChildren(...content.links.map(serviceCard));
  if (!content.links.length) container.append(element("p", "pp-muted", "No services are currently listed."));
}

async function copyText(text, success, target = announcements) {
  try {
    await navigator.clipboard.writeText(text);
    target.textContent = success;
  } catch {
    target.textContent = "Copy is unavailable in this browser. Select and copy the text or use the email option instead.";
  }
}

function articleCard(article) {
  const details = element("details", "pp-card glass-card pp-article");
  details.id = `guide-${article.slug}`;
  const summary = element("summary");
  summary.append(element("span", "", article.category), element("h2", "", article.title), element("p", "", article.summary));
  const body = element("div", "pp-article-body");
  for (const block of articleBlocks(article.body_markdown)) {
    if (block.type === "heading") body.append(element("h3", "", block.text));
    else if (block.type === "paragraph") body.append(element("p", "", block.text));
    else {
      const list = element(block.type === "ordered" ? "ol" : "ul");
      list.append(...block.items.map((text) => element("li", "", text)));
      body.append(list);
    }
  }
  const share = element("button", "pp-button pp-share-guide", "Copy guide link");
  share.type = "button";
  const shareStatus = element("p", "pp-small");
  shareStatus.setAttribute("role", "status");
  share.addEventListener("click", () => {
    const url = new URL(location.href);
    url.hash = `guide-${article.slug}`;
    url.search = "";
    void copyText(url.href, "Guide link copied.", shareStatus);
  });
  body.append(share, shareStatus);
  details.append(summary, body);
  return details;
}

function renderArticles() {
  const articles = filterArticles(content.articles, query, category);
  document.getElementById("help-count").textContent = `${articles.length} ${articles.length === 1 ? "guide" : "guides"}${query || category !== "all" ? " found" : " to help you get more from PlexPoint"}`;
  document.getElementById("help-articles").replaceChildren(...articles.map(articleCard));
  document.getElementById("help-empty").hidden = articles.length > 0;
  document.querySelectorAll("#help-categories button").forEach((button) => {
    button.setAttribute("aria-pressed", String(button.dataset.category === category));
  });
}

function renderCategories() {
  const categories = ["all", ...new Set(content.articles.map((article) => article.category))];
  if (!categories.includes(category)) category = "all";
  const buttons = categories.map((value) => {
    const button = element("button", "", value === "all" ? "All guides" : value);
    button.type = "button";
    button.dataset.category = value;
    button.setAttribute("aria-pressed", String(category === value));
    button.addEventListener("click", () => { category = value; renderArticles(); });
    return button;
  });
  document.getElementById("help-categories").replaceChildren(...buttons);
}

function openGuide(slug, focus = false) {
  const guide = document.getElementById(`guide-${slug}`);
  if (!guide) {
    document.getElementById("help-count").textContent = "That guide is not available. Browse the guides below or contact support.";
    return;
  }
  guide.open = true;
  if (focus) {
    guide.querySelector("summary").focus({ preventScroll: true });
    guide.scrollIntoView({ block: "start", behavior: "instant" });
  }
}

function openHashGuide(focus = false) {
  const slug = guideSlug(location.hash);
  if (slug) {
    query = ""; category = "all"; search.value = "";
    renderArticles();
    openGuide(slug, focus);
  }
}

if (search) {
  search.addEventListener("input", () => { query = search.value; renderArticles(); });
  document.getElementById("clear-search").addEventListener("click", () => {
    query = ""; category = "all"; search.value = ""; renderArticles(); search.focus();
  });
  window.addEventListener("hashchange", () => openHashGuide(true));

  async function refreshContent() {
  if (loading) return;
  loading = true;
  const retry = document.getElementById("retry-content");
  retry.disabled = true;
  retry.textContent = "Checking…";
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);
  try {
    const response = await fetch("/api/portal/content", { signal: controller.signal });
    if (!response.ok) throw new Error("Content unavailable");
    const updated = normalizeContent(await response.json());
    // Avoid replacing focused controls if the bundled content is already current.
    if (JSON.stringify(updated) !== JSON.stringify(content)) {
      content = updated;
      renderServices(); renderCategories(); renderArticles();
      openHashGuide();
    }
    document.getElementById("content-notice").hidden = true;
  } catch {
    document.getElementById("content-notice-text").textContent = "Updated guides could not be loaded. You can still use the content shown below.";
    document.getElementById("content-notice").hidden = false;
  } finally {
    clearTimeout(timeout);
    loading = false;
    retry.disabled = false;
    retry.textContent = "Try again";
  }
  }
  document.getElementById("retry-content").addEventListener("click", () => void refreshContent());

  const whatsapp = document.getElementById("support-whatsapp");
  whatsapp.href = publicHref(supportContact.whatsapp);
  whatsapp.target = "_blank";
  whatsapp.rel = "noopener noreferrer";
  document.getElementById("support-email").href = `mailto:${supportContact.email}`;
  const form = document.getElementById("support-form");
  const supportStatus = document.getElementById("support-status");
  const detailsInput = document.getElementById("support-details");
  function supportValues() { return Object.fromEntries(new FormData(form)); }
  function validateSupport() {
    detailsInput.setCustomValidity(detailsInput.value.trim().length < 10 ? "Please describe the problem in at least 10 characters." : "");
    return form.reportValidity();
  }
  form.addEventListener("input", () => {
    detailsInput.setCustomValidity("");
    document.getElementById("prepared-email").hidden = true;
    document.getElementById("prepared-email-link").removeAttribute("href");
    supportStatus.textContent = "";
  });
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!validateSupport()) return;
    const values = supportValues();
    const subject = encodeURIComponent(`PlexPoint support: ${values.topic}`);
    const body = encodeURIComponent(supportMessage(values));
    const link = document.getElementById("prepared-email-link");
    link.href = `mailto:${supportContact.email}?subject=${subject}&body=${body}`;
    document.getElementById("prepared-email").hidden = false;
    supportStatus.textContent = "Message prepared. Nothing has been sent.";
    link.focus();
  });
  document.getElementById("copy-support").addEventListener("click", () => {
    if (validateSupport()) void copyText(supportMessage(supportValues()), "Message copied. Paste it into email or WhatsApp to send it.", supportStatus);
  });

  renderServices();
  renderCategories();
  renderArticles();
  openHashGuide(true);
  void refreshContent();
}
