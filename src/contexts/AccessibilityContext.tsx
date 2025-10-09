import React, {createContext, useContext, useState, ReactNode} from "react";

interface AccessibilitySettings {
  highContrast: boolean;
  fontSize: "small" | "medium" | "large";
  reducedMotion: boolean;
  toolbarPosition: {
    x: number;
    y: number;
  };
  isMinimized: boolean;
}

interface AccessibilityContextType {
  settings: AccessibilitySettings;
  updateSettings: (newSettings: Partial<AccessibilitySettings>) => void;
  toggleHighContrast: () => void;
  increaseFontSize: () => void;
  decreaseFontSize: () => void;
  updateToolbarPosition: (x: number, y: number) => void;
  toggleMinimized: () => void;
}

const defaultSettings: AccessibilitySettings = {
  highContrast: false,
  fontSize: "medium",
  reducedMotion: false,
  toolbarPosition: {
    x: 16, // 16px from right (equivalent to right-4 in Tailwind)
    y: 16, // 16px from bottom (equivalent to bottom-4 in Tailwind)
  },
  isMinimized: false,
};

const AccessibilityContext = createContext<
  AccessibilityContextType | undefined
>(undefined);

export function AccessibilityProvider({children}: {children: ReactNode}) {
  const [settings, setSettings] = useState<AccessibilitySettings>(() => {
    // Load settings from localStorage or use defaults
    const stored = localStorage.getItem("accessibility-settings");
    return stored ? JSON.parse(stored) : defaultSettings;
  });

  const updateSettings = (newSettings: Partial<AccessibilitySettings>) => {
    const updated = {...settings, ...newSettings};
    setSettings(updated);
    localStorage.setItem("accessibility-settings", JSON.stringify(updated));

    // Apply settings to document
    applySettingsToDocument(updated);
  };

  const toggleHighContrast = () => {
    updateSettings({highContrast: !settings.highContrast});
  };

  const increaseFontSize = () => {
    const sizes: Array<"small" | "medium" | "large"> = [
      "small",
      "medium",
      "large",
    ];
    const currentIndex = sizes.indexOf(settings.fontSize);
    const nextIndex = Math.min(currentIndex + 1, sizes.length - 1);
    updateSettings({fontSize: sizes[nextIndex]});
  };

  const decreaseFontSize = () => {
    const sizes: Array<"small" | "medium" | "large"> = [
      "small",
      "medium",
      "large",
    ];
    const currentIndex = sizes.indexOf(settings.fontSize);
    const nextIndex = Math.max(currentIndex - 1, 0);
    updateSettings({fontSize: sizes[nextIndex]});
  };

  const updateToolbarPosition = (x: number, y: number) => {
    updateSettings({
      toolbarPosition: {x, y},
    });
  };

  const toggleMinimized = () => {
    updateSettings({isMinimized: !settings.isMinimized});
  };

  // Apply settings on mount
  React.useEffect(() => {
    applySettingsToDocument(settings);
  }, [settings]);

  return (
    <AccessibilityContext.Provider
      value={{
        settings,
        updateSettings,
        toggleHighContrast,
        increaseFontSize,
        decreaseFontSize,
        updateToolbarPosition,
        toggleMinimized,
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
}

function applySettingsToDocument(settings: AccessibilitySettings) {
  const root = document.documentElement;

  // Apply high contrast
  if (settings.highContrast) {
    root.classList.add("high-contrast");
  } else {
    root.classList.remove("high-contrast");
  }

  // Apply font size
  root.classList.remove("font-small", "font-medium", "font-large");
  root.classList.add(`font-${settings.fontSize}`);

  // Apply reduced motion
  if (settings.reducedMotion) {
    root.classList.add("reduced-motion");
  } else {
    root.classList.remove("reduced-motion");
  }
}

export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  if (context === undefined) {
    throw new Error(
      "useAccessibility must be used within an AccessibilityProvider",
    );
  }
  return context;
}
