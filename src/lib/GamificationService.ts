import {
  GamificationProfile,
  GamificationAchievement,
  Challenge,
  Badge,
  UserStatistics,
  LeaderboardEntry,
  ACTIVITY_POINTS,
  GAMIFICATION_ACHIEVEMENTS,
  GAMIFICATION_STORAGE_KEYS,
  WEEKLY_CHALLENGE_TEMPLATES,
  MONTHLY_CHALLENGE_TEMPLATES,
  calculateLevel,
  calculateExperienceToNextLevel,
  getTodayDateString,
  getYesterdayDateString,
  isStreakBroken,
  getWeekStartDate,
  getMonthStartDate,
} from './gamification';

export class GamificationService {
  private static instance: GamificationService;
  private profile: GamificationProfile | null = null;
  private eventListeners: Array<(event: string, data: any) => void> = [];

  static getInstance(): GamificationService {
    if (!GamificationService.instance) {
      GamificationService.instance = new GamificationService();
    }
    return GamificationService.instance;
  }

  constructor() {
    this.initializeProfile();
  }

  // Profile Management
  private initializeProfile(): void {
    const stored = localStorage.getItem(GAMIFICATION_STORAGE_KEYS.PROFILE);
    if (stored) {
      this.profile = JSON.parse(stored);
      this.checkAndUpdateStreak();
      this.updateChallenges();
    } else {
      this.createNewProfile();
    }
  }

  private createNewProfile(): void {
    this.profile = {
      id: `gp_${Date.now()}`,
      totalPoints: 0,
      level: 1,
      experience: 0,
      experienceToNextLevel: 100,
      streak: {
        currentStreak: 0,
        longestStreak: 0,
        lastActivityDate: '',
        streakStartDate: '',
      },
      badges: [],
      achievements: [],
      challenges: this.generateChallenges(),
      statistics: {
        listsCreated: 0,
        wordsAdded: 0,
        kawasCreated: 0,
        kagasCreated: 0,
        slfGamesPlayed: 0,
        sokratesSessions: 0,
        basarTrades: 0,
        totalActiveDays: 0,
        averageWordsPerList: 0,
        favoriteActivity: 'learning',
      },
      lastUpdated: new Date().toISOString(),
    };
    this.saveProfile();
  }

  private saveProfile(): void {
    if (this.profile) {
      localStorage.setItem(GAMIFICATION_STORAGE_KEYS.PROFILE, JSON.stringify(this.profile));
    }
  }

  getProfile(): GamificationProfile | null {
    return this.profile;
  }

  // Activity Tracking
  trackActivity(activityType: keyof typeof ACTIVITY_POINTS, metadata?: any): void {
    if (!this.profile) return;

    const activity = ACTIVITY_POINTS[activityType];
    if (!activity) return;

    // Award points and experience
    this.profile.totalPoints += activity.points;
    this.profile.experience += activity.points;

    // Update statistics
    this.updateStatistics(activityType, metadata);

    // Update streak for daily activities
    this.updateDailyStreak();

    // Check level progression
    this.updateLevel();

    // Check achievements
    this.checkAchievements();

    // Update challenges
    this.updateChallengeProgress(activityType);

    // Update last activity
    this.profile.lastUpdated = new Date().toISOString();
    this.saveProfile();

    // Notify listeners
    this.emitEvent('activity_tracked', { activityType, activity, profile: this.profile });
  }

  private updateStatistics(activityType: string, metadata?: any): void {
    if (!this.profile) return;

    const stats = this.profile.statistics;

    switch (activityType) {
      case 'list_created':
        stats.listsCreated++;
        break;
      case 'word_added':
        stats.wordsAdded++;
        // Update average words per list
        if (stats.listsCreated > 0) {
          stats.averageWordsPerList = stats.wordsAdded / stats.listsCreated;
        }
        break;
      case 'kawa_created':
        stats.kawasCreated++;
        break;
      case 'kaga_created':
        stats.kagasCreated++;
        break;
      case 'slf_game_played':
        stats.slfGamesPlayed++;
        break;
      case 'sokrates_session':
        stats.sokratesSessions++;
        break;
      case 'basar_trade':
        stats.basarTrades++;
        break;
    }

    // Update favorite activity based on most used feature
    this.updateFavoriteActivity();
  }

  private updateFavoriteActivity(): void {
    if (!this.profile) return;

    const stats = this.profile.statistics;
    const activities = {
      learning: stats.listsCreated + stats.wordsAdded + stats.sokratesSessions,
      creativity: stats.kawasCreated + stats.kagasCreated,
      gaming: stats.slfGamesPlayed,
      social: stats.basarTrades,
    };

    let maxActivity = 'learning';
    let maxCount = activities.learning;

    Object.entries(activities).forEach(([activity, count]) => {
      if (count > maxCount) {
        maxActivity = activity;
        maxCount = count;
      }
    });

    stats.favoriteActivity = maxActivity;
  }

