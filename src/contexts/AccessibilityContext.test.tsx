import {render, screen, fireEvent, waitFor} from "@testing-library/react";
import {describe, it, expect, beforeEach} from "vitest";
import {
  AccessibilityProvider,
  useAccessibility,
} from "@/contexts/AccessibilityContext";

// Test component to access the context
function TestComponent() {
  const {settings, toggleHighContrast, increaseFontSize, decreaseFontSize} =
    useAccessibility();

  return (
    <div>
      <div data-testid="high-contrast">{settings.highContrast.toString()}</div>
      <div data-testid="font-size">{settings.fontSize}</div>
      <button onClick={toggleHighContrast}>Toggle Contrast</button>
      <button onClick={increaseFontSize}>Increase Font</button>
      <button onClick={decreaseFontSize}>Decrease Font</button>
    </div>
  );
}

describe("AccessibilityContext", () => {
  beforeEach(() => {
    localStorage.clear();
    // Reset document classes
    document.documentElement.className = "";
  });

  it("should provide default accessibility settings", () => {
    render(
      <AccessibilityProvider>
        <TestComponent />
      </AccessibilityProvider>,
    );

    expect(screen.getByTestId("high-contrast")).toHaveTextContent("false");
    expect(screen.getByTestId("font-size")).toHaveTextContent("medium");
  });

  it("should toggle high contrast mode", async () => {
    render(
      <AccessibilityProvider>
        <TestComponent />
      </AccessibilityProvider>,
    );

    const toggleButton = screen.getByText("Toggle Contrast");
    fireEvent.click(toggleButton);

    await waitFor(() => {
      expect(screen.getByTestId("high-contrast")).toHaveTextContent("true");
    });

    // Check if class is applied to document
    expect(document.documentElement.classList.contains("high-contrast")).toBe(
      true,
    );
  });

  it("should increase font size", async () => {
    render(
      <AccessibilityProvider>
        <TestComponent />
      </AccessibilityProvider>,
    );

    const increaseButton = screen.getByText("Increase Font");
    fireEvent.click(increaseButton);

    await waitFor(() => {
      expect(screen.getByTestId("font-size")).toHaveTextContent("large");
    });

    expect(document.documentElement.classList.contains("font-large")).toBe(
      true,
    );
  });

  it("should decrease font size", async () => {
    render(
      <AccessibilityProvider>
        <TestComponent />
      </AccessibilityProvider>,
    );

    // First increase, then decrease
    const increaseButton = screen.getByText("Increase Font");
    const decreaseButton = screen.getByText("Decrease Font");

    fireEvent.click(increaseButton);
    fireEvent.click(decreaseButton);

    await waitFor(() => {
      expect(screen.getByTestId("font-size")).toHaveTextContent("medium");
    });
  });

  it("should persist settings in localStorage", async () => {
    render(
      <AccessibilityProvider>
        <TestComponent />
      </AccessibilityProvider>,
    );

    const toggleButton = screen.getByText("Toggle Contrast");
    fireEvent.click(toggleButton);

    await waitFor(() => {
      const stored = localStorage.getItem("accessibility-settings");
      expect(stored).toBeTruthy();
      const parsed = JSON.parse(stored!);
      expect(parsed.highContrast).toBe(true);
    });
  });

  it("should load settings from localStorage on initialization", () => {
    // Pre-populate localStorage
    localStorage.setItem(
      "accessibility-settings",
      JSON.stringify({
        highContrast: true,
        fontSize: "large",
        reducedMotion: false,
      }),
    );

    render(
      <AccessibilityProvider>
        <TestComponent />
      </AccessibilityProvider>,
    );

    expect(screen.getByTestId("high-contrast")).toHaveTextContent("true");
    expect(screen.getByTestId("font-size")).toHaveTextContent("large");
  });

  it("should not increase font size beyond large", () => {
    render(
      <AccessibilityProvider>
        <TestComponent />
      </AccessibilityProvider>,
    );

    const increaseButton = screen.getByText("Increase Font");

    // Click multiple times
    fireEvent.click(increaseButton);
    fireEvent.click(increaseButton);
    fireEvent.click(increaseButton);

    expect(screen.getByTestId("font-size")).toHaveTextContent("large");
  });

  it("should not decrease font size beyond small", () => {
    render(
      <AccessibilityProvider>
        <TestComponent />
      </AccessibilityProvider>,
    );

    const decreaseButton = screen.getByText("Decrease Font");

    // Click multiple times
    fireEvent.click(decreaseButton);
    fireEvent.click(decreaseButton);
    fireEvent.click(decreaseButton);

    expect(screen.getByTestId("font-size")).toHaveTextContent("small");
  });
});
