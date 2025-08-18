/**
 * ProfileService Tests
 * Tests for unified profile management and Google authentication
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { ProfileService } from "./ProfileService";
import { UNIFIED_PROFILE_STORAGE_KEYS } from "../types/profile";
import { COMMUNITY_STORAGE_KEYS } from "./CommunityService";
import { USER_PROFILES_KEY, CURRENT_USER_KEY } from "../components/Basar/types";

describe("ProfileService", () => {
  let profileService: ProfileService;

  beforeEach(() => {
    localStorage.clear();
    ProfileService.resetInstance();
    profileService = ProfileService.getInstance();

    // Mock environment variables for Supabase
    vi.stubGlobal("import.meta.env", {
      VITE_SUPABASE_URL: undefined,
      VITE_SUPABASE_ANON_KEY: undefined,
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe("Singleton Pattern", () => {
    it("should return the same instance", () => {
      const instance1 = ProfileService.getInstance();
      const instance2 = ProfileService.getInstance();
      expect(instance1).toBe(instance2);
    });

    it("should reset instance correctly", () => {
      const instance1 = ProfileService.getInstance();
      ProfileService.resetInstance();
      const instance2 = ProfileService.getInstance();
      expect(instance1).not.toBe(instance2);
    });
  });

  describe("Profile Management", () => {
    it("should return null when no profile exists", () => {
      const profile = profileService.getUnifiedProfile();
      expect(profile).toBeNull();
    });

    it("should create a new unified profile", () => {
      const profileData = {
        displayName: "Test User",
        bio: "Test bio",
        expertise: [],
        mentorAvailable: true,
        menteeInterested: false,
      };

      const profile = profileService.createUnifiedProfile(profileData);

      expect(profile).toBeDefined();
      expect(profile.displayName).toBe("Test User");
      expect(profile.community.bio).toBe("Test bio");
      expect(profile.community.mentorAvailable).toBe(true);
      expect(profile.trading.points).toBe(100);
      expect(profile.trading.level).toBe(1);
      expect(profile.version).toBe(1);
      expect(profile.migrated).toBe(false);
    });

    it("should save and retrieve unified profile", () => {
      const profileData = {
        displayName: "Test User",
        bio: "Test bio",
      };

      const createdProfile = profileService.createUnifiedProfile(profileData);
      const retrievedProfile = profileService.getUnifiedProfile();

      expect(retrievedProfile).toEqual(createdProfile);
    });

    it("should update existing profile", () => {
      const profileData = {
        displayName: "Test User",
        bio: "Original bio",
      };

      const profile = profileService.createUnifiedProfile(profileData);
      
      const updateData = {
        id: profile.id,
        displayName: "Updated User",
        bio: "Updated bio",
      };

      const success = profileService.updateUnifiedProfile(updateData);
      expect(success).toBe(true);

      const updatedProfile = profileService.getUnifiedProfile();
      expect(updatedProfile?.displayName).toBe("Updated User");
      expect(updatedProfile?.community.bio).toBe("Updated bio");
    });

    it("should fail to update non-existent profile", () => {
      const updateData = {
        id: "non-existent-id",
        displayName: "Test",
      };

      const success = profileService.updateUnifiedProfile(updateData);
      expect(success).toBe(false);
    });

    it("should handle JSON parsing errors gracefully", () => {
      localStorage.setItem(UNIFIED_PROFILE_STORAGE_KEYS.USER_PROFILE, "invalid json");
      
      const profile = profileService.getUnifiedProfile();
      expect(profile).toBeNull();
    });
  });

  describe("Legacy Profile Migration", () => {
    it("should return false when no legacy profiles exist", () => {
      const migrated = profileService.migrateLegacyProfiles();
      expect(migrated).toBe(false);
    });

    it("should return false when unified profile already exists", () => {
      // Create unified profile first
      profileService.createUnifiedProfile({ displayName: "Test" });
      
      const migrated = profileService.migrateLegacyProfiles();
      expect(migrated).toBe(false);
    });

    it("should return false when migration already completed", () => {
      localStorage.setItem(UNIFIED_PROFILE_STORAGE_KEYS.MIGRATION_STATUS, "completed");
      
      const migrated = profileService.migrateLegacyProfiles();
      expect(migrated).toBe(false);
    });

    it("should migrate legacy community profile", () => {
      const legacyCommunityProfile = {
        userId: "community-user-123",
        displayName: "Community User",
        bio: "Community bio",
        expertise: [{ area: "Mathematik", level: "Advanced", verified: false, endorsements: 0 }],
        mentorAvailable: true,
        menteeInterested: false,
        joinDate: "2024-01-01T00:00:00.000Z",
        lastActive: "2024-01-02T00:00:00.000Z",
        reputation: 50,
        contributionCount: 10,
        helpfulReviews: 5,
      };

      localStorage.setItem(COMMUNITY_STORAGE_KEYS.USER_PROFILE, JSON.stringify(legacyCommunityProfile));

      const migrated = profileService.migrateLegacyProfiles();
      expect(migrated).toBe(true);

      const unifiedProfile = profileService.getUnifiedProfile();
      expect(unifiedProfile).toBeDefined();
      expect(unifiedProfile?.id).toBe("community-user-123");
      expect(unifiedProfile?.displayName).toBe("Community User");
      expect(unifiedProfile?.community.bio).toBe("Community bio");
      expect(unifiedProfile?.community.reputation).toBe(50);
      expect(unifiedProfile?.trading.points).toBe(100); // Default value
      expect(unifiedProfile?.migrated).toBe(true);
    });

    it("should migrate legacy basar profile", () => {
      const legacyBasarProfile = {
        id: "basar-user-123",
        name: "Basar User",
        points: 250,
        level: 3,
        joinDate: "2024-01-01T00:00:00.000Z",
        tradesCompleted: 15,
        termsContributed: 30,
        averageRating: 4.5,
        achievements: [{ id: "test", name: "Test", description: "Test", icon: "🏆", dateEarned: "2024-01-01", points: 10 }],
        tradingHistory: [],
      };

      localStorage.setItem(USER_PROFILES_KEY, JSON.stringify([legacyBasarProfile]));
      localStorage.setItem(CURRENT_USER_KEY, "basar-user-123");

      const migrated = profileService.migrateLegacyProfiles();
      expect(migrated).toBe(true);

      const unifiedProfile = profileService.getUnifiedProfile();
      expect(unifiedProfile).toBeDefined();
      expect(unifiedProfile?.id).toBe("basar-user-123");
      expect(unifiedProfile?.displayName).toBe("Basar User");
      expect(unifiedProfile?.trading.points).toBe(250);
      expect(unifiedProfile?.trading.level).toBe(3);
      expect(unifiedProfile?.trading.tradesCompleted).toBe(15);
      expect(unifiedProfile?.community.bio).toBe(""); // Default value
      expect(unifiedProfile?.migrated).toBe(true);
    });

    it("should migrate both legacy profiles with community profile taking precedence for name", () => {
      const legacyCommunityProfile = {
        userId: "user-123",
        displayName: "Community Name",
        bio: "Community bio",
        expertise: [],
        mentorAvailable: false,
        menteeInterested: false,
        joinDate: "2024-01-01T00:00:00.000Z",
        lastActive: "2024-01-02T00:00:00.000Z",
        reputation: 10,
        contributionCount: 5,
        helpfulReviews: 2,
      };

      const legacyBasarProfile = {
        id: "user-456",
        name: "Basar Name",
        points: 200,
        level: 2,
        joinDate: "2024-01-01T00:00:00.000Z",
        tradesCompleted: 8,
        termsContributed: 20,
        averageRating: 4.0,
        achievements: [],
        tradingHistory: [],
      };

      localStorage.setItem(COMMUNITY_STORAGE_KEYS.USER_PROFILE, JSON.stringify(legacyCommunityProfile));
      localStorage.setItem(USER_PROFILES_KEY, JSON.stringify([legacyBasarProfile]));
      localStorage.setItem(CURRENT_USER_KEY, "user-456");

      const migrated = profileService.migrateLegacyProfiles();
      expect(migrated).toBe(true);

      const unifiedProfile = profileService.getUnifiedProfile();
      expect(unifiedProfile).toBeDefined();
      expect(unifiedProfile?.id).toBe("user-123"); // Community profile ID takes precedence
      expect(unifiedProfile?.displayName).toBe("Community Name"); // Community profile name takes precedence
      expect(unifiedProfile?.community.bio).toBe("Community bio");
      expect(unifiedProfile?.trading.points).toBe(200); // Basar profile data
      expect(unifiedProfile?.migrated).toBe(true);
    });
  });

  describe("Event Listeners", () => {
    it("should add and remove listeners", () => {
      const listener = vi.fn();
      
      profileService.addListener(listener);
      profileService.createUnifiedProfile({ displayName: "Test" });
      
      expect(listener).toHaveBeenCalledTimes(1);
      
      profileService.removeListener(listener);
      profileService.updateUnifiedProfile({ id: "test", displayName: "Updated" });
      
      // Should still be 1 since listener was removed
      expect(listener).toHaveBeenCalledTimes(1);
    });

    it("should notify multiple listeners", () => {
      const listener1 = vi.fn();
      const listener2 = vi.fn();
      
      profileService.addListener(listener1);
      profileService.addListener(listener2);
      
      profileService.createUnifiedProfile({ displayName: "Test" });
      
      expect(listener1).toHaveBeenCalledTimes(1);
      expect(listener2).toHaveBeenCalledTimes(1);
    });
  });

  describe("Authentication", () => {
    it("should return false for isAuthenticated when no profile exists", () => {
      expect(profileService.isAuthenticated()).toBe(false);
    });

    it("should return true for isAuthenticated when profile exists", () => {
      profileService.createUnifiedProfile({ displayName: "Test" });
      expect(profileService.isAuthenticated()).toBe(true);
    });

    it("should return null for getCurrentAuthUser initially", () => {
      expect(profileService.getCurrentAuthUser()).toBeNull();
    });

    it("should handle signInWithGoogle when Supabase is not available", async () => {
      const result = await profileService.signInWithGoogle();
      expect(result.success).toBe(false);
      expect(result.error).toContain("Authentication service not available");
    });
  });

  describe("ID Generation", () => {
    it("should generate unique IDs for different profiles", () => {
      const profile1 = profileService.createUnifiedProfile({ displayName: "User 1" });
      ProfileService.resetInstance();
      const newService = ProfileService.getInstance();
      const profile2 = newService.createUnifiedProfile({ displayName: "User 2" });
      
      expect(profile1.id).not.toBe(profile2.id);
      expect(profile1.id).toMatch(/^user_\d+_\w+$/);
      expect(profile2.id).toMatch(/^user_\d+_\w+$/);
    });
  });
});