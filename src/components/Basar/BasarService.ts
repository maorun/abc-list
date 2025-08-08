import {
  MarketplaceTerm,
  TermRating,
  UserProfile,
  TradeRecord,
  UserAchievement,
  Achievement,
  MARKETPLACE_TERMS_KEY,
  USER_PROFILES_KEY,
  TERM_RATINGS_KEY,
  CURRENT_USER_KEY,
  DEFAULT_ACHIEVEMENTS,
} from "./types";
import {WordWithExplanation} from "../List/types";

export class BasarService {
  private static instance: BasarService;

  static getInstance(): BasarService {
    if (!BasarService.instance) {
      BasarService.instance = new BasarService();
    }
    return BasarService.instance;
  }

  // User Management
  getCurrentUser(): UserProfile | null {
    const userId = localStorage.getItem(CURRENT_USER_KEY);
    if (!userId) return null;

    const users = this.getUsers();
    return users.find((user) => user.id === userId) || null;
  }

  setCurrentUser(userId: string): void {
    localStorage.setItem(CURRENT_USER_KEY, userId);
  }

  createUser(name: string): UserProfile {
    const users = this.getUsers();
    const newUser: UserProfile = {
      id: `user_${Date.now()}`,
      name,
      points: 100, // Starting points
      level: 1,
      joinDate: new Date().toISOString(),
      tradesCompleted: 0,
      termsContributed: 0,
      averageRating: 0,
      achievements: [],
      tradingHistory: [],
    };

    users.push(newUser);
    this.saveUsers(users);
    this.setCurrentUser(newUser.id);
    return newUser;
  }

  getUsers(): UserProfile[] {
    const stored = localStorage.getItem(USER_PROFILES_KEY);
    return stored ? JSON.parse(stored) : [];
  }

  private saveUsers(users: UserProfile[]): void {
    localStorage.setItem(USER_PROFILES_KEY, JSON.stringify(users));
  }

  updateUser(user: UserProfile): void {
    const users = this.getUsers();
    const index = users.findIndex((u) => u.id === user.id);
    if (index !== -1) {
      users[index] = user;
      this.saveUsers(users);
    }
  }

  // Marketplace Terms Management
  getMarketplaceTerms(): MarketplaceTerm[] {
    const stored = localStorage.getItem(MARKETPLACE_TERMS_KEY);
    return stored ? JSON.parse(stored) : [];
  }

  private saveMarketplaceTerms(terms: MarketplaceTerm[]): void {
    localStorage.setItem(MARKETPLACE_TERMS_KEY, JSON.stringify(terms));
  }

  addTermToMarketplace(
    word: WordWithExplanation,
    letter: string,
    listName: string,
    price: number,
  ): MarketplaceTerm | null {
    const currentUser = this.getCurrentUser();
    if (!currentUser) return null;

    const terms = this.getMarketplaceTerms();
    const newTerm: MarketplaceTerm = {
      ...word,
      id: `term_${Date.now()}`,
      letter,
      listName,
      sellerId: currentUser.id,
      sellerName: currentUser.name,
      price,
      quality: 0,
      ratingCount: 0,
      dateAdded: new Date().toISOString(),
    };

    terms.push(newTerm);
    this.saveMarketplaceTerms(terms);

    // Update user stats
    currentUser.termsContributed++;
    this.updateUser(currentUser);
    this.checkAchievements(currentUser);

    return newTerm;
  }

  buyTerm(termId: string): boolean {
    const currentUser = this.getCurrentUser();
    if (!currentUser) return false;

    const terms = this.getMarketplaceTerms();
    const termIndex = terms.findIndex((t) => t.id === termId);
    if (termIndex === -1) return false;

    const term = terms[termIndex];
    if (currentUser.points < term.price) return false;
    if (term.sellerId === currentUser.id) return false;

    // Process purchase
    currentUser.points -= term.price;
    currentUser.tradesCompleted++;

    // Add to trading history
    const tradeRecord: TradeRecord = {
      id: `trade_${Date.now()}`,
      type: "buy",
      termId: term.id,
      termText: term.text,
      letter: term.letter,
      price: term.price,
      partnerId: term.sellerId,
      partnerName: term.sellerName,
      date: new Date().toISOString(),
    };
    currentUser.tradingHistory.push(tradeRecord);

    // Update seller
    const users = this.getUsers();
    const seller = users.find((u) => u.id === term.sellerId);
    if (seller) {
      seller.points += term.price;
      seller.tradesCompleted++;
      seller.tradingHistory.push({
        ...tradeRecord,
        type: "sell",
        partnerId: currentUser.id,
        partnerName: currentUser.name,
      });
      this.updateUser(seller);
      this.checkAchievements(seller);
    }

    // Remove from marketplace
    terms.splice(termIndex, 1);
    this.saveMarketplaceTerms(terms);

    // Add to buyer's ABC list
    this.addTermToUserList(currentUser.id, term);

    this.updateUser(currentUser);
    this.checkAchievements(currentUser);

    return true;
  }

  private addTermToUserList(userId: string, term: MarketplaceTerm): void {
    // Add the purchased term to the user's ABC list
    const storageKey = `abcList-Marketplace Käufe:${term.letter}`;
    const existingTerms = localStorage.getItem(storageKey);
    const terms: WordWithExplanation[] = existingTerms
      ? JSON.parse(existingTerms)
      : [];

    // Check if term already exists
    if (!terms.some((t) => t.text === term.text)) {
      terms.push({
        text: term.text,
        explanation: term.explanation,
        version: term.version,
        imported: true,
        timestamp: Date.now(),
      });
      localStorage.setItem(storageKey, JSON.stringify(terms));

      // Add list name to user's lists if not exists
      const abcLists = localStorage.getItem("abcLists");
      const lists: string[] = abcLists ? JSON.parse(abcLists) : [];
      if (!lists.includes("Marketplace Käufe")) {
        lists.push("Marketplace Käufe");
        localStorage.setItem("abcLists", JSON.stringify(lists));
      }
    }
  }

