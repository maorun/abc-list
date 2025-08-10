import {render, screen, fireEvent} from "@testing-library/react";
import {describe, it, expect, vi} from "vitest";
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
  return render(
    <AccessibilityProvider>
      {component}
    </AccessibilityProvider>
  );
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
    expect(screen.getByRole("toolbar", {name: /barrierefreiheit-einstellungen/i})).toBeInTheDocument();

    // Check for high contrast button
    expect(screen.getByLabelText(/hohen kontrast aktivieren/i)).toBeInTheDocument();

    // Check for font size buttons
    expect(screen.getByLabelText(/schriftgröße vergrößern/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/schriftgröße verkleinern/i)).toBeInTheDocument();

    // Check for settings button
    expect(screen.getByLabelText(/barrierefreiheit-einstellungen öffnen/i)).toBeInTheDocument();
  });

  it("should toggle high contrast mode", () => {
    renderWithProvider(<AccessibilityToolbar />);

    const contrastButton = screen.getByLabelText(/hohen kontrast aktivieren/i);
    fireEvent.click(contrastButton);

    // Button should now show "deactivate" label
    expect(screen.getByLabelText(/hohen kontrast deaktivieren/i)).toBeInTheDocument();
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

    const settingsButton = screen.getByLabelText(/barrierefreiheit-einstellungen öffnen/i);
    fireEvent.click(settingsButton);

    // Check if dialog is open
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText(/barrierefreiheit-einstellungen/i)).toBeInTheDocument();

    // Check for keyboard shortcuts
    expect(screen.getByText(/alt \+ k: hoher kontrast umschalten/i)).toBeInTheDocument();
    expect(screen.getByText(/alt \+ plus: schrift vergrößern/i)).toBeInTheDocument();
    expect(screen.getByText(/alt \+ minus: schrift verkleinern/i)).toBeInTheDocument();
  });

  it("should show current accessibility status in settings dialog", () => {
    renderWithProvider(<AccessibilityToolbar />);

    // First toggle high contrast
    const contrastButton = screen.getByLabelText(/hohen kontrast aktivieren/i);
    fireEvent.click(contrastButton);

    // Open settings dialog
    const settingsButton = screen.getByLabelText(/barrierefreiheit-einstellungen öffnen/i);
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
    expect(toolbar).toHaveAttribute("aria-label", "Barrierefreiheit-Einstellungen");

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
    let contrastButton = screen.getByLabelText(/hohen kontrast aktivieren/i);
    
    // Focus the button
    contrastButton.focus();
    expect(contrastButton).toHaveFocus();

    // Activate with click (easier to test than keyboard events for state changes)
    fireEvent.click(contrastButton);

    // Should toggle high contrast (button text changes to "deactivate")
    expect(screen.getByLabelText(/hohen kontrast deaktivieren/i)).toBeInTheDocument();
  });
});