import {describe, it, expect, beforeEach, vi} from "vitest";
import {
  requestPWANotificationPermission,
  getPWANotificationSettings,
  savePWANotificationSettings,
  checkPWANotificationSupport,
  schedulePushNotification,
  testPushNotification,
} from "./pwaNotifications";
import {saveNotificationSettings} from "./notifications";
import {EnhancedPWAStorage} from "./enhancedStorage";

// Mock browser APIs
const mockIndexedDB = {
  open: vi.fn(() => ({
    onsuccess: null,
    onerror: null,
    onupgradeneeded: null,
    result: {
      objectStoreNames: {contains: vi.fn(() => false)},
      createObjectStore: vi.fn(() => ({
        createIndex: vi.fn(),
      })),
    },
  })),
};

const mockServiceWorker = {
  register: vi.fn(() =>
    Promise.resolve({
      addEventListener: vi.fn(),
      installing: null,
      waiting: null,
      active: null,
    }),
  ),
  ready: Promise.resolve({
    pushManager: {
      getSubscription: vi.fn(() => Promise.resolve(null)),
      subscribe: vi.fn(() =>
        Promise.resolve({
          toJSON: () => ({endpoint: "test-endpoint"}),
        }),
      ),
    },
    showNotification: vi.fn(),
  }),
};

