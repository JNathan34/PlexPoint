import type { Express } from "express";
import { createServer, type Server } from "http";
import { Readable } from "stream";
import { storage } from "./storage";
import { insertContentRequestSchema } from "../shared/schema";
import { getFeaturedCollection, getPlexCollections, getPlexMovies, getPlexSections, getTopRated, plexFetchImageSized } from "./plex";

export async function registerRoutes(app: Express): Promise<Server> {
  // Plex preview routes (optional; requires env vars)
  app.get("/api/plex/sections", async (_req, res) => {
    try {
      const sections = await getPlexSections();
      res.json(sections);
    } catch (error) {
      res.status(501).json({
        message:
          error instanceof Error
            ? error.message
            : "Plex integration not configured (set PLEX_URL and PLEX_TOKEN)",
      });
    }
  });

  app.get("/api/plex/collections", async (req, res) => {
    try {
      const sectionId = typeof req.query.sectionId === "string" ? req.query.sectionId : undefined;
      const collections = await getPlexCollections({ sectionId });
      res.json(collections);
    } catch (error) {
      res.status(501).json({
        message:
          error instanceof Error
            ? error.message
            : "Plex integration not configured (set PLEX_URL and PLEX_TOKEN)",
      });
    }
  });

  app.get("/api/plex/featured-collection", async (req, res) => {
    try {
      const collectionId = typeof req.query.id === "string" ? req.query.id : undefined;
      const collectionTitle = typeof req.query.title === "string" ? req.query.title : undefined;
      const limitRaw = Number(req.query.limit);
      const limit = Number.isFinite(limitRaw) ? Math.max(1, Math.min(500, Math.trunc(limitRaw))) : undefined;

      const collection = await getFeaturedCollection({ collectionId, collectionTitle, limit });
      res.json(collection);
    } catch (error) {
      res.status(501).json({
        message:
          error instanceof Error
            ? error.message
            : "Plex integration not configured (set PLEX_URL, PLEX_TOKEN, and a collection id or title)",
      });
    }
  });

  app.get("/api/plex/movies", async (req, res) => {
    try {
      const limitRaw = Number(req.query.limit);
      const limit = Number.isFinite(limitRaw) ? Math.max(1, Math.min(10_000, Math.trunc(limitRaw))) : undefined;

      const movies = await getPlexMovies({ limit });
      res.json(movies);
    } catch (error) {
      res.status(501).json({
        message:
          error instanceof Error
            ? error.message
            : "Plex integration not configured (set PLEX_URL and PLEX_TOKEN)",
      });
    }
  });

  app.get("/api/plex/top-rated", async (req, res) => {
    try {
      const typeParam = String(req.query.type ?? "tv").toLowerCase();
      const type = typeParam === "movie" ? "movie" : "tv";

      const limitRaw = Number(req.query.limit ?? 12);
      const limit = Number.isFinite(limitRaw) ? Math.max(1, Math.min(30, Math.trunc(limitRaw))) : 12;

      const items = await getTopRated({ type, limit });
      res.json(items);
    } catch (error) {
      res.status(501).json({
        message:
          error instanceof Error
            ? error.message
            : "Plex integration not configured (set PLEX_URL and PLEX_TOKEN)",
      });
    }
  });

  app.get("/api/plex/image", async (req, res) => {
    try {
      const path = req.query.path;
      if (typeof path !== "string" || !path.startsWith("/")) {
        res.status(400).json({ message: "Query param 'path' must be a Plex path starting with '/'" });
        return;
      }

      const widthRaw = typeof req.query.w === "string" ? Number(req.query.w) : null;
      const heightRaw = typeof req.query.h === "string" ? Number(req.query.h) : null;
      const width = widthRaw && Number.isFinite(widthRaw) ? Math.max(40, Math.min(2000, Math.trunc(widthRaw))) : undefined;
      const height = heightRaw && Number.isFinite(heightRaw) ? Math.max(40, Math.min(2000, Math.trunc(heightRaw))) : undefined;

      const upstream = await plexFetchImageSized(path, { width, height });
      if (!upstream.ok) {
        const body = (await upstream.text().catch(() => "")) || upstream.statusText;
        res.status(upstream.status).send(body);
        return;
      }

      const contentType = upstream.headers.get("content-type");
      if (contentType) res.setHeader("Content-Type", contentType);
      const etag = upstream.headers.get("etag");
      const lastModified = upstream.headers.get("last-modified");
      if (etag) res.setHeader("ETag", etag);
      if (lastModified) res.setHeader("Last-Modified", lastModified);
      res.setHeader("Cache-Control", "public, max-age=604800, stale-while-revalidate=86400, immutable");

      if (upstream.body) {
        res.status(200);
        Readable.fromWeb(upstream.body as any).pipe(res);
        return;
      }

      const buffer = Buffer.from(await upstream.arrayBuffer());
      res.status(200).send(buffer);
    } catch (error) {
      res.status(501).json({
        message:
          error instanceof Error
            ? error.message
            : "Plex integration not configured (set PLEX_URL and PLEX_TOKEN)",
      });
    }
  });

  // Media routes
  app.get("/api/media", async (req, res) => {
    try {
      const mediaItems = await storage.getMediaItems();
      res.json(mediaItems);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch media items" });
    }
  });

  app.get("/api/media/:type", async (req, res) => {
    try {
      const { type } = req.params;
      const mediaItems = await storage.getMediaItemsByType(type);
      res.json(mediaItems);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch media items by type" });
    }
  });

  app.get("/api/media/search/:query", async (req, res) => {
    try {
      const { query } = req.params;
      const mediaItems = await storage.searchMediaItems(query);
      res.json(mediaItems);
    } catch (error) {
      res.status(500).json({ message: "Failed to search media items" });
    }
  });

  // Membership routes
  app.get("/api/membership-tiers", async (req, res) => {
    try {
      const tiers = await storage.getMembershipTiers();
      res.json(tiers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch membership tiers" });
    }
  });

  // Content request routes
  app.get("/api/content-requests", async (req, res) => {
    try {
      const requests = await storage.getContentRequests();
      res.json(requests);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch content requests" });
    }
  });

  app.post("/api/content-requests", async (req, res) => {
    try {
      const validatedRequest = insertContentRequestSchema.parse(req.body);
      const newRequest = await storage.createContentRequest(validatedRequest);
      res.status(201).json(newRequest);
    } catch (error) {
      res.status(400).json({ message: "Invalid request data" });
    }
  });

  // Server stats routes
  app.get("/api/server-stats", async (req, res) => {
    try {
      const stats = await storage.getServerStats();
      if (!stats) {
        res.status(404).json({ message: "Server stats not found" });
        return;
      }
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch server stats" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
