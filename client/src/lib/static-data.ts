export interface MembershipTier {
  id: string;
  name: string;
  price: number;
  features: string[];
  maxStreams: number;
  priority: string;
  kofiTierId: string;
}

export const MEMBERSHIP_TIERS: MembershipTier[] = [
  {
    id: "bronze",
    name: "Bronze Tier",
    price: 100,
    features: ["Access to Plex", "Enjoy all the movies and shows already available on Plex"],
    maxStreams: 1,
    priority: "basic",
    kofiTierId: "bronze_tier",
  },
  {
    id: "silver",
    name: "Silver Tier",
    price: 300,
    features: ["5 Movie requests", "7 Season requests", "3 to 5 day Processing time", "Access to Plex", "Enjoy more freedom with 5 movie requests and 7 season requests per month"],
    maxStreams: 2,
    priority: "silver",
    kofiTierId: "silver_tier",
  },
  {
    id: "gold",
    name: "Gold Tier",
    price: 500,
    features: ["10 Movie requests", "15 Season requests", "3 to 4 day Processing time", "Access to Plex", "Unlock even more with 10 movie requests and 15 season requests every month"],
    maxStreams: 3,
    priority: "gold",
    kofiTierId: "gold_tier",
  },
  {
    id: "diamond",
    name: "Diamond Tier",
    price: 700,
    features: ["15 Movie requests", "20 Season requests", "2 to 3 day Processing time", "Access to Plex", "Unlock even more with 15 movie requests and 20 season requests every month"],
    maxStreams: 4,
    priority: "diamond",
    kofiTierId: "diamond_tier",
  },
  {
    id: "ruby",
    name: "Ruby Tier",
    price: 1000,
    features: ["Unlimited Movie requests", "30 Season requests", "Requests are processed within 48 Hours", "Access to Plex", "Enjoy more freedom with unlimited movie requests and 30 season requests per month"],
    maxStreams: 5,
    priority: "ruby",
    kofiTierId: "ruby_tier",
  },
  {
    id: "platinum",
    name: "Platinum Tier",
    price: 1500,
    features: ["Unlimited Movie requests", "Unlimited Season requests", "Requests are processed within 24 Hours", "Access to Plex", "Unlock even more with unlimited movie requests and unlimited season requests every month - the ultimate VIP experience"],
    maxStreams: -1,
    priority: "platinum",
    kofiTierId: "platinum_tier",
  },
];

export const SERVER_STATS = {
  totalMovies: "1k+",
  totalTvShows: "150+",
  uptime: "99.9%",
};
