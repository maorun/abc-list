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

// Advanced production rerender tracking system
const createProductionRerenderTracker = () => {
  let localStorageGets = 0;
  let localStorageSets = 0;
  let renderCalls = 0;
  let effectCalls = 0;
  let componentMounts = 0;

  const originalGetItem = localStorage.getItem;
  const originalSetItem = localStorage.setItem;

  // Comprehensive localStorage tracking
  localStorage.getItem = function (key: string) {
    localStorageGets++;
    // Log specific patterns that indicate rerender loops
    if (key.includes("abcList-Foobar")) {
      console.log(`📦 localStorage.getItem: ${key}`);
    }
    return originalGetItem.call(this, key);
  };

  localStorage.setItem = function (key: string, value: string) {
    localStorageSets++;
    return originalSetItem.call(this, key, value);
  };

  return {
    reset: () => {
      localStorageGets = 0;
      localStorageSets = 0;
      renderCalls = 0;
      effectCalls = 0;
      componentMounts = 0;
    },
    getStats: () => ({
      localStorageGets,
      localStorageSets,
      renderCalls,
      effectCalls,
      componentMounts,
      totalActivity: localStorageGets + localStorageSets + renderCalls,
    }),
    restore: () => {
      localStorage.getItem = originalGetItem;
      localStorage.setItem = originalSetItem;
    },
  };
};

const productionTracker = createProductionRerenderTracker();

