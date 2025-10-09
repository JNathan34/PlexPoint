// This file contains mock data for development purposes
// In a real application, this data would come from the API

export const mockMovies = [
  {
    id: "1",
    title: "Action Hero",
    type: "movie",
    year: 2023,
    poster: "https://pixabay.com/get/g099d5089b2d3837d140d41bfd2520ff4b94cb50114f4c55000b5088fe37c6e81bbfd33a0f0cd86ec5ddd7a483b3cfcee25fb97c6aa67b7ea7a627f2902193b4a_1280.jpg",
    description: "High-octane action thriller",
    genres: ["Action", "Adventure"],
    rating: "PG-13",
  },
  {
    id: "2",
    title: "Space Odyssey",
    type: "movie",
    year: 2023,
    poster: "https://images.unsplash.com/photo-1485846234645-a62644f84728?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=300&h=450",
    description: "Epic science fiction adventure",
    genres: ["Sci-Fi", "Adventure"],
    rating: "PG-13",
  },
];

export const mockTvShows = [
  {
    id: "1",
    title: "City Life",
    type: "tv",
    seasons: 5,
    poster: "https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=300&h=450",
    description: "Urban drama following interconnected lives",
    genres: ["Drama", "Urban"],
    rating: "TV-14",
  },
];

export const mockMembershipTiers = [
  {
    id: "1",
    name: "Basic Access",
    price: 500, // $5.00 in cents
    features: [
      "Access to full library",
      "2 simultaneous streams",
      "Mobile app access",
      "Basic request priority"
    ],
    maxStreams: 2,
    priority: "basic",
  },
  {
    id: "2",
    name: "Premium",
    price: 1500, // $15.00 in cents
    features: [
      "Everything in Basic",
      "5 simultaneous streams",
      "4K content access",
      "High request priority",
      "Early access to new content"
    ],
    maxStreams: 5,
    priority: "high",
  },
  {
    id: "3",
    name: "VIP Access",
    price: 2500, // $25.00 in cents
    features: [
      "Everything in Premium",
      "Unlimited streams",
      "Personal request channel",
      "Custom collections",
      "Admin consultation"
    ],
    maxStreams: -1, // Unlimited
    priority: "vip",
  },
];

export const mockServerStats = {
  id: "1",
  uptime: "99.9%",
  activeUsers: 47,
  storageUsed: "12.5TB",
  activeStreams: 8,
  totalMovies: 834,
  totalTvShows: 127,
  updatedAt: new Date(),
};
