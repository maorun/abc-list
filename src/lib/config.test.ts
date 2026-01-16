/**
 * Tests for Community Feature Toggle
 * Verifies that Community features are hidden when VITE_ENABLE_COMMUNITY is not set
 */

import {describe, it, expect, beforeEach, vi} from "vitest";
import {isCommunityEnabled} from "./config";

describe("Community Feature Flag", () => {
  beforeEach(() => {
    // Reset modules to ensure clean state
    vi.resetModules();
  });

  it("should be disabled by default", () => {
    // Without setting VITE_ENABLE_COMMUNITY, it should default to false
    expect(isCommunityEnabled()).toBe(false);
  });

  it("should return false when VITE_ENABLE_COMMUNITY is not set", () => {
    expect(import.meta.env.VITE_ENABLE_COMMUNITY).toBeUndefined();
    expect(isCommunityEnabled()).toBe(false);
  });

  it("should be a boolean value", () => {
    const result = isCommunityEnabled();
    expect(typeof result).toBe("boolean");
  });
});