  // Streak Management
  private updateDailyStreak(): void {
    if (!this.profile) return;

    const today = getTodayDateString();
    const lastActivity = this.profile.streak.lastActivityDate;

    // First activity ever
    if (!lastActivity) {
      this.profile.streak.currentStreak = 1;
      this.profile.streak.lastActivityDate = today;
      this.profile.streak.streakStartDate = today;
      this.profile.statistics.totalActiveDays = 1;
      return;
    }

    // Already active today
    if (lastActivity === today) {
      return;
    }

    // Activity yesterday - continue streak
    if (lastActivity === getYesterdayDateString()) {
      this.profile.streak.currentStreak++;
      this.profile.streak.lastActivityDate = today;
      this.profile.statistics.totalActiveDays++;

      // Check for new longest streak
      if (this.profile.streak.currentStreak > this.profile.streak.longestStreak) {
        this.profile.streak.longestStreak = this.profile.streak.currentStreak;
      }

      // Check for streak milestones
      this.checkStreakMilestones();
    } else {
      // Streak broken - reset
      this.profile.streak.currentStreak = 1;
      this.profile.streak.lastActivityDate = today;
      this.profile.streak.streakStartDate = today;
      this.profile.statistics.totalActiveDays++;
    }
  }

  private checkAndUpdateStreak(): void {
    if (!this.profile || !this.profile.streak.lastActivityDate) return;

    const today = getTodayDateString();
    const lastActivity = this.profile.streak.lastActivityDate;

    // If streak is broken, reset it
    if (isStreakBroken(lastActivity)) {
      this.profile.streak.currentStreak = 0;
      this.saveProfile();
    }
  }

  private checkStreakMilestones(): void {
    if (!this.profile) return;

    const streak = this.profile.streak.currentStreak;
    const milestones = [7, 14, 30, 50, 100, 365];

    milestones.forEach((milestone) => {
      if (streak === milestone) {
        this.trackActivity('streak_milestone');
        this.emitEvent('streak_milestone', { streak: milestone, profile: this.profile });
      }
    });
  }

  // Level System
  private updateLevel(): void {
    if (!this.profile) return;

    const newLevel = calculateLevel(this.profile.experience);
    const oldLevel = this.profile.level;

    if (newLevel > oldLevel) {
      this.profile.level = newLevel;
      this.profile.experienceToNextLevel = calculateExperienceToNextLevel(this.profile.experience);

      // Award level-up bonus
      this.profile.totalPoints += newLevel * 10;

      this.emitEvent('level_up', { oldLevel, newLevel, profile: this.profile });
    } else {
      this.profile.experienceToNextLevel = calculateExperienceToNextLevel(this.profile.experience);
    }
  }

  // Achievement System
  private checkAchievements(): void {
    if (!this.profile) return;

    GAMIFICATION_ACHIEVEMENTS.forEach((achievement) => {
      if (this.isAchievementUnlocked(achievement.id)) return;

      if (this.isAchievementEarned(achievement)) {
        this.unlockAchievement(achievement);
      } else {
        this.updateAchievementProgress(achievement);
      }
    });
  }

  private isAchievementUnlocked(achievementId: string): boolean {
    return this.profile?.achievements.some((a) => a.id === achievementId) || false;
  }

  private isAchievementEarned(achievement: GamificationAchievement): boolean {
    if (!this.profile) return false;

    const { type, value } = achievement.requirement;
    const stats = this.profile.statistics;

    switch (type) {
      case 'listsCreated':
        return stats.listsCreated >= value;
      case 'wordsAdded':
        return stats.wordsAdded >= value;
      case 'kawasCreated':
        return stats.kawasCreated >= value;
      case 'kagasCreated':
        return stats.kagasCreated >= value;
      case 'slfGamesPlayed':
        return stats.slfGamesPlayed >= value;
      case 'sokratesSessions':
        return stats.sokratesSessions >= value;
      case 'basarTrades':
        return stats.basarTrades >= value;
      case 'currentStreak':
        return this.profile.streak.currentStreak >= value;
      case 'level':
        return this.profile.level >= value;
      case 'totalPoints':
        return this.profile.totalPoints >= value;
      case 'combined_creative':
        return (stats.kawasCreated + stats.kagasCreated) >= value;
      default:
        return false;
    }
  }

