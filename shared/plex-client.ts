import { XMLParser } from "fast-xml-parser";

export type PlexLibraryType = "movie" | "show";
export type PlexMediaType = "movie" | "tv";

export type PlexEnv = {
  PLEX_URL?: string;
  PLEX_TOKEN?: string;
  PLEX_MOVIE_SECTION_ID?: string;
  PLEX_TV_SECTION_ID?: string;
  PLEX_COLLECTION_ID?: string;
  PLEX_COLLECTION_TITLE?: string;
};

export type PlexPreviewItem = {
  id: string;
  title: string;
  year: number | null;
  rating: number | null;
  posterPath: string | null;
  seasons: number | null;
};

export type PlexCollectionSummary = {
  id: string;
  title: string;
  summary: string | null;
  posterPath: string | null;
  artPath: string | null;
  itemCount: number | null;
  updatedAt: string | null;
};

export type PlexCollectionMovie = {
  id: string;
  title: string;
  year: number | null;
  rating: number | null;
  posterPath: string | null;
  summary: string | null;
  durationMinutes: number | null;
  genres: string[];
  contentRating: string | null;
  studio: string | null;
};

export type PlexFeaturedCollection = PlexCollectionSummary & {
  itemCount: number;
  items: PlexCollectionMovie[];
};

type CacheEntry<T> = { expiresAt: number; value: T };
type FeaturedCollectionOptions = {
  collectionId?: string | null;
  collectionTitle?: string | null;
  limit?: number | null;
};

const parser = new XMLParser({
  ignoreAttributes: false,
});

const cache = new Map<string, CacheEntry<unknown>>();

