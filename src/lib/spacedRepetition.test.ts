import {describe, it, expect, beforeEach} from "vitest";
import {
  calculateNextReview,
  isTermDueForReview,
  getSpacedRepetitionStats,
  getRecommendedSessionSize,
  sortTermsByPriority,
  DEFAULT_SETTINGS,
  type SpacedRepetitionSettings,
  type ReviewData,
} from "./spacedRepetition";

describe("Spaced Repetition Algorithm", () => {
  const customSettings: SpacedRepetitionSettings = {
    baseInterval: 2,
    easeFactor: 2.0,
    maxInterval: 180,
    minInterval: 1,
  };

  describe("calculateNextReview", () => {
    it("should calculate correct intervals for first review based on rating", () => {
      const testCases = [
        {rating: 1, expectedInterval: 1}, // Very poor
        {rating: 2, expectedInterval: 2}, // Poor
        {rating: 3, expectedInterval: 4}, // Moderate
        {rating: 4, expectedInterval: 7}, // Good
        {rating: 5, expectedInterval: 14}, // Excellent
      ];

      testCases.forEach(({rating, expectedInterval}) => {
        const result = calculateNextReview(rating);
        expect(result.newInterval).toBe(expectedInterval);
        expect(result.repetitionCount).toBe(1);
        expect(result.newEaseFactor).toBe(DEFAULT_SETTINGS.easeFactor);
      });
    });

    it("should increase interval for subsequent good reviews", () => {
      const reviewData: Partial<ReviewData> = {
        repetitionCount: 1,
        easeFactor: 2.5,
        interval: 7,
        lastReviewed: new Date().toISOString(),
      };

      const result = calculateNextReview(4, reviewData);
      expect(result.newInterval).toBeGreaterThan(7);
      expect(result.repetitionCount).toBe(2);
    });

    it("should reset interval for poor performance", () => {
      const reviewData: Partial<ReviewData> = {
        repetitionCount: 3,
        easeFactor: 2.5,
        interval: 14,
        lastReviewed: new Date().toISOString(),
      };

      const result = calculateNextReview(1, reviewData); // Poor rating
      expect(result.newInterval).toBe(1); // Reset to beginning
      expect(result.newEaseFactor).toBeLessThan(2.5); // Reduced ease factor
      expect(result.repetitionCount).toBe(4);
    });

    it("should respect minimum and maximum intervals", () => {
      const reviewData: Partial<ReviewData> = {
        repetitionCount: 10,
        easeFactor: 3.0,
        interval: 300, // Very large interval
        lastReviewed: new Date().toISOString(),
      };

      const result = calculateNextReview(5, reviewData, customSettings);
      expect(result.newInterval).toBeLessThanOrEqual(customSettings.maxInterval);
      expect(result.newInterval).toBeGreaterThanOrEqual(customSettings.minInterval);
    });

    it("should calculate next review date correctly", () => {
      const now = new Date();
      const result = calculateNextReview(3);
      
      const expectedDate = new Date(now);
      expectedDate.setDate(expectedDate.getDate() + 4);
      
      // Allow for small time differences
      const timeDiff = Math.abs(result.nextReviewDate.getTime() - expectedDate.getTime());
      expect(timeDiff).toBeLessThan(60000); // Less than 1 minute difference
    });
  });

  describe("isTermDueForReview", () => {
    it("should return true for never reviewed terms", () => {
      expect(isTermDueForReview()).toBe(true);
      expect(isTermDueForReview(undefined)).toBe(true);
    });

    it("should return true for terms due by explicit next review date", () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      expect(isTermDueForReview(
        new Date().toISOString(),
        7,
        yesterday.toISOString()
      )).toBe(true);
    });

    it("should return false for terms not yet due by explicit next review date", () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      expect(isTermDueForReview(
        new Date().toISOString(),
        7,
        tomorrow.toISOString()
      )).toBe(false);
    });

    it("should use interval when next review date is not available", () => {
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
      
      expect(isTermDueForReview(threeDaysAgo.toISOString(), 2)).toBe(true);
      expect(isTermDueForReview(threeDaysAgo.toISOString(), 5)).toBe(false);
    });

    it("should use 7-day fallback for legacy data", () => {
      const tenDaysAgo = new Date();
      tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);
      
      expect(isTermDueForReview(tenDaysAgo.toISOString())).toBe(true);
      
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
      
      expect(isTermDueForReview(threeDaysAgo.toISOString())).toBe(false);
    });
  });

  describe("getSpacedRepetitionStats", () => {
    const sampleData = [
      {rating: 5, lastReviewed: "2024-01-01", interval: 30},
      {rating: 4, lastReviewed: "2024-01-02", interval: 14},
      {rating: 2, lastReviewed: "2024-01-03", interval: 2},
      {rating: 1, lastReviewed: "2024-01-04", interval: 1},
      {}, // Never reviewed
    ];

    it("should calculate basic statistics correctly", () => {
      const stats = getSpacedRepetitionStats(sampleData);
      
      expect(stats.totalTerms).toBe(5);
      expect(stats.reviewedTerms).toBe(4);
      expect(stats.averageInterval).toBe(11.8); // (30+14+2+1)/4 = 11.75, rounded to 11.8
    });

    it("should calculate retention rate correctly", () => {
      const stats = getSpacedRepetitionStats(sampleData);
      
      // 2 terms with rating >= 4 out of 4 reviewed = 50%
      expect(stats.retentionRate).toBe(50);
    });

    it("should identify mastered terms correctly", () => {
      const stats = getSpacedRepetitionStats(sampleData);
      
      // Only 1 term with rating 5 and interval >= 30 days
      expect(stats.masteredTerms).toBe(1);
    });

    it("should handle empty data gracefully", () => {
      const stats = getSpacedRepetitionStats([]);
      
      expect(stats.totalTerms).toBe(0);
      expect(stats.reviewedTerms).toBe(0);
      expect(stats.dueTerms).toBe(0);
      expect(stats.averageInterval).toBe(0);
      expect(stats.retentionRate).toBe(0);
      expect(stats.masteredTerms).toBe(0);
    });
  });

  describe("getRecommendedSessionSize", () => {
    it("should return correct session sizes based on due terms", () => {
      expect(getRecommendedSessionSize(5)).toBe(5);
      expect(getRecommendedSessionSize(15)).toBe(15);
      expect(getRecommendedSessionSize(35)).toBe(20);
      expect(getRecommendedSessionSize(100)).toBe(25);
    });

    it("should never exceed maximum session size", () => {
      expect(getRecommendedSessionSize(1000)).toBe(25);
    });
  });

  describe("sortTermsByPriority", () => {
    it("should sort terms by due date first", () => {
      const terms = [
        {
          rating: 3,
          lastReviewed: "2024-01-01",
          interval: 1,
          nextReviewDate: "2024-01-03",
        },
        {
          rating: 4,
          lastReviewed: "2024-01-01",
          interval: 1,
          nextReviewDate: "2024-01-02",
        },
      ];

      const sorted = sortTermsByPriority(terms);
      expect(sorted[0].nextReviewDate).toBe("2024-01-02");
      expect(sorted[1].nextReviewDate).toBe("2024-01-03");
    });

    it("should prioritize lower ratings when due dates are equal", () => {
      const sameDate = "2024-01-02";
      const terms = [
        {
          rating: 4,
          nextReviewDate: sameDate,
        },
        {
          rating: 2,
          nextReviewDate: sameDate,
        },
      ];

      const sorted = sortTermsByPriority(terms);
      expect(sorted[0].rating).toBe(2);
      expect(sorted[1].rating).toBe(4);
    });

    it("should handle terms without complete data", () => {
      const terms = [
        {rating: 3},
        {rating: 1, lastReviewed: "2024-01-01"},
        {rating: 2, nextReviewDate: "2024-01-02"},
      ];

      expect(() => sortTermsByPriority(terms)).not.toThrow();
      const sorted = sortTermsByPriority(terms);
      expect(sorted).toHaveLength(3);
    });
  });

  describe("Edge Cases and Error Handling", () => {
    it("should handle invalid rating values gracefully", () => {
      expect(() => calculateNextReview(0)).not.toThrow();
      expect(() => calculateNextReview(6)).not.toThrow();
      expect(() => calculateNextReview(-1)).not.toThrow();
    });

    it("should handle invalid dates gracefully", () => {
      expect(isTermDueForReview("invalid-date", 7)).toBe(true);
      expect(() => isTermDueForReview("invalid-date", 7)).not.toThrow();
    });

    it("should handle negative intervals", () => {
      const result = calculateNextReview(1, {interval: -5});
      expect(result.newInterval).toBeGreaterThanOrEqual(DEFAULT_SETTINGS.minInterval);
    });
  });

  describe("Algorithm Performance", () => {
    it("should demonstrate forgetting curve behavior", () => {
      // Simulate multiple reviews with declining performance
      let reviewData: Partial<ReviewData> = {};
      const ratings = [5, 4, 3, 2, 1]; // Declining performance
      const intervals: number[] = [];

      ratings.forEach(rating => {
        const result = calculateNextReview(rating, reviewData);
        intervals.push(result.newInterval);
        reviewData = {
          repetitionCount: result.repetitionCount,
          easeFactor: result.newEaseFactor,
          interval: result.newInterval,
          lastReviewed: new Date().toISOString(),
        };
      });

      // Intervals should increase initially then reset on poor performance
      expect(intervals[0]).toBe(14); // First excellent review
      expect(intervals[intervals.length - 1]).toBe(1); // Reset after poor review
    });

    it("should show increasing intervals for consistent good performance", () => {
      let reviewData: Partial<ReviewData> = {};
      const intervals: number[] = [];

      // Simulate 5 consecutive good reviews (rating 4)
      for (let i = 0; i < 5; i++) {
        const result = calculateNextReview(4, reviewData);
        intervals.push(result.newInterval);
        reviewData = {
          repetitionCount: result.repetitionCount,
          easeFactor: result.newEaseFactor,
          interval: result.newInterval,
          lastReviewed: new Date().toISOString(),
        };
      }

      // Each interval should be larger than the previous (generally)
      expect(intervals[4]).toBeGreaterThan(intervals[0]);
      expect(intervals[2]).toBeGreaterThan(intervals[1]);
    });
  });
});