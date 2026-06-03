export const NAVBAR_HEIGHT = 80;

export const NAV_ITEMS = ['home', 'membership', 'addons', 'requests', 'tutorials'] as const;

export const FREE_TRIAL_URL = "https://wizarr.plexpoint.uk/j/FREE%20TRIAL";

export const WHATSAPP_URL = "https://wa.me/447481861478";

export const PLEZY_URL = "https://plezy.app/";

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
