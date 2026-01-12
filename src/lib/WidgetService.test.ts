import {describe, it, expect, beforeEach, afterEach, vi} from "vitest";
import {WidgetService, WIDGET_STORAGE_KEYS, WidgetData} from "./WidgetService";
import {GamificationService} from "./GamificationService";

describe("WidgetService", () => {
  let widgetService: WidgetService;
  let gamificationService: GamificationService;

  beforeEach(() => {
    localStorage.clear();
    WidgetService.resetInstance();
    GamificationService.resetInstance();
    widgetService = WidgetService.getInstance();
    gamificationService = GamificationService.getInstance();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe("Singleton Pattern", () => {
    it("should return the same instance on multiple calls", () => {
      const instance1 = WidgetService.getInstance();
      const instance2 = WidgetService.getInstance();
      expect(instance1).toBe(instance2);
    });

    it("should reset instance for testing", () => {
      const instance1 = WidgetService.getInstance();
      WidgetService.resetInstance();
      const instance2 = WidgetService.getInstance();
      expect(instance1).not.toBe(instance2);
    });
  });

  describe("getWidgetData", () => {
    it("should return complete widget data with all sections", () => {
      const widgetData = widgetService.getWidgetData();

      expect(widgetData).toHaveProperty("statistics");
      expect(widgetData).toHaveProperty("quickActions");
      expect(widgetData).toHaveProperty("randomQuiz");
      expect(widgetData).toHaveProperty("learningGoals");
      expect(widgetData).toHaveProperty("lastUpdated");
    });

    it("should cache widget data in localStorage", () => {
      widgetService.getWidgetData();

      const cached = localStorage.getItem(WIDGET_STORAGE_KEYS.DATA);
      expect(cached).not.toBeNull();

      if (cached) {
        const parsedData: WidgetData = JSON.parse(cached);
        expect(parsedData).toHaveProperty("statistics");
        expect(parsedData).toHaveProperty("quickActions");
        expect(parsedData).toHaveProperty("randomQuiz");
        expect(parsedData).toHaveProperty("learningGoals");
      }
    });

    it("should update lastUpdated timestamp on each call", async () => {
      const widgetData1 = widgetService.getWidgetData();
      await new Promise((resolve) => setTimeout(resolve, 10));
      const widgetData2 = widgetService.getWidgetData();

      expect(widgetData2.lastUpdated).not.toBe(widgetData1.lastUpdated);
    });
  });

  describe("Statistics Widget", () => {
    it("should return default statistics when no gamification profile exists", () => {
      const widgetData = widgetService.getWidgetData();

      expect(widgetData.statistics.currentStreak).toBe(0);
      expect(widgetData.statistics.longestStreak).toBe(0);
      expect(widgetData.statistics.totalPoints).toBe(0);
      expect(widgetData.statistics.level).toBe(1);
      expect(widgetData.statistics.experienceProgress).toBe(0);
    });

    it("should return current streak from gamification profile", () => {
      // Create some activity to build a streak
      gamificationService.trackActivity("list_created");

      const widgetData = widgetService.getWidgetData();

      expect(widgetData.statistics.currentStreak).toBeGreaterThanOrEqual(1);
    });

    it("should calculate experience progress percentage correctly", () => {
      // Track activities to gain experience
      gamificationService.trackActivity("list_created");
      gamificationService.trackActivity("word_added");

      const widgetData = widgetService.getWidgetData();

      expect(widgetData.statistics.experienceProgress).toBeGreaterThanOrEqual(
        0,
      );
      expect(widgetData.statistics.experienceProgress).toBeLessThanOrEqual(100);
    });
  });

  describe("Quick Actions Widget", () => {
    it("should return all quick action URLs", () => {
      const widgetData = widgetService.getWidgetData();

      expect(widgetData.quickActions.createListUrl).toBe("/list/neu");
      expect(widgetData.quickActions.createKawaUrl).toBe("/kawa/neu");
      expect(widgetData.quickActions.sokratesCheckUrl).toBe("/sokrates");
      expect(widgetData.quickActions.stadtLandFlussUrl).toBe(
        "/stadt-land-fluss/neu",
      );
    });
  });

  describe("Random Quiz Widget", () => {
    it("should generate a daily question", () => {
      const widgetData = widgetService.getWidgetData();

      expect(widgetData.randomQuiz.question).toBeTruthy();
      expect(widgetData.randomQuiz.category).toBeTruthy();
      expect(widgetData.randomQuiz.timestamp).toBeTruthy();
      expect(widgetData.randomQuiz.answeredToday).toBe(false);
    });

    it("should persist the same question for the same day", () => {
      const widgetData1 = widgetService.getWidgetData();
      const widgetData2 = widgetService.getWidgetData();

      expect(widgetData2.randomQuiz.question).toBe(
        widgetData1.randomQuiz.question,
      );
      expect(widgetData2.randomQuiz.category).toBe(
        widgetData1.randomQuiz.category,
      );
    });

    it("should mark quiz as answered", () => {
      const widgetData1 = widgetService.getWidgetData();
      expect(widgetData1.randomQuiz.answeredToday).toBe(false);

      widgetService.markQuizAnswered();

      const widgetData2 = widgetService.getWidgetData();
      expect(widgetData2.randomQuiz.answeredToday).toBe(true);
    });

    it("should store quiz state in localStorage", () => {
      widgetService.getWidgetData();

      const quizState = localStorage.getItem(WIDGET_STORAGE_KEYS.QUIZ_STATE);
      expect(quizState).not.toBeNull();

      if (quizState) {
        const parsedState = JSON.parse(quizState);
        expect(parsedState).toHaveProperty("lastQuestionDate");
        expect(parsedState).toHaveProperty("questionIndex");
        expect(parsedState).toHaveProperty("answeredToday");
      }
    });
  });

  describe("Learning Goals Widget", () => {
    it("should return default weekly goals", () => {
      const widgetData = widgetService.getWidgetData();

      expect(widgetData.learningGoals.weeklyGoals.listsCreated.target).toBe(5);
      expect(widgetData.learningGoals.weeklyGoals.wordsAdded.target).toBe(50);
      expect(widgetData.learningGoals.weeklyGoals.sokratesSessions.target).toBe(
        7,
      );
    });

    it("should track current progress towards weekly goals", () => {
      gamificationService.trackActivity("list_created");
      gamificationService.trackActivity("word_added");

      const widgetData = widgetService.getWidgetData();

      expect(
        widgetData.learningGoals.weeklyGoals.listsCreated.current,
      ).toBeGreaterThan(0);
      expect(
        widgetData.learningGoals.weeklyGoals.wordsAdded.current,
      ).toBeGreaterThan(0);
    });

    it("should calculate week progress percentage", () => {
      const widgetData = widgetService.getWidgetData();

      expect(widgetData.learningGoals.weekProgress).toBeGreaterThanOrEqual(0);
      expect(widgetData.learningGoals.weekProgress).toBeLessThanOrEqual(100);
    });

    it("should update weekly goals", () => {
      widgetService.updateWeeklyGoals({
        listsCreated: 10,
        wordsAdded: 100,
        sokratesSessions: 14,
      });

      const widgetData = widgetService.getWidgetData();

      expect(widgetData.learningGoals.weeklyGoals.listsCreated.target).toBe(10);
      expect(widgetData.learningGoals.weeklyGoals.wordsAdded.target).toBe(100);
      expect(widgetData.learningGoals.weeklyGoals.sokratesSessions.target).toBe(
        14,
      );
    });

    it("should include week start and end dates", () => {
      const widgetData = widgetService.getWidgetData();

      expect(widgetData.learningGoals.weekStart).toBeTruthy();
      expect(widgetData.learningGoals.weekEnd).toBeTruthy();

      // Week start should be before week end
      expect(
        new Date(widgetData.learningGoals.weekStart).getTime(),
      ).toBeLessThan(new Date(widgetData.learningGoals.weekEnd).getTime());
    });
  });

  describe("getCachedWidgetData", () => {
    it("should return cached widget data", () => {
      const widgetData = widgetService.getWidgetData();
      const cachedData = widgetService.getCachedWidgetData();

      expect(cachedData).not.toBeNull();
      expect(cachedData?.statistics).toEqual(widgetData.statistics);
      expect(cachedData?.quickActions).toEqual(widgetData.quickActions);
    });

    it("should return null when no cache exists", () => {
      const cachedData = widgetService.getCachedWidgetData();
      expect(cachedData).toBeNull();
    });

    it("should handle invalid JSON in cache", () => {
      localStorage.setItem(WIDGET_STORAGE_KEYS.DATA, "invalid json");

      const cachedData = widgetService.getCachedWidgetData();
      expect(cachedData).toBeNull();
    });
  });

  describe("refreshWidgetData", () => {
    it("should return fresh widget data", () => {
      const widgetData = widgetService.refreshWidgetData();

      expect(widgetData).toHaveProperty("statistics");
      expect(widgetData).toHaveProperty("quickActions");
      expect(widgetData).toHaveProperty("randomQuiz");
      expect(widgetData).toHaveProperty("learningGoals");
    });

    it("should update cached data on refresh", () => {
      widgetService.refreshWidgetData();

      const cached = localStorage.getItem(WIDGET_STORAGE_KEYS.DATA);
      expect(cached).not.toBeNull();
    });
  });

  describe("Edge Cases and Error Handling", () => {
    it("should handle missing localStorage gracefully", () => {
      // Simulate localStorage being unavailable
      const originalGetItem = localStorage.getItem;
      localStorage.getItem = vi.fn().mockReturnValue(null);

      const widgetData = widgetService.getWidgetData();

      expect(widgetData).toBeTruthy();
      expect(widgetData.statistics).toBeTruthy();

      // Restore
      localStorage.getItem = originalGetItem;
    });

    it("should handle corrupted quiz state in localStorage", () => {
      localStorage.setItem(
        WIDGET_STORAGE_KEYS.QUIZ_STATE,
        "corrupted json data",
      );

      const widgetData = widgetService.getWidgetData();

      expect(widgetData.randomQuiz).toBeTruthy();
      expect(widgetData.randomQuiz.question).toBeTruthy();
    });

    it("should handle corrupted goals data in localStorage", () => {
      localStorage.setItem(WIDGET_STORAGE_KEYS.GOALS, "corrupted json data");

      const widgetData = widgetService.getWidgetData();

      expect(widgetData.learningGoals).toBeTruthy();
      expect(widgetData.learningGoals.weeklyGoals).toBeTruthy();
    });
  });

  describe("Integration with GamificationService", () => {
    it("should reflect gamification statistics in widget data", () => {
      // Perform various activities
      gamificationService.trackActivity("list_created");
      gamificationService.trackActivity("list_created");
      gamificationService.trackActivity("word_added");
      gamificationService.trackActivity("word_added");
      gamificationService.trackActivity("word_added");

      const widgetData = widgetService.getWidgetData();

      expect(widgetData.statistics.totalPoints).toBeGreaterThan(0);
      expect(widgetData.statistics.level).toBeGreaterThanOrEqual(1);
    });

    it("should update learning goals based on gamification activities", () => {
      // Track activities
      gamificationService.trackActivity("list_created");
      gamificationService.trackActivity("sokrates_session");

      const widgetData = widgetService.getWidgetData();

      expect(
        widgetData.learningGoals.weeklyGoals.listsCreated.current,
      ).toBeGreaterThan(0);
      expect(
        widgetData.learningGoals.weeklyGoals.sokratesSessions.current,
      ).toBeGreaterThan(0);
    });
  });
});
