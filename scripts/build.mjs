import { cp, mkdir, rm } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";

const root = fileURLToPath(new URL("../", import.meta.url));
const output = resolve(root, "dist");
// An explicit public-asset list keeps backend source and migrations out of the site.
const publicPaths = [
  "index.html", "account", "assets", "icons", "plex-posters", "preview-pictures",
  "plex-preview.json", "plexpoint-logo.png", "homepage.png", "request.jpg",
  "manifest.webmanifest", "sw.js", "_routes.json",
];

await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
await Promise.all(publicPaths.map((path) => cp(resolve(root, path), resolve(output, path), { recursive: true })));

// Generate from the editable functions; never hand-edit the checked-in worker bundle.
const result = spawnSync(process.execPath, [
  resolve(root, "node_modules/wrangler/bin/wrangler.js"),
  "pages", "functions", "build", "functions", "--outdir=dist/_worker.js",
  "--build-output-directory=dist", "--compatibility-date=2026-08-25",
], {
  cwd: root,
  stdio: "inherit",
  env: { ...process.env, WRANGLER_SEND_METRICS: "false" },
});
if (result.error) throw result.error;
if (result.status !== 0) process.exit(result.status ?? 1);

// The production Pages project currently deploys this repository root, where
// advanced-mode Functions are loaded from `_worker.js`. Keep that entry point
// in sync with the same generated worker used by local and dist deployments.
await cp(resolve(output, "_worker.js", "index.js"), resolve(root, "_worker.js"));
console.log("Built the website and synchronized the deployable Pages worker. No deployment performed.");
