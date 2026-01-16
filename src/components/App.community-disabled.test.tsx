/**
 * Integration Tests for Community Feature Toggle in App Component
 * Verifies that Community navigation and routes are properly hidden
 */

import {render, screen} from "@testing-library/react";
import {describe, it, expect, vi} from "vitest";
import App from "../App";

// Mock the config module
vi.mock("../lib/config", () => ({
  isCommunityEnabled: vi.fn(() => false),
  COMMUNITY_ENABLED: false,
}));

describe("App with Community Disabled", () => {
  it("should not render Community navigation link when feature is disabled", () => {
    render(<App />);

    // Community link should not be in the navigation
    const communityLinks = screen.queryAllByRole("link", {
      name: /Community/i,
    });
    expect(communityLinks).toHaveLength(0);
  });

  it("should render all other navigation links when Community is disabled", () => {
    render(<App />);

    // Check that other navigation links still exist
    expect(screen.getByRole("link", {name: /Listen/i})).toBeInTheDocument();
    expect(screen.getByRole("link", {name: /Kawas/i})).toBeInTheDocument();
    expect(screen.getByRole("link", {name: /Basar/i})).toBeInTheDocument();
    expect(
      screen.getByRole("link", {name: /Sokrates-Check/i}),
    ).toBeInTheDocument();
  });
});
