import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { rm } from "node:fs/promises";

const testing = process.argv[2] === "test";
const store = testing ? ".wrangler/portal-tests" : ".wrangler/portal-local";
// Reset only the disposable browser-test database so prior runs cannot exhaust
// authentication rate limits. The development database is always preserved.
if (testing) await rm(store, { recursive: true, force: true });
// This configuration deliberately names a local database, not a production D1 ID.
const result = spawnSync(process.execPath, [
  fileURLToPath(new URL("../node_modules/wrangler/bin/wrangler.js", import.meta.url)),
  "d1", "migrations", "apply", "PORTAL_DB", "--local", "--config=wrangler.local.json", `--persist-to=${store}`,
], { stdio: ["ignore", "inherit", "inherit"], env: { ...process.env, WRANGLER_SEND_METRICS: "false" } });
if (result.error) throw result.error;
process.exitCode = result.status ?? 1;