  // Rating System
  getTermRatings(): TermRating[] {
    const stored = localStorage.getItem(TERM_RATINGS_KEY);
    return stored ? JSON.parse(stored) : [];
  }

  private saveTermRatings(ratings: TermRating[]): void {
    localStorage.setItem(TERM_RATINGS_KEY, JSON.stringify(ratings));
  }

  rateTerm(termId: string, rating: number, comment?: string): boolean {
    const currentUser = this.getCurrentUser();
    if (!currentUser) return false;

    const ratings = this.getTermRatings();
    const existingRating = ratings.find(
      (r) => r.termId === termId && r.userId === currentUser.id,
    );

    if (existingRating) {
      existingRating.rating = rating;
      existingRating.comment = comment;
      existingRating.date = new Date().toISOString();
    } else {
      const newRating: TermRating = {
        termId,
        userId: currentUser.id,
        rating,
        comment,
        date: new Date().toISOString(),
      };
      ratings.push(newRating);
    }

    this.saveTermRatings(ratings);
    this.updateTermQuality(termId);
    return true;
  }

  private updateTermQuality(termId: string): void {
    const ratings = this.getTermRatings().filter((r) => r.termId === termId);
    const terms = this.getMarketplaceTerms();
    const termIndex = terms.findIndex((t) => t.id === termId);

    if (termIndex !== -1 && ratings.length > 0) {
      const avgRating =
        ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length;
      terms[termIndex].quality = Math.round(avgRating * 10) / 10;
      terms[termIndex].ratingCount = ratings.length;
      this.saveMarketplaceTerms(terms);
    }
  }

  getUserRating(termId: string, userId: string): TermRating | undefined {
    const ratings = this.getTermRatings();
    return ratings.find((r) => r.termId === termId && r.userId === userId);
  }

  // Achievement System
  private checkAchievements(user: UserProfile): void {
    DEFAULT_ACHIEVEMENTS.forEach((achievement) => {
      if (
        !user.achievements.some((a) => a.id === achievement.id) &&
        this.isAchievementEarned(user, achievement)
      ) {
        const userAchievement: UserAchievement = {
          id: achievement.id,
          name: achievement.name,
          description: achievement.description,
          icon: achievement.icon,
          dateEarned: new Date().toISOString(),
          points: achievement.points,
        };

        user.achievements.push(userAchievement);
        user.points += achievement.points;
      }
    });
  }

  private isAchievementEarned(
    user: UserProfile,
    achievement: Achievement,
  ): boolean {
    switch (achievement.requirement.type) {
      case "trades":
        return user.tradesCompleted >= achievement.requirement.value;
      case "contributions":
        return user.termsContributed >= achievement.requirement.value;
      case "rating":
        return user.averageRating >= achievement.requirement.value;
      case "points":
        return user.points >= achievement.requirement.value;
      default:
        return false;
    }
  }

  // Utility methods
  initializeSampleData(): void {
    if (this.getMarketplaceTerms().length === 0) {
      this.createSampleData();
    }
  }

  private createSampleData(): void {
    // Create sample users
    const sampleUsers: UserProfile[] = [
      {
        id: "user_sample1",
        name: "Anna",
        points: 250,
        level: 2,
        joinDate: "2024-01-15T00:00:00.000Z",
        tradesCompleted: 5,
        termsContributed: 12,
        averageRating: 4.2,
        achievements: [],
        tradingHistory: [],
      },
      {
        id: "user_sample2",
        name: "Markus",
        points: 180,
        level: 1,
        joinDate: "2024-02-01T00:00:00.000Z",
        tradesCompleted: 3,
        termsContributed: 8,
        averageRating: 4.5,
        achievements: [],
        tradingHistory: [],
      },
    ];

    localStorage.setItem(USER_PROFILES_KEY, JSON.stringify(sampleUsers));

    // Create sample marketplace terms
    const sampleTerms: MarketplaceTerm[] = [
      {
        id: "term_sample1",
        text: "Algorithmus",
        explanation: "Eine Schritt-für-Schritt-Anleitung zur Problemlösung",
        letter: "a",
        listName: "Informatik",
        sellerId: "user_sample1",
        sellerName: "Anna",
        price: 15,
        quality: 4.3,
        ratingCount: 6,
        dateAdded: "2024-12-01T00:00:00.000Z",
        version: 1,
        imported: false,
      },
      {
        id: "term_sample2",
        text: "Biodiversität",
        explanation: "Die Vielfalt des Lebens auf der Erde",
        letter: "b",
        listName: "Biologie",
        sellerId: "user_sample2",
        sellerName: "Markus",
        price: 12,
        quality: 4.7,
        ratingCount: 3,
        dateAdded: "2024-12-02T00:00:00.000Z",
        version: 1,
        imported: false,
      },
      {
        id: "term_sample3",
        text: "Demokratie",
        explanation:
          "Herrschaftsform, bei der das Volk die Staatsgewalt ausübt",
        letter: "d",
        listName: "Politik",
        sellerId: "user_sample1",
        sellerName: "Anna",
        price: 18,
        quality: 4.1,
        ratingCount: 8,
        dateAdded: "2024-12-03T00:00:00.000Z",
        version: 1,
        imported: false,
      },
    ];

    localStorage.setItem(MARKETPLACE_TERMS_KEY, JSON.stringify(sampleTerms));
  }
}
