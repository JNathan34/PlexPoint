function accountLink(testId, className) {
  const link = document.createElement("a");
  link.href = "/account/";
  link.dataset.testid = testId;
  link.className = className;
  link.textContent = "Account";
  return link;
}

function installAccountLinks() {
  const desktopTrial = document.querySelector('[data-testid="nav-free-trial-link"]');
  if (desktopTrial && !document.querySelector('[data-testid="nav-account-link"]')) {
    desktopTrial.before(accountLink("nav-account-link",
      "glass inline-flex h-11 items-center justify-center rounded-full px-5 text-sm font-semibold text-foreground transition-colors hover:text-primary"));
  }

  const mobileTrial = document.querySelector('[data-testid="mobile-free-trial-link"]');
  if (mobileTrial && !document.querySelector('[data-testid="mobile-account-link"]')) {
    mobileTrial.before(accountLink("mobile-account-link",
      "glass mb-2 flex min-h-[48px] items-center justify-center rounded-xl px-4 py-3 text-sm font-semibold text-primary"));
  }
}

installAccountLinks();
new MutationObserver(installAccountLinks).observe(document.getElementById("root"), { childList: true, subtree: true });
