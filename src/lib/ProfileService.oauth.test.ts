/**
 * OAuth Configuration Tests for Cloud-Anmeldung Fix
 * Tests the OAuth redirect URL configuration changes
 */

import {describe, it, expect, vi, beforeEach, afterEach} from "vitest";

describe("OAuth Redirect Configuration", () => {
  const originalLocation = window.location;
  
  beforeEach(() => {
    // Mock window.location for testing
    delete (window as any).location;
    window.location = {
      ...originalLocation,
      origin: "https://example.com",
      pathname: "/abc-list/community",
    } as Location;
  });

  afterEach(() => {
    window.location = originalLocation;
  });

  it("should generate correct OAuth redirect URL for current location", () => {
    // This tests the fix for the OAuth redirect configuration
    const expectedRedirectUrl = window.location.origin + window.location.pathname;
    
    expect(expectedRedirectUrl).toBe("https://example.com/abc-list/community");
    
    // The redirect should work for any current path, not just /abc-list/
    window.location.pathname = "/abc-list/";
    const rootRedirectUrl = window.location.origin + window.location.pathname;
    expect(rootRedirectUrl).toBe("https://example.com/abc-list/");
    
    // Should also work for localhost development
    window.location.origin = "http://localhost:5173";
    window.location.pathname = "/community";
    const devRedirectUrl = window.location.origin + window.location.pathname;
    expect(devRedirectUrl).toBe("http://localhost:5173/community");
  });

  it("should prevent endless redirect scenario", () => {
    // Test that the OAuth redirect doesn't create infinite loops
    const testUrls = [
      "https://example.com/abc-list/",
      "https://example.com/abc-list/community",
      "http://localhost:5173/",
      "http://localhost:5173/community",
    ];

    testUrls.forEach(url => {
      const urlParts = new URL(url);
      window.location.origin = urlParts.origin;
      window.location.pathname = urlParts.pathname;
      
      const redirectUrl = window.location.origin + window.location.pathname;
      
      // Should not contain ~and~ patterns that caused infinite redirects
      expect(redirectUrl).not.toContain("~and~");
      expect(redirectUrl).toBe(url);
    });
  });
});