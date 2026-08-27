const REVOLUT_PAYMENT_URL = "https://revolut.me/jnathan34/pocket/DhbONnJ7pb";
const BANK_ACCOUNT_NUMBER = "06652300";
const BANK_SORT_CODE = "23-01-63";
const PLEX_STATUS_URL = "https://kuma.plexpoint.uk/api/badge/3/status";
const PLEX_UPTIME_URL = "https://kuma.plexpoint.uk/api/badge/3/uptime";
const PLEX_STATUS_REFRESH_MS = 30_000;

let plexLibraryCounts = { movies: 1_193, shows: 252 };
let plexLibraryCountsRequested = false;
let plexStatusState = { value: "Checking…", label: "Plex status" };
let plexStatusRequestInFlight = false;
let plexStatusHasLoaded = false;
let plexShows = null;
let plexShowsLoadPromise = null;
let plexShowsError = null;
let activePlexLibraryTab = "movies";
const plexShowsFilters = { query: "", genre: "all", sort: "library" };

function formatHomepageLibraryCount(count, label) {
  if (typeof count !== "number" || !Number.isFinite(count) || count < 0) return null;
  if (label === "Movies" && count >= 1_000) {
    const thousands = Math.floor(count / 100) / 10;
    return `${thousands.toFixed(1).replace(/\.0$/, "")}k+`;
  }

  const increment = label === "Shows" ? 50 : 100;
  if (count < increment) return `${Math.floor(count)}+`;
  return `${Math.floor(count / increment) * increment}+`;
}

function updateHomepageLibraryCounts() {
  const homepage = document.querySelector('[data-testid="hero-section"]');
  if (!homepage || !plexLibraryCounts) return;

  for (const [label, count] of [
    ["Movies", plexLibraryCounts.movies],
    ["Shows", plexLibraryCounts.shows],
  ]) {
    const card = [...homepage.querySelectorAll(".glass-card")].find((element) =>
      [...element.children].some((child) => child.textContent?.trim() === label),
    );
    const labelElement = [...(card?.children || [])].find(
      (child) => child.textContent?.trim() === label,
    );
    const formattedCount = formatHomepageLibraryCount(count, label);
    if (
      labelElement?.previousElementSibling &&
      formattedCount &&
      labelElement.previousElementSibling.textContent !== formattedCount
    ) {
      labelElement.previousElementSibling.textContent = formattedCount;
    }
  }
}

function updateNavigationBrand() {
  const logoButton = document.querySelector('[data-testid="logo-button"]');
  if (!logoButton) return;

  const title = [...logoButton.querySelectorAll("span")].find(
    (element) => element.textContent?.trim() === "Plex Point",
  );
  if (title) title.textContent = "PlexPoint";

  const logo = logoButton.querySelector('img[alt="Plex Point Logo"]');
  if (logo) logo.alt = "PlexPoint Logo";
}

async function loadHomepageLibraryCounts() {
  if (plexLibraryCountsRequested) return;
  plexLibraryCountsRequested = true;

  try {
    const response = await fetch("/api/plex/counts");
    if (!response.ok) return;

    const counts = await response.json();
    if (!counts || typeof counts !== "object") return;

    plexLibraryCounts = {
      movies:
        typeof counts.movies === "number" && Number.isFinite(counts.movies)
          ? counts.movies
          : plexLibraryCounts.movies,
      shows:
        typeof counts.shows === "number" && Number.isFinite(counts.shows)
          ? counts.shows
          : plexLibraryCounts.shows,
    };
    updateHomepageLibraryCounts();
  } catch {
    // Keep the bundled fallback values when Plex is temporarily unavailable.
  }
}

function findHomepageStatusCard() {
  const homepage = document.querySelector('[data-testid="hero-section"]');
  if (!homepage) return null;

  const existing = homepage.querySelector("[data-plex-status-card]");
  if (existing) return existing;

  const card = [...homepage.querySelectorAll(".glass-card")].find((element) =>
    [...element.children].some((child) => child.textContent?.trim() === "Uptime"),
  );
  if (card) card.dataset.plexStatusCard = "true";
  return card || null;
}

