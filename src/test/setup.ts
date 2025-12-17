import "@testing-library/jest-dom";
import {vi, afterEach} from "vitest";
import "./localStorageMock";

afterEach(() => {
  localStorage.clear();
  vi.clearAllMocks();
});

// Mock ResizeObserver for Recharts
global.ResizeObserver = class ResizeObserver {
  constructor(cb: ResizeObserverCallback) {
    this.callback = cb;
  }
  callback: ResizeObserverCallback;
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock matchMedia for PWA functionality
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // Deprecated
    removeListener: vi.fn(), // Deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock IndexedDB for PWA storage tests
const indexedDBMock = {
  open: vi.fn(),
  deleteDatabase: vi.fn(),
  cmp: vi.fn(),
};
Object.defineProperty(window, "indexedDB", {
  value: indexedDBMock,
  writable: true,
  configurable: true,
});

// Mock Notification API for PWA tests
interface MockNotificationOptions {
  body?: string;
  icon?: string;
  [key: string]: unknown;
}

interface MockNotificationConstructor {
  new (title: string, options?: MockNotificationOptions): MockNotification;
  permission: NotificationPermission;
  requestPermission(): Promise<NotificationPermission>;
}

interface MockNotification {
  title: string;
  body: string;
  icon: string;
  close: () => void;
  addEventListener: (type: string, listener: EventListener) => void;
  removeEventListener: (type: string, listener: EventListener) => void;
}

const NotificationMock = function (
  title: string,
  options?: MockNotificationOptions,
): MockNotification {
  // Mock constructor behavior
  return {
    title,
    body: options?.body || "",
    icon: options?.icon || "",
    close: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  };
} as MockNotificationConstructor;

NotificationMock.permission = "granted";
NotificationMock.requestPermission = vi.fn(() => Promise.resolve("granted"));

Object.defineProperty(window, "Notification", {
  value: NotificationMock,
  writable: true,
  configurable: true,
});

Object.defineProperty(global, "Notification", {
  value: NotificationMock,
  writable: true,
  configurable: true,
});

// Mock service worker for PWA tests
const mockPushManager = {
  getSubscription: vi.fn(() => Promise.resolve(null)),
  subscribe: vi.fn(() =>
    Promise.resolve({
      endpoint: "https://test-endpoint.com",
      keys: {
        p256dh: "test-key",
        auth: "test-auth",
      },
      toJSON: vi.fn(() => ({
        endpoint: "https://test-endpoint.com",
        keys: {
          p256dh: "test-key",
          auth: "test-auth",
        },
      })),
    }),
  ),
};

Object.defineProperty(navigator, "serviceWorker", {
  value: {
    register: vi.fn(() =>
      Promise.resolve({
        addEventListener: vi.fn(),
        installing: null,
        waiting: null,
        active: null,
        pushManager: mockPushManager,
      }),
    ),
    addEventListener: vi.fn(),
    ready: Promise.resolve({
      sync: {
        register: vi.fn(),
      },
      pushManager: mockPushManager,
    }),
  },
  writable: true,
});
