import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/browser",
  fullyParallel: true,
  workers: 2,
  reporter: "list",
  use: { baseURL: "http://127.0.0.1:8791", browserName: "chromium" },
  webServer: {
    command: "npm run build && node scripts/prepare-local-db.mjs test && wrangler pages dev dist --d1=PORTAL_DB=plexpoint-local --compatibility-date=2026-08-25 --persist-to=.wrangler/portal-tests --port 8791 --ip 127.0.0.1",
    url: "http://127.0.0.1:8791/account/",
    timeout: 120000,
    reuseExistingServer: false,
    env: { WRANGLER_SEND_METRICS: "false" },
  },
});