function findPlexLibraryStatusCard() {
  const library = document.querySelector('[data-testid="plex-collection-section"]');
  if (!library) return null;

  const card =
    library.querySelector('[data-testid="library-stat-uptime"]') ||
    library.querySelector("[data-plex-library-status-card]");
  if (card) card.dataset.plexLibraryStatusCard = "true";
  return card || null;
}

function updateHomepagePlexStatus() {
  for (const card of [findHomepageStatusCard(), findPlexLibraryStatusCard()].filter(Boolean)) {
    const textElements = [...card.children].filter((child) => child.matches("div"));
    const valueElement = textElements.at(-2);
    const labelElement = textElements.at(-1);

    if (valueElement && valueElement.textContent !== plexStatusState.value) {
      valueElement.textContent = plexStatusState.value;
    }
    if (labelElement && labelElement.textContent !== plexStatusState.label) {
      labelElement.textContent = plexStatusState.label;
    }
  }
}

function setHomepagePlexStatus(value, label) {
  plexStatusState = { value, label };
  updateHomepagePlexStatus();
}

function textFromKumaBadge(svg) {
  const documentFromSvg = new DOMParser().parseFromString(svg, "image/svg+xml");
  return (
    documentFromSvg.documentElement.getAttribute("aria-label") ||
    documentFromSvg.documentElement.textContent ||
    ""
  ).replace(/\s+/g, " ").trim();
}

async function refreshHomepagePlexStatus() {
  if (plexStatusRequestInFlight) return;
  plexStatusRequestInFlight = true;
  if (!plexStatusHasLoaded) setHomepagePlexStatus("Checking…", "Plex status");

  try {
    const [statusResponse, uptimeResponse] = await Promise.all([
      fetch(PLEX_STATUS_URL, { cache: "no-store" }),
      fetch(PLEX_UPTIME_URL, { cache: "no-store" }),
    ]);
    if (!statusResponse.ok || !uptimeResponse.ok) throw new Error("Kuma badge request failed");

    const [statusSvg, uptimeSvg] = await Promise.all([
      statusResponse.text(),
      uptimeResponse.text(),
    ]);
    const statusText = textFromKumaBadge(statusSvg).toLowerCase();
    const uptimeText = textFromKumaBadge(uptimeSvg);
    const uptimePercent = uptimeText.match(/(\d+(?:\.\d+)?)\s*%/)?.[1];

    if (statusText.includes("maintenance")) {
      setHomepagePlexStatus("Maintenance", "Plex status");
    } else if (statusText.includes("down") || statusText.includes("offline")) {
      setHomepagePlexStatus("Offline", "Plex status");
    } else if (statusText.includes("up") || statusText.includes("online")) {
      setHomepagePlexStatus(uptimePercent ? `${uptimePercent}%` : "Online", "Uptime");
    } else if (uptimePercent) {
      setHomepagePlexStatus(`${uptimePercent}%`, "Uptime");
    } else {
      setHomepagePlexStatus("Status", "Unavailable");
    }
    plexStatusHasLoaded = true;
  } catch {
    setHomepagePlexStatus("Status", "Unavailable");
  } finally {
    plexStatusRequestInFlight = false;
  }
}

function createPlexElement(tagName, { className = "", text = "", attributes = {} } = {}) {
  const element = document.createElement(tagName);
  if (className) element.className = className;
  if (text) element.textContent = text;
  for (const [name, value] of Object.entries(attributes)) {
    element.setAttribute(name, String(value));
  }
  return element;
}

function normalizePlexShow(item) {
  if (!item || typeof item !== "object") return null;
  const id = String(item.id ?? "").trim();
  const title = String(item.title ?? "").trim();
  if (!id || !title) return null;

  const numberOrNull = (value) => {
    if (value == null || value === "") return null;
    const number = Number(value);
    return Number.isFinite(number) ? number : null;
  };

  return {
    id,
    title,
    year: numberOrNull(item.year),
    rating: numberOrNull(item.rating),
    seasons: numberOrNull(item.seasons),
    posterPath: typeof item.posterPath === "string" ? item.posterPath : null,
    posterUrl: typeof item.posterUrl === "string" ? item.posterUrl : null,
    genres: Array.isArray(item.genres)
      ? item.genres.filter((genre) => typeof genre === "string" && genre.trim())
      : [],
  };
}

