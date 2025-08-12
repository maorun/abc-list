import { describe, it, expect, beforeEach, vi } from 'vitest';
import { 
  requestPWANotificationPermission,
  getPWANotificationSettings,
  savePWANotificationSettings,
  checkPWANotificationSupport,
  schedulePushNotification
} from '../lib/pwaNotifications';
import { EnhancedPWAStorage } from '../lib/enhancedStorage';

// Mock browser APIs
const mockIndexedDB = {
  open: vi.fn(() => ({
    onsuccess: null,
    onerror: null,
    onupgradeneeded: null,
    result: {
      objectStoreNames: { contains: vi.fn(() => false) },
      createObjectStore: vi.fn(() => ({
        createIndex: vi.fn()
      }))
    }
  }))
};

const mockServiceWorker = {
  register: vi.fn(() => Promise.resolve({
    addEventListener: vi.fn(),
    installing: null,
    waiting: null,
    active: null
  })),
  ready: Promise.resolve({
    pushManager: {
      getSubscription: vi.fn(() => Promise.resolve(null)),
      subscribe: vi.fn(() => Promise.resolve({
        toJSON: () => ({ endpoint: 'test-endpoint' })
      }))
    },
    showNotification: vi.fn()
  })
};

describe('PWA Functionality', () => {
  beforeEach(() => {
    // Setup mocks
    Object.defineProperty(global, 'indexedDB', {
      value: mockIndexedDB,
      writable: true
    });
    
    Object.defineProperty(global, 'navigator', {
      value: {
        serviceWorker: mockServiceWorker,
        onLine: true
      },
      writable: true
    });

    Object.defineProperty(global, 'Notification', {
      value: {
        permission: 'default',
        requestPermission: vi.fn(() => Promise.resolve('granted'))
      },
      writable: true
    });

    Object.defineProperty(global, 'PushManager', {
      value: vi.fn(),
      writable: true
    });

    // Clear localStorage
    localStorage.clear();
  });

  describe('PWA Notification Settings', () => {
    it('should have default settings', () => {
      const settings = getPWANotificationSettings();
      
      expect(settings.enabled).toBe(true);
      expect(settings.pushEnabled).toBe(false);
      expect(settings.frequency).toBe('daily');
      expect(settings.quietHours.start).toBe(22);
      expect(settings.quietHours.end).toBe(8);
      expect(settings.maxNotifications).toBe(3);
    });

    it('should save and load settings', () => {
      const newSettings = {
        enabled: true,
        pushEnabled: true,
        frequency: 'twice-daily' as const,
        quietHours: { start: 23, end: 7 },
        maxNotifications: 5
      };

      savePWANotificationSettings(newSettings);
      const loadedSettings = getPWANotificationSettings();

      expect(loadedSettings.enabled).toBe(true);
      expect(loadedSettings.pushEnabled).toBe(true);
      expect(loadedSettings.frequency).toBe('twice-daily');
      expect(loadedSettings.maxNotifications).toBe(5);
    });

    it('should detect PWA support correctly', () => {
      const support = checkPWANotificationSupport();
      
      expect(support.basicNotifications).toBe(true);
      expect(support.pushNotifications).toBe(true);
      expect(support.serviceWorker).toBe(true);
    });
  });

  describe('PWA Notification Permissions', () => {
    it('should request notification permissions', async () => {
      const result = await requestPWANotificationPermission();
      
      expect(result.basicPermission).toBe(true);
      expect(result.pushPermission).toBe(true);
      expect(Notification.requestPermission).toHaveBeenCalled();
    });

    it('should handle permission denied', async () => {
      Notification.requestPermission = vi.fn(() => Promise.resolve('denied'));
      
      const result = await requestPWANotificationPermission();
      
      expect(result.basicPermission).toBe(false);
      expect(result.pushPermission).toBe(false);
    });
  });

  describe('Push Notification Scheduling', () => {
    it('should schedule push notifications', async () => {
      // Enable push notifications in settings
      savePWANotificationSettings({
        enabled: true,
        pushEnabled: true,
        frequency: 'daily',
        quietHours: { start: 22, end: 8 },
        maxNotifications: 3
      });

      const result = await schedulePushNotification(
        'Test Title',
        'Test Body',
        0,
        { type: 'test' }
      );

      expect(result).toBe(true);
    });

    it('should not schedule when disabled', async () => {
      // Disable push notifications
      savePWANotificationSettings({
        enabled: false,
        pushEnabled: false,
        frequency: 'daily',
        quietHours: { start: 22, end: 8 },
        maxNotifications: 3
      });

      const result = await schedulePushNotification(
        'Test Title',
        'Test Body'
      );

      expect(result).toBe(false);
    });
  });

  describe('Enhanced PWA Storage', () => {
    it('should initialize enhanced storage', () => {
      const storage = new EnhancedPWAStorage();
      expect(storage).toBeInstanceOf(EnhancedPWAStorage);
    });

    it('should get sync queue size', () => {
      const storage = new EnhancedPWAStorage();
      const queueSize = storage.getSyncQueueSize();
      expect(typeof queueSize).toBe('number');
      expect(queueSize).toBeGreaterThanOrEqual(0);
    });

    it('should handle fallback to localStorage', async () => {
      const storage = new EnhancedPWAStorage();
      
      // Test data
      const testKey = 'test-key';
      const testValue = { test: 'data' };
      
      // Should fallback to localStorage when IndexedDB fails
      await storage.setItem('test-store', testKey, testValue);
      const retrieved = await storage.getItem('test-store', testKey);
      
      expect(retrieved).toEqual(testValue);
    });

    it('should track pending changes', async () => {
      const storage = new EnhancedPWAStorage();
      
      // Simulate offline
      Object.defineProperty(navigator, 'onLine', { value: false });
      
      await storage.setItem('test-store', 'offline-key', { data: 'offline' });
      
      const pendingChanges = storage.getPendingChanges();
      expect(Array.isArray(pendingChanges)).toBe(true);
    });
  });

  describe('PWA Integration', () => {
    it('should work without breaking existing functionality', () => {
      // Test that PWA features don't interfere with existing localStorage usage
      const testData = { existing: 'data' };
      localStorage.setItem('existing-key', JSON.stringify(testData));
      
      const storage = new EnhancedPWAStorage();
      expect(storage).toBeInstanceOf(EnhancedPWAStorage);
      
      // Existing data should still be accessible
      const retrieved = JSON.parse(localStorage.getItem('existing-key') || '{}');
      expect(retrieved).toEqual(testData);
    });

    it('should handle missing browser APIs gracefully', () => {
      // Remove PWA APIs
      Object.defineProperty(global, 'indexedDB', { value: undefined });
      Object.defineProperty(global, 'Notification', { value: undefined });
      
      const support = checkPWANotificationSupport();
      expect(support.basicNotifications).toBe(false);
      expect(support.pushNotifications).toBe(false);
      
      // Should still create storage instance
      const storage = new EnhancedPWAStorage();
      expect(storage).toBeInstanceOf(EnhancedPWAStorage);
    });
  });
});