describe("ListItem Production Rerender Investigation", () => {
  beforeEach(() => {
    localStorage.clear();
    productionTracker.reset();

    // Set up the exact user scenario from the issue
    localStorage.setItem("abcLists", JSON.stringify(["Foobar"]));
    localStorage.setItem(
      "abcList-Foobar:a",
      JSON.stringify([
        {
          text: "Apfel",
          explanation: "Test explanation",
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
          explanation: "Test explanation",
          version: 1,
          imported: false,
        },
      ]),
    );
    localStorage.setItem(
      "abcList-Foobar:c",
      JSON.stringify([
        {
          text: "Computer",
          explanation: "Test explanation",
          version: 1,
          imported: false,
        },
      ]),
    );

    vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    productionTracker.restore();
    vi.restoreAllMocks();
  });

  it("should reproduce the exact user scenario: neue Liste Foobar -> page reload -> continuous rerenders", async () => {
    console.log(
      "🚨 REPRODUCING EXACT USER SCENARIO: Neue Liste Foobar → reload /list/Foobar",
    );

    // Reset after localStorage setup to measure only component behavior
    productionTracker.reset();

    // Step 1: Simulate page reload at /list/Foobar (user's exact scenario)
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
      {timeout: 5000},
    );

    const initialStats = productionTracker.getStats();
    console.log(
      `📊 Initial load complete - localStorage gets: ${initialStats.localStorageGets}, sets: ${initialStats.localStorageSets}`,
    );

    // Step 2: Reset tracking and measure behavior during simulated production rerenders
    productionTracker.reset();

    console.log(
      "🔄 Simulating production rerender behavior that user experiences...",
    );

    // Simulate rapid rerenders that happen in production due to unstable dependencies
    for (let i = 0; i < 3; i++) {
      console.log(`🔄 Rerender ${i + 1}/3`);

      await act(async () => {
        // Force rerender by creating new router instance (simulates production behavior)
        rerender(
          <MemoryRouter initialEntries={["/list/Foobar"]} key={i}>
            <Routes>
              <Route path="/list/:item" element={<ListItem />} />
            </Routes>
          </MemoryRouter>,
        );
      });

      // Allow time for effects to process
      await new Promise((resolve) => setTimeout(resolve, 50));

      const currentStats = productionTracker.getStats();
      console.log(
        `📊 After rerender ${i + 1} - localStorage gets: ${currentStats.localStorageGets}`,
      );
    }

    const finalStats = productionTracker.getStats();
    console.log(
      `📊 FINAL STATS - localStorage gets: ${finalStats.localStorageGets}, total activity: ${finalStats.totalActivity}`,
    );

    // If we have a rerender loop, localStorage gets should be minimal after initial setup
    // Excessive localStorage access indicates Letters are being recreated
    if (finalStats.localStorageGets > 100) {
      console.log(
        "🚨 RERENDER LOOP DETECTED! Excessive localStorage access detected.",
      );
      console.log(
        "This indicates Letter components are being recreated on every render.",
      );
    } else {
      console.log("✅ No rerender loop detected. Components are stable.");
    }

    // For a truly fixed component, localStorage access during rerenders should be minimal
    expect(finalStats.localStorageGets).toBeLessThan(50);
  });

  it("should demonstrate rerender stability with alphabet stress test", async () => {
    console.log("🧪 Alphabet stress test to verify Letter component stability");

    // Create list with multiple letters to simulate full alphabet impact
    for (let i = 0; i < 26; i++) {
      const letter = String.fromCharCode(97 + i); // a-z
      localStorage.setItem(
        `abcList-Foobar:${letter}`,
        JSON.stringify([
          {text: `Word${i}`, explanation: "Test", version: 1, imported: false},
        ]),
      );
    }

    productionTracker.reset();

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

    const setupStats = productionTracker.getStats();
    console.log(
      `📊 Full alphabet setup - localStorage gets: ${setupStats.localStorageGets}`,
    );

    // Reset and test rerender behavior with all 26 Letter components
    productionTracker.reset();

    // Simulate the exact production rerender issue
    for (let i = 0; i < 5; i++) {
      await act(async () => {
        rerender(
          <MemoryRouter initialEntries={["/list/Foobar"]} key={`stress-${i}`}>
            <Routes>
              <Route path="/list/:item" element={<ListItem />} />
            </Routes>
          </MemoryRouter>,
        );
      });

      await new Promise((resolve) => setTimeout(resolve, 10));
    }

    const stressStats = productionTracker.getStats();
    console.log(
      `📊 Stress test (5 rerenders, 26 letters) - localStorage gets: ${stressStats.localStorageGets}`,
    );

    // With 26 Letter components, if each Letter loads data on every render,
    // we'd see 26 * 5 = 130+ localStorage accesses
    // Properly memoized components should show much less
    const expectedMaxAccess = 26 * 2; // Allow some tolerance

    if (stressStats.localStorageGets > expectedMaxAccess) {
      console.log(
        `🚨 POTENTIAL RERENDER ISSUE: ${stressStats.localStorageGets} localStorage accesses for 26 letters in 5 rerenders`,
      );
      console.log(
        `Expected max: ${expectedMaxAccess}, actual: ${stressStats.localStorageGets}`,
      );
    }

    expect(stressStats.localStorageGets).toBeLessThan(expectedMaxAccess);
  });

  it("should verify Navigation-related rerender stability", async () => {
    console.log("🧪 Testing Navigation-related rerender stability");

    productionTracker.reset();

    // Render with exact user navigation state
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

    productionTracker.reset();

    // Simulate navigation-triggered rerenders (what happens in production)
    for (let i = 0; i < 10; i++) {
      await act(async () => {
        // Simulate navigation changes that trigger rerenders
        rerender(
          <MemoryRouter initialEntries={["/list/Foobar"]} key={`nav-${i}`}>
            <Routes>
              <Route path="/list/:item" element={<ListItem />} />
            </Routes>
          </MemoryRouter>,
        );
      });

      // Micro-delay to simulate real navigation timing
      await new Promise((resolve) => setTimeout(resolve, 5));
    }

    const navStats = productionTracker.getStats();
    console.log(
      `📊 Navigation stress test - localStorage gets: ${navStats.localStorageGets}`,
    );

    // Navigation changes shouldn't cause excessive data reloading
    expect(navStats.localStorageGets).toBeLessThan(30);

    console.log("✅ Navigation stability verified");
  });
});
