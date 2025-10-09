import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertContentRequestSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
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
