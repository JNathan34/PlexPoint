import "dotenv/config";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  getPlexMovies,
  getTopRated,
  plexFetchImage,
  type PlexCollectionMovie,
  type PlexPreviewItem,
} from "../server/plex";

type PreviewFile = {
  generatedAt: string;
  movies: Array<PlexCollectionMovie & { posterUrl: string | null }>;
  tv: Array<PlexPreviewItem & { posterUrl: string | null }>;
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function parseLimit() {
  const arg = process.argv.find((a) => a.startsWith("--limit="));
  if (!arg) return 12;
  const n = Number(arg.slice("--limit=".length));
  if (!Number.isFinite(n)) return 12;
  return Math.max(1, Math.min(30, Math.trunc(n)));
}

async function ensureDir(dir: string) {
  await fs.mkdir(dir, { recursive: true });
}

function extensionFromContentType(contentType: string | null) {
  if (!contentType) return ".jpg";
  if (contentType.includes("image/png")) return ".png";
  if (contentType.includes("image/webp")) return ".webp";
  if (contentType.includes("image/jpeg")) return ".jpg";
  if (contentType.includes("image/jpg")) return ".jpg";
  return ".jpg";
}

async function downloadPoster(options: {
  postersDir: string;
  item: { id: string; posterPath: string | null };
}): Promise<string | null> {
  const { postersDir, item } = options;
  if (!item.posterPath) return null;

  const upstream = await plexFetchImage(item.posterPath, { width: 500, height: 750 });
  if (!upstream.ok) return null;

  const ext = extensionFromContentType(upstream.headers.get("content-type"));
  const filename = `${item.id}${ext}`;
  const diskPath = path.join(postersDir, filename);
  const publicUrl = `/plex-posters/${filename}`;

  const buffer = Buffer.from(await upstream.arrayBuffer());
  await fs.writeFile(diskPath, buffer);
  return publicUrl;
}

async function withPosters<T extends { id: string; posterPath: string | null }>(items: T[], postersDir: string) {
  const enriched: Array<T & { posterUrl: string | null }> = [];
  for (const item of items) {
    const posterUrl = await downloadPoster({ postersDir, item });
    enriched.push({ ...item, posterUrl });
  }
  return enriched;
}

async function main() {
  const limit = parseLimit();

  const publicDir = path.resolve(__dirname, "..", "client", "public");
  const postersDir = path.join(publicDir, "plex-posters");
  await ensureDir(postersDir);

  const [movies, tv] = await Promise.all([
    getPlexMovies({ limit: Math.max(limit * 3, 36) }),
    getTopRated({ type: "tv", limit }),
  ]);

  const moviesWithPosters = await withPosters(movies, postersDir);
  const tvWithPosters = await withPosters(tv, postersDir);

  const preview: PreviewFile = {
    generatedAt: new Date().toISOString(),
    movies: moviesWithPosters,
    tv: tvWithPosters,
  };

  const outPath = path.join(publicDir, "plex-preview.json");
  await fs.writeFile(outPath, JSON.stringify(preview, null, 2) + "\n", "utf8");

  // eslint-disable-next-line no-console
  console.log(`Wrote ${outPath}`);
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exitCode = 1;
});
