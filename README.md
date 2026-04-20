# Plex-Website

Plex Media Server Website

## Plex collection setup

1. Copy `.env.example` to `.env`
2. Set `PLEX_URL` and `PLEX_TOKEN`
3. Start the full app with `npm run dev`
4. Check `http://localhost:5000/api/plex/sections` if you need your movie section id
5. Check `http://localhost:5000/api/plex/collections` to find the collection you want to feature
6. Set either `PLEX_COLLECTION_TITLE` or `PLEX_COLLECTION_ID`

If you only want the frontend without API routes, use `npm run dev:vite`.

## Cloudflare Pages

- Build command: `npm run build`
- Build output directory: `dist`
- Pages Functions live in `functions/api/plex/*`
- Add these Pages environment variables: `PLEX_URL`, `PLEX_TOKEN`, `PLEX_MOVIE_SECTION_ID` (optional), `PLEX_COLLECTION_ID` or `PLEX_COLLECTION_TITLE`
- If your Plex server is only on your home network, Cloudflare Pages will not reach it unless you expose it safely, usually with Cloudflare Tunnel
