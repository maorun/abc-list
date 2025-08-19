/**
 * Unified Profile System Types
 * Consolidates Community and Basar profile systems into a single coherent interface
 */

import {UserExpertise} from "../lib/CommunityService";
import {UserAchievement, TradeRecord} from "../components/Basar/types";

/**
 * Authentication information for Google login and other providers
 */
export interface AuthInfo {
  provider: "google" | "manual";
  email?: string;
  providerId?: string;
  lastLogin: string;
  isVerified: boolean;
}

/**
 * Community-related profile fields
 */
export interface CommunityData {
  bio: string;
  expertise: UserExpertise[];
  mentorAvailable: boolean;
  menteeInterested: boolean;
  reputation: number;
  contributionCount: number;
  helpfulReviews: number;
}

/**
 * Basar/Trading-related profile fields
 */
export interface TradingData {
  points: number;
  level: number;
  tradesCompleted: number;
  termsContributed: number;
  averageRating: number;
  achievements: UserAchievement[];
  tradingHistory: TradeRecord[];
}

/**
 * Unified User Profile that combines all systems
 * This interface replaces both CommunityProfile and UserProfile (Basar)
 */
export interface UnifiedUserProfile {
  // Core identity
  id: string;
  displayName: string;
  joinDate: string;
  lastActive: string;

  // Authentication
  auth: AuthInfo;

  // Community features
  community: CommunityData;

  // Trading/Basar features
  trading: TradingData;

  // System metadata
  version: number; // For data migration and compatibility
  migrated?: boolean; // Flag to indicate if profile was migrated from separate systems
}

/**
 * Profile creation data for new users
 */
export interface CreateProfileData {
  displayName: string;
  bio?: string;
  expertise?: UserExpertise[];
  mentorAvailable?: boolean;
  menteeInterested?: boolean;
  auth?: Partial<AuthInfo>;
}

/**
 * Profile update data (all fields optional except id)
 */
export interface UpdateProfileData {
  id: string;
  displayName?: string;
  bio?: string;
  expertise?: UserExpertise[];
  mentorAvailable?: boolean;
  menteeInterested?: boolean;
  // Trading data is typically updated through specific service methods
}

/**
 * Legacy profile migration interfaces for backward compatibility
 */
export interface LegacyCommunityProfile {
  userId: string;
  displayName: string;
  bio: string;
  expertise: UserExpertise[];
  mentorAvailable: boolean;
  menteeInterested: boolean;
  joinDate: string;
  lastActive: string;
  reputation: number;
  contributionCount: number;
  helpfulReviews: number;
}

export interface LegacyBasarProfile {
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

/**
 * Storage keys for unified profile system
 */
export const UNIFIED_PROFILE_STORAGE_KEYS = {
  USER_PROFILE: "unified_user_profile",
  MIGRATION_STATUS: "profile_migration_status",
} as const;
