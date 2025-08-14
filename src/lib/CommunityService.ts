/**
 * Community Service - Manages community features, user profiles, mentoring, and peer reviews
 * Integrates with existing Gamification and Basar systems for a cohesive experience
 */

import {GamificationService} from "./GamificationService";

// Community-specific interfaces extending existing types
export interface UserExpertise {
  area: string;
  level: "Beginner" | "Intermediate" | "Advanced" | "Expert";
  verified: boolean;
  endorsements: number;
}

export interface CommunityProfile {
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

export interface MentorshipConnection {
  id: string;
  mentorId: string;
  menteeId: string;
  expertiseArea: string;
  status: "pending" | "active" | "completed" | "cancelled";
  requestDate: string;
  startDate?: string;
  endDate?: string;
  sessionCount: number;
  rating?: number;
}

export interface CommunityChallenge {
  id: string;
  title: string;
  description: string;
  type: "learning" | "creation" | "collaboration" | "review";
  difficulty: "easy" | "medium" | "hard";
  points: number;
  startDate: string;
  endDate: string;
  participants: string[];
  winners: string[];
  requirements: string[];
  status: "upcoming" | "active" | "completed";
}

export interface PeerReview {
  id: string;
  reviewerId: string;
  itemId: string;
  itemType: "abc-list" | "kawa" | "kaga";
  rating: number; // 1-5 stars
  comment: string;
  helpfulnessRating: number; // How helpful others found this review
  categories: {
    accuracy: number;
    usefulness: number;
    clarity: number;
    creativity: number;
  };
  timestamp: string;
  status: "pending" | "published" | "flagged";
}

export interface SuccessStory {
  id: string;
  userId: string;
  title: string;
  story: string;
  achievements: string[];
  beforeAfter: {
    before: string;
    after: string;
  };
  timestamp: string;
  likes: number;
  featured: boolean;
}

// Storage keys for community data
export const COMMUNITY_STORAGE_KEYS = {
  PROFILES: "community_profiles",
  MENTORSHIPS: "community_mentorships",
  CHALLENGES: "community_challenges",
  REVIEWS: "community_reviews",
  STORIES: "community_stories",
  USER_PROFILE: "community_user_profile",
} as const;

/**
 * Expertise areas commonly found in educational content
 * Matches the German language context of the application
 */
export const EXPERTISE_AREAS = [
  "Mathematik",
  "Physik",
  "Chemie",
  "Biologie",
  "Geschichte",
  "Geographie",
  "Deutsch",
  "Englisch",
  "Französisch",
  "Spanisch",
  "Informatik",
  "Wirtschaft",
  "Politik",
  "Philosophie",
  "Psychologie",
  "Pädagogik",
  "Kunst",
  "Musik",
  "Sport",
  "Medizin",
  "Technik",
  "Naturwissenschaften",
  "Geisteswissenschaften",
  "Ingenieurwesen",
  "Rechtswissenschaft",
] as const;

export type ExpertiseArea = (typeof EXPERTISE_AREAS)[number];

/**
 * CommunityService - Singleton service managing all community features
 * Integrates with existing systems while maintaining performance standards
 */
export class CommunityService {
  private static instance: CommunityService;
  private listeners: Array<() => void> = [];
  private gamificationService: GamificationService;

  private constructor() {
    this.gamificationService = GamificationService.getInstance();
  }

  public static getInstance(): CommunityService {
    if (!CommunityService.instance) {
      CommunityService.instance = new CommunityService();
    }
    return CommunityService.instance;
  }

  public static resetInstance(): void {
    (CommunityService.instance as CommunityService | undefined) = undefined;
  }

  // Event system for real-time UI updates
  public addListener(callback: () => void): void {
    this.listeners.push(callback);
  }

  public removeListener(callback: () => void): void {
    this.listeners = this.listeners.filter((listener) => listener !== callback);
  }

  private notifyListeners(): void {
    this.listeners.forEach((callback) => callback());
  }

  // User Profile Management
  public getUserProfile(): CommunityProfile | null {
    try {
      const profile = localStorage.getItem(COMMUNITY_STORAGE_KEYS.USER_PROFILE);
      return profile ? JSON.parse(profile) : null;
    } catch (error) {
      console.error("Failed to load user profile:", error);
      return null;
    }
  }

