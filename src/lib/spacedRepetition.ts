/**
 * Spaced Repetition Algorithm based on Ebbinghaus Forgetting Curve
 * Implements scientifically-backed intervals for optimal learning retention
 */

export interface SpacedRepetitionSettings {
  baseInterval: number; // Base interval in days
  easeFactor: number; // Multiplier for interval calculation
  maxInterval: number; // Maximum interval in days
  minInterval: number; // Minimum interval in days
}

export interface ReviewData {
  rating: number; // 1-5 Sokrates rating
  lastReviewed: string; // ISO date string
  repetitionCount: number; // How many times reviewed
  easeFactor: number; // Individual ease factor for this term
  interval: number; // Current interval in days
}

// Default settings based on spaced repetition research
export const DEFAULT_SETTINGS: SpacedRepetitionSettings = {
  baseInterval: 1, // Start with 1 day
  easeFactor: 2.5, // Standard SM-2 algorithm factor
  maxInterval: 365, // Maximum 1 year
  minInterval: 1, // Minimum 1 day
};

// Interval mapping based on rating (Sokrates 1-5 scale)
const RATING_INTERVALS = {
  1: 1, // Very poor understanding - review tomorrow
  2: 2, // Poor understanding - review in 2 days
  3: 4, // Moderate understanding - review in 4 days
  4: 7, // Good understanding - review in 1 week
  5: 14, // Excellent understanding - review in 2 weeks
} as const;

/**
 * Calculate the next review date based on Sokrates rating and review history
 */
export function calculateNextReview(
  rating: number,
  reviewData?: Partial<ReviewData>,
  settings: SpacedRepetitionSettings = DEFAULT_SETTINGS,
): {
  nextReviewDate: Date;
  newInterval: number;
  newEaseFactor: number;
  repetitionCount: number;
} {
  const now = new Date();
  const currentRepetitionCount = (reviewData?.repetitionCount ?? 0) + 1;
  let currentEaseFactor = reviewData?.easeFactor ?? settings.easeFactor;
  let newInterval: number;

  // First review or no previous interval data - use rating-based intervals
  if (currentRepetitionCount === 1 || !reviewData?.interval) {
    // Validate rating
    if (rating < 1 || rating > 5 || !Number.isInteger(rating)) {
      console.warn(
        `Invalid rating value: ${rating}. Using default rating of 3.`,
      );
      rating = 3;
    }
    newInterval = RATING_INTERVALS[rating as keyof typeof RATING_INTERVALS];
  } else {
    // Subsequent reviews - apply spaced repetition algorithm
    const previousInterval = reviewData.interval;

    // Adjust ease factor based on rating (SM-2 algorithm adaptation)
    if (rating < 3) {
      // Poor performance - reset to beginning and reduce ease factor
      currentEaseFactor = Math.max(1.3, currentEaseFactor - 0.2);
      newInterval = 1; // Start over
    } else {
      // Good performance - increase interval
      currentEaseFactor =
        currentEaseFactor + (0.1 - (5 - rating) * (0.08 + (5 - rating) * 0.02));
      newInterval = Math.round(previousInterval * currentEaseFactor);
    }
  }

  // Apply constraints
  newInterval = Math.max(
    settings.minInterval,
    Math.min(settings.maxInterval, newInterval),
  );

  // Calculate next review date
  const nextReviewDate = new Date(now);
  nextReviewDate.setDate(nextReviewDate.getDate() + newInterval);

  return {
    nextReviewDate,
    newInterval,
    newEaseFactor: Math.round(currentEaseFactor * 100) / 100, // Round to 2 decimal places
    repetitionCount: currentRepetitionCount,
  };
}

/**
 * Check if a term is due for review
 */
