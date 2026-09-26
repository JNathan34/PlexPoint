function accountLink(testId, className) {
  const link = document.createElement("a");
  link.href = "/account/";
  link.dataset.testid = testId;
  link.className = className;
  link.textContent = "Account";
  return link;
}

function installAccountLinks() {
  const desktopTutorials = document.querySelector('[data-testid="nav-link-tutorials"]');
  if (desktopTutorials && !document.querySelector('[data-testid="nav-account-link"]')) {
    desktopTutorials.after(accountLink("nav-account-link",
      "relative inline-flex items-center rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition-all duration-300 hover:text-foreground lg:px-5"));
  }

  const mobileTutorials = document.querySelector('[data-testid="mobile-nav-link-tutorials"]');
  if (mobileTutorials && !document.querySelector('[data-testid="mobile-account-link"]')) {
    mobileTutorials.after(accountLink("mobile-account-link",
      "flex min-h-[48px] items-center rounded-xl px-4 py-3 text-left text-sm text-muted-foreground transition-all hover:bg-muted/50 hover:text-foreground"));
  }

  // The home page animates its mobile menu open. Mark that tray so it can be
  // removed from the outgoing view-transition snapshot before changing pages.
  const mobileAccountLink = document.querySelector('[data-testid="mobile-account-link"]');
  const mobileTray = mobileAccountLink?.closest('.md\\:hidden');
  if (mobileTray) mobileTray.dataset.mobileNavigationTray = "";
}

installAccountLinks();
new MutationObserver(installAccountLinks).observe(document.getElementById("root"), { childList: true, subtree: true });

document.addEventListener("click", (event) => {
  const link = event.target.closest('a[href="/account/"]');
  if (!link) return;
  if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

  // Close React's drawer state as well as hiding it for the outgoing frame so
  // browser Back never restores the homepage with a tall, still-open header.
  if (link.dataset.testid === "mobile-account-link") {
    document.querySelector('[data-testid="mobile-menu-button"]')?.click();
  }
  document.documentElement.classList.add("pp-navigation-leaving");
  window.setTimeout(() => document.documentElement.classList.remove("pp-navigation-leaving"), 1000);
  try { sessionStorage.setItem("plexpoint:main-navigation", "1"); } catch { /* Storage is optional. */ }
}, { capture: true });

window.addEventListener("pageshow", () => document.documentElement.classList.remove("pp-navigation-leaving"));
