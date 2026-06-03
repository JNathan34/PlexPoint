# Plex-Website

Plex Media Server Website

## Static Plex preview

1. Copy `.env.example` to `.env`
2. Set `PLEX_URL` and `PLEX_TOKEN`
3. Optional: set `PLEX_MOVIE_SECTION_ID` and `PLEX_TV_SECTION_ID` if auto-detection picks the wrong library
4. Run `npm run generate:plex-preview -- --limit=12`
5. Commit/upload the generated `client/public/plex-preview.json` and `client/public/plex-posters/*`

The "What's on PlexPoint" page reads this static preview first, so it works on Cloudflare Pages without server functions or runtime Plex secrets.

## 24-hour free trial

The one-time 24-hour free trial invite is linked throughout the site:

`https://wizarr.plexpoint.uk/j/FREE%20TRIAL`

## Cloudflare Pages

- Build command: `npm run build`
- Build output directory: `dist`
- Static deploy is supported out of the box.
- If you later want live Plex data instead of the static preview, deploy the Pages Functions in `functions/api/plex/*`, add `PLEX_URL` and `PLEX_TOKEN` in Cloudflare, and set `VITE_USE_LIVE_PLEX=true`.
- If your Plex server is only on your home network, Cloudflare will not reach it unless you expose it safely, usually with Cloudflare Tunnel.
