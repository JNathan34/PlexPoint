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
}

installAccountLinks();
new MutationObserver(installAccountLinks).observe(document.getElementById("root"), { childList: true, subtree: true });
