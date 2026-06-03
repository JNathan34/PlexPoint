export interface MembershipTier {
  id: string;
  name: string;
  price: number;
  features: string[];
  maxStreams: number;
  priority: string;
  kofiTierId: string;
}

export type MembershipTierId = "bronze" | "silver" | "gold" | "diamond" | "ruby" | "platinum";

export interface MembershipAddOn {
  id: string;
  name: string;
  price: number; // in pence
  billing: "each" | "month";
  description: string;
  repeatable: boolean;
  availableFromTierId: MembershipTierId;
}

export const MEMBERSHIP_TIERS: MembershipTier[] = [
  {
    id: "bronze",
    name: "Bronze Tier",
    price: 250,
    features: ["Access to Plex", "Enjoy all the movies and shows already available on Plex"],
    maxStreams: 1,
    priority: "basic",
    kofiTierId: "bronze_tier",
  },
  {
    id: "silver",
    name: "Silver Tier",
    price: 350,
    features: ["5 Movie requests", "3 Season requests", "3 to 5 day Processing time", "Access to Plex", "Enjoy more freedom with 5 movie requests and 3 season requests per month"],
    maxStreams: 2,
    priority: "silver",
    kofiTierId: "silver_tier",
  },
  {
    id: "gold",
    name: "Gold Tier",
    price: 500,
    features: ["7 Movie requests", "5 Season requests", "3 to 4 day Processing time", "Access to Plex", "Unlock even more with 7 movie requests and 5 season requests every month"],
    maxStreams: 3,
    priority: "gold",
    kofiTierId: "gold_tier",
  },
  {
    id: "diamond",
    name: "Diamond Tier",
    price: 700,
    features: ["10 Movie requests", "7 Season requests", "2 to 3 day Processing time", "Access to Plex", "Unlock even more with 10 movie requests and 7 season requests every month"],
    maxStreams: 4,
    priority: "diamond",
    kofiTierId: "diamond_tier",
  },
  {
    id: "ruby",
    name: "Ruby Tier",
    price: 1000,
    features: ["20 Movie requests", "15 Season requests", "Requests are processed within 48 Hours", "Access to Plex", "Enjoy more freedom with 20 movie requests and 15 season requests per month"],
    maxStreams: 5,
    priority: "ruby",
    kofiTierId: "ruby_tier",
  },
  {
    id: "platinum",
    name: "Platinum Tier",
    price: 1500,
    features: ["30 Movie requests", "30 Season requests", "Requests are processed within 24 Hours", "Access to Plex", "Unlock even more with 30 movie requests and 30 season requests every month"],
    maxStreams: -1,
    priority: "platinum",
    kofiTierId: "platinum_tier",
  },
];

export const MEMBERSHIP_ADD_ONS: MembershipAddOn[] = [
  {
    id: "extra-season",
    name: "Extra Season Request",
    price: 100,
    billing: "each",
    description: "Adds 1 extra season request.",
    repeatable: true,
    availableFromTierId: "silver",
  },
  {
    id: "extra-movie",
    name: "Extra Movie Request",
    price: 50,
    billing: "each",
    description: "Adds 1 extra movie request.",
    repeatable: true,
    availableFromTierId: "silver",
  },
  {
    id: "extra-household-member",
    name: "Extra Household Member",
    price: 250,
    billing: "month",
    description: "Add another person from outside your household to your plan.",
    repeatable: true,
    availableFromTierId: "silver",
  },
];

export const SERVER_STATS = {
  totalMovies: "1k+",
  totalTvShows: "200+",
  uptime: "99.9%",
};