function plexShowPosterUrl(show) {
  if (show.posterUrl) return show.posterUrl;
  if (!show.posterPath) return null;
  if (/^https?:\/\//i.test(show.posterPath) || show.posterPath.startsWith("/plex-posters/")) {
    return show.posterPath;
  }

  const params = new URLSearchParams({
    path: show.posterPath,
    w: "400",
    h: "600",
  });
  return `/api/plex/image?${params.toString()}`;
}

async function loadPlexShows() {
  if (plexShowsLoadPromise) return plexShowsLoadPromise;

  plexShowsError = null;

  const request = (async () => {
    try {
      const response = await fetch("/api/plex/shows");
      if (!response.ok) throw new Error("Live Plex shows are unavailable");
      const data = await response.json();
      if (!Array.isArray(data)) throw new Error("Invalid Plex shows response");
      plexShows = data.map(normalizePlexShow).filter(Boolean);
    } catch {
      try {
        const response = await fetch("/plex-preview.json", { cache: "no-store" });
        if (!response.ok) throw new Error("TV preview is unavailable");
        const data = await response.json();
        if (!Array.isArray(data?.tv)) throw new Error("TV preview is invalid");
        plexShows = data.tv.map(normalizePlexShow).filter(Boolean);
      } catch {
        plexShows = null;
        plexShowsError = "The shows library could not be loaded. Please try again shortly.";
      }
    }

    renderAllPlexShowsPanels();
    return plexShows;
  })();

  plexShowsLoadPromise = request;
  renderAllPlexShowsPanels();
  try {
    return await request;
  } finally {
    if (plexShowsLoadPromise === request) plexShowsLoadPromise = null;
  }
}

function createPlexShowCard(show, index) {
  const card = createPlexElement("article", {
    className:
      "border bg-card text-card-foreground shadow-sm movie-library-card group rounded-xl p-1.5 sm:rounded-2xl sm:p-2",
    attributes: { "data-testid": `collection-show-${show.id}` },
  });
  card.title = show.title;

  const poster = createPlexElement("div", {
    className: "movie-library-poster relative aspect-[2/3] overflow-hidden rounded-lg sm:rounded-xl",
  });
  const posterUrl = plexShowPosterUrl(show);
  if (posterUrl) {
    const image = createPlexElement("img", {
      className: "h-full w-full rounded-lg object-cover sm:rounded-xl",
      attributes: {
        src: posterUrl,
        alt: `${show.title} poster`,
        loading: index < 12 ? "eager" : "lazy",
        decoding: "async",
        width: "200",
        height: "300",
      },
    });
    poster.append(image);
  } else {
    poster.append(
      createPlexElement("div", {
        className: "flex h-full items-center justify-center bg-muted px-3 text-center text-xs text-muted-foreground",
        text: "Poster unavailable",
      }),
    );
  }

  if (show.rating != null) {
    const badge = createPlexElement("div", {
      className:
        "glass absolute left-1.5 top-1.5 z-10 flex items-center gap-1 rounded-lg px-1.5 py-0.5 text-[10px] sm:left-2 sm:top-2 sm:px-2 sm:py-1 sm:text-[11px]",
    });
    badge.append(
      createPlexElement("span", { className: "text-yellow-400", text: "★" }),
      createPlexElement("span", {
        className: "font-semibold",
        text: show.rating.toFixed(1),
      }),
    );
    poster.append(badge);
  }

  const body = createPlexElement("div", {
    className: "p-6 movie-library-card__body px-1 pb-1 pt-2 sm:pt-3",
  });
  const details = [];
  if (show.year != null) details.push(String(Math.trunc(show.year)));
  if (show.seasons != null) {
    const seasons = Math.max(0, Math.trunc(show.seasons));
    details.push(`${seasons} ${seasons === 1 ? "season" : "seasons"}`);
  }
  if (show.genres[0]) details.push(show.genres[0]);

  body.append(
    createPlexElement("h6", {
      className: "truncate text-[11px] font-semibold text-white sm:text-xs",
      text: show.title,
    }),
    createPlexElement("p", {
      className: "truncate text-[10px] text-muted-foreground sm:text-[11px]",
      text: details.join(" • ") || "TV show",
    }),
  );
  card.append(poster, body);
  return card;
}

