// LocusMethodeService - Manages Loci-Methode (Memory Palace) data
// Service for storing and retrieving memory palaces, objects, and routes

import {
  MemoryPalace,
  MemoryObject,
  MemoryRoute,
  LocusMethodeStats,
  LOCUS_STORAGE_KEYS,
  createMemoryPalace,
  createMemoryObject,
  createMemoryRoute,
  calculateLocusStats,
  RoomTemplateType,
} from "./locusMethode";

export class LocusMethodeService {
  private static instance: LocusMethodeService | undefined;
  private memoryPalaces: MemoryPalace[] = [];
  private activePalaceId: string | null = null;
  private eventListeners: Array<(event: string, data: unknown) => void> = [];

  static getInstance(): LocusMethodeService {
    if (!LocusMethodeService.instance) {
      LocusMethodeService.instance = new LocusMethodeService();
    }
    return LocusMethodeService.instance;
  }

  // For testing only - reset singleton instance
  static resetInstance(): void {
    LocusMethodeService.instance = undefined;
  }

  constructor() {
    this.loadData();
  }

  // Data Management
  private loadData(): void {
    try {
      const storedPalaces = localStorage.getItem(
        LOCUS_STORAGE_KEYS.MEMORY_PALACES,
      );
      if (storedPalaces) {
        this.memoryPalaces = JSON.parse(storedPalaces);
      }

      const storedActivePalaceId = localStorage.getItem(
        LOCUS_STORAGE_KEYS.ACTIVE_PALACE_ID,
      );
      if (storedActivePalaceId) {
        this.activePalaceId = storedActivePalaceId;
      }
    } catch (error) {
      console.error("Failed to load Loci-Methode data:", error);
    }
  }

  private savePalaces(): void {
    try {
      localStorage.setItem(
        LOCUS_STORAGE_KEYS.MEMORY_PALACES,
        JSON.stringify(this.memoryPalaces),
      );
      this.emit("palaces-updated", this.memoryPalaces);
    } catch (error) {
      console.error("Failed to save memory palaces:", error);
    }
  }

  private saveActivePalaceId(): void {
    try {
      if (this.activePalaceId) {
        localStorage.setItem(
          LOCUS_STORAGE_KEYS.ACTIVE_PALACE_ID,
          this.activePalaceId,
        );
      } else {
        localStorage.removeItem(LOCUS_STORAGE_KEYS.ACTIVE_PALACE_ID);
      }
      this.emit("active-palace-changed", this.activePalaceId);
    } catch (error) {
      console.error("Failed to save active palace ID:", error);
    }
  }

  // Event system for UI updates
  on(callback: (event: string, data: unknown) => void): void {
    this.eventListeners.push(callback);
  }

  off(callback: (event: string, data: unknown) => void): void {
    this.eventListeners = this.eventListeners.filter((cb) => cb !== callback);
  }

  private emit(event: string, data: unknown): void {
    this.eventListeners.forEach((callback) => callback(event, data));
  }

  // Memory Palace Management
  createPalace(name: string, template: RoomTemplateType): MemoryPalace {
    const palace = createMemoryPalace(name, template);
    this.memoryPalaces.push(palace);
    this.savePalaces();
    return palace;
  }

  getPalace(id: string): MemoryPalace | undefined {
    return this.memoryPalaces.find((p) => p.id === id);
  }

  getAllPalaces(): MemoryPalace[] {
    return [...this.memoryPalaces];
  }

  updatePalace(id: string, updates: Partial<MemoryPalace>): boolean {
    const index = this.memoryPalaces.findIndex((p) => p.id === id);
    if (index === -1) return false;

    this.memoryPalaces[index] = {
      ...this.memoryPalaces[index],
      ...updates,
      lastModified: new Date().toISOString(),
    };
    this.savePalaces();
    return true;
  }

  deletePalace(id: string): boolean {
    const initialLength = this.memoryPalaces.length;
    this.memoryPalaces = this.memoryPalaces.filter((p) => p.id !== id);

    if (this.memoryPalaces.length < initialLength) {
      if (this.activePalaceId === id) {
        this.activePalaceId = null;
        this.saveActivePalaceId();
      }
      this.savePalaces();
      return true;
    }
    return false;
  }

