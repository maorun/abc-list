import {WordWithExplanation} from "../List/types";

export interface MarketplaceTerm extends WordWithExplanation {
  id: string;
  letter: string;
  listName: string;
  sellerId: string;
  sellerName: string;
  price: number;
  quality: number; // Average rating 1-5
  ratingCount: number;
  dateAdded: string;
  category?: string;
}

export interface TermRating {
  termId: string;
  userId: string;
  rating: number; // 1-5 stars
  comment?: string;
  date: string;
}

export interface UserProfile {
  id: string;
  name: string;
  points: number;
  level: number;
  joinDate: string;
  tradesCompleted: number;
  termsContributed: number;
  averageRating: number;
  achievements: UserAchievement[];
  tradingHistory: TradeRecord[];
}

export interface UserAchievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  dateEarned: string;
  points: number;
}

export interface TradeRecord {
  id: string;
  type: "buy" | "sell";
  termId: string;
  termText: string;
  letter: string;
  price: number;
  partnerId: string;
  partnerName: string;
  date: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  requirement: {
    type: "trades" | "contributions" | "rating" | "points";
    value: number;
  };
  points: number;
}

export interface TradeOffer {
  id: string;
  buyerId: string;
  buyerName: string;
  termId: string;
  offerPrice: number;
  message?: string;
  status: "pending" | "accepted" | "declined" | "expired";
  dateCreated: string;
}

// Storage keys for marketplace data
export const MARKETPLACE_TERMS_KEY = "bazarMarketplaceTerms";
export const USER_PROFILES_KEY = "bazarUserProfiles";
export const TERM_RATINGS_KEY = "bazarTermRatings";
export const TRADE_OFFERS_KEY = "bazarTradeOffers";
export const CURRENT_USER_KEY = "bazarCurrentUser";

// Default achievements
export const DEFAULT_ACHIEVEMENTS: Achievement[] = [
  {
    id: "first-trade",
    name: "Erster Handel",
    description: "Führe deinen ersten Handel im Basar durch",
    icon: "🤝",
    requirement: {type: "trades", value: 1},
    points: 10,
  },
  {
    id: "prolific-trader",
    name: "Aktiver Händler",
    description: "Führe 10 Handelsgeschäfte durch",
    icon: "💼",
    requirement: {type: "trades", value: 10},
    points: 50,
  },
  {
    id: "merchant-master",
    name: "Handelsmeister",
    description: "Führe 50 Handelsgeschäfte durch",
    icon: "👑",
    requirement: {type: "trades", value: 50},
    points: 200,
  },
  {
    id: "contributor",
    name: "Wissenscontributor",
    description: "Stelle 25 Begriffe im Basar zur Verfügung",
    icon: "📚",
    requirement: {type: "contributions", value: 25},
    points: 75,
  },
  {
    id: "quality-curator",
    name: "Qualitätskurator",
    description: "Erreiche eine durchschnittliche Bewertung von 4.5 Sternen",
    icon: "⭐",
    requirement: {type: "rating", value: 4.5},
    points: 100,
  },
  {
    id: "wealthy-trader",
    name: "Reicher Händler",
    description: "Sammle 1000 Punkte",
    icon: "💰",
    requirement: {type: "points", value: 1000},
    points: 150,
  },
];