function updatePlexShowsGenreOptions(panel) {
  const select = panel.querySelector("[data-plex-shows-genre]");
  if (!select || !plexShows) return;

  const genres = [...new Set(plexShows.flatMap((show) => show.genres))].sort((a, b) =>
    a.localeCompare(b),
  );
  const currentOptions = [...select.options].slice(1).map((option) => option.value);
  if (currentOptions.join("\n") === genres.join("\n")) return;

  select.replaceChildren(createPlexElement("option", { text: "All genres", attributes: { value: "all" } }));
  for (const genre of genres) {
    select.append(createPlexElement("option", { text: genre, attributes: { value: genre } }));
  }
  select.value = genres.includes(plexShowsFilters.genre) ? plexShowsFilters.genre : "all";
}

function renderPlexShowsPanel(panel) {
  const grid = panel.querySelector("[data-plex-shows-grid]");
  const status = panel.querySelector("[data-plex-shows-status]");
  if (!grid || !status) return;

  if (plexShowsLoadPromise && plexShows == null) {
    status.hidden = false;
    status.textContent = "Loading the PlexPoint shows library…";
    grid.hidden = true;
    return;
  }

  if (plexShowsError) {
    status.hidden = false;
    status.textContent = plexShowsError;
    grid.hidden = true;
    return;
  }

  if (!plexShows) {
    status.hidden = false;
    status.textContent = "Open the Shows tab to load the TV library.";
    grid.hidden = true;
    return;
  }

  updatePlexShowsGenreOptions(panel);
  const query = plexShowsFilters.query.trim().toLowerCase();
  let filtered = plexShows.filter((show) => {
    const matchesGenre =
      plexShowsFilters.genre === "all" || show.genres.includes(plexShowsFilters.genre);
    const matchesQuery =
      !query ||
      show.title.toLowerCase().includes(query) ||
      String(show.year ?? "").includes(query) ||
      show.genres.some((genre) => genre.toLowerCase().includes(query));
    return matchesGenre && matchesQuery;
  });

  if (plexShowsFilters.sort === "rating-desc") {
    filtered = [...filtered].sort((a, b) => (b.rating ?? -1) - (a.rating ?? -1));
  } else if (plexShowsFilters.sort === "year-desc") {
    filtered = [...filtered].sort((a, b) => (b.year ?? 0) - (a.year ?? 0));
  } else if (plexShowsFilters.sort === "title-asc") {
    filtered = [...filtered].sort((a, b) => a.title.localeCompare(b.title));
  }

  grid.replaceChildren();
  if (filtered.length === 0) {
    status.hidden = false;
    status.textContent = "No shows match those filters.";
    grid.hidden = true;
    return;
  }

  const fragment = document.createDocumentFragment();
  filtered.forEach((show, index) => fragment.append(createPlexShowCard(show, index)));
  grid.append(fragment);
  grid.hidden = false;
  status.hidden = true;
}

function renderAllPlexShowsPanels() {
  document.querySelectorAll("[data-plex-shows-panel]").forEach(renderPlexShowsPanel);
}

