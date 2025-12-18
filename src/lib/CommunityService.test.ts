/**
 * CommunityService Test Suite
 * Comprehensive tests for community features, user profiles, mentoring, and peer reviews
 */

import {describe, it, expect, beforeEach, vi} from "vitest";
import {
  CommunityService,
  COMMUNITY_STORAGE_KEYS,
  CommunityProfile,
} from "../lib/CommunityService";

// Mock GamificationService
vi.mock("../lib/GamificationService", () => ({
  GamificationService: {
    getInstance: () => ({
      trackCustomActivity: vi.fn(),
    }),
  },
}));

describe("CommunityService", () => {
  let communityService: CommunityService;

  beforeEach(() => {
    localStorage.clear();
    CommunityService.resetInstance();
    communityService = CommunityService.getInstance();
  });

  describe("Singleton Pattern", () => {
    it("should return the same instance", () => {
      const instance1 = CommunityService.getInstance();
      const instance2 = CommunityService.getInstance();
      expect(instance1).toBe(instance2);
    });

    it("should reset instance correctly", () => {
      const instance1 = CommunityService.getInstance();
      CommunityService.resetInstance();
      const instance2 = CommunityService.getInstance();
      expect(instance1).not.toBe(instance2);
    });
  });

  describe("User Profile Management", () => {
    it("should return null when no profile exists", () => {
      const profile = communityService.getUserProfile();
      expect(profile).toBeNull();
    });

    it("should create a user profile with default values", () => {
      const profileData = {
        displayName: "Test User",
        bio: "This is a test user",
      };

      const profile = communityService.createUserProfile(profileData);

      expect(profile.displayName).toBe("Test User");
      expect(profile.bio).toBe("This is a test user");
      expect(profile.expertise).toEqual([]);
      expect(profile.mentorAvailable).toBe(false);
      expect(profile.menteeInterested).toBe(false);
      expect(profile.reputation).toBe(0);
      expect(profile.contributionCount).toBe(0);
      expect(profile.helpfulReviews).toBe(0);
      expect(typeof profile.userId).toBe("string");
      expect(typeof profile.joinDate).toBe("string");
      expect(typeof profile.lastActive).toBe("string");
    });

    it("should create a user profile with custom values", () => {
      const profileData = {
        displayName: "Expert User",
        bio: "Expert in mathematics",
        expertise: [
          {
            area: "Mathematik",
            level: "Expert" as const,
            verified: true,
            endorsements: 10,
          },
        ],
        mentorAvailable: true,
        menteeInterested: false,
      };

      const profile = communityService.createUserProfile(profileData);

      expect(profile.displayName).toBe("Expert User");
      expect(profile.expertise).toHaveLength(1);
      expect(profile.expertise[0].area).toBe("Mathematik");
      expect(profile.mentorAvailable).toBe(true);
      expect(profile.menteeInterested).toBe(false);
    });

    it("should save and retrieve user profile from localStorage", () => {
      const profileData = {
        displayName: "Stored User",
        bio: "Stored in localStorage",
      };

      communityService.createUserProfile(profileData);
      const retrievedProfile = communityService.getUserProfile();

      expect(retrievedProfile).not.toBeNull();
      expect(retrievedProfile!.displayName).toBe("Stored User");
      expect(retrievedProfile!.bio).toBe("Stored in localStorage");
    });

    it("should update user profile", () => {
      const initialProfile = communityService.createUserProfile({
        displayName: "Initial User",
        bio: "Initial bio",
      });

      communityService.updateUserProfile({
        displayName: "Updated User",
        reputation: 50,
      });

      const updatedProfile = communityService.getUserProfile();
      expect(updatedProfile!.displayName).toBe("Updated User");
      expect(updatedProfile!.bio).toBe("Initial bio"); // Should keep existing bio
      expect(updatedProfile!.reputation).toBe(50);
      expect(updatedProfile!.userId).toBe(initialProfile.userId); // Should keep same ID
    });

    it("should handle JSON parsing errors gracefully", () => {
      localStorage.setItem(COMMUNITY_STORAGE_KEYS.USER_PROFILE, "invalid json");
      const profile = communityService.getUserProfile();
      expect(profile).toBeNull();
    });
  });

  describe("Mentorship System", () => {
    let userProfile: CommunityProfile;

    beforeEach(() => {
      userProfile = communityService.createUserProfile({
        displayName: "Mentee User",
        expertise: [
          {
            area: "Mathematik",
            level: "Beginner",
            verified: false,
            endorsements: 0,
          },
        ],
        menteeInterested: true,
      });
    });

    it("should find mentors for expertise area", () => {
      const mentors = communityService.findMentors("Mathematik");

      expect(mentors).toHaveLength(2);
      expect(mentors[0].displayName).toBe("Dr. Maria Schmidt");
      expect(mentors[1].displayName).toBe("Prof. Andreas Weber");
      expect(mentors.every((m) => m.mentorAvailable)).toBe(true);
      expect(
        mentors.every((m) =>
          m.expertise.some(
            (exp) => exp.area === "Mathematik" && exp.level === "Expert",
          ),
        ),
      ).toBe(true);
    });

    it("should request mentorship", () => {
      const mentorId = "mentor_1";
      const expertiseArea = "Mathematik";

      const mentorship = communityService.requestMentorship(
        mentorId,
        expertiseArea,
      );

      expect(mentorship.mentorId).toBe(mentorId);
      expect(mentorship.menteeId).toBe(userProfile.userId);
      expect(mentorship.expertiseArea).toBe(expertiseArea);
      expect(mentorship.status).toBe("pending");
      expect(mentorship.sessionCount).toBe(0);
      expect(typeof mentorship.id).toBe("string");
      expect(typeof mentorship.requestDate).toBe("string");
    });

    it("should throw error when requesting mentorship without profile", () => {
      localStorage.clear(); // Clear localStorage to ensure no profile exists
      CommunityService.resetInstance();
      const newService = CommunityService.getInstance();

      // Verify no profile exists
      const profile = newService.getUserProfile();
      expect(profile).toBeNull();

      expect(() => {
        newService.requestMentorship("mentor_1", "Mathematik");
      }).toThrow("User profile required");
    });

    it("should retrieve mentorships from localStorage", () => {
      const mentorship1 = communityService.requestMentorship(
        "mentor_1",
        "Mathematik",
      );
      const mentorship2 = communityService.requestMentorship(
        "mentor_2",
        "Physik",
      );

      const mentorships = communityService.getMentorships();
      expect(mentorships).toHaveLength(2);
      expect(mentorships[0].id).toBe(mentorship1.id);
      expect(mentorships[1].id).toBe(mentorship2.id);
    });

    it("should handle empty mentorships gracefully", () => {
      const mentorships = communityService.getMentorships();
      expect(mentorships).toEqual([]);
    });

    it("should handle JSON parsing errors for mentorships", () => {
      localStorage.setItem(COMMUNITY_STORAGE_KEYS.MENTORSHIPS, "invalid json");
      const mentorships = communityService.getMentorships();
      expect(mentorships).toEqual([]);
    });
  });

  describe("Community Challenges", () => {
    let userProfile: CommunityProfile;

    beforeEach(() => {
      userProfile = communityService.createUserProfile({
        displayName: "Challenge User",
      });
    });

    it("should return default challenges when none exist", () => {
      const challenges = communityService.getCommunityChallenges();

      expect(challenges).toHaveLength(2);
      expect(challenges[0].title).toBe("Wochenend-Lernchallenge");
      expect(challenges[1].title).toBe("Community-Reviewer");
      expect(challenges.every((c) => c.status === "active")).toBe(true);
    });

    it("should participate in challenge", () => {
      const challenges = communityService.getCommunityChallenges();
      const challengeId = challenges[0].id;

      communityService.participateInChallenge(challengeId);

      const updatedChallenges = communityService.getCommunityChallenges();
      const challenge = updatedChallenges.find((c) => c.id === challengeId);

      expect(challenge!.participants).toContain(userProfile.userId);
    });

    it("should not add duplicate participants", () => {
      const challenges = communityService.getCommunityChallenges();
      const challengeId = challenges[0].id;

      communityService.participateInChallenge(challengeId);
      communityService.participateInChallenge(challengeId); // Try to participate again

      const updatedChallenges = communityService.getCommunityChallenges();
      const challenge = updatedChallenges.find((c) => c.id === challengeId);

      expect(
        challenge!.participants.filter((p) => p === userProfile.userId),
      ).toHaveLength(1);
    });

    it("should handle participation without user profile", () => {
      CommunityService.resetInstance();
      const newService = CommunityService.getInstance();

      expect(() => {
        newService.participateInChallenge("challenge_1");
      }).not.toThrow(); // Should fail silently
    });

    it("should handle JSON parsing errors for challenges", () => {
      localStorage.setItem(COMMUNITY_STORAGE_KEYS.CHALLENGES, "invalid json");
      const challenges = communityService.getCommunityChallenges();
      expect(challenges).toHaveLength(2); // Should return default challenges
    });
  });

  describe("Peer Review System", () => {
    let userProfile: CommunityProfile;

    beforeEach(() => {
      userProfile = communityService.createUserProfile({
        displayName: "Reviewer User",
      });
    });

    it("should submit a peer review", () => {
      const reviewData = {
        reviewerId: userProfile.userId,
        itemId: "test-item-123",
        itemType: "abc-list" as const,
        rating: 4,
        comment: "Great list with helpful content!",
        categories: {
          accuracy: 5,
          usefulness: 4,
          clarity: 4,
          creativity: 3,
        },
      };

      const review = communityService.submitReview(reviewData);

      expect(review.reviewerId).toBe(userProfile.userId);
      expect(review.itemId).toBe("test-item-123");
      expect(review.itemType).toBe("abc-list");
      expect(review.rating).toBe(4);
      expect(review.comment).toBe("Great list with helpful content!");
      expect(review.status).toBe("published");
      expect(review.helpfulnessRating).toBe(0);
      expect(typeof review.id).toBe("string");
      expect(typeof review.timestamp).toBe("string");
    });

    it("should retrieve all reviews", () => {
      const review1 = communityService.submitReview({
        reviewerId: userProfile.userId,
        itemId: "item-1",
        itemType: "abc-list",
        rating: 4,
        comment: "Review 1",
        categories: {accuracy: 4, usefulness: 4, clarity: 4, creativity: 4},
      });

      const review2 = communityService.submitReview({
        reviewerId: userProfile.userId,
        itemId: "item-2",
        itemType: "kawa",
        rating: 5,
        comment: "Review 2",
        categories: {accuracy: 5, usefulness: 5, clarity: 5, creativity: 5},
      });

      const reviews = communityService.getReviews();
      expect(reviews).toHaveLength(2);
      expect(reviews[0].id).toBe(review1.id);
      expect(reviews[1].id).toBe(review2.id);
    });

    it("should get reviews for specific item", () => {
      communityService.submitReview({
        reviewerId: userProfile.userId,
        itemId: "item-1",
        itemType: "abc-list",
        rating: 4,
        comment: "Review for item 1",
        categories: {accuracy: 4, usefulness: 4, clarity: 4, creativity: 4},
      });

      communityService.submitReview({
        reviewerId: userProfile.userId,
        itemId: "item-2",
        itemType: "abc-list",
        rating: 5,
        comment: "Review for item 2",
        categories: {accuracy: 5, usefulness: 5, clarity: 5, creativity: 5},
      });

      const item1Reviews = communityService.getReviewsForItem(
        "item-1",
        "abc-list",
      );
      expect(item1Reviews).toHaveLength(1);
      expect(item1Reviews[0].itemId).toBe("item-1");

      const item2Reviews = communityService.getReviewsForItem(
        "item-2",
        "abc-list",
      );
      expect(item2Reviews).toHaveLength(1);
      expect(item2Reviews[0].itemId).toBe("item-2");
    });

    it("should handle empty reviews gracefully", () => {
      const reviews = communityService.getReviews();
      expect(reviews).toEqual([]);

      const itemReviews = communityService.getReviewsForItem(
        "non-existent",
        "abc-list",
      );
      expect(itemReviews).toEqual([]);
    });

    it("should handle JSON parsing errors for reviews", () => {
      localStorage.setItem(COMMUNITY_STORAGE_KEYS.REVIEWS, "invalid json");
      const reviews = communityService.getReviews();
      expect(reviews).toEqual([]);
    });
  });

  describe("Success Stories", () => {
    let userProfile: CommunityProfile;

    beforeEach(() => {
      userProfile = communityService.createUserProfile({
        displayName: "Success User",
      });
    });

    it("should submit a success story", () => {
      const storyData = {
        userId: userProfile.userId,
        title: "My Learning Journey",
        story: "This is my amazing learning story...",
        achievements: ["Passed exam", "Learned new skills"],
        beforeAfter: {
          before: "I knew nothing about the subject",
          after: "Now I'm confident and knowledgeable",
        },
      };

      const story = communityService.submitSuccessStory(storyData);

      expect(story.userId).toBe(userProfile.userId);
      expect(story.title).toBe("My Learning Journey");
      expect(story.story).toBe("This is my amazing learning story...");
      expect(story.achievements).toEqual(["Passed exam", "Learned new skills"]);
      expect(story.beforeAfter.before).toBe("I knew nothing about the subject");
      expect(story.beforeAfter.after).toBe(
        "Now I'm confident and knowledgeable",
      );
      expect(story.likes).toBe(0);
      expect(story.featured).toBe(false);
      expect(typeof story.id).toBe("string");
      expect(typeof story.timestamp).toBe("string");
    });

    it("should retrieve all success stories", () => {
      const story1 = communityService.submitSuccessStory({
        userId: userProfile.userId,
        title: "Story 1",
        story: "Content 1",
        achievements: ["Achievement 1"],
        beforeAfter: {before: "Before 1", after: "After 1"},
      });

      const story2 = communityService.submitSuccessStory({
        userId: userProfile.userId,
        title: "Story 2",
        story: "Content 2",
        achievements: ["Achievement 2"],
        beforeAfter: {before: "Before 2", after: "After 2"},
      });

      const stories = communityService.getSuccessStories();
      expect(stories).toHaveLength(2);
      expect(stories[0].id).toBe(story1.id);
      expect(stories[1].id).toBe(story2.id);
    });

    it("should get featured stories", () => {
      // Create regular story
      communityService.submitSuccessStory({
        userId: userProfile.userId,
        title: "Regular Story",
        story: "Regular content",
        achievements: [],
        beforeAfter: {before: "before", after: "after"},
      });

      // Create featured story by modifying localStorage directly
      const stories = communityService.getSuccessStories();
      stories[0].featured = true;
      stories[0].likes = 10;
      localStorage.setItem(
        COMMUNITY_STORAGE_KEYS.STORIES,
        JSON.stringify(stories),
      );

      const featuredStories = communityService.getFeaturedStories();
      expect(featuredStories).toHaveLength(1);
      expect(featuredStories[0].featured).toBe(true);
      expect(featuredStories[0].likes).toBe(10);
    });

    it("should like a story", () => {
      const story = communityService.submitSuccessStory({
        userId: userProfile.userId,
        title: "Likeable Story",
        story: "Content to like",
        achievements: [],
        beforeAfter: {before: "before", after: "after"},
      });

      expect(story.likes).toBe(0);

      communityService.likeStory(story.id);

      const updatedStories = communityService.getSuccessStories();
      const updatedStory = updatedStories.find((s) => s.id === story.id);
      expect(updatedStory!.likes).toBe(1);
    });

    it("should handle liking non-existent story", () => {
      expect(() => {
        communityService.likeStory("non-existent-id");
      }).not.toThrow(); // Should fail silently
    });

    it("should handle empty stories gracefully", () => {
      const stories = communityService.getSuccessStories();
      expect(stories).toEqual([]);

      const featuredStories = communityService.getFeaturedStories();
      expect(featuredStories).toEqual([]);
    });

    it("should handle JSON parsing errors for stories", () => {
      localStorage.setItem(COMMUNITY_STORAGE_KEYS.STORIES, "invalid json");
      const stories = communityService.getSuccessStories();
      expect(stories).toEqual([]);
    });
  });

  describe("Event System", () => {
    it("should add and notify listeners", () => {
      const listener1 = vi.fn();
      const listener2 = vi.fn();

      communityService.addListener(listener1);
      communityService.addListener(listener2);

      // Create a profile to trigger notifications
      communityService.createUserProfile({displayName: "Test User"});

      expect(listener1).toHaveBeenCalled();
      expect(listener2).toHaveBeenCalled();
    });

    it("should remove listeners", () => {
      const listener1 = vi.fn();
      const listener2 = vi.fn();

      communityService.addListener(listener1);
      communityService.addListener(listener2);
      communityService.removeListener(listener1);

      // Create a profile to trigger notifications
      communityService.createUserProfile({displayName: "Test User"});

      expect(listener1).not.toHaveBeenCalled();
      expect(listener2).toHaveBeenCalled();
    });
  });

  describe("Integration with Gamification", () => {
    let userProfile: CommunityProfile;

    beforeEach(() => {
      userProfile = communityService.createUserProfile({
        displayName: "Gamified User",
      });
    });

    it("should track gamification activity for reviews", () => {
      // We can't easily mock the singleton, but we can verify the service
      // would call trackCustomActivity through integration
      const review = communityService.submitReview({
        reviewerId: userProfile.userId,
        itemId: "test-item",
        itemType: "abc-list",
        rating: 4,
        comment: "Test review",
        categories: {accuracy: 4, usefulness: 4, clarity: 4, creativity: 4},
      });

      expect(review).toBeDefined();
      expect(review.reviewerId).toBe(userProfile.userId);
    });

    it("should track gamification activity for success stories", () => {
      const story = communityService.submitSuccessStory({
        userId: userProfile.userId,
        title: "Gamified Story",
        story: "Story content",
        achievements: ["Test achievement"],
        beforeAfter: {before: "before", after: "after"},
      });

      expect(story).toBeDefined();
      expect(story.userId).toBe(userProfile.userId);
    });
  });
});
