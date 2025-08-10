import React from "react";
import {render, waitFor} from "@testing-library/react";
import {vi, beforeEach, afterEach, describe, it, expect} from "vitest";
import {MemoryRouter} from "react-router-dom";
import {ListItem} from "./ListItem";

// Mock sonner toast
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
  },
}));

// Mock the prompt dialog
vi.mock("@/components/ui/prompt-dialog", () => ({
  usePrompt: () => ({
    prompt: vi.fn(),
    PromptComponent: () => null,
  }),
}));

// Mock localStorage
const localStorageMock = (() => {
  let store: {[key: string]: string} = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});

// Mock useParams to simulate router behavior
const mockUseParams = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useParams: () => mockUseParams(),
    useNavigate: () => vi.fn(),
  };
});

describe("ListItem Integration Test - Production Rerender Issue", () => {
  let localStorageAccessCount = 0;

  beforeEach(() => {
    localStorage.clear();
    localStorageAccessCount = 0;

    // Mock console to avoid noise
    vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});

    // Track localStorage access
    const originalGetItem = localStorage.getItem;
    localStorage.getItem = (key: string) => {
      localStorageAccessCount++;
      return originalGetItem.call(localStorage, key);
    };
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should not cause rerender loop when loading ABC-List page after navigation", async () => {
    // Set up the scenario: Create a list "Foobar" first
    const listData = ["Foobar"];
    localStorage.setItem("abcLists", JSON.stringify(listData));

    // Add some sample data for the list to make it more realistic
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

    // Step 1: Simulate initial router state (undefined item)
    // This happens when the page first loads
    mockUseParams.mockReturnValue({item: undefined});

    const {rerender} = render(
      <MemoryRouter>
        <ListItem />
      </MemoryRouter>,
    );

    // Should show loading state, no localStorage access for Letter components yet
    const initialAccessCount = localStorageAccessCount;
    expect(localStorageAccessCount).toBeLessThan(10); // Some access is expected for basic setup

    // Step 2: Simulate router updating with actual item value
    // This is the critical transition that was causing rerender loops
    mockUseParams.mockReturnValue({item: "Foobar"});

    rerender(
      <MemoryRouter>
        <ListItem />
      </MemoryRouter>,
    );

    // Wait for all effects to settle
    await waitFor(() => {
      expect(document.title).toBe("ABC-Liste für Foobar");
    });

    const afterNavAccessCount = localStorageAccessCount;

    // Step 3: Force multiple rerenders to detect loops
    // In production, this would happen due to React optimizations/timing
    for (let i = 0; i < 5; i++) {
      rerender(
        <MemoryRouter>
          <ListItem />
        </MemoryRouter>,
      );

      // Small delay to allow effects to run
      await new Promise((resolve) => setTimeout(resolve, 10));
    }

    const finalAccessCount = localStorageAccessCount;

    // CRITICAL ASSERTION: localStorage access should not grow significantly
    // with forced rerenders. This indicates no rerender loop.
    // 26 letters * 2-3 accesses per letter = ~52-78 accesses is reasonable
    // But continuous rerenders would cause hundreds or thousands of accesses
    const accessGrowth = finalAccessCount - afterNavAccessCount;

    console.log(
      `Initial access: ${initialAccessCount}, After nav: ${afterNavAccessCount}, Final: ${finalAccessCount}, Growth: ${accessGrowth}`,
    );

    // The key test: rerender growth should be minimal (< 50 additional accesses)
    // If there's a rerender loop, this would be in the hundreds or thousands
    expect(accessGrowth).toBeLessThan(50);

    // Additional check: No continuous growth pattern
    // Re-render once more and check for minimal additional access
    const beforeFinalRerender = localStorageAccessCount;
    rerender(
      <MemoryRouter>
        <ListItem />
      </MemoryRouter>,
    );
    await new Promise((resolve) => setTimeout(resolve, 10));

    const afterFinalRerender = localStorageAccessCount;
    const finalGrowth = afterFinalRerender - beforeFinalRerender;

    // Should be nearly zero additional access on stable rerenders
    expect(finalGrowth).toBeLessThan(5);
  });

  it("should handle the exact scenario: neue Liste → reload → no rerender loop", async () => {
    // Simulate exact user workflow

    // Step 1: Create new list "Foobar" (simulating user creating it)
    const listData = ["Foobar"];
    localStorage.setItem("abcLists", JSON.stringify(listData));

    // Step 2: Simulate page reload at /list/Foobar
    // This is the problematic scenario user reported
    mockUseParams.mockReturnValue({item: "Foobar"});

    // Track render cycles and localStorage access during mount/unmount
    let componentMountCount = 0;
    const OriginalListItem = ListItem;

    const TestWrapper = () => {
      componentMountCount++;
      return <OriginalListItem />;
    };

    const {unmount} = render(
      <MemoryRouter>
        <TestWrapper />
      </MemoryRouter>,
    );

    // Wait for component to stabilize
    await waitFor(
      () => {
        expect(document.title).toBe("ABC-Liste für Foobar");
      },
      {timeout: 1000},
    );

    // Simulate what happens in production - force React to reconcile
    unmount();

    // Reset counters for clean measurement
    localStorageAccessCount = 0;
    componentMountCount = 0;

    // Re-mount component (simulating reload)
    const {rerender} = render(
      <MemoryRouter>
        <TestWrapper />
      </MemoryRouter>,
    );

    // Wait for stabilization again
    await waitFor(
      () => {
        expect(document.title).toBe("ABC-Liste für Foobar");
      },
      {timeout: 1000},
    );

    const afterReloadAccessCount = localStorageAccessCount;
    console.log(`After reload access count: ${afterReloadAccessCount}`);

    // Force several rerenders to simulate production stress
    for (let i = 0; i < 10; i++) {
      rerender(
        <MemoryRouter>
          <TestWrapper />
        </MemoryRouter>,
      );
      await new Promise((resolve) => setTimeout(resolve, 5));
    }

    const afterStressTestCount = localStorageAccessCount;
    const stressGrowth = afterStressTestCount - afterReloadAccessCount;

    // The critical assertion: stress test should not cause significant localStorage growth
    // Production rerender loops would cause exponential growth here
    console.log(
      `Reload access: ${afterReloadAccessCount}, After stress: ${afterStressTestCount}, Growth: ${stressGrowth}`,
    );

    // The fix: growth should be minimal (< 60 for 26 components * 10 rerenders is reasonable)
    // A true rerender loop would cause hundreds or thousands of accesses
    expect(stressGrowth).toBeLessThan(60); // Reasonable threshold for this scenario

    // Verify no runaway render cycles
    expect(componentMountCount).toBeLessThan(15); // Should be around 11 (1 + 10 rerenders)
  });

  it("should handle router timing edge case without infinite loops", async () => {
    // Test the specific router timing issue that was causing problems

    // Step 1: Start with undefined (router not ready)
    mockUseParams.mockReturnValue({item: undefined});

    const {rerender} = render(
      <MemoryRouter>
        <ListItem />
      </MemoryRouter>,
    );

    // Should show loading state
    const loadingElement = document.querySelector('[data-testid="loading"]');
    const bodyText = document.body.textContent || "";
    expect(loadingElement !== null || bodyText.includes("Lade")).toBe(true);

    // Step 2: Router becomes ready but with different values in rapid succession
    // This simulates the timing issue where router updates multiple times
    const items = [undefined, "Foobar", "Foobar", "Foobar"];

    for (const item of items) {
      mockUseParams.mockReturnValue({item});
      rerender(
        <MemoryRouter>
          <ListItem />
        </MemoryRouter>,
      );
      await new Promise((resolve) => setTimeout(resolve, 1));
    }

    // Wait for final state
    await waitFor(() => {
      expect(document.title).toBe("ABC-Liste für Foobar");
    });

    const finalAccessCount = localStorageAccessCount;

    // Additional rapid-fire rerenders should not cause explosive growth
    for (let i = 0; i < 20; i++) {
      mockUseParams.mockReturnValue({item: "Foobar"});
      rerender(
        <MemoryRouter>
          <ListItem />
        </MemoryRouter>,
      );
    }

    const afterRapidFireCount = localStorageAccessCount;
    const rapidFireGrowth = afterRapidFireCount - finalAccessCount;

    // Should handle rapid rerenders gracefully
    expect(rapidFireGrowth).toBeLessThan(40);
  });
});
