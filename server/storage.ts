import { type User, type InsertUser, type MediaItem, type InsertMediaItem, type MembershipTier, type InsertMembershipTier, type ContentRequest, type InsertContentRequest, type ServerStats, type InsertServerStats } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Media Items
  getMediaItems(): Promise<MediaItem[]>;
  getMediaItemsByType(type: string): Promise<MediaItem[]>;
  createMediaItem(item: InsertMediaItem): Promise<MediaItem>;
  searchMediaItems(query: string): Promise<MediaItem[]>;
  
  // Membership Tiers
  getMembershipTiers(): Promise<MembershipTier[]>;
  createMembershipTier(tier: InsertMembershipTier): Promise<MembershipTier>;
  
  // Content Requests
  getContentRequests(): Promise<ContentRequest[]>;
  createContentRequest(request: InsertContentRequest): Promise<ContentRequest>;
  
  // Server Stats
  getServerStats(): Promise<ServerStats | undefined>;
  updateServerStats(stats: InsertServerStats): Promise<ServerStats>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private mediaItems: Map<string, MediaItem>;
  private membershipTiers: Map<string, MembershipTier>;
  private contentRequests: Map<string, ContentRequest>;
  private serverStats: ServerStats | undefined;

  constructor() {
    this.users = new Map();
    this.mediaItems = new Map();
    this.membershipTiers = new Map();
    this.contentRequests = new Map();
    this.initializeData();
  }

  private initializeData() {
    // Initialize membership tiers
    const bronzeTier: MembershipTier = {
      id: randomUUID(),
      name: "Bronze Tier",
      price: 100, // £1.00
      features: ["Access to Plex", "Enjoy all the movies and shows already available on Plex"],
      maxStreams: 1,
      priority: "basic",
      kofiTierId: "bronze_tier",
    };

    const silverTier: MembershipTier = {
      id: randomUUID(),
      name: "Silver Tier",
      price: 300, // £3.00
      features: ["5 Movie requests", "7 Season requests", "3 to 5 day Processing time", "Access to Plex", "Enjoy more freedom with 5 movie requests and 7 season requests per month"],
      maxStreams: 2,
      priority: "silver",
      kofiTierId: "silver_tier",
    };

    const goldTier: MembershipTier = {
      id: randomUUID(),
      name: "Gold Tier",
      price: 500, // £5.00
      features: ["10 Movie requests", "15 Season requests", "3 to 4 day Processing time", "Access to Plex", "Unlock even more with 10 movie requests and 15 season requests every month"],
      maxStreams: 3,
      priority: "gold",
      kofiTierId: "gold_tier",
    };

    const diamondTier: MembershipTier = {
      id: randomUUID(),
      name: "Diamond Tier",
      price: 700, // £7.00
      features: ["15 Movie requests", "20 Season requests", "2 to 3 day Processing time", "Access to Plex", "Unlock even more with 15 movie requests and 20 season requests every month"],
      maxStreams: 4,
      priority: "diamond",
      kofiTierId: "diamond_tier",
    };

    const rubyTier: MembershipTier = {
      id: randomUUID(),
      name: "Ruby Tier",
      price: 1000, // £10.00
      features: ["Unlimited Movie requests", "30 Season requests", "Requests are processed within 48 Hours", "Access to Plex", "Enjoy more freedom with unlimited movie requests and 30 season requests per month"],
      maxStreams: 5,
      priority: "ruby",
      kofiTierId: "ruby_tier",
    };

    const platinumTier: MembershipTier = {
      id: randomUUID(),
      name: "Platinum Tier",
      price: 1500, // £15.00
      features: ["Unlimited Movie requests", "Unlimited Season requests", "Requests are processed within 24 Hours", "Access to Plex", "Unlock even more with unlimited movie requests and unlimited season requests every month - the ultimate VIP experience"],
      maxStreams: -1, // Unlimited
      priority: "platinum",
      kofiTierId: "platinum_tier",
    };

    this.membershipTiers.set(bronzeTier.id, bronzeTier);
    this.membershipTiers.set(silverTier.id, silverTier);
    this.membershipTiers.set(goldTier.id, goldTier);
    this.membershipTiers.set(diamondTier.id, diamondTier);
    this.membershipTiers.set(rubyTier.id, rubyTier);
    this.membershipTiers.set(platinumTier.id, platinumTier);

    // Initialize server stats
    this.serverStats = {
      id: randomUUID(),
      uptime: "99.9%",
      activeUsers: 47,
      storageUsed: "12.5TB",
      activeStreams: 8,
      totalMovies: 834,
      totalTvShows: 127,
      updatedAt: new Date(),
    };

    // Initialize some sample media items
    const sampleMovies: Partial<MediaItem>[] = [
      {
        title: "Action Hero",
        type: "movie",
        year: 2023,
        poster: "https://pixabay.com/get/g099d5089b2d3837d140d41bfd2520ff4b94cb50114f4c55000b5088fe37c6e81bbfd33a0f0cd86ec5ddd7a483b3cfcee25fb97c6aa67b7ea7a627f2902193b4a_1280.jpg",
        description: "High-octane action thriller",
        genres: ["Action", "Adventure"],
        rating: "PG-13",
      },
      {
        title: "Space Odyssey",
        type: "movie",
        year: 2023,
        poster: "https://images.unsplash.com/photo-1485846234645-a62644f84728?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=300&h=450",
        description: "Epic science fiction adventure",
        genres: ["Sci-Fi", "Adventure"],
        rating: "PG-13",
      },
      {
        title: "Life Stories",
        type: "movie",
        year: 2022,
        poster: "https://pixabay.com/get/gc715de136cbdd338053c7a1684d26b931d011dfe106e306cfbaaf58032adf74bcf0578b44a66a716e7055a11c9261a677dad57f300b9e7cf80c2898ddbd94003_1280.jpg",
        description: "Heartfelt drama about human connections",
        genres: ["Drama", "Biography"],
        rating: "R",
      },
      {
        title: "Dark Shadows",
        type: "movie",
        year: 2023,
        poster: "https://pixabay.com/get/gf0684817f340a46ad56fcfe056e27eec640ba84856989ede1ace407b16a307e3d8f379d92d4cc97b6d1dddc1792b205e78ff12887a7dfb9a92778dbf3104f930_1280.jpg",
        description: "Supernatural horror thriller",
        genres: ["Horror", "Thriller"],
        rating: "R",
      }
    ];

    const sampleTvShows: Partial<MediaItem>[] = [
      {
        title: "City Life",
        type: "tv",
        seasons: 5,
        poster: "https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=300&h=450",
        description: "Urban drama following interconnected lives",
        genres: ["Drama", "Urban"],
        rating: "TV-14",
      },
      {
        title: "Detective Stories",
        type: "tv",
        seasons: 3,
        poster: "https://pixabay.com/get/g08d943737c2cccdd1aaf553182e567f65bd994c0fdeec8cbb2d3e2877515d10162fd8c779af62c8f13e79931ffd8779861d06c6d6f1f5ef5f643148980be95a7_1280.jpg",
        description: "Crime procedural with complex mysteries",
        genres: ["Crime", "Mystery"],
        rating: "TV-MA",
      },
      {
        title: "Future Worlds",
        type: "tv",
        seasons: 4,
        poster: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=300&h=450",
        description: "Science fiction anthology series",
        genres: ["Sci-Fi", "Anthology"],
        rating: "TV-14",
      },
      {
        title: "Comedy Central",
        type: "tv",
        seasons: 8,
        poster: "https://images.unsplash.com/photo-1485846234645-a62644f84728?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=300&h=450",
        description: "Hilarious sitcom with ensemble cast",
        genres: ["Comedy", "Sitcom"],
        rating: "TV-PG",
      }
    ];

    [...sampleMovies, ...sampleTvShows].forEach(item => {
      const mediaItem: MediaItem = {
        id: randomUUID(),
        addedAt: new Date(),
        ...item as Omit<MediaItem, 'id' | 'addedAt'>
      };
      this.mediaItems.set(mediaItem.id, mediaItem);
    });
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { 
      ...insertUser, 
      id, 
      createdAt: new Date() 
    };
    this.users.set(id, user);
    return user;
  }

  async getMediaItems(): Promise<MediaItem[]> {
    return Array.from(this.mediaItems.values());
  }

  async getMediaItemsByType(type: string): Promise<MediaItem[]> {
    return Array.from(this.mediaItems.values()).filter(item => item.type === type);
  }

  async createMediaItem(insertItem: InsertMediaItem): Promise<MediaItem> {
    const id = randomUUID();
    const mediaItem: MediaItem = { 
      ...insertItem, 
      id, 
      addedAt: new Date() 
    };
    this.mediaItems.set(id, mediaItem);
    return mediaItem;
  }

  async searchMediaItems(query: string): Promise<MediaItem[]> {
    const lowerQuery = query.toLowerCase();
    return Array.from(this.mediaItems.values()).filter(item => 
      item.title.toLowerCase().includes(lowerQuery) ||
      item.description?.toLowerCase().includes(lowerQuery) ||
      item.genres?.some(genre => genre.toLowerCase().includes(lowerQuery))
    );
  }

  async getMembershipTiers(): Promise<MembershipTier[]> {
    return Array.from(this.membershipTiers.values());
  }

  async createMembershipTier(insertTier: InsertMembershipTier): Promise<MembershipTier> {
    const id = randomUUID();
    const tier: MembershipTier = { ...insertTier, id };
    this.membershipTiers.set(id, tier);
    return tier;
  }

  async getContentRequests(): Promise<ContentRequest[]> {
    return Array.from(this.contentRequests.values());
  }

  async createContentRequest(insertRequest: InsertContentRequest): Promise<ContentRequest> {
    const id = randomUUID();
    const request: ContentRequest = { 
      ...insertRequest, 
      id, 
      requestedAt: new Date() 
    };
    this.contentRequests.set(id, request);
    return request;
  }

  async getServerStats(): Promise<ServerStats | undefined> {
    return this.serverStats;
  }

  async updateServerStats(insertStats: InsertServerStats): Promise<ServerStats> {
    const id = this.serverStats?.id || randomUUID();
    this.serverStats = { 
      ...insertStats, 
      id, 
      updatedAt: new Date() 
    };
    return this.serverStats;
  }
}

export const storage = new MemStorage();