  private updateAchievementProgress(achievement: GamificationAchievement): void {
    if (!this.profile) return;

    const existingAchievement = this.profile.achievements.find((a) => a.id === achievement.id);
    if (existingAchievement) return;

    const { type, value } = achievement.requirement;
    const stats = this.profile.statistics;
    let progress = 0;

    switch (type) {
      case 'listsCreated':
        progress = stats.listsCreated;
        break;
      case 'wordsAdded':
        progress = stats.wordsAdded;
        break;
      case 'kawasCreated':
        progress = stats.kawasCreated;
        break;
      case 'kagasCreated':
        progress = stats.kagasCreated;
        break;
      case 'slfGamesPlayed':
        progress = stats.slfGamesPlayed;
        break;
      case 'sokratesSessions':
        progress = stats.sokratesSessions;
        break;
      case 'basarTrades':
        progress = stats.basarTrades;
        break;
      case 'currentStreak':
        progress = this.profile.streak.currentStreak;
        break;
      case 'level':
        progress = this.profile.level;
        break;
      case 'totalPoints':
        progress = this.profile.totalPoints;
        break;
      case 'combined_creative':
        progress = stats.kawasCreated + stats.kagasCreated;
        break;
    }

    // Add achievement with progress
    const achievementWithProgress: GamificationAchievement = {
      ...achievement,
      progress: Math.min(progress, value),
    };

    // Remove existing and add updated
    this.profile.achievements = this.profile.achievements.filter((a) => a.id !== achievement.id);
    this.profile.achievements.push(achievementWithProgress);
  }

  private unlockAchievement(achievement: GamificationAchievement): void {
    if (!this.profile) return;

    const unlockedAchievement: GamificationAchievement = {
      ...achievement,
      dateEarned: new Date().toISOString(),
      progress: achievement.requirement.value,
    };

    // Remove from progress tracking and add as earned
    this.profile.achievements = this.profile.achievements.filter((a) => a.id !== achievement.id);
    this.profile.achievements.push(unlockedAchievement);

    // Award points
    this.profile.totalPoints += achievement.points;
    this.profile.experience += achievement.points;

    // Award badge if special achievement
    if (achievement.rarity === 'legendary' || achievement.rarity === 'epic') {
      const badge: Badge = {
        id: `badge_${achievement.id}`,
        name: achievement.name,
        description: achievement.description,
        icon: achievement.icon,
        rarity: achievement.rarity,
        dateEarned: new Date().toISOString(),
      };
      this.profile.badges.push(badge);
    }

    this.emitEvent('achievement_unlocked', { achievement: unlockedAchievement, profile: this.profile });
  }

  // Challenge System
  private generateChallenges(): Challenge[] {
    const challenges: Challenge[] = [];
    const now = new Date();

    // Weekly challenge
    const weeklyTemplate = WEEKLY_CHALLENGE_TEMPLATES[
      Math.floor(Math.random() * WEEKLY_CHALLENGE_TEMPLATES.length)
    ];
    const weekStart = getWeekStartDate();
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);

    challenges.push({
      id: `weekly_${Date.now()}`,
      name: weeklyTemplate.name,
      description: weeklyTemplate.description,
      type: 'weekly',
      target: weeklyTemplate.target,
      progress: 0,
      startDate: weekStart,
      endDate: weekEnd.toISOString().split('T')[0],
      reward: weeklyTemplate.reward,
      activity: weeklyTemplate.activity,
      icon: weeklyTemplate.icon,
      completed: false,
    });

    // Monthly challenge
    const monthlyTemplate = MONTHLY_CHALLENGE_TEMPLATES[
      Math.floor(Math.random() * MONTHLY_CHALLENGE_TEMPLATES.length)
    ];
    const monthStart = getMonthStartDate();
    const monthEnd = new Date(monthStart);
    monthEnd.setMonth(monthEnd.getMonth() + 1);
    monthEnd.setDate(0); // Last day of month

    challenges.push({
      id: `monthly_${Date.now()}`,
      name: monthlyTemplate.name,
      description: monthlyTemplate.description,
      type: 'monthly',
      target: monthlyTemplate.target,
      progress: 0,
      startDate: monthStart,
      endDate: monthEnd.toISOString().split('T')[0],
      reward: monthlyTemplate.reward,
      activity: monthlyTemplate.activity,
      icon: monthlyTemplate.icon,
      completed: false,
    });

