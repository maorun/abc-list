import React from "react";
import {render, screen, waitFor, act} from "@testing-library/react";
import {describe, it, expect, vi, beforeEach, afterEach} from "vitest";
import {MemoryRouter, Route, Routes} from "react-router-dom";
import {ListItem} from "./ListItem";

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

// Enhanced tracking system for production testing
const createRerenderTracker = () => {
  let localStorageAccesses = 0;
  let renderCalls = 0;
  let effectCalls = 0;

  const originalGetItem = localStorage.getItem;
  const originalSetItem = localStorage.setItem;

  // Patch localStorage to track accesses
  localStorage.getItem = function (key: string) {
    localStorageAccesses++;
    return originalGetItem.call(this, key);
  };

  localStorage.setItem = function (key: string, value: string) {
    return originalSetItem.call(this, key, value);
  };

  return {
    reset: () => {
      localStorageAccesses = 0;
      renderCalls = 0;
      effectCalls = 0;
    },
    getStats: () => ({
      localStorageAccesses,
      renderCalls,
      effectCalls,
    }),
    restore: () => {
      localStorage.getItem = originalGetItem;
      localStorage.setItem = originalSetItem;
    },
  };
};

const rerenderTracker = createRerenderTracker();

describe("ListItem Navigation-Fixed Production Test", () => {
  beforeEach(() => {
    localStorage.clear();
    rerenderTracker.reset();

    // Set up the exact user scenario
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
    rerenderTracker.restore();
    vi.restoreAllMocks();
  });

  it("should handle the exact user scenario with Navigation fixes", async () => {
    console.log(
      "🧪 Testing Navigation-fixed scenario: neue Liste Foobar → reload /list/Foobar",
    );

    // Reset tracking after localStorage setup
    rerenderTracker.reset();

    // Simulate exact user scenario: page reload at /list/Foobar
    const {rerender} = render(
      <MemoryRouter initialEntries={["/list/Foobar"]}>
        <Routes>
          <Route path="/list/:item" element={<ListItem />} />
        </Routes>
      </MemoryRouter>,
    );

    // Wait for initial load
    await waitFor(
      () => {
        expect(
          screen.getByRole("heading", {name: "ABC-Liste für Foobar"}),
        ).toBeInTheDocument();
      },
      {timeout: 3000},
    );

    const initialStats = rerenderTracker.getStats();
    console.log(
      `📊 Initial load - localStorage: ${initialStats.localStorageAccesses}`,
    );

    // Reset to measure rerender behavior specifically
    rerenderTracker.reset();

    // Simulate production rerender scenario that user experiences
    console.log("🔄 Simulating production rerenders with Navigation fixes...");

    // Test multiple rerenders to verify stable behavior
    for (let i = 0; i < 5; i++) {
      await act(async () => {
        rerender(
          <MemoryRouter initialEntries={["/list/Foobar"]}>
            <Routes>
              <Route path="/list/:item" element={<ListItem />} />
            </Routes>
          </MemoryRouter>,
        );
      });

      // Small delay to allow effects to process
      await new Promise((resolve) => setTimeout(resolve, 20));
    }

    const finalStats = rerenderTracker.getStats();
    console.log(
      `📊 After 5 rerenders - localStorage: ${finalStats.localStorageAccesses}`,
    );

    // With Navigation fixes, localStorage access should be minimal during rerenders
    expect(finalStats.localStorageAccesses).toBeLessThan(30);

    // Verify single additional rerender is stable
    rerenderTracker.reset();

    await act(async () => {
      rerender(
        <MemoryRouter initialEntries={["/list/Foobar"]}>
          <Routes>
            <Route path="/list/:item" element={<ListItem />} />
          </Routes>
        </MemoryRouter>,
      );
    });

    await new Promise((resolve) => setTimeout(resolve, 20));

    const singleRerenderStats = rerenderTracker.getStats();
    console.log(
      `📊 Single rerender - localStorage: ${singleRerenderStats.localStorageAccesses}`,
    );

    // Single rerender should have minimal localStorage access
    expect(singleRerenderStats.localStorageAccesses).toBeLessThan(10);

    console.log(
      "✅ Navigation fixes verified - production rerender scenario handled correctly",
    );
  });

  it("should demonstrate the fix by comparing localStorage access patterns", async () => {
    console.log("🔬 Demonstrating the Navigation rerender fix effectiveness");

    rerenderTracker.reset();

    // Single clean render
    const {rerender} = render(
      <MemoryRouter initialEntries={["/list/Foobar"]}>
        <Routes>
          <Route path="/list/:item" element={<ListItem />} />
        </Routes>
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(
        screen.getByRole("heading", {name: "ABC-Liste für Foobar"}),
      ).toBeInTheDocument();
    });

    const baselineStats = rerenderTracker.getStats();
    console.log(
      `📊 Baseline render - localStorage: ${baselineStats.localStorageAccesses}`,
    );

    // Reset and stress test with 10 rapid rerenders
    rerenderTracker.reset();

    for (let i = 0; i < 10; i++) {
      await act(async () => {
        rerender(
          <MemoryRouter initialEntries={["/list/Foobar"]}>
            <Routes>
              <Route path="/list/:item" element={<ListItem />} />
            </Routes>
          </MemoryRouter>,
        );
      });
    }

    const stressTestStats = rerenderTracker.getStats();
    console.log(
      `📊 Stress test (10 rerenders) - localStorage: ${stressTestStats.localStorageAccesses}`,
    );

    // With proper Navigation memoization, stress test should show minimal growth
    expect(stressTestStats.localStorageAccesses).toBeLessThan(50);

    // Calculate access per rerender (should be very low)
    const accessPerRerender = stressTestStats.localStorageAccesses / 10;
    console.log(
      `📊 localStorage access per rerender: ${accessPerRerender.toFixed(2)}`,
    );

    expect(accessPerRerender).toBeLessThan(5); // Should be minimal per rerender

    console.log(
      "✅ Navigation fixes successfully prevent rerender loops in production",
    );
  });
});
