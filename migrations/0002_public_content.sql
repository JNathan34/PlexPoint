-- Seed the public service directory and guides. Existing edits are preserved.

INSERT OR IGNORE INTO service_links (id, title, description, url, sort_order) VALUES ('plex', 'Open Plex', 'Your next movie night starts here.', 'https://app.plex.tv/', 10);

INSERT OR IGNORE INTO service_links (id, title, description, url, sort_order) VALUES ('requests', 'Request a movie or show', 'Find something new and send a request through Overseerr.', 'https://request.plexpoint.uk/', 20);

INSERT OR IGNORE INTO service_links (id, title, description, url, sort_order) VALUES ('library', 'Browse the library', 'Explore the movies and shows available on PlexPoint.', '/movies', 30);

INSERT OR IGNORE INTO service_links (id, title, description, url, sort_order) VALUES ('setup', 'Device setup guides', 'Get comfortable on your TV, phone, tablet or computer.', '/#tutorials', 40);

INSERT OR IGNORE INTO service_links (id, title, description, url, sort_order) VALUES ('install', 'Install Plex', 'Find the Plex application for your device.', 'https://www.plex.tv/apps-devices/', 50);

INSERT OR IGNORE INTO help_articles (slug, title, summary, category, body_markdown, published, sort_order) VALUES ('install-plex', 'Install Plex on your device', 'Set up Plex on a TV, phone, tablet or computer.', 'Getting started', '## Choose your device
1. Open the application store on your device and search for Plex. You can also use the Install Plex link in Services to find supported devices.
2. Install and open the Plex application. On a computer, you can use Open Plex in your web browser instead.
3. Sign in with the Plex account you use for PlexPoint.

## Find PlexPoint
Open the library or More menu and look for the libraries shared with your account. Pin the libraries you use most often. Menu names can vary between devices.

If you cannot see the shared libraries, follow the missing-library guide or contact Jacob.', 1, 10);

INSERT OR IGNORE INTO help_articles (slug, title, summary, category, body_markdown, published, sort_order) VALUES ('sign-in-to-plex', 'Sign in to Plex', 'Use the right Plex account and connect your TV.', 'Getting started', '## On a phone or computer
1. Open the Plex application or choose Open Plex from Services.
2. Sign in with the account that received your PlexPoint library invitation.
3. Accept the library invitation if it is still pending, then reopen the application.

## On a television
Follow the sign-in instructions displayed by the Plex application. If it shows a link code, visit the address shown on the TV using your phone or computer and enter that code.

Your Plex account and the My PlexPoint customer portal are separate. Creating a portal account will not automatically create a Plex account or grant library access.', 1, 20);

INSERT OR IGNORE INTO help_articles (slug, title, summary, category, body_markdown, published, sort_order) VALUES ('request-content', 'Request a movie or TV show', 'Search, request and follow progress through Overseerr.', 'Requests', '## Send a request
1. Check the PlexPoint library to see whether the title is already available.
2. Open Request a movie or show in Services and sign in to Overseerr using your Plex account.
3. Search for the exact title and check its release year. For a show, select the seasons you want.
4. Submit the request and check its status in Overseerr.

## What happens next?
Request allowances and processing priority depend on your subscription tier. A request is not a guarantee of immediate availability. Check your existing request before submitting a duplicate.

If Overseerr does not recognise your account or you cannot submit a request, contact Jacob.', 1, 30);

INSERT OR IGNORE INTO help_articles (slug, title, summary, category, body_markdown, published, sort_order) VALUES ('missing-library', 'I cannot see the PlexPoint library', 'Check your invitation, account and pinned libraries.', 'Troubleshooting', '## Check these first
1. Confirm that you are signed in to the Plex account that received the invitation.
2. Check whether the library invitation still needs to be accepted.
3. Open the More or library menu. The shared libraries may be available but not pinned to your home screen.
4. Close and reopen Plex. Try the web application to see whether the same problem happens there.

## Still missing?
Contact Jacob with your Plex username and the device you are using. Ask for your library invitation and subscription status to be checked. An available public website does not necessarily mean the Plex server is reachable.', 1, 40);

INSERT OR IGNORE INTO help_articles (slug, title, summary, category, body_markdown, published, sort_order) VALUES ('playback-help', 'Buffering or playback problems', 'Narrow down the problem before requesting help.', 'Troubleshooting', '## Try a few quick checks
1. Try another movie or episode to see whether the problem affects one title or everything.
2. Restart the Plex application and check for application updates.
3. Check your network connection. Try a wired connection or move closer to your Wi-Fi router where possible.
4. If your connection is struggling, try a lower playback quality in Plex.
5. Try another device or the Plex web application.

## Ask for help
Include the title, episode if relevant, device, approximate time of the problem and any error message. The Contact support section helps you prepare a message.', 1, 50);

INSERT OR IGNORE INTO help_articles (slug, title, summary, category, body_markdown, published, sort_order) VALUES ('payments-and-renewals', 'Payments and subscription renewals', 'Understand manual payments, confirmation and renewal dates.', 'Membership', '## Payments are confirmed manually
PlexPoint currently uses manual payment confirmation. Paying by bank transfer or Revolut does not automatically update access or renew a subscription.

Check the current plan price and payment instructions on the main PlexPoint website. Include the requested payment reference or plan name and contact Jacob so the payment can be matched to your membership.

## Payment and subscription status are different
A payment awaiting confirmation has not yet been confirmed by the administrator. An expired subscription means its access period has ended. A confirmed payment and a subscription extension are separate records.

If you have paid but your access has not been updated, contact Jacob with the plan, payment date and reference. Account-specific payment history is not available in this portal preview.', 1, 60);