function createPlexShowsPanel() {
  const panel = createPlexElement("div", {
    className: "movie-library-panel rounded-2xl p-3 sm:rounded-[1.75rem] sm:p-5",
    attributes: { "data-plex-shows-panel": "true" },
  });

  const searchRow = createPlexElement("div", { className: "flex" });
  const search = createPlexElement("input", {
    className:
      "flex w-full flex-1 border px-4 py-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 h-10 rounded-xl border-white/10 bg-white/[0.035] text-sm text-foreground placeholder:text-slate-500 focus-visible:ring-primary/40 sm:h-12 sm:text-base",
    attributes: {
      type: "search",
      placeholder: "Search shows (title, year, genre)…",
      "aria-label": "Search shows",
      "data-plex-shows-search": "true",
    },
  });
  search.value = plexShowsFilters.query;
  search.addEventListener("input", () => {
    plexShowsFilters.query = search.value;
    renderPlexShowsPanel(panel);
  });
  searchRow.append(search);

  const filterRow = createPlexElement("div", {
    className: "mt-3 grid grid-cols-2 gap-2 sm:mt-4 sm:flex sm:flex-row sm:gap-3",
    attributes: { "data-plex-library-filter-row": "true" },
  });
  const selectClass =
    "h-10 w-full rounded-xl border border-white/10 bg-white/[0.035] px-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary/30 sm:h-12 sm:w-72 sm:text-base";
  const genre = createPlexElement("select", {
    className: selectClass,
    attributes: { "aria-label": "Filter shows by genre", "data-plex-shows-genre": "true" },
  });
  genre.append(createPlexElement("option", { text: "All genres", attributes: { value: "all" } }));
  genre.value = plexShowsFilters.genre;
  genre.addEventListener("change", () => {
    plexShowsFilters.genre = genre.value;
    renderPlexShowsPanel(panel);
  });

  const sort = createPlexElement("select", {
    className: selectClass,
    attributes: { "aria-label": "Sort shows", "data-plex-shows-sort": "true" },
  });
  for (const [value, text] of [
    ["library", "Library order"],
    ["rating-desc", "Rating: high to low"],
    ["year-desc", "Newest first"],
    ["title-asc", "Title: A to Z"],
  ]) {
    sort.append(createPlexElement("option", { text, attributes: { value } }));
  }
  sort.value = plexShowsFilters.sort;
  sort.addEventListener("change", () => {
    plexShowsFilters.sort = sort.value;
    renderPlexShowsPanel(panel);
  });
  filterRow.append(genre, sort);

  const status = createPlexElement("div", {
    className:
      "mt-4 rounded-xl border border-white/10 bg-white/[0.035] px-4 py-10 text-center text-sm text-muted-foreground sm:mt-6",
    text: "Open the Shows tab to load the TV library.",
    attributes: { "data-plex-shows-status": "true", "aria-live": "polite" },
  });
  const grid = createPlexElement("div", {
    className:
      "movie-library-grid grid grid-cols-2 gap-3 pt-4 sm:grid-cols-4 sm:gap-4 sm:pt-6 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 2xl:grid-cols-8",
    attributes: { "data-plex-shows-grid": "true" },
  });
  grid.hidden = true;

  panel.append(searchRow, filterRow, status, grid);
  return panel;
}

function createPlexLibrarySwitcher() {
  const select = createPlexElement("select", {
    className:
      "plex-library-switcher h-10 w-full rounded-xl border border-white/10 bg-white/[0.035] px-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary/30 sm:h-12 sm:w-72 sm:text-base",
    attributes: {
      "aria-label": "Choose Plex library",
      "data-plex-library-switcher": "true",
    },
  });
  select.append(
    createPlexElement("option", { text: "Movies", attributes: { value: "movies" } }),
    createPlexElement("option", { text: "Shows", attributes: { value: "shows" } }),
  );
  select.value = activePlexLibraryTab;
  select.addEventListener("change", () => setPlexLibraryTab(select.value));
  return select;
}

function setPlexLibraryTab(tab) {
  activePlexLibraryTab = tab === "shows" ? "shows" : "movies";
  const section = document.querySelector('[data-testid="plex-collection-section"]');
  const moviePanel = section?.querySelector(".movie-library-panel:not([data-plex-shows-panel])");
  const showsPanel = section?.querySelector("[data-plex-shows-panel]");
  if (moviePanel) moviePanel.style.display = activePlexLibraryTab === "movies" ? "" : "none";
  if (showsPanel) showsPanel.style.display = activePlexLibraryTab === "shows" ? "" : "none";

  section?.querySelectorAll("[data-plex-library-switcher]").forEach((select) => {
    if (select.value !== activePlexLibraryTab) select.value = activePlexLibraryTab;
  });

  if (activePlexLibraryTab === "shows" && plexShows == null) void loadPlexShows();
}

