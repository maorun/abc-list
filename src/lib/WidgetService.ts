/**
 * WidgetService
 *
 * Manages widget data for PWA homescreen widgets.
 * Provides data aggregation for:
 * - Statistics Widget: Streak, points, level
 * - Quick Actions: Fast access to list creation
 * - Random Quiz: Daily learning questions
 * - Learning Goals: Weekly progress tracking
 *
 * Design Philosophy:
 * - Uses existing services (GamificationService, localStorage)
 * - Optimized for mobile-first display
 * - Implements efficient caching for widget updates
 * - Supports periodic background sync for fresh data
 */

import {GamificationService} from "./GamificationService";

// Widget data types
export interface WidgetStatistics {
  currentStreak: number;
  longestStreak: number;
  totalPoints: number;
  level: number;
  experienceProgress: number; // 0-100 percentage
  lastActivityDate: string;
}

export interface WidgetQuickActions {
  createListUrl: string;
  createKawaUrl: string;
  sokratesCheckUrl: string;
  stadtLandFlussUrl: string;
}

export interface WidgetRandomQuiz {
  question: string;
  category: string;
  timestamp: string;
  answeredToday: boolean;
}

export interface WidgetLearningGoals {
  weeklyGoals: {
    listsCreated: {current: number; target: number};
    wordsAdded: {current: number; target: number};
    sokratesSessions: {current: number; target: number};
  };
  weekProgress: number; // 0-100 percentage
  weekStart: string;
  weekEnd: string;
}

export interface WidgetData {
  statistics: WidgetStatistics;
  quickActions: WidgetQuickActions;
  randomQuiz: WidgetRandomQuiz;
  learningGoals: WidgetLearningGoals;
  lastUpdated: string;
}

// Storage keys
export const WIDGET_STORAGE_KEYS = {
  DATA: "widget-data",
  QUIZ_STATE: "widget-quiz-state",
  GOALS: "widget-learning-goals",
} as const;

// Default weekly goals
const DEFAULT_WEEKLY_GOALS = {
  listsCreated: 5,
  wordsAdded: 50,
  sokratesSessions: 7,
};

// Random quiz questions pool (German educational content)
const QUIZ_QUESTIONS = [
  {
    question: "Wie viele Buchstaben hat das ABC?",
    category: "Grundlagen",
    answer: "26",
  },
  {
    question: "Welches Birkenbihl-Prinzip nutzt die KaWa-Methode?",
    category: "Methodik",
    answer: "Kreative Assoziation",
  },
  {
    question: "Was bedeutet 'Sokrates' in dieser App?",
    category: "Lerntechnik",
    answer: "Spaced Repetition System",
  },
  {
    question: "Wofür steht das 'K' in KaGa?",
    category: "Methodik",
    answer: "Kreative (Assoziation, graphisch)",
  },
  {
    question: "Wie oft sollte man idealerweise Sokrates-Check nutzen?",
    category: "Lernstrategie",
    answer: "Täglich",
  },
];

export class WidgetService {
  private static instance: WidgetService | undefined;
  private gamificationService: GamificationService;

  static getInstance(): WidgetService {
    if (!WidgetService.instance) {
      WidgetService.instance = new WidgetService();
    }
    return WidgetService.instance;
  }

  // For testing only - reset singleton instance
  static resetInstance(): void {
    WidgetService.instance = undefined;
  }

  constructor() {
    this.gamificationService = GamificationService.getInstance();
  }

  /**
   * Get all widget data aggregated from various services
   */
  getWidgetData(): WidgetData {
    const statistics = this.getStatisticsData();
    const quickActions = this.getQuickActionsData();
    const randomQuiz = this.getRandomQuizData();
    const learningGoals = this.getLearningGoalsData();

    const widgetData: WidgetData = {
      statistics,
      quickActions,
      randomQuiz,
      learningGoals,
      lastUpdated: new Date().toISOString(),
    };

    // Cache widget data for service worker
    this.cacheWidgetData(widgetData);

    return widgetData;
  }

  /**
   * Get statistics widget data
   */
  private getStatisticsData(): WidgetStatistics {
    const profile = this.gamificationService.getProfile();

    if (!profile) {
      return {
        currentStreak: 0,
        longestStreak: 0,
        totalPoints: 0,
        level: 1,
        experienceProgress: 0,
        lastActivityDate: "",
      };
    }

    const experienceProgress =
      profile.experienceToNextLevel > 0
        ? Math.round((profile.experience / profile.experienceToNextLevel) * 100)
        : 0;

    return {
      currentStreak: profile.streak.currentStreak,
      longestStreak: profile.streak.longestStreak,
      totalPoints: profile.totalPoints,
      level: profile.level,
      experienceProgress,
      lastActivityDate: profile.streak.lastActivityDate,
    };
  }

  /**
   * Get quick actions widget data
   */
  private getQuickActionsData(): WidgetQuickActions {
    // PWA shortcuts will use these URLs for deep linking
    return {
      createListUrl: "/list/neu",
      createKawaUrl: "/kawa/neu",
      sokratesCheckUrl: "/sokrates",
      stadtLandFlussUrl: "/stadt-land-fluss/neu",
    };
  }

