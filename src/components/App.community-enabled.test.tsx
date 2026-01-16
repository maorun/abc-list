/**
 * Integration Tests for Community Feature Toggle (Enabled State)
 * Verifies that Community navigation and routes are properly shown when enabled
 */

import {render, screen} from "@testing-library/react";
import {describe, it, expect, vi, beforeEach} from "vitest";

// Mock the config module to enable Community
vi.mock("../lib/config", () => ({
  isCommunityEnabled: vi.fn(() => true),
  COMMUNITY_ENABLED: true,
}));

describe("App with Community Enabled", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render Community navigation link when feature is enabled", async () => {
    const App = await import("../App").then((m) => m.default);
    render(<App />);

    // Community link should be in the navigation
    const communityLinks = screen.queryAllByRole("link", {
      name: /Community/i,
    });
    expect(communityLinks.length).toBeGreaterThan(0);
  });
});
