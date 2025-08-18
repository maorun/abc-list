/**
 * Unified Profile Service
 * Manages user profiles, authentication, and migration from legacy systems
 * Integrates Google OAuth via Supabase and consolidates Community/Basar profiles
 */

import { createClient, SupabaseClient, User, AuthChangeEvent, Session } from "@supabase/supabase-js";
import {
  UnifiedUserProfile,
  CreateProfileData,
  UpdateProfileData,
  AuthInfo,
  LegacyCommunityProfile,
  LegacyBasarProfile,
  UNIFIED_PROFILE_STORAGE_KEYS,
} from "../types/profile";
import { COMMUNITY_STORAGE_KEYS } from "./CommunityService";
import { USER_PROFILES_KEY, CURRENT_USER_KEY } from "../components/Basar/types";

/**
 * ProfileService - Singleton service managing unified user profiles and authentication
 * Handles Google OAuth, profile management, and legacy data migration
 */
export class ProfileService {
  private static instance: ProfileService | null = null;
  private supabaseClient: SupabaseClient | null = null;
  private currentUser: User | null = null;
  private listeners: Array<() => void> = [];

  private constructor() {
    this.initializeSupabase();
  }

  public static getInstance(): ProfileService {
    if (!ProfileService.instance) {
      ProfileService.instance = new ProfileService();
    }
    return ProfileService.instance;
  }

  public static resetInstance(): void {
    ProfileService.instance = null;
  }

  /**
   * Initialize Supabase client for authentication
   */
  private initializeSupabase(): void {
    try {
      // Only initialize if environment variables are available
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      if (supabaseUrl && supabaseKey) {
        this.supabaseClient = createClient(supabaseUrl, supabaseKey);
        
        // Listen for auth state changes
        this.supabaseClient.auth.onAuthStateChange((event: AuthChangeEvent, session: Session | null) => {
          this.handleAuthStateChange(event, session);
        });
      }
    } catch (error) {
      console.warn("Supabase initialization failed, using localStorage fallback:", error);
    }
  }

  /**
   * Handle authentication state changes
   */
  private handleAuthStateChange(event: AuthChangeEvent, session: Session | null): void {
    if (event === "SIGNED_IN" && session?.user) {
      this.currentUser = session.user;
      this.handleGoogleLoginSuccess(session.user);
    } else if (event === "SIGNED_OUT") {
      this.currentUser = null;
    }
    this.notifyListeners();
  }

  /**
   * Handle successful Google login
   */
  private async handleGoogleLoginSuccess(user: User): Promise<void> {
    const existingProfile = this.getUnifiedProfile();
    
    if (!existingProfile) {
      // Create new profile for Google user
      const profileData: CreateProfileData = {
        displayName: user.user_metadata?.full_name || user.email?.split("@")[0] || "Google User",
        bio: "",
        expertise: [],
        auth: {
          provider: "google",
          email: user.email,
          providerId: user.id,
          lastLogin: new Date().toISOString(),
          isVerified: true,
        },
      };
      
      this.createUnifiedProfile(profileData);
    } else {
      // Update existing profile with Google auth info
      this.updateUnifiedProfile({
        id: existingProfile.id,
      });
      
      // Update auth info
      existingProfile.auth = {
        provider: "google",
        email: user.email,
        providerId: user.id,
        lastLogin: new Date().toISOString(),
        isVerified: true,
      };
      
      this.saveUnifiedProfile(existingProfile);
    }
  }

