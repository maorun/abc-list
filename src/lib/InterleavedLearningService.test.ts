import {describe, it, expect, beforeEach} from "vitest";
import {InterleavedLearningService} from "./InterleavedLearningService";
import {TopicGroup} from "./interleavedLearning";

describe("InterleavedLearningService", () => {
  let service: InterleavedLearningService;

  beforeEach(() => {
    localStorage.clear();
    InterleavedLearningService.resetInstance();
    service = InterleavedLearningService.getInstance();
  });

  describe("Singleton Pattern", () => {
    it("should return the same instance", () => {
      const instance1 = InterleavedLearningService.getInstance();
      const instance2 = InterleavedLearningService.getInstance();
      expect(instance1).toBe(instance2);
    });

    it("should reset instance correctly", () => {
      const instance1 = InterleavedLearningService.getInstance();
      InterleavedLearningService.resetInstance();
      const instance2 = InterleavedLearningService.getInstance();
      expect(instance1).not.toBe(instance2);
    });
  });

  describe("Settings Management", () => {
    it("should load default settings", () => {
      const settings = service.getSettings();
      expect(settings.enabled).toBe(true);
      expect(settings.contextSwitchFrequency).toBe(3);
      expect(settings.minTopicsToInterleave).toBe(2);
      expect(settings.shuffleIntensity).toBe(3);
    });

    it("should update settings", () => {
      service.updateSettings({enabled: false, shuffleIntensity: 5});

      const settings = service.getSettings();
      expect(settings.enabled).toBe(false);
      expect(settings.shuffleIntensity).toBe(5);
      expect(settings.contextSwitchFrequency).toBe(3); // Unchanged
    });

    it("should persist settings to localStorage", () => {
      service.updateSettings({enabled: false});

      InterleavedLearningService.resetInstance();
      const newService = InterleavedLearningService.getInstance();

      expect(newService.getSettings().enabled).toBe(false);
    });

    it("should reset settings to defaults", () => {
      service.updateSettings({enabled: false, shuffleIntensity: 5});
      service.resetSettings();

      const settings = service.getSettings();
      expect(settings.enabled).toBe(true);
      expect(settings.shuffleIntensity).toBe(3);
    });
  });

  describe("Event System", () => {
    it("should notify listeners on settings change", () => {
      let notified = false;
      service.addListener(() => {
        notified = true;
      });

      service.updateSettings({enabled: false});
      expect(notified).toBe(true);
    });

    it("should allow removing listeners", () => {
      let count = 0;
      const unsubscribe = service.addListener(() => {
        count++;
      });

      service.updateSettings({enabled: false});
      expect(count).toBe(1);

      unsubscribe();
      service.updateSettings({enabled: true});
      expect(count).toBe(1); // Should not increase
    });
  });

  describe("Session Management", () => {
    const mockTopics: TopicGroup[] = [
      {topic: "Math", terms: ["1+1", "2+2"], weight: 1},
      {topic: "Science", terms: ["H2O", "CO2"], weight: 1},
    ];

    it("should start a new session", () => {
      const session = service.startSession(mockTopics);

      expect(session.id).toBeDefined();
      expect(session.startTime).toBeDefined();
      expect(session.topicGroups).toEqual(mockTopics);
      expect(session.results).toEqual([]);
    });

    it("should get current session", () => {
      const originalSession = service.startSession(mockTopics);
      const currentSession = service.getCurrentSession();

      expect(currentSession).toBeDefined();
      expect(currentSession?.id).toBe(originalSession.id);
    });

    it("should record results", () => {
      service.startSession(mockTopics);
      service.recordResult("Math", "1+1", true, 1000);
      service.recordResult("Science", "H2O", false, 2000);

      const session = service.getCurrentSession();
      expect(session?.results).toHaveLength(2);
      expect(session?.results[0]).toMatchObject({
        topic: "Math",
        term: "1+1",
        correct: true,
        responseTime: 1000,
      });
    });

    it("should finish session and analyze performance", () => {
      service.startSession(mockTopics);
      service.recordResult("Math", "1+1", true, 1000);
      service.recordResult("Science", "H2O", true, 1500);
      service.recordResult("Math", "2+2", false, 2000);

      const finishedSession = service.finishSession();

      expect(finishedSession).toBeDefined();
      expect(finishedSession?.endTime).toBeDefined();
      expect(finishedSession?.metrics).toBeDefined();
      expect(finishedSession?.recommendations).toBeDefined();

      // Should clear current session
      expect(service.getCurrentSession()).toBeNull();
    });

    it("should save session to history", () => {
      service.startSession(mockTopics);
      service.recordResult("Math", "1+1", true, 1000);
      service.finishSession();

      const history = service.getSessionHistory();
      expect(history).toHaveLength(1);
      expect(history[0].results).toHaveLength(1);
    });

    it("should limit session history to 50 sessions", () => {
      // Create 60 sessions
      for (let i = 0; i < 60; i++) {
        service.startSession(mockTopics);
        service.recordResult("Math", "test", true, 1000);
        service.finishSession();
      }

      const allHistory = service.getSessionHistory(100);
      expect(allHistory.length).toBeLessThanOrEqual(50);
    });

    it("should return limited session history", () => {
      // Create 5 sessions
      for (let i = 0; i < 5; i++) {
        service.startSession(mockTopics);
        service.recordResult("Math", "test", true, 1000);
        service.finishSession();
      }

      const history = service.getSessionHistory(3);
      expect(history).toHaveLength(3);
    });
  });

  describe("Statistics", () => {
    const mockTopics: TopicGroup[] = [
      {topic: "Math", terms: ["1+1"], weight: 1},
      {topic: "Science", terms: ["H2O"], weight: 1},
    ];

    it("should return empty statistics when no sessions", () => {
      const stats = service.getStatistics();

      expect(stats.totalSessions).toBe(0);
      expect(stats.avgAccuracy).toBe(0);
      expect(stats.totalTermsReviewed).toBe(0);
    });

    it("should calculate average accuracy", () => {
      service.startSession(mockTopics);
      service.recordResult("Math", "1+1", true, 1000);
      service.recordResult("Science", "H2O", true, 1000);
      service.recordResult("Math", "2+2", false, 1000);
      service.finishSession();

      const stats = service.getStatistics();
      expect(stats.avgAccuracy).toBeCloseTo(2 / 3);
      expect(stats.totalTermsReviewed).toBe(3);
    });

    it("should calculate average session duration", () => {
      service.startSession(mockTopics);
      service.recordResult("Math", "1+1", true, 1000);

      // Wait a bit before finishing
      const startTime = Date.now();
      const session = service.getCurrentSession();
      if (session) {
        session.startTime = new Date(startTime - 5000).toISOString(); // 5 seconds ago
        localStorage.setItem(
          "interleavedLearning-currentSession",
          JSON.stringify(session),
        );
      }

      service.finishSession();

      const stats = service.getStatistics();
      expect(stats.avgSessionDuration).toBeGreaterThan(0);
    });

    it("should track most practiced topics", () => {
      service.startSession(mockTopics);
      service.recordResult("Math", "1+1", true, 1000);
      service.recordResult("Math", "2+2", true, 1000);
      service.recordResult("Science", "H2O", true, 1000);
      service.finishSession();

      const stats = service.getStatistics();
      expect(stats.mostPracticedTopics[0].topic).toBe("Math");
      expect(stats.mostPracticedTopics[0].count).toBe(2);
    });
  });

  describe("Sequence Generation", () => {
    it("should generate interleaved sequence", () => {
      const topics: TopicGroup[] = [
        {topic: "Math", terms: ["1+1", "2+2"], weight: 1},
        {topic: "Science", terms: ["H2O", "CO2"], weight: 1},
      ];

      const result = service.generateSequence(topics);

      expect(result.sequence).toHaveLength(4);
      expect(result.contextSwitches).toBeGreaterThan(0);
    });

    it("should respect settings when generating sequence", () => {
      const topics: TopicGroup[] = [
        {topic: "Math", terms: ["1+1"], weight: 1},
        {topic: "Science", terms: ["H2O"], weight: 1},
      ];

      service.updateSettings({enabled: false});
      const result = service.generateSequence(topics);

      expect(result.contextSwitches).toBe(0);
      expect(result.effectiveness).toBe(0);
    });
  });
});
