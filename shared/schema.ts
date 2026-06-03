import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  membershipTier: text("membership_tier").default("free"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const mediaItems = pgTable("media_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  type: text("type").notNull(), // "movie" | "tv"
  year: integer("year"),
  poster: text("poster"),
  description: text("description"),
  genres: text("genres").array(),
  rating: text("rating"),
  seasons: integer("seasons"),
  addedAt: timestamp("added_at").defaultNow(),
});

export const membershipTiers = pgTable("membership_tiers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  price: integer("price").notNull(), // in cents
  features: text("features").array().notNull(),
  maxStreams: integer("max_streams").notNull(),
  priority: text("priority").notNull(),
  kofiTierId: text("kofi_tier_id"),
});

export const contentRequests = pgTable("content_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  title: text("title").notNull(),
  type: text("type").notNull(),
  status: text("status").default("pending"), // "pending" | "approved" | "completed" | "rejected"
  requestedAt: timestamp("requested_at").defaultNow(),
});

export const serverStats = pgTable("server_stats", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  uptime: text("uptime").notNull(),
  activeUsers: integer("active_users").notNull(),
  storageUsed: text("storage_used").notNull(),
  activeStreams: integer("active_streams").notNull(),
  totalMovies: integer("total_movies").notNull(),
  totalTvShows: integer("total_tv_shows").notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertMediaItemSchema = createInsertSchema(mediaItems).omit({
  id: true,
  addedAt: true,
});

export const insertMembershipTierSchema = createInsertSchema(membershipTiers).omit({
  id: true,
});

export const insertContentRequestSchema = createInsertSchema(contentRequests).omit({
  id: true,
  requestedAt: true,
});

export const insertServerStatsSchema = createInsertSchema(serverStats).omit({
  id: true,
  updatedAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertMediaItem = z.infer<typeof insertMediaItemSchema>;
export type MediaItem = typeof mediaItems.$inferSelect;
export type InsertMembershipTier = z.infer<typeof insertMembershipTierSchema>;
export type MembershipTier = typeof membershipTiers.$inferSelect;
export type InsertContentRequest = z.infer<typeof insertContentRequestSchema>;
export type ContentRequest = typeof contentRequests.$inferSelect;
export type InsertServerStats = z.infer<typeof insertServerStatsSchema>;
export type ServerStats = typeof serverStats.$inferSelect;
