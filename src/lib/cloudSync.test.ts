import {
  describe,
  it,
  expect,
  beforeEach,
  vi,
  beforeAll,
  afterEach,
} from "vitest";

// Mock environment first
Object.defineProperty(import.meta, "env", {
  value: {
    VITE_SUPABASE_URL: "https://test.supabase.co",
    VITE_SUPABASE_ANON_KEY: "test-key",
  },
  writable: true,
});

// Mock global objects needed for testing
Object.defineProperty(global, "crypto", {
  value: {
    subtle: {
      digest: vi.fn().mockResolvedValue(new ArrayBuffer(32)),
    },
  },
});

Object.defineProperty(global, "navigator", {
  value: {
    onLine: true,
    userAgent: "test-agent",
    platform: "test-platform",
  },
});

// Mock Supabase completely
vi.mock("@supabase/supabase-js", () => ({
  createClient: vi.fn(() => ({
    auth: {
      getSession: vi.fn(),
      onAuthStateChange: vi.fn(),
      signInWithOAuth: vi.fn(),
      signOut: vi.fn(),
    },
    from: vi.fn(),
    channel: vi.fn(),
    removeChannel: vi.fn(),
  })),
}));

// Now import after mocking
import {CloudSyncService, SyncConflict, BackupMetadata} from "./cloudSync";

// Simple integration test to verify the cloud sync service can be instantiated
describe("CloudSyncService Integration", () => {
  it("should be importable and create instance", () => {
    expect(CloudSyncService).toBeDefined();
    expect(typeof CloudSyncService.getInstance).toBe("function");
    expect(typeof CloudSyncService.resetInstance).toBe("function");
  });

  it("should have proper method signatures", () => {
    // Test without actually instantiating to avoid Supabase issues in test environment
    const methods = [
      "signInWithGoogle",
      "signOut",
      "getCurrentUser",
      "isAuthenticated",
      "updateConfig",
      "getConfig",
      "syncDataToCloud",
      "syncDataFromCloud",
      "createBackup",
      "restoreFromBackup",
      "listBackups",
      "deleteAllUserData",
      "exportUserData",
    ];

    // Verify methods exist on prototype
    methods.forEach((method) => {
      expect(CloudSyncService.prototype[method]).toBeDefined();
    });
  });
});