  /**
   * Get random quiz widget data
   */
  private getRandomQuizData(): WidgetRandomQuiz {
    const today = new Date().toISOString().split("T")[0];
    const storedQuizState = localStorage.getItem(
      WIDGET_STORAGE_KEYS.QUIZ_STATE,
    );

    let quizState: {
      lastQuestionDate: string;
      questionIndex: number;
      answeredToday: boolean;
    } = {
      lastQuestionDate: "",
      questionIndex: 0,
      answeredToday: false,
    };

    if (storedQuizState) {
      try {
        quizState = JSON.parse(storedQuizState);
      } catch {
        // Invalid JSON, use defaults
      }
    }

    // Generate new question if it's a new day
    if (quizState.lastQuestionDate !== today) {
      quizState.questionIndex = Math.floor(
        Math.random() * QUIZ_QUESTIONS.length,
      );
      quizState.answeredToday = false;
      quizState.lastQuestionDate = today;
      localStorage.setItem(
        WIDGET_STORAGE_KEYS.QUIZ_STATE,
        JSON.stringify(quizState),
      );
    }

    const questionData = QUIZ_QUESTIONS[quizState.questionIndex];

    return {
      question: questionData.question,
      category: questionData.category,
      timestamp: today,
      answeredToday: quizState.answeredToday,
    };
  }

  /**
   * Mark today's quiz as answered
   */
  markQuizAnswered(): void {
    const today = new Date().toISOString().split("T")[0];
    const storedQuizState = localStorage.getItem(
      WIDGET_STORAGE_KEYS.QUIZ_STATE,
    );

    let quizState = {
      lastQuestionDate: today,
      questionIndex: 0,
      answeredToday: true,
    };

    if (storedQuizState) {
      try {
        quizState = {...JSON.parse(storedQuizState), answeredToday: true};
      } catch {
        // Invalid JSON, use defaults
      }
    }

    localStorage.setItem(
      WIDGET_STORAGE_KEYS.QUIZ_STATE,
      JSON.stringify(quizState),
    );
  }

  /**
   * Get learning goals widget data
   */
  private getLearningGoalsData(): WidgetLearningGoals {
    const profile = this.gamificationService.getProfile();
    const storedGoals = localStorage.getItem(WIDGET_STORAGE_KEYS.GOALS);

    let goals = DEFAULT_WEEKLY_GOALS;

    if (storedGoals) {
      try {
        goals = JSON.parse(storedGoals);
      } catch {
        // Invalid JSON, use defaults
      }
    }

    const weekStart = this.getWeekStartDate();
    const weekEnd = this.getWeekEndDate();

    // Get current week's statistics from gamification profile
    const currentStats = profile?.statistics || {
      listsCreated: 0,
      wordsAdded: 0,
      sokratesSessions: 0,
    };

    // Calculate progress percentage
    const listsProgress = Math.min(
      (currentStats.listsCreated / goals.listsCreated) * 100,
      100,
    );
    const wordsProgress = Math.min(
      (currentStats.wordsAdded / goals.wordsAdded) * 100,
      100,
    );
    const sessionsProgress = Math.min(
      (currentStats.sokratesSessions / goals.sokratesSessions) * 100,
      100,
    );

    const weekProgress = Math.round(
      (listsProgress + wordsProgress + sessionsProgress) / 3,
    );

    return {
      weeklyGoals: {
        listsCreated: {
          current: currentStats.listsCreated,
          target: goals.listsCreated,
        },
        wordsAdded: {
          current: currentStats.wordsAdded,
          target: goals.wordsAdded,
        },
        sokratesSessions: {
          current: currentStats.sokratesSessions,
          target: goals.sokratesSessions,
        },
      },
      weekProgress,
      weekStart,
      weekEnd,
    };
  }

  /**
   * Update weekly learning goals
   */
  updateWeeklyGoals(goals: {
    listsCreated?: number;
    wordsAdded?: number;
    sokratesSessions?: number;
  }): void {
    const currentGoals = {...DEFAULT_WEEKLY_GOALS};
    const storedGoals = localStorage.getItem(WIDGET_STORAGE_KEYS.GOALS);

    if (storedGoals) {
      try {
        Object.assign(currentGoals, JSON.parse(storedGoals));
      } catch {
        // Invalid JSON, use defaults
      }
    }

    const updatedGoals = {...currentGoals, ...goals};
    localStorage.setItem(
      WIDGET_STORAGE_KEYS.GOALS,
      JSON.stringify(updatedGoals),
    );
  }

  /**
   * Cache widget data for service worker access
   */
  private cacheWidgetData(data: WidgetData): void {
    localStorage.setItem(WIDGET_STORAGE_KEYS.DATA, JSON.stringify(data));
  }

  /**
   * Get cached widget data (used by service worker)
   */
  getCachedWidgetData(): WidgetData | null {
    const cached = localStorage.getItem(WIDGET_STORAGE_KEYS.DATA);
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch {
        return null;
      }
    }
    return null;
  }

  /**
   * Get start of current week (Monday)
   */
  private getWeekStartDate(): string {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Adjust for Monday start
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() + diff);
    weekStart.setHours(0, 0, 0, 0);
    return weekStart.toISOString().split("T")[0];
  }

  /**
   * Get end of current week (Sunday)
   */
  private getWeekEndDate(): string {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const diff = dayOfWeek === 0 ? 0 : 7 - dayOfWeek;
    const weekEnd = new Date(now);
    weekEnd.setDate(now.getDate() + diff);
    weekEnd.setHours(23, 59, 59, 999);
    return weekEnd.toISOString().split("T")[0];
  }

  /**
   * Force refresh widget data
   */
  refreshWidgetData(): WidgetData {
    return this.getWidgetData();
  }
}
