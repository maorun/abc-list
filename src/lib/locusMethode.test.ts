import {describe, it, expect, beforeEach} from "vitest";
import {
  createMemoryPalace,
  createMemoryObject,
  createMemoryRoute,
  calculateLocusStats,
  isValidPosition,
  ROOM_TEMPLATES,
  type MemoryPalace,
  type RoomTemplateType,
} from "./locusMethode";

describe("locusMethode utilities", () => {
  describe("createMemoryPalace", () => {
    it("should create a new memory palace with correct structure", () => {
      const palace = createMemoryPalace("Test Palace", "haus");

      expect(palace).toMatchObject({
        name: "Test Palace",
        template: "haus",
        objects: [],
        routes: [],
        reviewCount: 0,
      });
      expect(palace.id).toBeDefined();
      expect(palace.createdAt).toBeDefined();
      expect(palace.lastModified).toBeDefined();
    });

    it("should create palaces with different templates", () => {
      const templates: RoomTemplateType[] = [
        "haus",
        "buero",
        "natur",
        "custom",
      ];

      templates.forEach((template) => {
        const palace = createMemoryPalace(`Test ${template}`, template);
        expect(palace.template).toBe(template);
      });
    });
  });

  describe("createMemoryObject", () => {
    it("should create a new memory object with correct structure", () => {
      const obj = createMemoryObject("Paris is the capital of France", 50, 50);

      expect(obj).toMatchObject({
        content: "Paris is the capital of France",
        x: 50,
        y: 50,
        color: "#3B82F6",
        size: 40,
        reviewCount: 0,
      });
      expect(obj.id).toBeDefined();
      expect(obj.createdAt).toBeDefined();
    });

    it("should create objects at different positions", () => {
      const obj1 = createMemoryObject("Test 1", 10, 20);
      const obj2 = createMemoryObject("Test 2", 80, 90);

      expect(obj1.x).toBe(10);
      expect(obj1.y).toBe(20);
      expect(obj2.x).toBe(80);
      expect(obj2.y).toBe(90);
    });
  });

  describe("createMemoryRoute", () => {
    it("should create a new memory route with correct structure", () => {
      const objectIds = ["obj1", "obj2", "obj3"];
      const route = createMemoryRoute("Test Route", objectIds);

      expect(route).toMatchObject({
        name: "Test Route",
        objectIds,
      });
      expect(route.id).toBeDefined();
      expect(route.createdAt).toBeDefined();
    });

    it("should handle empty object IDs", () => {
      const route = createMemoryRoute("Empty Route", []);
      expect(route.objectIds).toEqual([]);
    });
  });

  describe("calculateLocusStats", () => {
    let palaces: MemoryPalace[];

    beforeEach(() => {
      palaces = [
        {
          ...createMemoryPalace("Palace 1", "haus"),
          objects: [
            createMemoryObject("Obj 1", 10, 10),
            createMemoryObject("Obj 2", 20, 20),
          ],
          routes: [createMemoryRoute("Route 1", ["obj1", "obj2"])],
          reviewCount: 5,
        },
        {
          ...createMemoryPalace("Palace 2", "buero"),
          objects: [
            createMemoryObject("Obj 3", 30, 30),
            createMemoryObject("Obj 4", 40, 40),
            createMemoryObject("Obj 5", 50, 50),
          ],
          routes: [],
          reviewCount: 3,
        },
      ];
    });

    it("should calculate correct statistics", () => {
      const stats = calculateLocusStats(palaces);

      expect(stats.totalPalaces).toBe(2);
      expect(stats.totalObjects).toBe(5);
      expect(stats.totalRoutes).toBe(1);
      expect(stats.averageObjectsPerPalace).toBe(2.5);
      expect(stats.totalReviewCount).toBe(8);
    });

    it("should find most used template", () => {
      palaces.push(createMemoryPalace("Palace 3", "haus"));
      const stats = calculateLocusStats(palaces);

      expect(stats.mostUsedTemplate).toBe("haus");
    });

    it("should handle empty palaces array", () => {
      const stats = calculateLocusStats([]);

      expect(stats.totalPalaces).toBe(0);
      expect(stats.totalObjects).toBe(0);
      expect(stats.totalRoutes).toBe(0);
      expect(stats.averageObjectsPerPalace).toBe(0);
      expect(stats.totalReviewCount).toBe(0);
      expect(stats.mostUsedTemplate).toBe("haus");
    });
  });

  describe("isValidPosition", () => {
    it("should return true for valid positions", () => {
      expect(isValidPosition(0, 0)).toBe(true);
      expect(isValidPosition(50, 50)).toBe(true);
      expect(isValidPosition(100, 100)).toBe(true);
    });

    it("should return false for invalid positions", () => {
      expect(isValidPosition(-1, 50)).toBe(false);
      expect(isValidPosition(50, -1)).toBe(false);
      expect(isValidPosition(101, 50)).toBe(false);
      expect(isValidPosition(50, 101)).toBe(false);
    });
  });

  describe("ROOM_TEMPLATES", () => {
    it("should have all required templates", () => {
      expect(ROOM_TEMPLATES.haus).toBeDefined();
      expect(ROOM_TEMPLATES.buero).toBeDefined();
      expect(ROOM_TEMPLATES.natur).toBeDefined();
      expect(ROOM_TEMPLATES.custom).toBeDefined();
    });

    it("should have correct template structure", () => {
      Object.values(ROOM_TEMPLATES).forEach((template) => {
        expect(template.type).toBeDefined();
        expect(template.name).toBeDefined();
        expect(template.description).toBeDefined();
        expect(template.backgroundColor).toBeDefined();
        expect(Array.isArray(template.landmarks)).toBe(true);
      });
    });

    it("should have landmarks with correct structure", () => {
      const hausTemplate = ROOM_TEMPLATES.haus;
      expect(hausTemplate.landmarks.length).toBeGreaterThan(0);

      hausTemplate.landmarks.forEach((landmark) => {
        expect(landmark.x).toBeGreaterThanOrEqual(0);
        expect(landmark.x).toBeLessThanOrEqual(100);
        expect(landmark.y).toBeGreaterThanOrEqual(0);
        expect(landmark.y).toBeLessThanOrEqual(100);
        expect(landmark.label).toBeDefined();
        expect(landmark.icon).toBeDefined();
      });
    });
  });
});