  // Active Palace Management
  setActivePalace(id: string | null): void {
    this.activePalaceId = id;
    this.saveActivePalaceId();
  }

  getActivePalace(): MemoryPalace | null {
    if (!this.activePalaceId) return null;
    return this.getPalace(this.activePalaceId) || null;
  }

  // Memory Object Management
  addObject(palaceId: string, content: string, x: number, y: number): boolean {
    const palace = this.getPalace(palaceId);
    if (!palace) return false;

    const newObject = createMemoryObject(content, x, y);
    palace.objects.push(newObject);
    this.updatePalace(palaceId, {objects: palace.objects});
    return true;
  }

  updateObject(
    palaceId: string,
    objectId: string,
    updates: Partial<MemoryObject>,
  ): boolean {
    const palace = this.getPalace(palaceId);
    if (!palace) return false;

    const objIndex = palace.objects.findIndex((o) => o.id === objectId);
    if (objIndex === -1) return false;

    palace.objects[objIndex] = {...palace.objects[objIndex], ...updates};
    this.updatePalace(palaceId, {objects: palace.objects});
    return true;
  }

  deleteObject(palaceId: string, objectId: string): boolean {
    const palace = this.getPalace(palaceId);
    if (!palace) return false;

    const initialLength = palace.objects.length;
    palace.objects = palace.objects.filter((o) => o.id !== objectId);

    if (palace.objects.length < initialLength) {
      // Also remove from any routes
      palace.routes.forEach((route) => {
        route.objectIds = route.objectIds.filter((id) => id !== objectId);
      });

      this.updatePalace(palaceId, {
        objects: palace.objects,
        routes: palace.routes,
      });
      return true;
    }
    return false;
  }

  getObject(palaceId: string, objectId: string): MemoryObject | undefined {
    const palace = this.getPalace(palaceId);
    if (!palace) return undefined;
    return palace.objects.find((o) => o.id === objectId);
  }

  // Memory Route Management
  addRoute(palaceId: string, name: string, objectIds: string[]): boolean {
    const palace = this.getPalace(palaceId);
    if (!palace) return false;

    const newRoute = createMemoryRoute(name, objectIds);
    palace.routes.push(newRoute);
    this.updatePalace(palaceId, {routes: palace.routes});
    return true;
  }

  updateRoute(
    palaceId: string,
    routeId: string,
    updates: Partial<MemoryRoute>,
  ): boolean {
    const palace = this.getPalace(palaceId);
    if (!palace) return false;

    const routeIndex = palace.routes.findIndex((r) => r.id === routeId);
    if (routeIndex === -1) return false;

    palace.routes[routeIndex] = {...palace.routes[routeIndex], ...updates};
    this.updatePalace(palaceId, {routes: palace.routes});
    return true;
  }

  deleteRoute(palaceId: string, routeId: string): boolean {
    const palace = this.getPalace(palaceId);
    if (!palace) return false;

    const initialLength = palace.routes.length;
    palace.routes = palace.routes.filter((r) => r.id !== routeId);

    if (palace.routes.length < initialLength) {
      this.updatePalace(palaceId, {routes: palace.routes});
      return true;
    }
    return false;
  }

  getRoute(palaceId: string, routeId: string): MemoryRoute | undefined {
    const palace = this.getPalace(palaceId);
    if (!palace) return undefined;
    return palace.routes.find((r) => r.id === routeId);
  }

  // Review Management
  incrementPalaceReviewCount(palaceId: string): boolean {
    const palace = this.getPalace(palaceId);
    if (!palace) return false;

    this.updatePalace(palaceId, {reviewCount: palace.reviewCount + 1});
    return true;
  }

  incrementObjectReviewCount(palaceId: string, objectId: string): boolean {
    const palace = this.getPalace(palaceId);
    if (!palace) return false;

    const obj = palace.objects.find((o) => o.id === objectId);
    if (!obj) return false;

    return this.updateObject(palaceId, objectId, {
      reviewCount: obj.reviewCount + 1,
      lastReviewed: new Date().toISOString(),
    });
  }

  // Statistics
  getStats(): LocusMethodeStats {
    return calculateLocusStats(this.memoryPalaces);
  }
}