function toArray<T>(value: T | T[] | undefined | null): T[] {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

function getRequiredEnv(env: PlexEnv, name: keyof PlexEnv): string {
  const value = env[name];
  if (!value) throw new Error(`Missing required env var: ${name}`);
  return value;
}

function cachePrefix(env: PlexEnv) {
  return `${env.PLEX_URL ?? "missing-url"}::${env.PLEX_COLLECTION_ID ?? env.PLEX_COLLECTION_TITLE ?? "no-collection"}`;
}

function normalizeBaseUrl(raw: string): URL {
  const url = new URL(raw);
  if (!url.pathname.endsWith("/")) url.pathname += "/";
  return url;
}

async function cached<T>(key: string, ttlMs: number, fn: () => Promise<T>): Promise<T> {
  const now = Date.now();
  const existing = cache.get(key) as CacheEntry<T> | undefined;
  if (existing && existing.expiresAt > now) return existing.value;
  const value = await fn();
  cache.set(key, { expiresAt: now + ttlMs, value });
  return value;
}

function parseNumber(value: unknown): number | null {
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (typeof value !== "string" && typeof value !== "boolean") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function parseString(value: unknown): string | null {
  if (typeof value === "string") return value.length ? value : null;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  return null;
}

function pickFirstString(obj: Record<string, unknown>, keys: string[]): string | null {
  for (const key of keys) {
    const value = parseString(obj[key]);
    if (value) return value;
  }
  return null;
}

function pickFirstNumber(obj: Record<string, unknown>, keys: string[]): number | null {
  for (const key of keys) {
    const value = parseNumber(obj[key]);
    if (value != null) return value;
  }
  return null;
}

function parseUnixTimestamp(value: unknown): string | null {
  const parsed = parseNumber(value);
  if (parsed == null) return null;
  const timestamp = parsed > 1_000_000_000_000 ? parsed : parsed * 1000;
  const date = new Date(timestamp);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function parseDurationMinutes(value: unknown): number | null {
  const milliseconds = parseNumber(value);
  if (milliseconds == null) return null;
  return Math.max(1, Math.round(milliseconds / 60_000));
}

function extractEntryId(entry: Record<string, unknown>): string | null {
  const raw =
    pickFirstString(entry, ["@_ratingKey", "ratingKey"]) ??
    pickFirstString(entry, ["@_key", "key"]);

  if (!raw) return null;
  const match = raw.match(/\/(\d+)(?:\/items)?(?:[/?#].*)?$/);
  return match?.[1] ?? raw;
}

function extractTags(entry: Record<string, unknown>, key: string): string[] {
  return toArray<any>((entry as any)[key])
    .map((tag) => pickFirstString(tag, ["@_tag", "tag", "@_title", "title"]))
    .filter((tag): tag is string => Boolean(tag));
}

function getMediaContainerEntries(parsed: unknown): any[] {
  const mediaContainer = (parsed as any).MediaContainer ?? parsed;
  return [
    ...toArray<any>(mediaContainer?.Metadata),
    ...toArray<any>(mediaContainer?.Video),
    ...toArray<any>(mediaContainer?.Directory),
  ];
}

function mapPreviewItem(entry: Record<string, unknown>): PlexPreviewItem | null {
  const id = extractEntryId(entry);
  const title = pickFirstString(entry, ["@_title", "title", "@_originalTitle", "originalTitle"]);
  if (!id || !title) return null;

  return {
    id,
    title,
    year: pickFirstNumber(entry, ["@_year", "year"]),
    rating: pickFirstNumber(entry, [
      "@_audienceRating",
      "audienceRating",
      "@_rating",
      "rating",
      "@_userRating",
      "userRating",
    ]),
    posterPath: pickFirstString(entry, ["@_thumb", "thumb", "@_parentThumb", "parentThumb", "@_art", "art"]),
    seasons: pickFirstNumber(entry, ["@_childCount", "childCount"]),
  };
}

function mapCollectionSummary(entry: Record<string, unknown>): PlexCollectionSummary | null {
  const id = extractEntryId(entry);
  const title = pickFirstString(entry, ["@_title", "title"]);
  if (!id || !title) return null;

  return {
    id,
    title,
    summary: pickFirstString(entry, ["@_summary", "summary"]),
    posterPath: pickFirstString(entry, ["@_thumb", "thumb", "@_composite", "composite"]),
    artPath: pickFirstString(entry, ["@_art", "art"]),
    itemCount: pickFirstNumber(entry, ["@_childCount", "childCount"]),
    updatedAt: parseUnixTimestamp(entry["@_updatedAt"] ?? entry.updatedAt),
  };
}

function mapCollectionMovie(entry: Record<string, unknown>): PlexCollectionMovie | null {
  const id = extractEntryId(entry);
  const title = pickFirstString(entry, ["@_title", "title", "@_originalTitle", "originalTitle"]);
  if (!id || !title) return null;

  return {
    id,
    title,
    year: pickFirstNumber(entry, ["@_year", "year"]),
    rating: pickFirstNumber(entry, [
      "@_audienceRating",
      "audienceRating",
      "@_rating",
      "rating",
      "@_userRating",
      "userRating",
    ]),
    posterPath: pickFirstString(entry, ["@_thumb", "thumb", "@_parentThumb", "parentThumb", "@_art", "art"]),
    summary: pickFirstString(entry, ["@_summary", "summary", "@_tagline", "tagline"]),
    durationMinutes: parseDurationMinutes(entry["@_duration"] ?? entry.duration),
    genres: extractTags(entry, "Genre"),
    contentRating: pickFirstString(entry, ["@_contentRating", "contentRating"]),
    studio:
      pickFirstString(entry, ["@_studio", "studio"]) ??
      extractTags(entry, "Studio")[0] ??
      null,
  };
}

async function plexRequest(
  env: PlexEnv,
  pathname: string,
  params?: Record<string, string | number | boolean>,
) {
  const baseUrl = normalizeBaseUrl(getRequiredEnv(env, "PLEX_URL"));
  const token = getRequiredEnv(env, "PLEX_TOKEN");

  const url = new URL(pathname.replace(/^\//, ""), baseUrl);
  url.searchParams.set("X-Plex-Token", token);
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      url.searchParams.set(key, String(value));
    }
  }

  const res = await fetch(url, {
    headers: {
      Accept: "application/json, text/xml, application/xml;q=0.9, */*;q=0.8",
    },
  });

  if (!res.ok) {
    const body = (await res.text().catch(() => "")) || res.statusText;
    throw new Error(`Plex request failed (${res.status}): ${body}`);
  }

  const contentType = res.headers.get("content-type") || "";
  const text = await res.text();

  if (contentType.includes("application/json")) {
    return JSON.parse(text);
  }

  return parser.parse(text);
}

export async function plexFetchImage(
  env: PlexEnv,
  path: string,
  options: { width?: number; height?: number } = {},
): Promise<Response> {
  const baseUrl = normalizeBaseUrl(getRequiredEnv(env, "PLEX_URL"));
  const token = getRequiredEnv(env, "PLEX_TOKEN");

  const safePath = path.startsWith("/") ? path : `/${path}`;
  const width = options.width;
  const height = options.height;

  const url =
    width || height
      ? (() => {
          const transcodeUrl = new URL("photo/:/transcode", baseUrl);
          if (width) transcodeUrl.searchParams.set("width", String(width));
          if (height) transcodeUrl.searchParams.set("height", String(height));
          transcodeUrl.searchParams.set("minSize", "1");
          transcodeUrl.searchParams.set("upscale", "1");
          transcodeUrl.searchParams.set("url", safePath);
          return transcodeUrl;
        })()
      : new URL(safePath.slice(1), baseUrl);
  url.searchParams.set("X-Plex-Token", token);

  return fetch(url);
}

export async function getPlexSections(
  env: PlexEnv,
): Promise<Array<{ key: string; title: string; type: PlexLibraryType }>> {
  const key = `${cachePrefix(env)}::sections`;
  return cached(key, 60_000, async () => {
    const parsed = await plexRequest(env, "/library/sections");
    const mediaContainer = (parsed as any).MediaContainer ?? parsed;
    const directories = toArray<any>(mediaContainer?.Directory);

    return directories
      .map((directory) => ({
        key: pickFirstString(directory, ["@_key", "key"]) ?? "",
        title: pickFirstString(directory, ["@_title", "title"]) ?? "",
        type: (pickFirstString(directory, ["@_type", "type"]) ?? "") as PlexLibraryType,
      }))
      .filter(
        (directory) =>
          directory.key && directory.title && (directory.type === "movie" || directory.type === "show"),
      );
  });
}

async function resolveSectionId(env: PlexEnv, forType: PlexMediaType): Promise<string> {
  const envKey = forType === "tv" ? "PLEX_TV_SECTION_ID" : "PLEX_MOVIE_SECTION_ID";
  const explicit = env[envKey];
  if (explicit) return explicit;

  const sections = await getPlexSections(env);
  const desired: PlexLibraryType = forType === "tv" ? "show" : "movie";
  const match = sections.find((section) => section.type === desired);
  if (!match) {
    throw new Error(`Could not auto-detect Plex ${forType} library. Set ${envKey} to the library section id.`);
  }

  return match.key;
}

export async function getTopRated(
  env: PlexEnv,
  options: { type: PlexMediaType; limit: number },
): Promise<PlexPreviewItem[]> {
  const { type, limit } = options;
  const sectionId = await resolveSectionId(env, type);

  const plexType = type === "tv" ? 2 : 1;
  const key = `${cachePrefix(env)}::topRated:${type}:${limit}:${sectionId}`;

  return cached(key, 60_000, async () => {
    const parsed = await plexRequest(env, `/library/sections/${sectionId}/all`, {
      type: plexType,
      sort: "audienceRating:desc",
      "X-Plex-Container-Start": 0,
      "X-Plex-Container-Size": limit,
    });

    return getMediaContainerEntries(parsed)
      .map(mapPreviewItem)
      .filter((item): item is PlexPreviewItem => Boolean(item))
      .slice(0, limit);
  });
}

function normalizeLibraryLimit(limit: number | null | undefined): number | null {
  if (limit == null || !Number.isFinite(limit)) return null;
  return Math.max(1, Math.min(10_000, Math.trunc(limit)));
}

export async function getPlexMovies(
  env: PlexEnv,
  options: { limit?: number | null } = {},
): Promise<PlexCollectionMovie[]> {
  const sectionId = await resolveSectionId(env, "movie");
  const limit = normalizeLibraryLimit(options.limit);
  const key = `${cachePrefix(env)}::movies:${sectionId}:${limit ?? "all"}`;

  return cached(key, 60_000, async () => {
    const pageSize = 200;
    const items: PlexCollectionMovie[] = [];
    let start = 0;
    let totalSize: number | null = null;

    while (true) {
      const remaining = limit == null ? pageSize : Math.min(pageSize, limit - items.length);
      if (remaining <= 0) break;

      const parsed = await plexRequest(env, `/library/sections/${sectionId}/all`, {
        type: 1,
        "X-Plex-Container-Start": start,
        "X-Plex-Container-Size": remaining,
      });

      const mediaContainer = (parsed as any).MediaContainer ?? parsed;
      const pageItems = getMediaContainerEntries(parsed)
        .map(mapCollectionMovie)
        .filter((item): item is PlexCollectionMovie => Boolean(item));

      items.push(...pageItems);
      totalSize =
        pickFirstNumber(mediaContainer as Record<string, unknown>, ["@_totalSize", "totalSize"]) ??
        totalSize;

      if (pageItems.length === 0) break;

      start += pageItems.length;
      if (limit != null && items.length >= limit) break;
      if (totalSize != null && start >= totalSize) break;
      if (pageItems.length < remaining) break;
    }

    return items;
  });
}

export async function getPlexCollections(
  env: PlexEnv,
  options: { sectionId?: string } = {},
): Promise<PlexCollectionSummary[]> {
  const sectionId = options.sectionId ?? (await resolveSectionId(env, "movie"));
  const key = `${cachePrefix(env)}::collections:${sectionId}`;

  return cached(key, 60_000, async () => {
    const parsed = await plexRequest(env, `/library/sections/${sectionId}/collections`);

    return getMediaContainerEntries(parsed)
      .map(mapCollectionSummary)
      .filter((collection): collection is PlexCollectionSummary => Boolean(collection));
  });
}

async function getCollectionMetadata(env: PlexEnv, collectionId: string): Promise<PlexCollectionSummary | null> {
  const key = `${cachePrefix(env)}::collectionMeta:${collectionId}`;
  return cached(key, 60_000, async () => {
    const parsed = await plexRequest(env, `/library/metadata/${collectionId}`);
    const [entry] = getMediaContainerEntries(parsed);
    return entry ? mapCollectionSummary(entry) : null;
  });
}

async function getCollectionItems(env: PlexEnv, collectionId: string): Promise<PlexCollectionMovie[]> {
  const key = `${cachePrefix(env)}::collectionItems:${collectionId}`;
  return cached(key, 60_000, async () => {
    const pageSize = 100;
    const items: PlexCollectionMovie[] = [];
    let start = 0;
    let totalSize: number | null = null;

    while (true) {
      const parsed = await plexRequest(env, `/library/collections/${collectionId}/items`, {
        "X-Plex-Container-Start": start,
        "X-Plex-Container-Size": pageSize,
      });

      const mediaContainer = (parsed as any).MediaContainer ?? parsed;
      const pageItems = getMediaContainerEntries(parsed)
        .map(mapCollectionMovie)
        .filter((item): item is PlexCollectionMovie => Boolean(item));

      items.push(...pageItems);
      totalSize =
        pickFirstNumber(mediaContainer as Record<string, unknown>, ["@_totalSize", "totalSize"]) ??
        totalSize;

      if (pageItems.length === 0) break;

      start += pageItems.length;
      if (totalSize != null && start >= totalSize) break;
      if (pageItems.length < pageSize) break;
    }

    return items;
  });
}

function normalizeLimit(limit: number | null | undefined): number | null {
  if (limit == null || !Number.isFinite(limit)) return null;
  return Math.max(1, Math.min(500, Math.trunc(limit)));
}

function normalizeText(value: string | null | undefined): string | null {
  const normalized = value?.trim();
  return normalized ? normalized : null;
}

async function resolveFeaturedCollectionTarget(
  env: PlexEnv,
  options: FeaturedCollectionOptions,
): Promise<{
  collectionId: string;
  summary: PlexCollectionSummary | null;
}> {
  const desiredId = normalizeText(options.collectionId ?? env.PLEX_COLLECTION_ID);
  const desiredTitle = normalizeText(options.collectionTitle ?? env.PLEX_COLLECTION_TITLE);

  if (!desiredId && !desiredTitle) {
    throw new Error("Set PLEX_COLLECTION_ID or PLEX_COLLECTION_TITLE to choose which Plex collection to display.");
  }

  const collections = await getPlexCollections(env);

  if (desiredId) {
    const summary = collections.find((collection) => collection.id === desiredId) ?? null;
    return { collectionId: desiredId, summary };
  }

  const summary =
    collections.find((collection) => collection.title.trim().toLowerCase() === desiredTitle!.toLowerCase()) ?? null;

  if (!summary) {
    throw new Error(`Could not find Plex collection '${desiredTitle}'. Check /api/plex/collections or set PLEX_COLLECTION_ID.`);
  }

  return { collectionId: summary.id, summary };
}

export async function getFeaturedCollection(
  env: PlexEnv,
  options: FeaturedCollectionOptions = {},
): Promise<PlexFeaturedCollection> {
  const { collectionId, summary } = await resolveFeaturedCollectionTarget(env, options);
  const limit = normalizeLimit(options.limit);

  const [metadata, allItems] = await Promise.all([
    summary ? Promise.resolve(summary) : getCollectionMetadata(env, collectionId),
    getCollectionItems(env, collectionId),
  ]);

  const resolvedSummary = metadata ?? summary;
  const items = limit == null ? allItems : allItems.slice(0, limit);

  return {
    id: collectionId,
    title:
      resolvedSummary?.title ??
      normalizeText(options.collectionTitle ?? env.PLEX_COLLECTION_TITLE) ??
      "Featured Collection",
    summary: resolvedSummary?.summary ?? null,
    posterPath: resolvedSummary?.posterPath ?? null,
    artPath: resolvedSummary?.artPath ?? null,
    itemCount: resolvedSummary?.itemCount ?? allItems.length,
    updatedAt: resolvedSummary?.updatedAt ?? null,
    items,
  };
}
