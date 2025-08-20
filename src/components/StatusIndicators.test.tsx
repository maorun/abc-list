import React from "react";
import {render, screen} from "@testing-library/react";
import {StatusIndicators} from "./StatusIndicators";
import {CloudSyncProvider} from "../contexts/CloudSyncContext";
import {MemoryRouter} from "react-router-dom";

// Mock the child components to focus on StatusIndicators behavior
vi.mock("./CloudSync/CloudBackupManager", () => ({
  CloudBackupManager: () => (
    <div data-testid="cloud-backup-manager">CloudBackupManager</div>
  ),
}));

vi.mock("./CloudSync/CloudAuthButton", () => ({
  CloudAuthButton: () => (
    <div data-testid="cloud-auth-button">CloudAuthButton</div>
  ),
}));

vi.mock("./Gamification/GamificationStatusIndicator", () => ({
  GamificationStatusIndicator: ({onClick}: {onClick?: () => void}) => (
    <button
      type="button"
      data-testid="gamification-status"
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick?.();
        }
      }}
    >
      GamificationStatus
    </button>
  ),
}));

vi.mock("./OfflineStatusIndicator", () => ({
  OfflineStatusIcon: () => (
    <div data-testid="offline-status">OfflineStatus</div>
  ),
}));

vi.mock("./SyncStatusIndicator", () => ({
  SyncStatusIcon: () => <div data-testid="sync-status">SyncStatus</div>,
}));

vi.mock("./CloudSync/CloudSyncStatusIndicator", () => ({
  CloudSyncStatusIcon: () => (
    <div data-testid="cloud-sync-status">CloudSyncStatus</div>
  ),
}));

function TestWrapper({children}: {children: React.ReactNode}) {
  return (
    <MemoryRouter>
      <CloudSyncProvider>{children}</CloudSyncProvider>
    </MemoryRouter>
  );
}

describe("StatusIndicators", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("should render mobile layout when isMobile is true", () => {
    render(
      <TestWrapper>
        <StatusIndicators isMobile={true} />
      </TestWrapper>,
    );

    // Check for mobile-specific structure
    expect(screen.getByText("Status & Einstellungen")).toBeInTheDocument();
    expect(screen.getByText("Cloud & Backup")).toBeInTheDocument();
    expect(screen.getByText("Status")).toBeInTheDocument();

    // Verify all components are rendered
    expect(screen.getByTestId("cloud-backup-manager")).toBeInTheDocument();
    expect(screen.getByTestId("cloud-auth-button")).toBeInTheDocument();
    expect(screen.getByTestId("gamification-status")).toBeInTheDocument();
    expect(screen.getByTestId("offline-status")).toBeInTheDocument();
    expect(screen.getByTestId("sync-status")).toBeInTheDocument();
    expect(screen.getByTestId("cloud-sync-status")).toBeInTheDocument();
  });

  it("should render desktop layout when isMobile is false", () => {
    render(
      <TestWrapper>
        <StatusIndicators isMobile={false} />
      </TestWrapper>,
    );

    // Mobile headers should not be present
    expect(
      screen.queryByText("Status & Einstellungen"),
    ).not.toBeInTheDocument();
    expect(screen.queryByText("Cloud & Backup")).not.toBeInTheDocument();
    expect(screen.queryByText("Status")).not.toBeInTheDocument();

    // All components should still be rendered
    expect(screen.getByTestId("cloud-backup-manager")).toBeInTheDocument();
    expect(screen.getByTestId("cloud-auth-button")).toBeInTheDocument();
    expect(screen.getByTestId("gamification-status")).toBeInTheDocument();
    expect(screen.getByTestId("offline-status")).toBeInTheDocument();
    expect(screen.getByTestId("sync-status")).toBeInTheDocument();
    expect(screen.getByTestId("cloud-sync-status")).toBeInTheDocument();
  });

  it("should handle gamification click when provided", () => {
    const mockGamificationClick = vi.fn();

    render(
      <TestWrapper>
        <StatusIndicators
          isMobile={false}
          onGamificationClick={mockGamificationClick}
        />
      </TestWrapper>,
    );

    const gamificationStatus = screen.getByTestId("gamification-status");
    gamificationStatus.click();

    expect(mockGamificationClick).toHaveBeenCalledTimes(1);
  });

  it("should apply mobile-first responsive design classes", () => {
    const {container} = render(
      <TestWrapper>
        <StatusIndicators isMobile={true} />
      </TestWrapper>,
    );

    // Check for mobile-first responsive classes with compact spacing
    const mobileContainer = container.querySelector(".space-y-2");
    expect(mobileContainer).toBeInTheDocument();

    const flexContainer = container.querySelector(".flex.flex-col.gap-1");
    expect(flexContainer).toBeInTheDocument();
  });

  it("should apply proper desktop grouping with separators", () => {
    const {container} = render(
      <TestWrapper>
        <StatusIndicators isMobile={false} />
      </TestWrapper>,
    );

    // Check for desktop layout with separators
    const desktopContainer = container.querySelector(
      ".flex.items-center.gap-3",
    );
    expect(desktopContainer).toBeInTheDocument();

    const separators = container.querySelectorAll(".border-r");
    expect(separators.length).toBeGreaterThan(0);
  });
});
