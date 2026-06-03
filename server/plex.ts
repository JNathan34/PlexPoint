import {
  getFeaturedCollection as getFeaturedCollectionFromEnv,
  getPlexCollections as getPlexCollectionsFromEnv,
  getPlexMovies as getPlexMoviesFromEnv,
  getPlexSections as getPlexSectionsFromEnv,
  getTopRated as getTopRatedFromEnv,
  plexFetchImage as plexFetchImageFromEnv,
  type PlexCollectionMovie,
  type PlexCollectionSummary,
  type PlexEnv,
  type PlexFeaturedCollection,
  type PlexPreviewItem,
} from "../shared/plex-client";

export type {
  PlexCollectionMovie,
  PlexCollectionSummary,
  PlexFeaturedCollection,
  PlexPreviewItem,
};

const runtimeEnv = process.env as PlexEnv;

export function plexFetchImage(path: string) {
  return plexFetchImageFromEnv(runtimeEnv, path);
}

export function plexFetchImageSized(path: string, options: { width?: number; height?: number } = {}) {
  return plexFetchImageFromEnv(runtimeEnv, path, options);
}

export function getPlexSections() {
  return getPlexSectionsFromEnv(runtimeEnv);
}

export function getPlexCollections(options: { sectionId?: string } = {}) {
  return getPlexCollectionsFromEnv(runtimeEnv, options);
}

export function getPlexMovies(options: { limit?: number | null } = {}): Promise<PlexCollectionMovie[]> {
  return getPlexMoviesFromEnv(runtimeEnv, options);
}

export function getTopRated(options: { type: "movie" | "tv"; limit: number }): Promise<PlexPreviewItem[]> {
  return getTopRatedFromEnv(runtimeEnv, options);
}

export function getFeaturedCollection(options: {
  collectionId?: string | null;
  collectionTitle?: string | null;
  limit?: number | null;
} = {}): Promise<PlexFeaturedCollection> {
  return getFeaturedCollectionFromEnv(runtimeEnv, options);
}
