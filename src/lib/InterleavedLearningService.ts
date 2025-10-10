/**
 * Interleaved Learning Service
 * Manages interleaved learning sessions with localStorage persistence and event-driven updates
 */

import {
  generateInterleavedSequence,
  analyzeInterleavingPerformance,
  generateInterleavingRecommendations,
  DEFAULT_INTERLEAVING_SETTINGS,
  InterleavingSettings,
  TopicGroup,
  PerformanceMetrics,
} from "./interleavedLearning";

export interface InterleavingSession {
  id: string;
  startTime: string;
  endTime?: string;
  topicGroups: TopicGroup[];
  results: Array<{
    topic: string;
    term: string;
    correct: boolean;
    responseTime: number;
    timestamp: string;
  }>;
  metrics?: PerformanceMetrics[];
  recommendations?: string[];
}

const STORAGE_KEYS = {
  SETTINGS: "interleavedLearning-settings",
  SESSIONS: "interleavedLearning-sessions",
  CURRENT_SESSION: "interleavedLearning-currentSession",
} as const;

type EventCallback = () => void;

export class InterleavedLearningService {
  private static instance: InterleavedLearningService | null = null;
  private listeners: EventCallback[] = [];
  private settings: InterleavingSettings;

  private constructor() {
    this.settings = this.loadSettings();
  }

  static getInstance(): InterleavedLearningService {
    if (!InterleavedLearningService.instance) {
      InterleavedLearningService.instance = new InterleavedLearningService();
    }
    return InterleavedLearningService.instance;
  }

  // For testing purposes only
  static resetInstance(): void {
    InterleavedLearningService.instance = null;
  }

  // Event system
  addListener(callback: EventCallback): () => void {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== callback);
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach((callback) => callback());
  }

  // Settings management
  private loadSettings(): InterleavingSettings {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error("Failed to load interleaving settings:", error);
    }
    return DEFAULT_INTERLEAVING_SETTINGS;
  }

  getSettings(): InterleavingSettings {
    return {...this.settings};
  }

  updateSettings(newSettings: Partial<InterleavingSettings>): void {
    this.settings = {...this.settings, ...newSettings};
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(this.settings));
    this.notifyListeners();
  }

  resetSettings(): void {
    this.settings = DEFAULT_INTERLEAVING_SETTINGS;
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(this.settings));
    this.notifyListeners();
  }

  // Session management
  startSession(topicGroups: TopicGroup[]): InterleavingSession {
    const session: InterleavingSession = {
      id: `session-${Date.now()}`,
      startTime: new Date().toISOString(),
      topicGroups,
      results: [],
    };

    localStorage.setItem(STORAGE_KEYS.CURRENT_SESSION, JSON.stringify(session));
    this.notifyListeners();
    return session;
  }

  getCurrentSession(): InterleavingSession | null {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.CURRENT_SESSION);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error("Failed to load current session:", error);
    }
    return null;
  }

  recordResult(
    topic: string,
    term: string,
    correct: boolean,
    responseTime: number,
  ): void {
    const session = this.getCurrentSession();
    if (!session) return;

    session.results.push({
      topic,
      term,
      correct,
      responseTime,
      timestamp: new Date().toISOString(),
    });

    localStorage.setItem(STORAGE_KEYS.CURRENT_SESSION, JSON.stringify(session));
    this.notifyListeners();
  }

  finishSession(): InterleavingSession | null {
    const session = this.getCurrentSession();
    if (!session) return null;

    session.endTime = new Date().toISOString();

    // Analyze performance
    session.metrics = analyzeInterleavingPerformance(session.results);
    session.recommendations = generateInterleavingRecommendations(
      session.metrics,
    );

    // Save to history
    this.saveSessionToHistory(session);

    // Clear current session
    localStorage.removeItem(STORAGE_KEYS.CURRENT_SESSION);
    this.notifyListeners();

    return session;
  }

  private saveSessionToHistory(session: InterleavingSession): void {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.SESSIONS);
      const sessions: InterleavingSession[] = stored ? JSON.parse(stored) : [];

      sessions.unshift(session); // Add to beginning

      // Keep only last 50 sessions
      if (sessions.length > 50) {
        sessions.splice(50);
      }

      localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
    } catch (error) {
      console.error("Failed to save session to history:", error);
    }
  }

  getSessionHistory(limit: number = 10): InterleavingSession[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.SESSIONS);
      const sessions: InterleavingSession[] = stored ? JSON.parse(stored) : [];
      return sessions.slice(0, limit);
    } catch (error) {
      console.error("Failed to load session history:", error);
      return [];
    }
  }

  getStatistics(): {
    totalSessions: number;
    avgAccuracy: number;
    avgSessionDuration: number;
    mostPracticedTopics: Array<{topic: string; count: number}>;
    totalTermsReviewed: number;
  } {
    const sessions = this.getSessionHistory(100); // Analyze last 100 sessions

    if (sessions.length === 0) {
      return {
        totalSessions: 0,
        avgAccuracy: 0,
        avgSessionDuration: 0,
        mostPracticedTopics: [],
        totalTermsReviewed: 0,
      };
    }

    const totalCorrect = sessions.reduce(
      (sum, s) => sum + s.results.filter((r) => r.correct).length,
      0,
    );
    const totalTerms = sessions.reduce((sum, s) => sum + s.results.length, 0);

    const durations = sessions
      .filter((s) => s.endTime)
      .map((s) => {
        const start = new Date(s.startTime).getTime();
        const end = new Date(s.endTime!).getTime();
        return end - start;
      });

    const avgDuration =
      durations.length > 0
        ? durations.reduce((sum, d) => sum + d, 0) / durations.length
        : 0;

    // Count topic occurrences
    const topicCounts: Record<string, number> = {};
    sessions.forEach((s) => {
      s.results.forEach((r) => {
        topicCounts[r.topic] = (topicCounts[r.topic] || 0) + 1;
      });
    });

    const mostPracticedTopics = Object.entries(topicCounts)
      .map(([topic, count]) => ({topic, count}))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      totalSessions: sessions.length,
      avgAccuracy: totalTerms > 0 ? totalCorrect / totalTerms : 0,
      avgSessionDuration: avgDuration,
      mostPracticedTopics,
      totalTermsReviewed: totalTerms,
    };
  }

  // Generate interleaved sequence
  generateSequence<T>(topicGroups: TopicGroup[]) {
    return generateInterleavedSequence<T>(topicGroups, this.settings);
  }
}
