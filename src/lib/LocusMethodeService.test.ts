import {describe, it, expect, beforeEach} from "vitest";
import {LocusMethodeService} from "./LocusMethodeService";

describe("LocusMethodeService", () => {
  let service: LocusMethodeService;

  beforeEach(() => {
    localStorage.clear();
    LocusMethodeService.resetInstance();
    service = LocusMethodeService.getInstance();
  });

  describe("Singleton pattern", () => {
    it("should return the same instance", () => {
      const instance1 = LocusMethodeService.getInstance();
      const instance2 = LocusMethodeService.getInstance();
      expect(instance1).toBe(instance2);
    });

    it("should reset instance for testing", () => {
      const instance1 = LocusMethodeService.getInstance();
      LocusMethodeService.resetInstance();
      const instance2 = LocusMethodeService.getInstance();
      expect(instance1).not.toBe(instance2);
    });
  });

  describe("Memory Palace Management", () => {
    it("should create a new memory palace", () => {
      const palace = service.createPalace("Test Palace", "haus");

      expect(palace.name).toBe("Test Palace");
      expect(palace.template).toBe("haus");
      expect(service.getAllPalaces()).toHaveLength(1);
    });

    it("should get palace by ID", () => {
      const palace = service.createPalace("Test Palace", "buero");
      const retrieved = service.getPalace(palace.id);

      expect(retrieved).toBeDefined();
      expect(retrieved?.id).toBe(palace.id);
    });

    it("should update palace", () => {
      const palace = service.createPalace("Test Palace", "haus");
      const updated = service.updatePalace(palace.id, {name: "Updated Palace"});

      expect(updated).toBe(true);
      const retrieved = service.getPalace(palace.id);
      expect(retrieved?.name).toBe("Updated Palace");
    });

    it("should delete palace", () => {
      const palace = service.createPalace("Test Palace", "natur");
      const deleted = service.deletePalace(palace.id);

      expect(deleted).toBe(true);
      expect(service.getAllPalaces()).toHaveLength(0);
      expect(service.getPalace(palace.id)).toBeUndefined();
    });

    it("should return false when updating non-existent palace", () => {
      const updated = service.updatePalace("non-existent", {name: "Test"});
      expect(updated).toBe(false);
    });

    it("should return false when deleting non-existent palace", () => {
      const deleted = service.deletePalace("non-existent");
      expect(deleted).toBe(false);
    });
  });

  describe("Active Palace Management", () => {
    it("should set and get active palace", () => {
      const palace = service.createPalace("Test Palace", "haus");
      service.setActivePalace(palace.id);

      const active = service.getActivePalace();
      expect(active?.id).toBe(palace.id);
    });

    it("should clear active palace when set to null", () => {
      const palace = service.createPalace("Test Palace", "haus");
      service.setActivePalace(palace.id);
      service.setActivePalace(null);

      const active = service.getActivePalace();
      expect(active).toBeNull();
    });

    it("should clear active palace when deleted", () => {
      const palace = service.createPalace("Test Palace", "haus");
      service.setActivePalace(palace.id);
      service.deletePalace(palace.id);

      const active = service.getActivePalace();
      expect(active).toBeNull();
    });
  });

  describe("Memory Object Management", () => {
    let palaceId: string;

    beforeEach(() => {
      const palace = service.createPalace("Test Palace", "haus");
      palaceId = palace.id;
    });

    it("should add object to palace", () => {
      const added = service.addObject(palaceId, "Test Object", 50, 50);

      expect(added).toBe(true);
      const palace = service.getPalace(palaceId);
      expect(palace?.objects).toHaveLength(1);
      expect(palace?.objects[0].content).toBe("Test Object");
    });

    it("should update object", () => {
      service.addObject(palaceId, "Test Object", 50, 50);
      const palace = service.getPalace(palaceId);
      expect(palace).toBeDefined();
      const objectId = palace!.objects[0].id;

      const updated = service.updateObject(palaceId, objectId, {
        content: "Updated Object",
      });

      expect(updated).toBe(true);
      const obj = service.getObject(palaceId, objectId);
      expect(obj?.content).toBe("Updated Object");
    });

    it("should delete object", () => {
      service.addObject(palaceId, "Test Object", 50, 50);
      const palace = service.getPalace(palaceId);
      expect(palace).toBeDefined();
      const objectId = palace!.objects[0].id;

      const deleted = service.deleteObject(palaceId, objectId);

      expect(deleted).toBe(true);
      expect(service.getPalace(palaceId)?.objects).toHaveLength(0);
    });

    it("should remove object from routes when deleted", () => {
      service.addObject(palaceId, "Object 1", 10, 10);
      service.addObject(palaceId, "Object 2", 20, 20);
      const palace = service.getPalace(palaceId);
      expect(palace).toBeDefined();
      const obj1Id = palace!.objects[0].id;
      const obj2Id = palace!.objects[1].id;

      service.addRoute(palaceId, "Test Route", [obj1Id, obj2Id]);
      service.deleteObject(palaceId, obj1Id);

      const route = service.getPalace(palaceId)?.routes[0];
      expect(route?.objectIds).toEqual([obj2Id]);
    });

    it("should return false when adding object to non-existent palace", () => {
      const added = service.addObject("non-existent", "Test", 50, 50);
      expect(added).toBe(false);
    });
  });

  describe("Memory Route Management", () => {
    let palaceId: string;
    let obj1Id: string;
    let obj2Id: string;

    beforeEach(() => {
      const palace = service.createPalace("Test Palace", "haus");
      palaceId = palace.id;
      service.addObject(palaceId, "Object 1", 10, 10);
      service.addObject(palaceId, "Object 2", 20, 20);

      const updatedPalace = service.getPalace(palaceId);
      expect(updatedPalace).toBeDefined();
      obj1Id = updatedPalace!.objects[0].id;
      obj2Id = updatedPalace!.objects[1].id;
    });

    it("should add route to palace", () => {
      const added = service.addRoute(palaceId, "Test Route", [obj1Id, obj2Id]);

      expect(added).toBe(true);
      const palace = service.getPalace(palaceId);
      expect(palace?.routes).toHaveLength(1);
      expect(palace?.routes[0].name).toBe("Test Route");
    });

    it("should update route", () => {
      service.addRoute(palaceId, "Test Route", [obj1Id, obj2Id]);
      const palace = service.getPalace(palaceId);
      expect(palace).toBeDefined();
      const routeId = palace!.routes[0].id;

      const updated = service.updateRoute(palaceId, routeId, {
        name: "Updated Route",
      });

      expect(updated).toBe(true);
      const route = service.getRoute(palaceId, routeId);
      expect(route?.name).toBe("Updated Route");
    });

    it("should delete route", () => {
      service.addRoute(palaceId, "Test Route", [obj1Id, obj2Id]);
      const palace = service.getPalace(palaceId);
      expect(palace).toBeDefined();
      const routeId = palace!.routes[0].id;

      const deleted = service.deleteRoute(palaceId, routeId);

      expect(deleted).toBe(true);
      expect(service.getPalace(palaceId)?.routes).toHaveLength(0);
    });

    it("should return false when adding route to non-existent palace", () => {
      const added = service.addRoute("non-existent", "Test", []);
      expect(added).toBe(false);
    });
  });

  describe("Review Management", () => {
    let palaceId: string;
    let objectId: string;

    beforeEach(() => {
      const palace = service.createPalace("Test Palace", "haus");
      palaceId = palace.id;
      service.addObject(palaceId, "Test Object", 50, 50);
      const updatedPalace = service.getPalace(palaceId);
      expect(updatedPalace).toBeDefined();
      objectId = updatedPalace!.objects[0].id;
    });

    it("should increment palace review count", () => {
      service.incrementPalaceReviewCount(palaceId);

      const palace = service.getPalace(palaceId);
      expect(palace?.reviewCount).toBe(1);
    });

    it("should increment object review count", () => {
      service.incrementObjectReviewCount(palaceId, objectId);

      const obj = service.getObject(palaceId, objectId);
      expect(obj?.reviewCount).toBe(1);
      expect(obj?.lastReviewed).toBeDefined();
    });

    it("should return false when incrementing review for non-existent palace", () => {
      const incremented = service.incrementPalaceReviewCount("non-existent");
      expect(incremented).toBe(false);
    });

    it("should return false when incrementing review for non-existent object", () => {
      const incremented = service.incrementObjectReviewCount(
        palaceId,
        "non-existent",
      );
      expect(incremented).toBe(false);
    });
  });

  describe("Statistics", () => {
    it("should calculate correct statistics", () => {
      const palace1 = service.createPalace("Palace 1", "haus");
      service.addObject(palace1.id, "Obj 1", 10, 10);
      service.addObject(palace1.id, "Obj 2", 20, 20);

      const palace2 = service.createPalace("Palace 2", "buero");
      service.addObject(palace2.id, "Obj 3", 30, 30);

      const stats = service.getStats();

      expect(stats.totalPalaces).toBe(2);
      expect(stats.totalObjects).toBe(3);
      expect(stats.averageObjectsPerPalace).toBe(1.5);
    });

    it("should return empty stats when no palaces exist", () => {
      const stats = service.getStats();

      expect(stats.totalPalaces).toBe(0);
      expect(stats.totalObjects).toBe(0);
      expect(stats.totalRoutes).toBe(0);
    });
  });

  describe("Event System", () => {
    it("should emit events on palace updates", () => {
      let eventReceived = false;

      service.on((event) => {
        if (event === "palaces-updated") {
          eventReceived = true;
        }
      });

      service.createPalace("Test Palace", "haus");
      expect(eventReceived).toBe(true);
    });

    it("should remove event listeners", () => {
      let eventCount = 0;
      const callback = () => {
        eventCount++;
      };

      service.on(callback);
      service.createPalace("Test 1", "haus");
      expect(eventCount).toBe(1);

      service.off(callback);
      service.createPalace("Test 2", "haus");
      expect(eventCount).toBe(1); // Should not increment
    });
  });

  describe("Data Persistence", () => {
    it("should persist palaces to localStorage", () => {
      service.createPalace("Test Palace", "haus");

      const stored = localStorage.getItem("locus-memoryPalaces");
      expect(stored).toBeDefined();

      const palaces = JSON.parse(stored!);
      expect(palaces).toHaveLength(1);
      expect(palaces[0].name).toBe("Test Palace");
    });

    it("should load palaces from localStorage", () => {
      service.createPalace("Test Palace", "haus");

      // Create new service instance
      LocusMethodeService.resetInstance();
      const newService = LocusMethodeService.getInstance();

      const palaces = newService.getAllPalaces();
      expect(palaces).toHaveLength(1);
      expect(palaces[0].name).toBe("Test Palace");
    });

    it("should persist active palace ID", () => {
      const palace = service.createPalace("Test Palace", "haus");
      service.setActivePalace(palace.id);

      const stored = localStorage.getItem("locus-activePalaceId");
      expect(stored).toBe(palace.id);
    });
  });
});
