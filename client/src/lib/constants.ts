export const NAVBAR_HEIGHT = 80;

export const NAV_ITEMS = ['home', 'membership', 'tutorials', 'requests', 'faq'] as const;

export type NavItem = typeof NAV_ITEMS[number];

export function scrollToSection(id: string) {
  const element = document.getElementById(id);
  if (element) {
    const offsetTop = element.offsetTop - NAVBAR_HEIGHT;
    window.scrollTo({
      top: offsetTop,
      behavior: 'smooth'
    });
  }
}
