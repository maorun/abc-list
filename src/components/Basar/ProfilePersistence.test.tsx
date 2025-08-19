/**
 * Test for the profile persistence issue fix
 * Verifies that profiles created in Basar persist when switching to Community and back
 */

import {describe, it, expect, beforeEach} from "vitest";
import {ProfileService} from "../../lib/ProfileService";
import {BasarService} from "./BasarService";
import {UNIFIED_PROFILE_STORAGE_KEYS} from "../../types/profile";

describe("Profile Persistence Fix", () => {
  let profileService: ProfileService;
  let basarService: BasarService;

  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();

    // Reset singleton instances
    ProfileService.resetInstance();
    profileService = ProfileService.getInstance();
    basarService = BasarService.getInstance();
  });

  it("should maintain profile persistence between Basar and Community", () => {
    // 1. Create a unified profile (as if created in Basar)
    const profile = profileService.createUnifiedProfile({
      displayName: "Test User",
      bio: "Test bio",
      expertise: [],
    });

    // 2. Verify profile is created and saved
    expect(profile.displayName).toBe("Test User");
    expect(
      localStorage.getItem(UNIFIED_PROFILE_STORAGE_KEYS.USER_PROFILE),
    ).toBeTruthy();

    // 3. Verify BasarService can find the profile
    const basarUser = basarService.getCurrentUser();
    expect(basarUser).toBeTruthy();
    expect(basarUser?.displayName).toBe("Test User");
    expect(basarUser?.trading.points).toBe(100); // Starting points

    // 4. Simulate going to Community and back - profile should still exist
    const profileFromStorage = profileService.getUnifiedProfile();
    expect(profileFromStorage).toBeTruthy();
    expect(profileFromStorage?.displayName).toBe("Test User");

    // 5. BasarService should still find the same profile
    const basarUserAfter = basarService.getCurrentUser();
    expect(basarUserAfter).toBeTruthy();
    expect(basarUserAfter?.id).toBe(profile.id);
    expect(basarUserAfter?.displayName).toBe("Test User");
  });

  it("should update trading data correctly in unified profile", () => {
    // Create profile
    const profile = profileService.createUnifiedProfile({
      displayName: "Trader User",
      bio: "",
      expertise: [],
    });

    // Update trading data through BasarService
    const success = basarService.updateUserTradingData({
      points: 150,
      level: 2,
      tradesCompleted: 1,
      termsContributed: 5,
    });

    expect(success).toBe(true);

    // Verify the update persisted
    const updatedProfile = basarService.getCurrentUser();
    expect(updatedProfile?.trading.points).toBe(150);
    expect(updatedProfile?.trading.level).toBe(2);
    expect(updatedProfile?.trading.tradesCompleted).toBe(1);
    expect(updatedProfile?.trading.termsContributed).toBe(5);

    // Verify it's the same profile ID
    expect(updatedProfile?.id).toBe(profile.id);
  });

  it("should handle legacy profile migration", () => {
    // Create mock legacy community profile
    const legacyCommunityProfile = {
      userId: "legacy-user-123",
      displayName: "Legacy User",
      bio: "Legacy bio",
      expertise: [],
      mentorAvailable: false,
      menteeInterested: false,
      joinDate: "2024-01-01T00:00:00.000Z",
      lastActive: "2024-01-02T00:00:00.000Z",
      reputation: 50,
      contributionCount: 10,
      helpfulReviews: 5,
    };

    // Save legacy profile to localStorage
    localStorage.setItem(
      "community_user_profile",
      JSON.stringify(legacyCommunityProfile),
    );

    // Migration should work
    const migrated = profileService.migrateLegacyProfiles();
    expect(migrated).toBe(true);

    // BasarService should find the migrated profile
    const basarUser = basarService.getCurrentUser();
    expect(basarUser).toBeTruthy();
    expect(basarUser?.displayName).toBe("Legacy User");
    expect(basarUser?.community.bio).toBe("Legacy bio");
    expect(basarUser?.community.reputation).toBe(50);
    expect(basarUser?.trading.points).toBe(100); // Default starting points
  });
});
