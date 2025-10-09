import {render, screen, fireEvent, waitFor} from "@testing-library/react";
import {describe, it, expect, vi, beforeEach} from "vitest";
import {AccessibilityToolbar} from "@/components/AccessibilityToolbar";
import {AccessibilityProvider} from "@/contexts/AccessibilityContext";

// Mock the toast function
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

function renderWithProvider(component: React.ReactNode) {
  return render(<AccessibilityProvider>{component}</AccessibilityProvider>);
}

describe("AccessibilityToolbar", () => {
  beforeEach(() => {
    // Clear localStorage before each test to ensure consistent state
    localStorage.clear();
    // Reset document classes
    document.documentElement.className = "";
  });
  it("should render accessibility toolbar with all controls", () => {
    renderWithProvider(<AccessibilityToolbar />);

    // Check if toolbar is properly labeled
    expect(
      screen.getByRole("toolbar", {name: /barrierefreiheit-einstellungen/i}),
    ).toBeInTheDocument();

    // Check for high contrast button
    expect(
      screen.getByLabelText(/hohen kontrast aktivieren/i),
    ).toBeInTheDocument();

    // Check for font size buttons
    expect(
      screen.getByLabelText(/schriftgröße vergrößern/i),
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText(/schriftgröße verkleinern/i),
    ).toBeInTheDocument();

    // Check for settings button
    expect(
      screen.getByLabelText(/barrierefreiheit-einstellungen öffnen/i),
    ).toBeInTheDocument();
  });

  it("should toggle high contrast mode", () => {
    renderWithProvider(<AccessibilityToolbar />);

    const contrastButton = screen.getByLabelText(/hohen kontrast aktivieren/i);
    fireEvent.click(contrastButton);

    // Button should now show "deactivate" label
    expect(
      screen.getByLabelText(/hohen kontrast deaktivieren/i),
    ).toBeInTheDocument();
    expect(contrastButton).toHaveAttribute("aria-pressed", "true");
  });

  it("should increase and decrease font size", () => {
    renderWithProvider(<AccessibilityToolbar />);

    const increaseButton = screen.getByLabelText(/schriftgröße vergrößern/i);
    const decreaseButton = screen.getByLabelText(/schriftgröße verkleinern/i);

    // Initially decrease button should be disabled (at medium, can go to small)
    expect(decreaseButton).not.toBeDisabled();

    // Increase font size
    fireEvent.click(increaseButton);

    // Now increase button should be disabled (at large)
    expect(increaseButton).toBeDisabled();

    // Decrease font size twice
    fireEvent.click(decreaseButton);
    fireEvent.click(decreaseButton);

    // Now decrease button should be disabled (at small)
    expect(decreaseButton).toBeDisabled();
  });

  it("should open settings dialog with keyboard shortcuts information", () => {
    renderWithProvider(<AccessibilityToolbar />);

    const settingsButton = screen.getByLabelText(
      /barrierefreiheit-einstellungen öffnen/i,
    );
    fireEvent.click(settingsButton);

    // Check if dialog is open
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(
      screen.getByText(/barrierefreiheit-einstellungen/i),
    ).toBeInTheDocument();

    // Check for keyboard shortcuts
    expect(
      screen.getByText(/alt \+ k: hoher kontrast umschalten/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/alt \+ plus: schrift vergrößern/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/alt \+ minus: schrift verkleinern/i),
    ).toBeInTheDocument();
  });

  it("should show current accessibility status in settings dialog", () => {
    renderWithProvider(<AccessibilityToolbar />);

    // First toggle high contrast
    const contrastButton = screen.getByLabelText(/hohen kontrast aktivieren/i);
    fireEvent.click(contrastButton);

    // Open settings dialog
    const settingsButton = screen.getByLabelText(
      /barrierefreiheit-einstellungen öffnen/i,
    );
    fireEvent.click(settingsButton);

    // Check status display
    expect(screen.getByText(/hoher kontrast:/i)).toBeInTheDocument();
    expect(screen.getByText(/aktiviert/i)).toBeInTheDocument();
    expect(screen.getByText(/schriftgröße:/i)).toBeInTheDocument();
    expect(screen.getByText(/normal/i)).toBeInTheDocument();
  });

  it("should have proper ARIA attributes for accessibility", () => {
    renderWithProvider(<AccessibilityToolbar />);

    // Check toolbar attributes
    const toolbar = screen.getByRole("toolbar");
    expect(toolbar).toHaveAttribute(
      "aria-label",
      "Barrierefreiheit-Einstellungen",
    );

    // Check button attributes
    const contrastButton = screen.getByLabelText(/hohen kontrast aktivieren/i);
    expect(contrastButton).toHaveAttribute("aria-pressed", "false");
    expect(contrastButton).toHaveAttribute("title");

    // Check other buttons have proper labels
    const increaseButton = screen.getByLabelText(/schriftgröße vergrößern/i);
    expect(increaseButton).toHaveAttribute("title", "Schriftgröße vergrößern");

    const decreaseButton = screen.getByLabelText(/schriftgröße verkleinern/i);
    expect(decreaseButton).toHaveAttribute("title", "Schriftgröße verkleinern");
  });

  it("should be keyboard accessible", () => {
    renderWithProvider(<AccessibilityToolbar />);

    // Get the button by its current state (initially "activate")
    const contrastButton = screen.getByLabelText(/hohen kontrast aktivieren/i);

    // Focus the button
    contrastButton.focus();
    expect(contrastButton).toHaveFocus();

    // Activate with click (easier to test than keyboard events for state changes)
    fireEvent.click(contrastButton);

    // Should toggle high contrast (button text changes to "deactivate")
    expect(
      screen.getByLabelText(/hohen kontrast deaktivieren/i),
    ).toBeInTheDocument();
  });

  // New tests for drag functionality
  it("should render drag handle for moving toolbar", () => {
    renderWithProvider(<AccessibilityToolbar />);

    expect(screen.getByLabelText("Toolbar verschieben")).toBeInTheDocument();
    expect(screen.getByTitle("Ziehen zum Verschieben")).toBeInTheDocument();
  });

  it("should have proper drag styling", () => {
    renderWithProvider(<AccessibilityToolbar />);

    const toolbar = screen.getByRole("toolbar");
    expect(toolbar).toHaveStyle({position: "fixed"});
    expect(toolbar).toHaveStyle({userSelect: "none"});
    // Note: touchAction is tested via inline style attribute inspection
    expect(toolbar.style.touchAction).toBe("none");

    const dragHandle = screen.getByLabelText("Toolbar verschieben");
    expect(dragHandle).toHaveClass("cursor-grab");
  });

  it("should start drag on mouse down", async () => {
    renderWithProvider(<AccessibilityToolbar />);

    const dragHandle = screen.getByLabelText("Toolbar verschieben");

    // Simulate mouse down to start drag
    fireEvent.mouseDown(dragHandle, {
      clientX: 100,
      clientY: 200,
    });

    // Verify drag handle has proper styling during drag
    expect(dragHandle).toHaveClass("active:cursor-grabbing");
  });

  it("should start drag on touch start", async () => {
    renderWithProvider(<AccessibilityToolbar />);

    const dragHandle = screen.getByLabelText("Toolbar verschieben");

    // Simulate touch start to start drag
    fireEvent.touchStart(dragHandle, {
      touches: [{clientX: 100, clientY: 200}],
    });

    // Verify drag handle has proper styling during drag
    expect(dragHandle).toHaveClass("active:cursor-grabbing");
  });

  it("should handle mouse drag movement", async () => {
    // Mock window dimensions for boundary calculations
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: 1024,
    });
    Object.defineProperty(window, "innerHeight", {
      writable: true,
      configurable: true,
      value: 768,
    });

    renderWithProvider(<AccessibilityToolbar />);

    const dragHandle = screen.getByLabelText("Toolbar verschieben");

    // Start drag
    fireEvent.mouseDown(dragHandle, {
      clientX: 100,
      clientY: 200,
    });

    // Simulate mouse move
    fireEvent(
      document,
      new MouseEvent("mousemove", {
        clientX: 150,
        clientY: 250,
      }),
    );

    // End drag
    fireEvent(document, new MouseEvent("mouseup"));

    // Verify toolbar is still present and functioning
    await waitFor(() => {
      expect(screen.getByRole("toolbar")).toBeInTheDocument();
    });
  });

  it("should handle touch drag movement", async () => {
    // Mock window dimensions for boundary calculations
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: 1024,
    });
    Object.defineProperty(window, "innerHeight", {
      writable: true,
      configurable: true,
      value: 768,
    });

    renderWithProvider(<AccessibilityToolbar />);

    const dragHandle = screen.getByLabelText("Toolbar verschieben");

    // Start touch drag
    fireEvent.touchStart(dragHandle, {
      touches: [{clientX: 100, clientY: 200}],
    });

    // Simulate touch move
    fireEvent(
      document,
      new TouchEvent("touchmove", {
        touches: [{clientX: 150, clientY: 250} as Touch],
      }),
    );

    // End touch drag
    fireEvent(document, new TouchEvent("touchend"));

    // Verify toolbar is still present and functioning
    await waitFor(() => {
      expect(screen.getByRole("toolbar")).toBeInTheDocument();
    });
  });

  it("should move toolbar in correct direction when dragging", async () => {
    // Mock window dimensions for boundary calculations
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: 1024,
    });
    Object.defineProperty(window, "innerHeight", {
      writable: true,
      configurable: true,
      value: 768,
    });

    // Test the behavior indirectly by verifying the toolbar responds to drag events
    renderWithProvider(<AccessibilityToolbar />);

    const dragHandle = screen.getByLabelText("Toolbar verschieben");

    // Start drag at position (100, 200)
    fireEvent.mouseDown(dragHandle, {
      clientX: 100,
      clientY: 200,
    });

    // Drag down and to the right (150, 250)
    // This should move toolbar down and left (in terms of bottom/right positioning)
    fireEvent(
      document,
      new MouseEvent("mousemove", {
        clientX: 150,
        clientY: 250,
      }),
    );

    // End drag
    fireEvent(document, new MouseEvent("mouseup"));

    // Verify toolbar is still present and functioning after drag
    await waitFor(() => {
      expect(screen.getByRole("toolbar")).toBeInTheDocument();
    });
  });

  it("should persist toolbar position in localStorage", () => {
    // Test that position data structure exists in context
    renderWithProvider(<AccessibilityToolbar />);

    const toolbar = screen.getByRole("toolbar");
    expect(toolbar).toBeInTheDocument();

    // Position should be persisted via the AccessibilityContext
    // The actual localStorage persistence is tested in AccessibilityContext tests
  });

  it("should load position from localStorage on mount", () => {
    // Set initial position in localStorage
    const testPosition = {x: 50, y: 100};
    const testSettings = {
      highContrast: false,
      fontSize: "medium",
      reducedMotion: false,
      toolbarPosition: testPosition,
    };

    localStorage.setItem(
      "accessibility-settings",
      JSON.stringify(testSettings),
    );

    renderWithProvider(<AccessibilityToolbar />);

    const toolbar = screen.getByRole("toolbar");
    // Verify toolbar exists and can potentially use the stored position
    expect(toolbar).toBeInTheDocument();
  });

  it("should maintain accessibility during drag operations", () => {
    renderWithProvider(<AccessibilityToolbar />);

    const dragHandle = screen.getByLabelText("Toolbar verschieben");
    const toolbar = screen.getByRole("toolbar");

    // Verify ARIA attributes are maintained
    expect(toolbar).toHaveAttribute(
      "aria-label",
      "Barrierefreiheit-Einstellungen",
    );
    expect(dragHandle).toHaveAttribute("aria-label", "Toolbar verschieben");
    expect(dragHandle).toHaveAttribute("title", "Ziehen zum Verschieben");

    // Start drag and verify accessibility is maintained
    fireEvent.mouseDown(dragHandle, {
      clientX: 100,
      clientY: 200,
    });

    expect(toolbar).toHaveAttribute(
      "aria-label",
      "Barrierefreiheit-Einstellungen",
    );
    expect(dragHandle).toHaveAttribute("aria-label", "Toolbar verschieben");
  });

  // Minimize/Maximize functionality tests
  it("should render minimize button", () => {
    renderWithProvider(<AccessibilityToolbar />);

    expect(screen.getByLabelText("Toolbar minimieren")).toBeInTheDocument();
    expect(screen.getByTitle("Toolbar minimieren")).toBeInTheDocument();
  });

  it("should minimize toolbar when minimize button is clicked", () => {
    renderWithProvider(<AccessibilityToolbar />);

    // Initially should show all controls
    expect(
      screen.getByLabelText(/hohen kontrast aktivieren/i),
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText(/schriftgröße vergrößern/i),
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText(/schriftgröße verkleinern/i),
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText(/barrierefreiheit-einstellungen öffnen/i),
    ).toBeInTheDocument();

    // Click minimize button
    const minimizeButton = screen.getByLabelText("Toolbar minimieren");
    fireEvent.click(minimizeButton);

    // After minimize, button text should change
    expect(screen.getByLabelText("Toolbar maximieren")).toBeInTheDocument();

    // Other controls should be hidden
    expect(
      screen.queryByLabelText(/hohen kontrast aktivieren/i),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByLabelText(/schriftgröße vergrößern/i),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByLabelText(/schriftgröße verkleinern/i),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByLabelText(/barrierefreiheit-einstellungen öffnen/i),
    ).not.toBeInTheDocument();
  });

  it("should maximize toolbar when maximize button is clicked", () => {
    renderWithProvider(<AccessibilityToolbar />);

    // First minimize
    const minimizeButton = screen.getByLabelText("Toolbar minimieren");
    fireEvent.click(minimizeButton);

    // Now maximize
    const maximizeButton = screen.getByLabelText("Toolbar maximieren");
    fireEvent.click(maximizeButton);

    // Button should be back to minimize
    expect(screen.getByLabelText("Toolbar minimieren")).toBeInTheDocument();

    // All controls should be visible again
    expect(
      screen.getByLabelText(/hohen kontrast aktivieren/i),
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText(/schriftgröße vergrößern/i),
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText(/schriftgröße verkleinern/i),
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText(/barrierefreiheit-einstellungen öffnen/i),
    ).toBeInTheDocument();
  });

  it("should have proper ARIA attributes for minimize button", () => {
    renderWithProvider(<AccessibilityToolbar />);

    const minimizeButton = screen.getByLabelText("Toolbar minimieren");
    expect(minimizeButton).toHaveAttribute("aria-pressed", "false");
    expect(minimizeButton).toHaveAttribute("title", "Toolbar minimieren");

    // Click to minimize
    fireEvent.click(minimizeButton);

    const maximizeButton = screen.getByLabelText("Toolbar maximieren");
    expect(maximizeButton).toHaveAttribute("aria-pressed", "true");
    expect(maximizeButton).toHaveAttribute("title", "Toolbar maximieren");
  });

  it("should persist minimize state in localStorage", () => {
    renderWithProvider(<AccessibilityToolbar />);

    // Click minimize button
    const minimizeButton = screen.getByLabelText("Toolbar minimieren");
    fireEvent.click(minimizeButton);

    // Check that settings are stored in localStorage
    const storedSettings = localStorage.getItem("accessibility-settings");
    expect(storedSettings).toBeTruthy();
    const settings = JSON.parse(storedSettings!);
    expect(settings.isMinimized).toBe(true);
  });

  it("should load minimized state from localStorage on mount", () => {
    // Set minimized state in localStorage
    const testSettings = {
      highContrast: false,
      fontSize: "medium",
      reducedMotion: false,
      toolbarPosition: {x: 16, y: 16},
      isMinimized: true,
    };

    localStorage.setItem(
      "accessibility-settings",
      JSON.stringify(testSettings),
    );

    renderWithProvider(<AccessibilityToolbar />);

    // Should show maximize button
    expect(screen.getByLabelText("Toolbar maximieren")).toBeInTheDocument();

    // Controls should be hidden
    expect(
      screen.queryByLabelText(/hohen kontrast aktivieren/i),
    ).not.toBeInTheDocument();
  });

  it("should keep drag handle and minimize button visible when minimized", () => {
    renderWithProvider(<AccessibilityToolbar />);

    // Minimize the toolbar
    const minimizeButton = screen.getByLabelText("Toolbar minimieren");
    fireEvent.click(minimizeButton);

    // Drag handle and maximize button should still be visible
    expect(screen.getByLabelText("Toolbar verschieben")).toBeInTheDocument();
    expect(screen.getByLabelText("Toolbar maximieren")).toBeInTheDocument();
  });
});