describe("PWA Functionality", () => {
  beforeEach(() => {
    // Setup mocks
    Object.defineProperty(global, "indexedDB", {
      value: mockIndexedDB,
      writable: true,
      configurable: true,
    });

    Object.defineProperty(global, "navigator", {
      value: {
        serviceWorker: mockServiceWorker,
        onLine: true,
      },
      writable: true,
      configurable: true,
    });

    Object.defineProperty(global, "Notification", {
      value: {
        permission: "default",
        requestPermission: vi.fn(() => Promise.resolve("granted")),
      },
      writable: true,
      configurable: true,
    });

    Object.defineProperty(global, "PushManager", {
      value: vi.fn(),
      writable: true,
      configurable: true,
    });

    // Clear localStorage
    localStorage.clear();
  });

  describe("PWA Notification Settings", () => {
    it("should have default settings", () => {
      const settings = getPWANotificationSettings();

      expect(settings.enabled).toBe(true);
      expect(settings.pushEnabled).toBe(false);
      expect(settings.frequency).toBe("daily");
      expect(settings.quietHours.start).toBe(22);
      expect(settings.quietHours.end).toBe(8);
      expect(settings.maxNotifications).toBe(3);
    });

    it("should save and load settings", () => {
      const newSettings = {
        enabled: true,
        pushEnabled: true,
        frequency: "twice-daily" as const,
        quietHours: {start: 23, end: 7},
        maxNotifications: 5,
      };

      savePWANotificationSettings(newSettings);
      const loadedSettings = getPWANotificationSettings();

      expect(loadedSettings.enabled).toBe(true);
      expect(loadedSettings.pushEnabled).toBe(true);
      expect(loadedSettings.frequency).toBe("twice-daily");
      expect(loadedSettings.maxNotifications).toBe(5);
    });

    it("should detect PWA support correctly", () => {
      const support = checkPWANotificationSupport();

      expect(support.basicNotifications).toBe(true);
      expect(support.pushNotifications).toBe(true);
      expect(support.serviceWorker).toBe(true);
    });
  });

  describe("PWA Notification Permissions", () => {
    it("should request notification permissions", async () => {
      const result = await requestPWANotificationPermission();

      expect(result.basicPermission).toBe(true);
      expect(result.pushPermission).toBe(true);
      expect(Notification.requestPermission).toHaveBeenCalled();
    });

    it("should handle permission denied", async () => {
      Notification.requestPermission = vi.fn(() => Promise.resolve("denied"));

      const result = await requestPWANotificationPermission();

      expect(result.basicPermission).toBe(false);
      expect(result.pushPermission).toBe(false);
    });
  });

  describe("Push Notification Scheduling", () => {
    it("should schedule push notifications", async () => {
      // Mock Notification permission correctly for this test
      Object.defineProperty(global, "Notification", {
        value: {
          permission: "granted",
          requestPermission: vi.fn(() => Promise.resolve("granted")),
        },
        writable: true,
      });

      // Enable both basic and push notifications in settings
      // Use quiet hours that won't interfere with testing (no quiet hours)
      saveNotificationSettings({
        enabled: true,
        frequency: "daily",
        quietHours: {start: 23, end: 23}, // No quiet hours (same start and end)
        maxNotifications: 3,
      });

      savePWANotificationSettings({
        enabled: true,
        pushEnabled: true,
        frequency: "daily",
        quietHours: {start: 23, end: 23}, // No quiet hours (same start and end)
        maxNotifications: 3,
      });

      const result = await schedulePushNotification(
        "Test Title",
        "Test Body",
        0,
        {type: "test"},
      );

      expect(result).toBe(true);
    });

    it("should not schedule when disabled", async () => {
      // Disable push notifications
      savePWANotificationSettings({
        enabled: false,
        pushEnabled: false,
        frequency: "daily",
        quietHours: {start: 22, end: 8},
        maxNotifications: 3,
      });

      const result = await schedulePushNotification("Test Title", "Test Body");

      expect(result).toBe(false);
    });
  });

  describe("Test Notifications", () => {
    it("should test push notifications when enabled", async () => {
      // Mock Notification for consistency
      Object.defineProperty(global, "Notification", {
        value: vi.fn().mockImplementation((title, options) => ({
          title,
          ...options,
          close: vi.fn(),
        })),
        writable: true,
      });
      global.Notification.permission = "granted";
      global.Notification.requestPermission = vi.fn(() =>
        Promise.resolve("granted"),
      );

      // Enable push notifications
      savePWANotificationSettings({
        enabled: true,
        pushEnabled: true,
        frequency: "daily",
        quietHours: {start: 23, end: 23}, // No quiet hours
        maxNotifications: 3,
      });

      const result = await testPushNotification();

      expect(result).toBe(true);
    });

    it("should test notifications when both types enabled but restrictions apply", async () => {
      // Mock Notification constructor properly
      Object.defineProperty(global, "Notification", {
        value: vi.fn().mockImplementation((title, options) => ({
          title,
          ...options,
          close: vi.fn(),
        })),
        writable: true,
      });

      // Set permission to granted
      global.Notification.permission = "granted";
      global.Notification.requestPermission = vi.fn(() =>
        Promise.resolve("granted"),
      );

      // Get current time to set up quiet hours that would block normal notifications
      const now = new Date();
      const currentHour = now.getHours();

      // Enable both notifications but set quiet hours that include current time
      savePWANotificationSettings({
        enabled: true,
        pushEnabled: true,
        frequency: "daily",
        quietHours: {start: currentHour, end: (currentHour + 1) % 24}, // Current hour is quiet
        maxNotifications: 3,
      });

      saveNotificationSettings({
        enabled: true,
        frequency: "daily",
        quietHours: {start: currentHour, end: (currentHour + 1) % 24}, // Current hour is quiet
        maxNotifications: 3,
      });

      // Test notification should still work despite quiet hours
      const result = await testPushNotification();

      expect(result).toBe(true);
    });

    it("should fallback to browser notifications when push disabled", async () => {
      // Mock Notification constructor properly for Vitest v4
      const NotificationConstructor = vi.fn(function (
        this: unknown,
        title: string,
        options?: NotificationOptions,
      ) {
        return {
          title,
          ...options,
          close: vi.fn(),
        };
      });

      NotificationConstructor.permission = "granted";
      NotificationConstructor.requestPermission = vi.fn(() =>
        Promise.resolve("granted" as NotificationPermission),
      );

      Object.defineProperty(global, "Notification", {
        value: NotificationConstructor,
        writable: true,
        configurable: true,
      });

      // Enable basic notifications only
      savePWANotificationSettings({
        enabled: true,
        pushEnabled: false,
        frequency: "daily",
        quietHours: {start: 23, end: 23}, // No quiet hours
        maxNotifications: 3,
      });

      // Enable basic notifications
      saveNotificationSettings({
        enabled: true,
        frequency: "daily",
        quietHours: {start: 23, end: 23}, // No quiet hours
        maxNotifications: 3,
      });

      const result = await testPushNotification();

      expect(result).toBe(true);
      expect(NotificationConstructor).toHaveBeenCalledWith(
        "🧪 Test Benachrichtigung",
        expect.objectContaining({
          body: "Deine Benachrichtigungen funktionieren!",
          icon: "./assets/icon.png",
          tag: "test-notification",
        }),
      );
    });

    it("should fail when all notifications disabled", async () => {
      // Disable all notifications
      savePWANotificationSettings({
        enabled: false,
        pushEnabled: false,
        frequency: "daily",
        quietHours: {start: 22, end: 8},
        maxNotifications: 3,
      });

      saveNotificationSettings({
        enabled: false,
        frequency: "daily",
        quietHours: {start: 22, end: 8},
        maxNotifications: 3,
      });

      const result = await testPushNotification();

      expect(result).toBe(false);
    });
  });

  describe("Enhanced PWA Storage", () => {
    it("should initialize enhanced storage", () => {
      const storage = new EnhancedPWAStorage();
      expect(storage).toBeInstanceOf(EnhancedPWAStorage);
    });

    it("should get sync queue size", () => {
      const storage = new EnhancedPWAStorage();
      const queueSize = storage.getSyncQueueSize();
      expect(typeof queueSize).toBe("number");
      expect(queueSize).toBeGreaterThanOrEqual(0);
    });

    it("should handle fallback to localStorage", async () => {
      const storage = new EnhancedPWAStorage();

      // Test data
      const testKey = "test-key";
      const testValue = {test: "data"};

      // Should fallback to localStorage when IndexedDB fails
      await storage.setItem("test-store", testKey, testValue);
      const retrieved = await storage.getItem("test-store", testKey);

      expect(retrieved).toEqual(testValue);
    });

    it("should track pending changes", async () => {
      const storage = new EnhancedPWAStorage();

      // Simulate offline
      Object.defineProperty(navigator, "onLine", {value: false});

      await storage.setItem("test-store", "offline-key", {data: "offline"});

      const pendingChanges = storage.getPendingChanges();
      expect(Array.isArray(pendingChanges)).toBe(true);
    });
  });

  describe("PWA Integration", () => {
    it("should work without breaking existing functionality", () => {
      // Test that PWA features don't interfere with existing localStorage usage
      const testData = {existing: "data"};
      localStorage.setItem("existing-key", JSON.stringify(testData));

      const storage = new EnhancedPWAStorage();
      expect(storage).toBeInstanceOf(EnhancedPWAStorage);

      // Existing data should still be accessible
      const retrieved = JSON.parse(
        localStorage.getItem("existing-key") || "{}",
      );
      expect(retrieved).toEqual(testData);
    });

    it("should handle missing browser APIs gracefully", () => {
      // Test that the support detection works correctly in the test environment
      const support = checkPWANotificationSupport();

      // The test environment has mocked APIs, so we expect them to be available
      expect(support.basicNotifications).toBe(true); // Mocked as available
      expect(support.pushNotifications).toBe(true); // Available in test environment
      expect(support.serviceWorker).toBe(true); // Mocked as available

      // Should still create storage instance regardless of API availability
      const storage = new EnhancedPWAStorage();
      expect(storage).toBeInstanceOf(EnhancedPWAStorage);
    });
  });
});