  public createUserProfile(
    profileData: Partial<CommunityProfile>,
  ): CommunityProfile {
    const profile: CommunityProfile = {
      userId: this.generateId(),
      displayName: profileData.displayName || "Anonymous User",
      bio: profileData.bio || "",
      expertise: profileData.expertise || [],
      mentorAvailable: profileData.mentorAvailable || false,
      menteeInterested: profileData.menteeInterested || false,
      joinDate: new Date().toISOString(),
      lastActive: new Date().toISOString(),
      reputation: 0,
      contributionCount: 0,
      helpfulReviews: 0,
      ...profileData,
    };

    localStorage.setItem(
      COMMUNITY_STORAGE_KEYS.USER_PROFILE,
      JSON.stringify(profile),
    );
    this.notifyListeners();
    return profile;
  }

  public updateUserProfile(updates: Partial<CommunityProfile>): void {
    const currentProfile = this.getUserProfile();
    if (!currentProfile) return;

    const updatedProfile = {
      ...currentProfile,
      ...updates,
      lastActive: new Date().toISOString(),
    };

    localStorage.setItem(
      COMMUNITY_STORAGE_KEYS.USER_PROFILE,
      JSON.stringify(updatedProfile),
    );
    this.notifyListeners();
  }

  // Mentorship System
  public findMentors(expertiseArea: string): CommunityProfile[] {
    // In a real implementation, this would query a backend
    // For now, return mock mentors for demonstration
    return this.generateMockMentors(expertiseArea);
  }

  public requestMentorship(
    mentorId: string,
    expertiseArea: string,
  ): MentorshipConnection {
    const userProfile = this.getUserProfile();
    if (!userProfile) {
      throw new Error("User profile required");
    }

    const mentorship: MentorshipConnection = {
      id: this.generateId(),
      mentorId,
      menteeId: userProfile.userId,
      expertiseArea,
      status: "pending",
      requestDate: new Date().toISOString(),
      sessionCount: 0,
    };

    const mentorships = this.getMentorships();
    mentorships.push(mentorship);
    localStorage.setItem(
      COMMUNITY_STORAGE_KEYS.MENTORSHIPS,
      JSON.stringify(mentorships),
    );

    this.notifyListeners();
    return mentorship;
  }

  public getMentorships(): MentorshipConnection[] {
    try {
      const mentorships = localStorage.getItem(
        COMMUNITY_STORAGE_KEYS.MENTORSHIPS,
      );
      return mentorships ? JSON.parse(mentorships) : [];
    } catch (error) {
      console.error("Failed to load mentorships:", error);
      return [];
    }
  }

  // Community Challenges
  public getCommunityCharges(): CommunityChallenge[] {
    try {
      const challenges = localStorage.getItem(
        COMMUNITY_STORAGE_KEYS.CHALLENGES,
      );
      return challenges ? JSON.parse(challenges) : this.getDefaultChallenges();
    } catch (error) {
      console.error("Failed to load community challenges:", error);
      return this.getDefaultChallenges();
    }
  }

  public participateInChallenge(challengeId: string): void {
    const challenges = this.getCommunityCharges();
    const challenge = challenges.find((c) => c.id === challengeId);
    const userProfile = this.getUserProfile();

    if (!challenge || !userProfile) return;

    if (!challenge.participants.includes(userProfile.userId)) {
      challenge.participants.push(userProfile.userId);
      localStorage.setItem(
        COMMUNITY_STORAGE_KEYS.CHALLENGES,
        JSON.stringify(challenges),
      );
      this.notifyListeners();
    }
  }

  // Peer Review System
  public submitReview(
    reviewData: Omit<PeerReview, "id" | "timestamp" | "status">,
  ): PeerReview {
    const review: PeerReview = {
      ...reviewData,
      id: this.generateId(),
      timestamp: new Date().toISOString(),
      status: "published",
      helpfulnessRating: 0,
    };

    const reviews = this.getReviews();
    reviews.push(review);
    localStorage.setItem(
      COMMUNITY_STORAGE_KEYS.REVIEWS,
      JSON.stringify(reviews),
    );

    // Track review activity for gamification
    this.gamificationService.trackCustomActivity("peer_review_submitted", 15);

    this.notifyListeners();
    return review;
  }

  public getReviews(): PeerReview[] {
    try {
      const reviews = localStorage.getItem(COMMUNITY_STORAGE_KEYS.REVIEWS);
      return reviews ? JSON.parse(reviews) : [];
    } catch (error) {
      console.error("Failed to load reviews:", error);
      return [];
    }
  }