export function isTermDueForReview(
  lastReviewed?: string,
  interval?: number,
  nextReviewDate?: string,
): boolean {
  if (!lastReviewed) return true; // Never reviewed

  const now = new Date();

  // Use explicit next review date if available
  if (nextReviewDate) {
    try {
      const reviewDate = new Date(nextReviewDate);
      // Check if date is valid
      if (isNaN(reviewDate.getTime())) return true;
      return now >= reviewDate;
    } catch {
      return true; // Invalid date format, consider due for review
    }
  }

  // Fallback to interval calculation
  if (interval) {
    try {
      const lastReviewDate = new Date(lastReviewed);
      // Check if date is valid
      if (isNaN(lastReviewDate.getTime())) return true;
      const daysSinceReview =
        (now.getTime() - lastReviewDate.getTime()) / (1000 * 60 * 60 * 24);
      return daysSinceReview >= interval;
    } catch {
      return true; // Invalid date format, consider due for review
    }
  }

  // Legacy fallback - use 7 days for old data
  try {
    const lastReviewDate = new Date(lastReviewed);
    // Check if date is valid
    if (isNaN(lastReviewDate.getTime())) return true;
    const daysSinceReview =
      (now.getTime() - lastReviewDate.getTime()) / (1000 * 60 * 60 * 24);
    return daysSinceReview >= 7;
  } catch {
    return true; // Invalid date format, consider due for review
  }
}

/**
 * Get statistics about spaced repetition performance
 */
export function getSpacedRepetitionStats(
  reviewData: Array<{
    rating?: number;
    lastReviewed?: string;
    repetitionCount?: number;
    interval?: number;
    nextReviewDate?: string;
  }>,
): {
  totalTerms: number;
  reviewedTerms: number;
  dueTerms: number;
  averageInterval: number;
  retentionRate: number; // Percentage of terms with rating >= 4
  masteredTerms: number; // Terms with rating 5 and interval >= 30 days
} {
  const totalTerms = reviewData.length;
  const reviewedTerms = reviewData.filter(
    (term) => term.rating && term.lastReviewed,
  ).length;
  const dueTerms = reviewData.filter((term) =>
    isTermDueForReview(term.lastReviewed, term.interval, term.nextReviewDate),
  ).length;

  const intervalsSum = reviewData
    .filter((term) => term.interval)
    .reduce((sum, term) => sum + (term.interval || 0), 0);
  const termsWithIntervals = reviewData.filter((term) => term.interval).length;
  const averageInterval =
    termsWithIntervals > 0 ? intervalsSum / termsWithIntervals : 0;

  const wellKnownTerms = reviewData.filter(
    (term) => term.rating && term.rating >= 4,
  ).length;
  const retentionRate =
    reviewedTerms > 0 ? (wellKnownTerms / reviewedTerms) * 100 : 0;

  const masteredTerms = reviewData.filter(
    (term) => term.rating === 5 && term.interval && term.interval >= 30,
  ).length;

  return {
    totalTerms,
    reviewedTerms,
    dueTerms,
    averageInterval: Math.round(averageInterval * 10) / 10,
    retentionRate: Math.round(retentionRate * 10) / 10,
    masteredTerms,
  };
}

/**
 * Get recommended study session size based on due terms
 */
export function getRecommendedSessionSize(dueTermsCount: number): number {
  if (dueTermsCount <= 10) return dueTermsCount;
  if (dueTermsCount <= 30) return 15;
  if (dueTermsCount <= 50) return 20;
  return 25; // Maximum session size for cognitive load management
}

/**
 * Sort due terms by priority (earliest due first, then by rating)
 */
export function sortTermsByPriority(
  terms: Array<{
    rating?: number;
    lastReviewed?: string;
    interval?: number;
    nextReviewDate?: string;
  }>,
): typeof terms {
  return terms.sort((a, b) => {
    // First, sort by due date
    const aNextReview =
      a.nextReviewDate ||
      (a.lastReviewed && a.interval
        ? new Date(
            new Date(a.lastReviewed).getTime() +
              a.interval * 24 * 60 * 60 * 1000,
          ).toISOString()
        : "");
    const bNextReview =
      b.nextReviewDate ||
      (b.lastReviewed && b.interval
        ? new Date(
            new Date(b.lastReviewed).getTime() +
              b.interval * 24 * 60 * 60 * 1000,
          ).toISOString()
        : "");

    if (aNextReview && bNextReview) {
      const comparison =
        new Date(aNextReview).getTime() - new Date(bNextReview).getTime();
      if (comparison !== 0) return comparison;
    }

    // If due dates are equal, prioritize lower ratings (need more attention)
    return (a.rating || 0) - (b.rating || 0);
  });
}
