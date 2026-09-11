// Public content only. Edit these defaults to add services or guides without a database.
export const defaultLinks = [
  { id: "plex", title: "Open Plex", description: "Your next movie night starts here.", url: "https://app.plex.tv/" },
  { id: "requests", title: "Request a movie or show", description: "Find something new and send a request through Overseerr.", url: "https://request.plexpoint.uk/" },
  { id: "library", title: "Browse the library", description: "Explore the movies and shows available on PlexPoint.", url: "/movies" },
  { id: "setup", title: "Device setup guides", description: "Get comfortable on your TV, phone, tablet or computer.", url: "/#tutorials" },
  { id: "install", title: "Install Plex", description: "Find the Plex application for your device.", url: "https://www.plex.tv/apps-devices/" },
];

export const supportContact = {
  name: "Jacob",
  email: "jacobnathan1718@gmail.com",
  whatsapp: "https://wa.me/447481861478",
};

export const defaultArticles = [
  {
    slug: "install-plex", title: "Install Plex on your device", category: "Getting started",
    summary: "Set up Plex on a TV, phone, tablet or computer.",
    body_markdown: "## Choose your device\n1. Open the application store on your device and search for Plex. You can also use the Install Plex link in Services to find supported devices.\n2. Install and open the Plex application. On a computer, you can use Open Plex in your web browser instead.\n3. Sign in with the Plex account you use for PlexPoint.\n\n## Find PlexPoint\nOpen the library or More menu and look for the libraries shared with your account. Pin the libraries you use most often. Menu names can vary between devices.\n\nIf you cannot see the shared libraries, follow the missing-library guide or contact Jacob."
  },
  {
    slug: "sign-in-to-plex", title: "Sign in to Plex", category: "Getting started",
    summary: "Use the right Plex account and connect your TV.",
    body_markdown: "## On a phone or computer\n1. Open the Plex application or choose Open Plex from Services.\n2. Sign in with the account that received your PlexPoint library invitation.\n3. Accept the library invitation if it is still pending, then reopen the application.\n\n## On a television\nFollow the sign-in instructions displayed by the Plex application. If it shows a link code, visit the address shown on the TV using your phone or computer and enter that code.\n\nYour Plex account and the My PlexPoint customer portal are separate. Creating a portal account will not automatically create a Plex account or grant library access."
  },
  {
    slug: "request-content", title: "Request a movie or TV show", category: "Requests",
    summary: "Search, request and follow progress through Overseerr.",
    body_markdown: "## Send a request\n1. Check the PlexPoint library to see whether the title is already available.\n2. Open Request a movie or show in Services and sign in to Overseerr using your Plex account.\n3. Search for the exact title and check its release year. For a show, select the seasons you want.\n4. Submit the request and check its status in Overseerr.\n\n## What happens next?\nRequest allowances and processing priority depend on your subscription tier. A request is not a guarantee of immediate availability. Check your existing request before submitting a duplicate.\n\nIf Overseerr does not recognise your account or you cannot submit a request, contact Jacob."
  },
  {
    slug: "missing-library", title: "I cannot see the PlexPoint library", category: "Troubleshooting",
    summary: "Check your invitation, account and pinned libraries.",
    body_markdown: "## Check these first\n1. Confirm that you are signed in to the Plex account that received the invitation.\n2. Check whether the library invitation still needs to be accepted.\n3. Open the More or library menu. The shared libraries may be available but not pinned to your home screen.\n4. Close and reopen Plex. Try the web application to see whether the same problem happens there.\n\n## Still missing?\nContact Jacob with your Plex username and the device you are using. Ask for your library invitation and subscription status to be checked. An available public website does not necessarily mean the Plex server is reachable."
  },
  {
    slug: "playback-help", title: "Buffering or playback problems", category: "Troubleshooting",
    summary: "Narrow down the problem before requesting help.",
    body_markdown: "## Try a few quick checks\n1. Try another movie or episode to see whether the problem affects one title or everything.\n2. Restart the Plex application and check for application updates.\n3. Check your network connection. Try a wired connection or move closer to your Wi-Fi router where possible.\n4. If your connection is struggling, try a lower playback quality in Plex.\n5. Try another device or the Plex web application.\n\n## Ask for help\nInclude the title, episode if relevant, device, approximate time of the problem and any error message. The Contact support section helps you prepare a message."
  },
  {
    slug: "payments-and-renewals", title: "Payments and subscription renewals", category: "Membership",
    summary: "Understand manual payments, confirmation and renewal dates.",
    body_markdown: "## Payments are confirmed manually\nPlexPoint currently uses manual payment confirmation. Paying by bank transfer or Revolut does not automatically update access or renew a subscription.\n\nCheck the current plan price and payment instructions on the main PlexPoint website. Include the requested payment reference or plan name and contact Jacob so the payment can be matched to your membership.\n\n## Payment and subscription status are different\nA payment awaiting confirmation has not yet been confirmed by the administrator. An expired subscription means its access period has ended. A confirmed payment and a subscription extension are separate records.\n\nIf you have paid but your access has not been updated, contact Jacob with the plan, payment date and reference. Account-specific payment history is not available in this portal preview."
  },
];