function ensurePlexShowsSection() {
  const section = document.querySelector('[data-testid="plex-collection-section"]');
  const container = section?.querySelector(".container");
  const moviePanel = container?.querySelector(".movie-library-panel:not([data-plex-shows-panel])");
  if (!section || !container || !moviePanel) return;

  const description = [...section.querySelectorAll("p")].find((element) =>
    element.textContent?.startsWith("See live PlexPoint movie and show counts"),
  );
  if (description) {
    description.textContent =
      "See live PlexPoint movie and show counts, browse each library separately, filter by genre, search by title or year, and explore every poster.";
  }

  moviePanel.id = "plex-movies-panel";
  const movieFilterRow = moviePanel.querySelector('[data-testid="movie-filter-genre"]')?.parentElement;
  if (movieFilterRow && !movieFilterRow.querySelector("[data-plex-library-switcher]")) {
    movieFilterRow.dataset.plexLibraryFilterRow = "true";
    movieFilterRow.append(createPlexLibrarySwitcher());
  }

  let showsPanel = container.querySelector("[data-plex-shows-panel]");
  const showsPanelWasCreated = !showsPanel;
  if (!showsPanel) {
    showsPanel = createPlexShowsPanel();
    showsPanel.id = "plex-shows-panel";
    moviePanel.insertAdjacentElement("afterend", showsPanel);
  }
  const showsFilterRow = showsPanel.querySelector("[data-plex-library-filter-row]");
  if (showsFilterRow && !showsFilterRow.querySelector("[data-plex-library-switcher]")) {
    showsFilterRow.append(createPlexLibrarySwitcher());
  }

  setPlexLibraryTab(activePlexLibraryTab);
  if (showsPanelWasCreated) renderPlexShowsPanel(showsPanel);
}

function addAnimeAccessNotice() {
  const membership = document.getElementById("membership");
  if (!membership) return;

  const heading = [...membership.querySelectorAll("h1, h2, h3")].find((element) =>
    /membership|subscription|choose/i.test(element.textContent || ""),
  );
  membership.querySelector("[data-anime-access-notice]")?.remove();

  const description = [...membership.querySelectorAll("p")].find((element) =>
    /choose (access|the plan)|request movies/i.test(element.textContent || ""),
  );
  if (heading && description && !description.dataset.animeAccessIncluded) {
    description.dataset.animeAccessIncluded = "true";
    description.append(" Anime library access is available with Ruby and Platinum tiers only.");
  }

  for (const tierName of ["ruby-tier", "platinum-tier"]) {
    const tier = membership.querySelector(`[data-testid="membership-tier-${tierName}"]`);
    const featureList = tier?.querySelector("ul");
    if (!featureList || featureList.querySelector("[data-anime-tier-feature]")) continue;

    const feature = featureList.firstElementChild?.cloneNode(true);
    const label = feature?.lastElementChild;
    if (!feature || !label) continue;

    feature.dataset.animeTierFeature = "true";
    feature.className = feature.className.replace(/hidden\s+sm:flex/g, "flex");
    label.textContent = "Anime library access";
    featureList.append(feature);
  }
}

