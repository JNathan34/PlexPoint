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

function updateHomepagePlexStatus() {
  const card = findHomepageStatusCard();
  if (!card) return;

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
