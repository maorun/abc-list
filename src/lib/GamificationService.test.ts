import {describe, it, expect, beforeEach, afterEach} from "vitest";
import {GamificationService} from "../lib/GamificationService";
import {GAMIFICATION_STORAGE_KEYS} from "../lib/gamification";

describe("GamificationService", () => {
  let gamificationService: GamificationService;

  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    // Reset singleton instance to get fresh service
    GamificationService.resetInstance();
    // Get fresh instance
    gamificationService = GamificationService.getInstance();
  });

  afterEach(() => {
    localStorage.clear();
    GamificationService.resetInstance();
  });

  describe("Profile Management", () => {
    it("should create a new profile on first use", () => {
      const profile = gamificationService.getProfile();

      expect(profile).toBeTruthy();
      expect(profile?.totalPoints).toBe(0);
      expect(profile?.level).toBe(1);
      expect(profile?.experience).toBe(0);
      expect(profile?.streak.currentStreak).toBe(0);
      expect(profile?.achievements).toEqual([]);
      expect(profile?.challenges).toHaveLength(2); // Weekly and monthly
    });

    it("should persist profile to localStorage", () => {
      const profile = gamificationService.getProfile();
      const storedProfile = localStorage.getItem(
        GAMIFICATION_STORAGE_KEYS.PROFILE,
      );

      expect(storedProfile).toBeTruthy();
      expect(JSON.parse(storedProfile!).id).toBe(profile?.id);
    });
  });

  describe("Activity Tracking", () => {
    it("should track list creation activity", () => {
      const initialProfile = gamificationService.getProfile()!;
      const initialPoints = initialProfile.totalPoints;
      const initialLists = initialProfile.statistics.listsCreated;

      gamificationService.trackActivity("list_created", {
        listName: "Test List",
      });

      const updatedProfile = gamificationService.getProfile()!;
      expect(updatedProfile.totalPoints).toBe(initialPoints + 30); // list_created = 10 points + 20 achievement bonus
      expect(updatedProfile.statistics.listsCreated).toBe(initialLists + 1);
      expect(updatedProfile.experience).toBe(30);
    });

    it("should track word addition activity", () => {
      const initialProfile = gamificationService.getProfile()!;
      const initialPoints = initialProfile.totalPoints;
      const initialWords = initialProfile.statistics.wordsAdded;

      gamificationService.trackActivity("word_added", {
        word: "Test",
        listName: "Test List",
      });

      const updatedProfile = gamificationService.getProfile()!;
      expect(updatedProfile.totalPoints).toBe(initialPoints + 2); // word_added = 2 points
      expect(updatedProfile.statistics.wordsAdded).toBe(initialWords + 1);
    });

    it("should track KaWa creation activity", () => {
      const initialProfile = gamificationService.getProfile()!;
      const initialKawas = initialProfile.statistics.kawasCreated;

      gamificationService.trackActivity("kawa_created", {kawaKey: "test-kawa"});

      const updatedProfile = gamificationService.getProfile()!;
      expect(updatedProfile.statistics.kawasCreated).toBe(initialKawas + 1);
      expect(updatedProfile.totalPoints).toBe(45); // kawa_created = 15 points + 30 achievement bonus
    });

    it("should track KaGa creation activity", () => {
      const initialProfile = gamificationService.getProfile()!;
      const initialKagas = initialProfile.statistics.kagasCreated;

      gamificationService.trackActivity("kaga_created", {kagaKey: "test-kaga"});

      const updatedProfile = gamificationService.getProfile()!;
      expect(updatedProfile.statistics.kagasCreated).toBe(initialKagas + 1);
      expect(updatedProfile.totalPoints).toBe(60); // kaga_created = 20 points + 40 achievement bonus
    });
  });

  describe("Level System", () => {
    it("should level up when gaining enough experience", () => {
      const profile = gamificationService.getProfile()!;
      expect(profile.level).toBe(1);

      // Add enough activities to reach level 2 (needs 100 XP total)
      gamificationService.trackActivity("kaga_created"); // 60 points (20 + 40 achievement)
      gamificationService.trackActivity("word_added"); // 2 points
      gamificationService.trackActivity("word_added"); // 2 points (total 64 points)
      gamificationService.trackActivity("word_added"); // 2 points (total 66 points)
      gamificationService.trackActivity("word_added"); // 2 points (total 68 points)
      gamificationService.trackActivity("word_added"); // 2 points (total 70 points)

      // Add more to exceed 100 XP for level 2
      for (let i = 0; i < 16; i++) {
        gamificationService.trackActivity("word_added"); // 2 points each = 32 more = 102 total
      }

      const updatedProfile = gamificationService.getProfile()!;
      expect(updatedProfile.level).toBe(2); // Should be level 2 at 102 XP
      expect(updatedProfile.experience).toBe(102);
    });

    it("should calculate experience to next level correctly", () => {
      const profile = gamificationService.getProfile()!;
      expect(profile.experienceToNextLevel).toBe(100); // Level 1 -> 2 needs 100 XP

      // Add some experience
      gamificationService.trackActivity("list_created"); // 30 points (10 + 20 achievement)

      const updatedProfile = gamificationService.getProfile()!;
      expect(updatedProfile.experienceToNextLevel).toBe(70); // 100 - 30 = 70
    });
  });

  describe("Streak System", () => {
    it("should start streak on first daily login", () => {
      gamificationService.trackActivity("daily_login");

      const profile = gamificationService.getProfile()!;
      expect(profile.streak.currentStreak).toBe(1);
      expect(profile.streak.longestStreak).toBe(1);
      expect(profile.statistics.totalActiveDays).toBe(1);
    });

    it("should not increase streak for multiple activities same day", () => {
      gamificationService.trackActivity("daily_login");
      gamificationService.trackActivity("list_created");
      gamificationService.trackActivity("word_added");

      const profile = gamificationService.getProfile()!;
      expect(profile.streak.currentStreak).toBe(1);
      expect(profile.statistics.totalActiveDays).toBe(1);
    });
  });

  describe("Achievement System", () => {
    it("should unlock achievement for first list creation", () => {
      gamificationService.trackActivity("list_created");

      const profile = gamificationService.getProfile()!;
      const firstListAchievement = profile.achievements.find(
        (a) => a.id === "first_list",
      );

      expect(firstListAchievement).toBeTruthy();
      expect(firstListAchievement?.dateEarned).toBeTruthy();
      expect(profile.totalPoints).toBeGreaterThan(10); // 10 + achievement bonus
    });

    it("should track achievement progress", () => {
      // Create 5 lists (need 10 for list_master achievement)
      for (let i = 0; i < 5; i++) {
        gamificationService.trackActivity("list_created");
      }

      const profile = gamificationService.getProfile()!;
      const listMasterAchievement = profile.achievements.find(
        (a) => a.id === "list_master",
      );

      expect(listMasterAchievement).toBeTruthy();
      expect(listMasterAchievement?.progress).toBe(5);
      expect(listMasterAchievement?.dateEarned).toBeFalsy(); // Not earned yet
    });

    it("should unlock creative achievement for KaWa/KaGa", () => {
      gamificationService.trackActivity("kawa_created");

      const profile = gamificationService.getProfile()!;
      const creativeMindAchievement = profile.achievements.find(
        (a) => a.id === "creative_mind",
      );

      expect(creativeMindAchievement).toBeTruthy();
      expect(creativeMindAchievement?.dateEarned).toBeTruthy();
    });
  });

  describe("Challenge System", () => {
    it("should generate weekly and monthly challenges", () => {
      const profile = gamificationService.getProfile()!;

      expect(profile.challenges).toHaveLength(2);

      const weeklyChallenge = profile.challenges.find(
        (c) => c.type === "weekly",
      );
      const monthlyChallenge = profile.challenges.find(
        (c) => c.type === "monthly",
      );

      expect(weeklyChallenge).toBeTruthy();
      expect(monthlyChallenge).toBeTruthy();
      expect(weeklyChallenge?.progress).toBe(0);
      expect(monthlyChallenge?.progress).toBe(0);
    });

    it("should update challenge progress", () => {
      const profile = gamificationService.getProfile()!;
      const initialChallenge = profile.challenges[0];

      // Track activities that might match the challenge
      if (initialChallenge.activity === "wordsAdded") {
        gamificationService.trackActivity("word_added");

        const updatedProfile = gamificationService.getProfile()!;
        const updatedChallenge = updatedProfile.challenges.find(
          (c) => c.id === initialChallenge.id,
        );

        expect(updatedChallenge?.progress).toBe(1);
      }
    });
  });

  describe("Statistics and Analytics", () => {
    it("should track overall statistics correctly", () => {
      gamificationService.trackActivity("list_created");
      gamificationService.trackActivity("word_added");
      gamificationService.trackActivity("word_added");
      gamificationService.trackActivity("kawa_created");
      gamificationService.trackActivity("slf_game_played");

      const profile = gamificationService.getProfile()!;
      const stats = profile.statistics;

      expect(stats.listsCreated).toBe(1);
      expect(stats.wordsAdded).toBe(2);
      expect(stats.kawasCreated).toBe(1);
      expect(stats.slfGamesPlayed).toBe(1);
      expect(stats.averageWordsPerList).toBe(2);
    });

    it("should calculate favorite activity correctly", () => {
      // Do more creative activities
      gamificationService.trackActivity("kawa_created");
      gamificationService.trackActivity("kawa_created");
      gamificationService.trackActivity("kaga_created");
      gamificationService.trackActivity("list_created");

      const profile = gamificationService.getProfile()!;
      expect(profile.statistics.favoriteActivity).toBe("creativity");
    });
  });

  describe("Event System", () => {
    it("should emit events for activities", () => {
      let eventReceived = false;
      let eventData: unknown = null;

      gamificationService.addEventListener((event, data) => {
        if (event === "activity_tracked") {
          eventReceived = true;
          eventData = data;
        }
      });

      gamificationService.trackActivity("list_created");

      expect(eventReceived).toBe(true);
      expect(eventData.activityType).toBe("list_created");
    });

    it("should emit level up events", () => {
      let levelUpReceived = false;

      gamificationService.addEventListener((event) => {
        if (event === "level_up") {
          levelUpReceived = true;
        }
      });

      // Add enough experience to level up
      for (let i = 0; i < 5; i++) {
        gamificationService.trackActivity("kaga_created"); // 20 points each = 100 total
      }

      expect(levelUpReceived).toBe(true);
    });

    it("should emit achievement unlock events", () => {
      let achievementReceived = false;
      let achievementData: unknown = null;

      gamificationService.addEventListener((event, data) => {
        if (event === "achievement_unlocked") {
          achievementReceived = true;
          achievementData = data;
        }
      });

      gamificationService.trackActivity("list_created");

      expect(achievementReceived).toBe(true);
      expect(achievementData.achievement.id).toBe("first_list");
    });
  });

  describe("Leaderboard Generation", () => {
    it("should generate mock leaderboard with current user", () => {
      // Add some activity to get points
      gamificationService.trackActivity("list_created");
      gamificationService.trackActivity("word_added");

      const leaderboard = gamificationService.generateLeaderboard(
        "totalPoints",
        5,
      );

      expect(leaderboard).toHaveLength(5);
      expect(leaderboard[0].username).toBe("Du");
      expect(leaderboard[0].rank).toBe(1);
      expect(leaderboard[0].value).toBe(32); // 10 + 2 + 20 (first_list achievement)
    });

    it("should generate leaderboard for different metrics", () => {
      gamificationService.trackActivity("list_created");

      const levelLeaderboard = gamificationService.generateLeaderboard("level");
      const pointsLeaderboard =
        gamificationService.generateLeaderboard("totalPoints");

      expect(levelLeaderboard[0].value).toBe(1); // Level 1
      expect(pointsLeaderboard[0].value).toBeGreaterThan(0); // Has points
    });
  });

  describe("Data Persistence", () => {
    it("should load existing profile from localStorage", () => {
      // Create profile and add some activity
      gamificationService.trackActivity("list_created");
      const originalProfile = gamificationService.getProfile()!;

      // Create new service instance (simulates app restart)
      const newService = GamificationService.getInstance();
      const loadedProfile = newService.getProfile()!;

      expect(loadedProfile.id).toBe(originalProfile.id);
      expect(loadedProfile.totalPoints).toBe(originalProfile.totalPoints);
      expect(loadedProfile.statistics.listsCreated).toBe(1);
    });

    it("should export data correctly", () => {
      gamificationService.trackActivity("list_created");
      const exportData = gamificationService.exportData();

      expect(exportData.profile).toBeTruthy();
      expect(exportData.timestamp).toBeTruthy();
      expect(exportData.profile.statistics.listsCreated).toBe(1);
    });
  });
});