function addRevolutPaymentOption() {
  for (const dialog of document.querySelectorAll('[role="dialog"]')) {
    const stripeLink = [...dialog.querySelectorAll("a")].find((link) =>
      /buy\.stripe\.com/.test(link.href),
    );
    if (!stripeLink) continue;

    const stripeLabel = [...dialog.querySelectorAll("p")].find(
      (element) => element.textContent === "Stripe checkout",
    );
    if (stripeLabel) {
      const summaryGrid = stripeLabel.parentElement?.parentElement;
      if (stripeLabel.parentElement) stripeLabel.parentElement.style.display = "none";
      summaryGrid?.classList.remove("grid-cols-2");
      summaryGrid?.classList.add("grid-cols-1");
    }

    const stripePanel = stripeLink.closest("div.rounded-2xl");

    if (dialog.querySelector("[data-revolut-payment]")) {
      if (stripePanel) stripePanel.style.display = "none";
      continue;
    }

    const panel = document.createElement("div");
    panel.dataset.revolutPayment = "true";
    panel.className = "rounded-2xl border border-white/10 bg-white/[0.04] p-3 sm:p-4";

    const link = document.createElement("a");
    link.href = REVOLUT_PAYMENT_URL;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.setAttribute("aria-label", "Pay with Revolut");
    link.style.cssText = "display:flex;min-height:44px;width:100%;align-items:center;justify-content:center;gap:10px;border:1px solid rgba(255,255,255,.25);border-radius:12px;background:#050505;color:#fff;font-size:15px;font-weight:700;letter-spacing:-.01em;box-shadow:0 6px 18px rgba(0,0,0,.28);transition:transform .2s ease,background .2s ease";
    link.innerHTML = '<span aria-hidden="true" style="display:grid;height:24px;width:24px;place-items:center;border-radius:7px;background:#fff;color:#050505;font-size:17px;font-weight:900;font-style:italic">R</span><span>Pay with <span style="font-weight:850">Revolut</span></span>';
    link.addEventListener("mouseenter", () => { link.style.background = "#171717"; });
    link.addEventListener("mouseleave", () => { link.style.background = "#050505"; });

    const note = document.createElement("p");
    note.className = "mt-2 text-[11px] leading-5 text-muted-foreground sm:mt-3 sm:text-xs";
    note.textContent = "Put the plan name in the payment note and send the correct amount shown above for the plan you want. Then send a WhatsApp message so access can be confirmed.";

    panel.append(link, note);
    stripePanel?.insertAdjacentElement("beforebegin", panel);
    if (stripePanel) stripePanel.style.display = "none";
  }
}

function updatePaymentCopy() {
  for (const element of document.querySelectorAll("p, li")) {
    if (element.children.length) continue;
    if (
      element.textContent === "Subscriptions can be paid monthly by bank transfer or Stripe checkout" ||
      element.textContent === "Subscriptions can be paid monthly by bank transfer, Revolut, or Stripe checkout"
    ) {
      element.textContent = "Subscriptions can be paid monthly by bank transfer or Revolut";
    }
    if (element.textContent === "Subscriptions are billed monthly via bank transfer.") {
      element.textContent = "Subscriptions are billed monthly via bank transfer or Revolut.";
    }
    if (element.textContent?.startsWith("Stripe checkout prices may be higher")) element.style.display = "none";
    if (element.textContent?.startsWith("Stripe checkout may also be offered")) element.style.display = "none";
  }
}

function updateBankDetails() {
  for (const dialog of document.querySelectorAll('[role="dialog"]')) {
    for (const paragraph of dialog.querySelectorAll("p")) {
      if (paragraph.textContent === "58925008") paragraph.textContent = BANK_ACCOUNT_NUMBER;
      if (paragraph.textContent === "09-01-28") paragraph.textContent = BANK_SORT_CODE;
    }
  }
}

document.addEventListener(
  "click",
  (event) => {
    const button = event.target.closest?.("button[aria-label]");
    if (!button) return;

    const label = button.getAttribute("aria-label");
    const replacement =
      label === "Copy account" ? BANK_ACCOUNT_NUMBER :
      label === "Copy sortCode" ? BANK_SORT_CODE :
      null;
    if (!replacement) return;

    event.preventDefault();
    event.stopImmediatePropagation();
    navigator.clipboard.writeText(replacement);
  },
  true,
);

function applyEnhancements() {
  updateNavigationBrand();
  ensurePlexShowsSection();
  addAnimeAccessNotice();
  addRevolutPaymentOption();
  updatePaymentCopy();
  updateBankDetails();
  updateHomepageLibraryCounts();
  updateHomepagePlexStatus();
}

new MutationObserver(applyEnhancements).observe(document.body, {
  childList: true,
  subtree: true,
});

applyEnhancements();
loadHomepageLibraryCounts();
refreshHomepagePlexStatus();
window.setInterval(refreshHomepagePlexStatus, PLEX_STATUS_REFRESH_MS);
