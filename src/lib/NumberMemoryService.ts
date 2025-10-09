// NumberMemoryService - Manages number memory system (Major System)
// Service for storing and retrieving number-to-image associations and training data

import {
  NumberAssociation,
  TrainingSession,
  NumberMemoryStats,
  NUMBER_MEMORY_STORAGE_KEYS,
  DEFAULT_NUMBER_IMAGES,
  calculateStats,
} from "./numberMemory";

export class NumberMemoryService {
  private static instance: NumberMemoryService | undefined;
  private associations: NumberAssociation[] = [];
  private trainingHistory: TrainingSession[] = [];
  private eventListeners: Array<(event: string, data: unknown) => void> = [];

  static getInstance(): NumberMemoryService {
    if (!NumberMemoryService.instance) {
      NumberMemoryService.instance = new NumberMemoryService();
    }
    return NumberMemoryService.instance;
  }

  // For testing only - reset singleton instance
  static resetInstance(): void {
    NumberMemoryService.instance = undefined;
  }

  constructor() {
    this.loadData();
  }

  // Data Management
  private loadData(): void {
    try {
      const storedAssociations = localStorage.getItem(
        NUMBER_MEMORY_STORAGE_KEYS.CUSTOM_ASSOCIATIONS,
      );
      if (storedAssociations) {
        this.associations = JSON.parse(storedAssociations);
      } else {
        this.initializeDefaultAssociations();
      }

      const storedHistory = localStorage.getItem(
        NUMBER_MEMORY_STORAGE_KEYS.TRAINING_HISTORY,
      );
      if (storedHistory) {
        this.trainingHistory = JSON.parse(storedHistory);
      }
    } catch (error) {
      console.error("Failed to load number memory data:", error);
      this.initializeDefaultAssociations();
    }
  }

  private initializeDefaultAssociations(): void {
    this.associations = Object.entries(DEFAULT_NUMBER_IMAGES).map(
      ([num, image]) => ({
        number: num,
        image,
        isCustom: false,
        createdAt: new Date().toISOString(),
        reviewCount: 0,
      }),
    );
    this.saveAssociations();
  }

  private saveAssociations(): void {
    try {
      localStorage.setItem(
        NUMBER_MEMORY_STORAGE_KEYS.CUSTOM_ASSOCIATIONS,
        JSON.stringify(this.associations),
      );
      this.emit("associations-updated", this.associations);
    } catch (error) {
      console.error("Failed to save associations:", error);
    }
  }

  private saveTrainingHistory(): void {
    try {
      // Keep only last 100 sessions to avoid localStorage bloat
      const recentHistory = this.trainingHistory.slice(-100);
      localStorage.setItem(
        NUMBER_MEMORY_STORAGE_KEYS.TRAINING_HISTORY,
        JSON.stringify(recentHistory),
      );
      this.trainingHistory = recentHistory;
      this.emit("training-history-updated", recentHistory);
    } catch (error) {
      console.error("Failed to save training history:", error);
    }
  }

  // Association Management
  getAssociation(number: string): NumberAssociation | undefined {
    return this.associations.find((a) => a.number === number);
  }

  getAllAssociations(): NumberAssociation[] {
    return [...this.associations];
  }

  addAssociation(
    association: Omit<NumberAssociation, "createdAt" | "reviewCount">,
  ): NumberAssociation {
    const newAssociation: NumberAssociation = {
      ...association,
      createdAt: new Date().toISOString(),
      reviewCount: 0,
    };

    // Remove existing association for same number if exists
    this.associations = this.associations.filter(
      (a) => a.number !== association.number,
    );

    this.associations.push(newAssociation);
    this.saveAssociations();
    return newAssociation;
  }

  updateAssociation(
    number: string,
    updates: Partial<NumberAssociation>,
  ): boolean {
    const index = this.associations.findIndex((a) => a.number === number);
    if (index === -1) return false;

    this.associations[index] = {
      ...this.associations[index],
      ...updates,
    };
    this.saveAssociations();
    return true;
  }

  deleteAssociation(number: string): boolean {
    const initialLength = this.associations.length;
    this.associations = this.associations.filter((a) => a.number !== number);

    if (this.associations.length < initialLength) {
      this.saveAssociations();
      return true;
    }
    return false;
  }

  reviewAssociation(number: string): void {
    const association = this.associations.find((a) => a.number === number);
    if (association) {
      association.reviewCount++;
      association.lastReviewed = new Date().toISOString();
      this.saveAssociations();
    }
  }

  // Training Session Management
  recordTrainingSession(
    session: Omit<TrainingSession, "id" | "timestamp">,
  ): TrainingSession {
    const newSession: TrainingSession = {
      ...session,
      id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
    };

    this.trainingHistory.push(newSession);
    this.saveTrainingHistory();
    return newSession;
  }

  getTrainingHistory(limit?: number): TrainingSession[] {
    const history = [...this.trainingHistory].reverse();
    return limit ? history.slice(0, limit) : history;
  }

  getStatistics(): NumberMemoryStats {
    return calculateStats(this.trainingHistory, this.associations);
  }

  // Event System
  addEventListener(callback: (event: string, data: unknown) => void): void {
    this.eventListeners.push(callback);
  }

  removeEventListener(callback: (event: string, data: unknown) => void): void {
    this.eventListeners = this.eventListeners.filter((cb) => cb !== callback);
  }

  private emit(event: string, data: unknown): void {
    this.eventListeners.forEach((callback) => {
      try {
        callback(event, data);
      } catch (error) {
        console.error("Event listener error:", error);
      }
    });
  }

  // Utility Methods
  getPresetAssociations(): NumberAssociation[] {
    return this.associations.filter((a) => !a.isCustom);
  }

  getCustomAssociations(): NumberAssociation[] {
    return this.associations.filter((a) => a.isCustom);
  }

  clearAllData(): void {
    this.associations = [];
    this.trainingHistory = [];
    localStorage.removeItem(NUMBER_MEMORY_STORAGE_KEYS.CUSTOM_ASSOCIATIONS);
    localStorage.removeItem(NUMBER_MEMORY_STORAGE_KEYS.TRAINING_HISTORY);
    this.initializeDefaultAssociations();
    this.emit("data-cleared", null);
  }
}
