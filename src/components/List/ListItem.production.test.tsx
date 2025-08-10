import React from "react";
import {render, screen, waitFor, act} from "@testing-library/react";
import {describe, it, expect, vi, beforeEach, afterEach} from "vitest";
import {MemoryRouter, Route, Routes} from "react-router-dom";
import {ListItem} from "./ListItem";
import App from "../../App";

// Mock sonner toast
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
  },
  Toaster: () => null,
}));

// Create a detailed tracking system for all React operations
const createProductionTracker = () => {
  let renderCount = 0;
  let effectCount = 0;
  let localStorageAccess = 0;
  let rerenderComponents: string[] = [];

  return {
    trackRender: (componentName: string) => {
      renderCount++;
      rerenderComponents.push(componentName);
      console.log(`🔄 Render #${renderCount}: ${componentName}`);
    },
    trackEffect: (componentName: string) => {
      effectCount++;
      console.log(`⚡ Effect #${effectCount}: ${componentName}`);
    },
    trackLocalStorage: () => {
      localStorageAccess++;
    },
    getRenderCount: () => renderCount,
    getEffectCount: () => effectCount,
    getLocalStorageAccess: () => localStorageAccess,
    getRerenderComponents: () => rerenderComponents,
    reset: () => {
      renderCount = 0;
      effectCount = 0;
      localStorageAccess = 0;
      rerenderComponents = [];
    },
  };
};

const productionTracker = createProductionTracker();

// Monkey-patch localStorage to track access
const originalGetItem = localStorage.getItem;
const originalSetItem = localStorage.setItem;
localStorage.getItem = function (key: string) {
  productionTracker.trackLocalStorage();
  return originalGetItem.call(this, key);
};
localStorage.setItem = function (key: string, value: string) {
  return originalSetItem.call(this, key, value);
};

// Mock React to track renders and effects (simulating production behavior)
const originalUseEffect = React.useEffect;
const originalUseMemo = React.useMemo;
const originalUseCallback = React.useCallback;

// Production simulation: effects and callbacks behave differently
React.useEffect = function (effect: any, deps?: any[]) {
  productionTracker.trackEffect("useEffect");
  return originalUseEffect(effect, deps);
};

React.useMemo = function (factory: any, deps?: any[]) {
  // In production, memoization might be more aggressive
  return originalUseMemo(factory, deps);
};

React.useCallback = function (callback: any, deps?: any[]) {
  // In production, callback memoization might behave differently
  return originalUseCallback(callback, deps);
};

