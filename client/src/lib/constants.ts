export const NAVBAR_HEIGHT = 80;

export const NAV_ITEMS = ['home', 'membership', 'addons', 'requests', 'tutorials'] as const;

export type NavItem = typeof NAV_ITEMS[number];

export function scrollToSection(id: string) {
  const element = document.getElementById(id);
  if (element) {
    const offsetTop =
      element.getBoundingClientRect().top + window.scrollY - NAVBAR_HEIGHT;
    window.scrollTo({
      top: offsetTop,
      behavior: 'smooth'
    });
  }
}
