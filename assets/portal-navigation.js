const header = document.querySelector(".pp-site-header");
const toggle = document.getElementById("portal-menu-toggle");
const navigation = document.getElementById("portal-navigation");
const mobile = matchMedia("(max-width: 767px)");

function closeMenu(returnFocus = false) {
  header.dataset.menuOpen = "false";
  toggle.setAttribute("aria-expanded", "false");
  toggle.setAttribute("aria-label", "Open navigation");
  if (returnFocus && mobile.matches) toggle.focus();
}
function updateHeader() {
  header.classList.toggle("navbar-custom", window.scrollY > 50 || mobile.matches);
  header.classList.toggle("pp-scrolled", window.scrollY > 50);
}
toggle.addEventListener("click", () => {
  const open = toggle.getAttribute("aria-expanded") !== "true";
  header.dataset.menuOpen = String(open);
  toggle.setAttribute("aria-expanded", String(open));
  toggle.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
});
navigation.addEventListener("click", (event) => {
  if (event.target.closest("a")) closeMenu();
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") closeMenu(true);
});
document.addEventListener("pointerdown", (event) => {
  if (!header.contains(event.target)) closeMenu();
});
mobile.addEventListener("change", () => { closeMenu(); updateHeader(); });
window.addEventListener("hashchange", () => closeMenu());
window.addEventListener("scroll", updateHeader, { passive: true });
closeMenu();
updateHeader();
