import {useEffect} from "react";
import {useAccessibility} from "@/contexts/AccessibilityContext";

export function useKeyboardNavigation() {
  const {toggleHighContrast, increaseFontSize, decreaseFontSize} =
    useAccessibility();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Only handle Alt + key combinations for accessibility
      if (!event.altKey) return;

      switch (event.key) {
        case "k":
        case "K":
          event.preventDefault();
          toggleHighContrast();
          break;
        case "+":
        case "=": // + key without shift
          event.preventDefault();
          increaseFontSize();
          break;
        case "-":
        case "_": // - key without shift
          event.preventDefault();
          decreaseFontSize();
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [toggleHighContrast, increaseFontSize, decreaseFontSize]);

  // Helper function to handle focus management
  const focusFirstElement = (container: HTMLElement) => {
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );
    const firstElement = focusableElements[0] as HTMLElement;
    firstElement?.focus();
  };

  const focusLastElement = (container: HTMLElement) => {
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );
    const lastElement = focusableElements[
      focusableElements.length - 1
    ] as HTMLElement;
    lastElement?.focus();
  };

  return {
    focusFirstElement,
    focusLastElement,
  };
}
