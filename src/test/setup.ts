import "@testing-library/jest-dom";

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
});

// Mock service worker for PWA tests
Object.defineProperty(navigator, "serviceWorker", {
  value: {
    register: vi.fn(() =>
      Promise.resolve({
        addEventListener: vi.fn(),
        installing: null,
        waiting: null,
        active: null,
      }),
    ),
    addEventListener: vi.fn(),
    ready: Promise.resolve({
      sync: {
        register: vi.fn(),
      },
    }),
  },
  writable: true,
});