    return challenges;
  }

  private updateChallenges(): void {
    if (!this.profile) return;

    const today = getTodayDateString();
    let needsUpdate = false;

    // Check if challenges are expired and need regeneration
    this.profile.challenges = this.profile.challenges.filter((challenge) => {
      if (challenge.endDate < today && !challenge.completed) {
        needsUpdate = true;
        return false;
      }
      return true;
    });

    // Generate new challenges if needed
    if (needsUpdate || this.profile.challenges.length === 0) {
      const newChallenges = this.generateChallenges();
      this.profile.challenges.push(...newChallenges);
    }
  }

  private updateChallengeProgress(activityType: string): void {
    if (!this.profile) return;

    this.profile.challenges.forEach((challenge) => {
      if (challenge.completed) return;

      let shouldUpdate = false;

      switch (challenge.activity) {
        case 'wordsAdded':
          shouldUpdate = activityType === 'word_added';
          break;
        case 'listsCreated':
          shouldUpdate = activityType === 'list_created';
          break;
        case 'creativesCreated':
          shouldUpdate = activityType === 'kawa_created' || activityType === 'kaga_created';
          break;
        case 'slfGamesPlayed':
          shouldUpdate = activityType === 'slf_game_played';
          break;
        case 'basarTrades':
          shouldUpdate = activityType === 'basar_trade';
          break;
        case 'dailyStreak':
          shouldUpdate = activityType === 'daily_login';
          break;
      }

      if (shouldUpdate) {
        challenge.progress++;
        
        if (challenge.progress >= challenge.target) {
          challenge.completed = true;
          this.profile!.totalPoints += challenge.reward;
          this.profile!.experience += challenge.reward;
          this.trackActivity('challenge_completed');
          this.emitEvent('challenge_completed', { challenge, profile: this.profile });
        }
      }
    });
  }

  // Leaderboard System
  generateLeaderboard(metric: string, limit: number = 10): LeaderboardEntry[] {
    // For now, generate mock leaderboard with current user
    // In a real app, this would fetch from a server
    if (!this.profile) return [];

    const entries: LeaderboardEntry[] = [
      {
        userId: this.profile.id,
        username: 'Du',
        value: this.getMetricValue(metric),
        rank: 1,
        level: this.profile.level,
        badge: this.getTopBadge()?.icon,
      },
    ];

    // Add some mock competitors
    for (let i = 2; i <= limit; i++) {
      entries.push({
        userId: `mock_${i}`,
        username: `Spieler ${i}`,
        value: Math.max(0, this.getMetricValue(metric) - Math.random() * 100),
        rank: i,
        level: Math.max(1, this.profile.level - Math.floor(Math.random() * 3)),
        badge: ['🎯', '⭐', '🏆', '💎'][Math.floor(Math.random() * 4)],
      });
    }

    return entries.sort((a, b) => b.value - a.value).map((entry, index) => ({
      ...entry,
      rank: index + 1,
    }));
  }

  private getMetricValue(metric: string): number {
    if (!this.profile) return 0;

    switch (metric) {
      case 'totalPoints':
        return this.profile.totalPoints;
      case 'level':
        return this.profile.level;
      case 'currentStreak':
        return this.profile.streak.currentStreak;
      case 'listsCreated':
        return this.profile.statistics.listsCreated;
      case 'wordsAdded':
        return this.profile.statistics.wordsAdded;
      case 'basarTrades':
        return this.profile.statistics.basarTrades;
      default:
        return 0;
    }
  }

  private getTopBadge(): Badge | undefined {
    if (!this.profile) return undefined;
    return this.profile.badges
      .sort((a, b) => {
        const rarityOrder = { legendary: 4, epic: 3, rare: 2, common: 1 };
        return rarityOrder[b.rarity] - rarityOrder[a.rarity];
      })[0];
  }

  // Event System
  addEventListener(callback: (event: string, data: any) => void): void {
    this.eventListeners.push(callback);
  }

  removeEventListener(callback: (event: string, data: any) => void): void {
    this.eventListeners = this.eventListeners.filter((listener) => listener !== callback);
  }

  private emitEvent(event: string, data: any): void {
    this.eventListeners.forEach((listener) => {
      try {
        listener(event, data);
      } catch (error) {
        console.error('Error in gamification event listener:', error);
      }
    });
  }

  // Utility Methods
  getAchievementProgress(achievementId: string): { progress: number; target: number } | null {
    if (!this.profile) return null;

    const achievement = this.profile.achievements.find((a) => a.id === achievementId);
    if (!achievement) return null;

    return {
      progress: achievement.progress || 0,
      target: achievement.requirement.value,
    };
  }

  getActiveChallenges(): Challenge[] {
    if (!this.profile) return [];
    return this.profile.challenges.filter((c) => !c.completed);
  }

  getCompletedChallenges(): Challenge[] {
    if (!this.profile) return [];
    return this.profile.challenges.filter((c) => c.completed);
  }

  getEarnedAchievements(): GamificationAchievement[] {
    if (!this.profile) return [];
    return this.profile.achievements.filter((a) => a.dateEarned);
  }

  getProgressAchievements(): GamificationAchievement[] {
    if (!this.profile) return [];
    return this.profile.achievements.filter((a) => !a.dateEarned);
  }

  // Export data for debugging
  exportData(): any {
    return {
      profile: this.profile,
      timestamp: new Date().toISOString(),
    };
  }
}