describe("ListItem Production Rerender Investigation", () => {
  beforeEach(() => {
    localStorage.clear();
    productionTracker.reset();

    // Set up the exact scenario: existing list with data
    localStorage.setItem("abcLists", JSON.stringify(["Foobar"]));
    localStorage.setItem(
      "abcList-Foobar:a",
      JSON.stringify([
        {
          text: "Apfel",
          explanation: "Rote Frucht",
          version: 1,
          imported: false,
        },
      ]),
    );
    localStorage.setItem(
      "abcList-Foobar:b",
      JSON.stringify([
        {
          text: "Banane",
          explanation: "Gelbe Frucht",
          version: 1,
          imported: false,
        },
      ]),
    );

    vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
    // Restore original functions
    localStorage.getItem = originalGetItem;
    localStorage.setItem = originalSetItem;
    React.useEffect = originalUseEffect;
    React.useMemo = originalUseMemo;
    React.useCallback = originalUseCallback;
  });

  it("should handle the exact production scenario: neue Liste Foobar → reload /list/Foobar", async () => {
    console.log("🧪 Starting production rerender investigation...");

    // Reset tracking after localStorage setup
    productionTracker.reset();

    // Simulate the exact scenario: page reload at /list/Foobar URL
    // This simulates what happens when user reloads the page
    const {rerender} = render(
      <MemoryRouter initialEntries={["/list/Foobar"]}>
        <Routes>
          <Route path="/list/:item" element={<ListItem />} />
        </Routes>
      </MemoryRouter>,
    );

    // Wait for initial load to complete
    await waitFor(
      () => {
        expect(
          screen.getByRole("heading", {name: "ABC-Liste für Foobar"}),
        ).toBeInTheDocument();
      },
      {timeout: 3000},
    );

    const initialRenders = productionTracker.getRenderCount();
    const initialEffects = productionTracker.getEffectCount();
    const initialLocalStorage = productionTracker.getLocalStorageAccess();

    console.log(
      `📊 Initial load: Renders=${initialRenders}, Effects=${initialEffects}, localStorage=${initialLocalStorage}`,
    );

    // Reset counters to measure rerender behavior
    productionTracker.reset();

    // Simulate what happens in production - multiple potential rerenders
    // This could be caused by Navigation, Router, or other surrounding components
    console.log("🔄 Simulating production rerenders...");

    for (let i = 0; i < 3; i++) {
      await act(async () => {
        rerender(
          <MemoryRouter initialEntries={["/list/Foobar"]}>
            <Routes>
              <Route path="/list/:item" element={<ListItem />} />
            </Routes>
          </MemoryRouter>,
        );
      });

      // Allow time for effects to process
      await new Promise((resolve) => setTimeout(resolve, 50));

      const currentRenders = productionTracker.getRenderCount();
      const currentEffects = productionTracker.getEffectCount();
      const currentLocalStorage = productionTracker.getLocalStorageAccess();

      console.log(
        `📊 After rerender ${i + 1}: Renders=${currentRenders}, Effects=${currentEffects}, localStorage=${currentLocalStorage}`,
      );
    }

    const finalRenders = productionTracker.getRenderCount();
    const finalEffects = productionTracker.getEffectCount();
    const finalLocalStorage = productionTracker.getLocalStorageAccess();

    console.log(
      `📊 Final: Renders=${finalRenders}, Effects=${finalEffects}, localStorage=${finalLocalStorage}`,
    );
    console.log(
      `🧬 Components that rerendered: ${productionTracker.getRerenderComponents().join(", ")}`,
    );

    // In a properly optimized React app, rerenders should not cause exponential localStorage access
    // The key insight: if localStorage access grows significantly, we have a rerender loop
    expect(finalLocalStorage).toBeLessThan(30); // Should be minimal with proper memoization

    console.log("✅ Production rerender investigation complete");
  });

  it("should test with full App component including Navigation", async () => {
    console.log(
      "🧪 Testing full App component for navigation-related rerenders...",
    );

    productionTracker.reset();

    // Test with full App component (includes Navigation)
    const {rerender} = render(
      <MemoryRouter initialEntries={["/list/Foobar"]}>
        <App />
      </MemoryRouter>,
    );

    // Wait for app to load
    await waitFor(
      () => {
        expect(screen.getByText("ABC-Listen App")).toBeInTheDocument();
      },
      {timeout: 3000},
    );

    await waitFor(
      () => {
        expect(
          screen.getByRole("heading", {name: "ABC-Liste für Foobar"}),
        ).toBeInTheDocument();
      },
      {timeout: 3000},
    );

    const initialRenders = productionTracker.getRenderCount();
    const initialEffects = productionTracker.getEffectCount();
    const initialLocalStorage = productionTracker.getLocalStorageAccess();

    console.log(
      `📊 Full App Initial: Renders=${initialRenders}, Effects=${initialEffects}, localStorage=${initialLocalStorage}`,
    );

    // Reset and test rerenders with full app context
    productionTracker.reset();

    // Simulate production rerender scenarios
    for (let i = 0; i < 2; i++) {
      await act(async () => {
        rerender(
          <MemoryRouter initialEntries={["/list/Foobar"]}>
            <App />
          </MemoryRouter>,
        );
      });

      await new Promise((resolve) => setTimeout(resolve, 100));

      const currentRenders = productionTracker.getRenderCount();
      const currentLocalStorage = productionTracker.getLocalStorageAccess();

      console.log(
        `📊 Full App Rerender ${i + 1}: Renders=${currentRenders}, localStorage=${currentLocalStorage}`,
      );
    }

    const finalLocalStorage = productionTracker.getLocalStorageAccess();
    console.log(`📊 Full App Final localStorage access: ${finalLocalStorage}`);

    // With Navigation and full App, we might see more renders but localStorage should still be stable
    expect(finalLocalStorage).toBeLessThan(50);

    console.log("✅ Full App rerender test complete");
  });
});