  /**
   * Sign in with Google
   */
  public async signInWithGoogle(): Promise<{ success: boolean; error?: string }> {
    if (!this.supabaseClient) {
      return { success: false, error: "Authentication service not available. Using manual profile creation." };
    }

    try {
      const { error } = await this.supabaseClient.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/abc-list/`,
        },
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : "Unknown authentication error" 
      };
    }
  }

  /**
   * Sign out user
   */
  public async signOut(): Promise<void> {
    if (this.supabaseClient) {
      await this.supabaseClient.auth.signOut();
    }
    this.currentUser = null;
    this.notifyListeners();
  }

  /**
   * Get current unified user profile
   */
  public getUnifiedProfile(): UnifiedUserProfile | null {
    try {
      const profile = localStorage.getItem(UNIFIED_PROFILE_STORAGE_KEYS.USER_PROFILE);
      return profile ? JSON.parse(profile) : null;
    } catch (error) {
      console.error("Failed to load unified profile:", error);
      return null;
    }
  }

  /**
   * Create new unified profile
   */
  public createUnifiedProfile(data: CreateProfileData): UnifiedUserProfile {
    const profile: UnifiedUserProfile = {
      id: this.generateId(),
      displayName: data.displayName,
      joinDate: new Date().toISOString(),
      lastActive: new Date().toISOString(),
      
      auth: {
        provider: "manual",
        lastLogin: new Date().toISOString(),
        isVerified: false,
        ...data.auth,
      },
      
      community: {
        bio: data.bio || "",
        expertise: data.expertise || [],
        mentorAvailable: data.mentorAvailable || false,
        menteeInterested: data.menteeInterested || false,
        reputation: 0,
        contributionCount: 0,
        helpfulReviews: 0,
      },
      
      trading: {
        points: 100, // Starting points
        level: 1,
        tradesCompleted: 0,
        termsContributed: 0,
        averageRating: 0,
        achievements: [],
        tradingHistory: [],
      },
      
      version: 1,
      migrated: false,
    };

    this.saveUnifiedProfile(profile);
    this.notifyListeners();
    return profile;
  }

  /**
   * Update unified profile
   */
  public updateUnifiedProfile(data: UpdateProfileData): boolean {
    const currentProfile = this.getUnifiedProfile();
    if (!currentProfile || currentProfile.id !== data.id) {
      return false;
    }

    const updatedProfile: UnifiedUserProfile = {
      ...currentProfile,
      displayName: data.displayName ?? currentProfile.displayName,
      lastActive: new Date().toISOString(),
      community: {
        ...currentProfile.community,
        bio: data.bio ?? currentProfile.community.bio,
        expertise: data.expertise ?? currentProfile.community.expertise,
        mentorAvailable: data.mentorAvailable ?? currentProfile.community.mentorAvailable,
        menteeInterested: data.menteeInterested ?? currentProfile.community.menteeInterested,
      },
    };

    this.saveUnifiedProfile(updatedProfile);
    this.notifyListeners();
    return true;
  }

  /**
   * Save unified profile to storage
   */
  private saveUnifiedProfile(profile: UnifiedUserProfile): void {
    localStorage.setItem(UNIFIED_PROFILE_STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile));
  }

  /**
   * Migrate legacy profiles to unified system
   */
  public migrateLegacyProfiles(): boolean {
    const migrationStatus = localStorage.getItem(UNIFIED_PROFILE_STORAGE_KEYS.MIGRATION_STATUS);
    if (migrationStatus === "completed") {
      return false; // Already migrated
    }

    const existingUnified = this.getUnifiedProfile();
    if (existingUnified) {
      return false; // Unified profile already exists
    }

    const legacyCommunity = this.getLegacyCommunityProfile();
    const legacyBasar = this.getLegacyBasarProfile();

    if (!legacyCommunity && !legacyBasar) {
      return false; // No legacy profiles to migrate
    }

    // Create unified profile from legacy data
    const unifiedProfile: UnifiedUserProfile = {
      id: legacyCommunity?.userId || legacyBasar?.id || this.generateId(),
      displayName: legacyCommunity?.displayName || legacyBasar?.name || "User",
      joinDate: legacyCommunity?.joinDate || legacyBasar?.joinDate || new Date().toISOString(),
      lastActive: legacyCommunity?.lastActive || new Date().toISOString(),
      
      auth: {
        provider: "manual",
        lastLogin: new Date().toISOString(),
        isVerified: false,
      },
      
      community: {
        bio: legacyCommunity?.bio || "",
        expertise: legacyCommunity?.expertise || [],
        mentorAvailable: legacyCommunity?.mentorAvailable || false,
        menteeInterested: legacyCommunity?.menteeInterested || false,
        reputation: legacyCommunity?.reputation || 0,
        contributionCount: legacyCommunity?.contributionCount || 0,
        helpfulReviews: legacyCommunity?.helpfulReviews || 0,
      },
      
      trading: {
        points: legacyBasar?.points || 100,
        level: legacyBasar?.level || 1,
        tradesCompleted: legacyBasar?.tradesCompleted || 0,
        termsContributed: legacyBasar?.termsContributed || 0,
        averageRating: legacyBasar?.averageRating || 0,
        achievements: legacyBasar?.achievements || [],
        tradingHistory: legacyBasar?.tradingHistory || [],
      },
      
      version: 1,
      migrated: true,
    };

    this.saveUnifiedProfile(unifiedProfile);
    localStorage.setItem(UNIFIED_PROFILE_STORAGE_KEYS.MIGRATION_STATUS, "completed");
    this.notifyListeners();
    return true;
  }

  /**
   * Get legacy community profile for migration
   */
  private getLegacyCommunityProfile(): LegacyCommunityProfile | null {
    try {
      const profile = localStorage.getItem(COMMUNITY_STORAGE_KEYS.USER_PROFILE);
      return profile ? JSON.parse(profile) : null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Get legacy basar profile for migration
   */
  private getLegacyBasarProfile(): LegacyBasarProfile | null {
    try {
      const currentUserId = localStorage.getItem(CURRENT_USER_KEY);
      if (!currentUserId) return null;

      const users = localStorage.getItem(USER_PROFILES_KEY);
      if (!users) return null;

      const userProfiles = JSON.parse(users);
      return userProfiles.find((user: LegacyBasarProfile) => user.id === currentUserId) || null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Add event listener for profile changes
   */
  public addListener(listener: () => void): void {
    this.listeners.push(listener);
  }

  /**
   * Remove event listener
   */
  public removeListener(listener: () => void): void {
    this.listeners = this.listeners.filter((l) => l !== listener);
  }

  /**
   * Notify all listeners of profile changes
   */
  private notifyListeners(): void {
    this.listeners.forEach((listener) => listener());
  }

  /**
   * Generate unique ID for profiles
   */
  private generateId(): string {
    return `user_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  /**
   * Get current authentication status
   */
  public isAuthenticated(): boolean {
    return this.currentUser !== null || this.getUnifiedProfile() !== null;
  }

  /**
   * Get current user from Supabase auth
   */
  public getCurrentAuthUser(): User | null {
    return this.currentUser;
  }
}