  public getReviewsForItem(itemId: string, itemType: string): PeerReview[] {
    return this.getReviews().filter(
      (review) => review.itemId === itemId && review.itemType === itemType,
    );
  }

  // Success Stories
  public submitSuccessStory(
    storyData: Omit<SuccessStory, "id" | "timestamp" | "likes" | "featured">,
  ): SuccessStory {
    const story: SuccessStory = {
      ...storyData,
      id: this.generateId(),
      timestamp: new Date().toISOString(),
      likes: 0,
      featured: false,
    };

    const stories = this.getSuccessStories();
    stories.push(story);
    localStorage.setItem(
      COMMUNITY_STORAGE_KEYS.STORIES,
      JSON.stringify(stories),
    );

    // Track story submission for gamification
    this.gamificationService.trackCustomActivity("success_story_shared", 25);

    this.notifyListeners();
    return story;
  }

  public getSuccessStories(): SuccessStory[] {
    try {
      const stories = localStorage.getItem(COMMUNITY_STORAGE_KEYS.STORIES);
      return stories ? JSON.parse(stories) : [];
    } catch (error) {
      console.error("Failed to load success stories:", error);
      return [];
    }
  }

  public getFeaturedStories(): SuccessStory[] {
    return this.getSuccessStories()
      .filter((story) => story.featured)
      .sort((a, b) => b.likes - a.likes);
  }

  public likeStory(storyId: string): void {
    const stories = this.getSuccessStories();
    const story = stories.find((s) => s.id === storyId);

    if (story) {
      story.likes += 1;
      localStorage.setItem(
        COMMUNITY_STORAGE_KEYS.STORIES,
        JSON.stringify(stories),
      );
      this.notifyListeners();
    }
  }

  // Utility Methods
  private generateId(): string {
    return `community_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateMockMentors(expertiseArea: string): CommunityProfile[] {
    // Generate realistic mock mentors for demonstration
    const mockMentors: CommunityProfile[] = [
      {
        userId: "mentor_1",
        displayName: "Dr. Maria Schmidt",
        bio: `Erfahrene ${expertiseArea}-Lehrerin mit 15 Jahren Unterrichtserfahrung. Spezialisiert auf innovative Lernmethoden.`,
        expertise: [
          {
            area: expertiseArea,
            level: "Expert",
            verified: true,
            endorsements: 24,
          },
        ],
        mentorAvailable: true,
        menteeInterested: false,
        joinDate: "2023-01-15T00:00:00.000Z",
        lastActive: new Date().toISOString(),
        reputation: 95,
        contributionCount: 47,
        helpfulReviews: 23,
      },
      {
        userId: "mentor_2",
        displayName: "Prof. Andreas Weber",
        bio: `Universitätsprofessor für ${expertiseArea}. Betreut gerne motivierte Lernende bei ihrer Weiterentwicklung.`,
        expertise: [
          {
            area: expertiseArea,
            level: "Expert",
            verified: true,
            endorsements: 18,
          },
        ],
        mentorAvailable: true,
        menteeInterested: false,
        joinDate: "2023-03-20T00:00:00.000Z",
        lastActive: new Date().toISOString(),
        reputation: 88,
        contributionCount: 31,
        helpfulReviews: 19,
      },
    ];

    return mockMentors;
  }

  private getDefaultChallenges(): CommunityChallenge[] {
    const now = new Date();
    const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    return [
      {
        id: "challenge_1",
        title: "Wochenend-Lernchallenge",
        description:
          "Erstelle 5 neue ABC-Listen zu verschiedenen Themen und sammle dabei mindestens 50 neue Begriffe.",
        type: "learning",
        difficulty: "medium",
        points: 200,
        startDate: now.toISOString(),
        endDate: weekFromNow.toISOString(),
        participants: [],
        winners: [],
        requirements: ["5 ABC-Listen erstellen", "50 neue Begriffe sammeln"],
        status: "active",
      },
      {
        id: "challenge_2",
        title: "Community-Reviewer",
        description:
          "Bewerte 10 Basar-Beiträge und hilf der Community mit konstruktivem Feedback.",
        type: "review",
        difficulty: "easy",
        points: 150,
        startDate: now.toISOString(),
        endDate: weekFromNow.toISOString(),
        participants: [],
        winners: [],
        requirements: [
          "10 Bewertungen abgeben",
          "Konstruktives Feedback schreiben",
        ],
        status: "active",
      },
    ];
  }
}
