import {describe, it, expect, beforeEach} from "vitest";
import {NumberMemoryService} from "./NumberMemoryService";
import {NUMBER_MEMORY_STORAGE_KEYS} from "./numberMemory";

describe("NumberMemoryService", () => {
  let service: NumberMemoryService;

  beforeEach(() => {
    localStorage.clear();
    NumberMemoryService.resetInstance();
    service = NumberMemoryService.getInstance();
  });

  describe("Singleton Pattern", () => {
    it("should return the same instance", () => {
      const instance1 = NumberMemoryService.getInstance();
      const instance2 = NumberMemoryService.getInstance();
      expect(instance1).toBe(instance2);
    });

    it("should reset instance for testing", () => {
      const instance1 = NumberMemoryService.getInstance();
      NumberMemoryService.resetInstance();
      const instance2 = NumberMemoryService.getInstance();
      expect(instance1).not.toBe(instance2);
    });
  });

  describe("Initialization", () => {
    it("should initialize with default associations", () => {
      const associations = service.getAllAssociations();
      expect(associations.length).toBeGreaterThan(0);
      expect(associations.some((a) => a.number === "0")).toBe(true);
      expect(associations.some((a) => a.number === "1")).toBe(true);
    });

    it("should load saved associations from localStorage", () => {
      const customAssociation = {
        number: "999",
        image: "Custom Test",
        isCustom: true,
        createdAt: new Date().toISOString(),
        reviewCount: 0,
      };

      localStorage.setItem(
        NUMBER_MEMORY_STORAGE_KEYS.CUSTOM_ASSOCIATIONS,
        JSON.stringify([customAssociation]),
      );

      NumberMemoryService.resetInstance();
      const newService = NumberMemoryService.getInstance();
      const association = newService.getAssociation("999");

      expect(association).toBeDefined();
      expect(association?.image).toBe("Custom Test");
    });
  });

  describe("Association Management", () => {
    it("should add new custom association", () => {
      const newAssociation = service.addAssociation({
        number: "42",
        image: "Regen (Regen = R-G-N)",
        story: "Test story",
        isCustom: true,
      });

      expect(newAssociation.number).toBe("42");
      expect(newAssociation.image).toBe("Regen (Regen = R-G-N)");
      expect(newAssociation.reviewCount).toBe(0);
    });

    it("should get association by number", () => {
      service.addAssociation({
        number: "123",
        image: "Test Image",
        isCustom: true,
      });

      const association = service.getAssociation("123");
      expect(association).toBeDefined();
      expect(association?.image).toBe("Test Image");
    });

    it("should update existing association", () => {
      service.addAssociation({
        number: "456",
        image: "Original",
        isCustom: true,
      });

      const updated = service.updateAssociation("456", {
        image: "Updated",
        story: "New story",
      });

      expect(updated).toBe(true);
      const association = service.getAssociation("456");
      expect(association?.image).toBe("Updated");
      expect(association?.story).toBe("New story");
    });

    it("should delete association", () => {
      service.addAssociation({
        number: "789",
        image: "To Delete",
        isCustom: true,
      });

      const deleted = service.deleteAssociation("789");
      expect(deleted).toBe(true);

      const association = service.getAssociation("789");
      expect(association).toBeUndefined();
    });

    it("should replace association with same number", () => {
      service.addAssociation({
        number: "100",
        image: "First",
        isCustom: true,
      });

      service.addAssociation({
        number: "100",
        image: "Second",
        isCustom: true,
      });

      const associations = service.getAllAssociations();
      const count100 = associations.filter((a) => a.number === "100").length;
      expect(count100).toBe(1);

      const association = service.getAssociation("100");
      expect(association?.image).toBe("Second");
    });

    it("should track review count and last reviewed", () => {
      service.addAssociation({
        number: "555",
        image: "Review Test",
        isCustom: true,
      });

      service.reviewAssociation("555");
      service.reviewAssociation("555");

      const association = service.getAssociation("555");
      expect(association?.reviewCount).toBe(2);
      expect(association?.lastReviewed).toBeDefined();
    });
  });

  describe("Training Session Management", () => {
    it("should record training session", () => {
      const session = service.recordTrainingSession({
        type: "pin",
        numberToMemorize: "1234",
        userAnswer: "1234",
        isCorrect: true,
        timeSpent: 10,
      });

      expect(session.id).toBeDefined();
      expect(session.timestamp).toBeDefined();
      expect(session.type).toBe("pin");
    });

    it("should retrieve training history", () => {
      service.recordTrainingSession({
        type: "pin",
        numberToMemorize: "1111",
        userAnswer: "1111",
        isCorrect: true,
        timeSpent: 5,
      });

      service.recordTrainingSession({
        type: "phone",
        numberToMemorize: "2222222222",
        userAnswer: "2222222222",
        isCorrect: true,
        timeSpent: 15,
      });

      const history = service.getTrainingHistory();
      expect(history).toHaveLength(2);
      expect(history[0].type).toBe("phone"); // Most recent first
    });

    it("should limit training history retrieval", () => {
      for (let i = 0; i < 5; i++) {
        service.recordTrainingSession({
          type: "pin",
          numberToMemorize: `${i}${i}${i}${i}`,
          userAnswer: `${i}${i}${i}${i}`,
          isCorrect: true,
          timeSpent: i,
        });
      }

      const limited = service.getTrainingHistory(3);
      expect(limited).toHaveLength(3);
    });

    it("should keep only last 100 sessions in storage", () => {
      for (let i = 0; i < 150; i++) {
        service.recordTrainingSession({
          type: "pin",
          numberToMemorize: "1234",
          userAnswer: "1234",
          isCorrect: true,
          timeSpent: 1,
        });
      }

      const history = service.getTrainingHistory();
      expect(history.length).toBeLessThanOrEqual(100);
    });
  });

  describe("Statistics", () => {
    it("should calculate statistics", () => {
      service.recordTrainingSession({
        type: "pin",
        numberToMemorize: "1234",
        userAnswer: "1234",
        isCorrect: true,
        timeSpent: 10,
      });

      service.recordTrainingSession({
        type: "pin",
        numberToMemorize: "5678",
        userAnswer: "1111",
        isCorrect: false,
        timeSpent: 15,
      });

      service.addAssociation({
        number: "99",
        image: "Custom",
        isCustom: true,
      });

      const stats = service.getStatistics();
      expect(stats.totalTrainingSessions).toBe(2);
      expect(stats.successRate).toBe(0.5);
      expect(stats.customAssociationsCount).toBeGreaterThan(0);
    });
  });

  describe("Filtering Methods", () => {
    it("should get preset associations", () => {
      const presets = service.getPresetAssociations();
      expect(presets.length).toBeGreaterThan(0);
      expect(presets.every((a) => !a.isCustom)).toBe(true);
    });

    it("should get custom associations", () => {
      service.addAssociation({
        number: "777",
        image: "Lucky",
        isCustom: true,
      });

      const customs = service.getCustomAssociations();
      expect(customs.length).toBeGreaterThan(0);
      expect(customs.every((a) => a.isCustom)).toBe(true);
    });
  });

  describe("Event System", () => {
    it("should emit events on data changes", () => {
      return new Promise<void>((resolve) => {
        service.addEventListener((event, data) => {
          if (event === "associations-updated") {
            expect(data).toBeDefined();
            resolve();
          }
        });

        service.addAssociation({
          number: "888",
          image: "Event Test",
          isCustom: true,
        });
      });
    });

    it("should remove event listeners", () => {
      let callCount = 0;
      const listener = () => {
        callCount++;
      };

      service.addEventListener(listener);
      service.addAssociation({
        number: "111",
        image: "Test 1",
        isCustom: true,
      });

      service.removeEventListener(listener);
      service.addAssociation({
        number: "222",
        image: "Test 2",
        isCustom: true,
      });

      expect(callCount).toBe(1);
    });
  });

  describe("Clear Data", () => {
    it("should clear all data and reinitialize defaults", () => {
      service.addAssociation({
        number: "999",
        image: "To Clear",
        isCustom: true,
      });

      service.recordTrainingSession({
        type: "pin",
        numberToMemorize: "1234",
        userAnswer: "1234",
        isCorrect: true,
        timeSpent: 10,
      });

      service.clearAllData();

      const customs = service.getCustomAssociations();
      expect(customs.length).toBe(0);

      const history = service.getTrainingHistory();
      expect(history.length).toBe(0);

      const presets = service.getPresetAssociations();
      expect(presets.length).toBeGreaterThan(0);
    });
  });
});
