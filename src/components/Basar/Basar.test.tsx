import {
  describe,
  it,
  expect,
  beforeEach,
  vi,
  type MockedFunction,
} from "vitest";
import type {Mock} from "vitest";
import {render, screen, fireEvent, waitFor} from "@testing-library/react";
import {BrowserRouter} from "react-router-dom";
import {Basar} from "./Basar";
import {BasarService} from "./BasarService";
import * as useUnifiedProfileModule from "../../hooks/useUnifiedProfile";

// Mock the unified profile hook module
vi.mock("../../hooks/useUnifiedProfile");

// Mock the BasarService
vi.mock("./BasarService");

// Mock the UnifiedUserProfile component
vi.mock("../Profile/UnifiedUserProfile", () => ({
  UnifiedUserProfile: ({
    showCreateProfile,
    setShowCreateProfile,
  }: {
    showCreateProfile: boolean;
    setShowCreateProfile: (show: boolean) => void;
  }) => {
    if (showCreateProfile) {
      return (
        <div data-testid="unified-user-profile">
          <button>Mit Google anmelden</button>
          <button>Manuell erstellen</button>
          <div>Unified Profile Component</div>
        </div>
      );
    }
    return (
      <div data-testid="unified-user-profile">
        <div>Test User</div>
        <div>Mitglied seit 2024-01-01</div>
        <div>Profile View</div>
      </div>
    );
  },
}));

interface MockBasarService {
  getInstance: MockedFunction<() => MockBasarService>;
  initializeSampleData: Mock;
  getCurrentUser: Mock;
  getMarketplaceTerms: Mock;
  buyTerm: Mock;
  rateTerm: Mock;
  addTermToMarketplace: Mock;
  getUserRating: Mock;
}

const mockBasarService: MockBasarService = {
  getInstance: vi.fn(),
  initializeSampleData: vi.fn(),
  getCurrentUser: vi.fn(),
  getMarketplaceTerms: vi.fn(() => []),
  buyTerm: vi.fn(),
  rateTerm: vi.fn(),
  addTermToMarketplace: vi.fn(),
  getUserRating: vi.fn(),
};

mockBasarService.getInstance.mockReturnValue(mockBasarService);

const renderBasar = () => {
  return render(
    <BrowserRouter>
      <Basar />
    </BrowserRouter>,
  );
};

const createMockUnifiedProfile = () => ({
  profile: {
    id: "test-user-1",
    displayName: "Test User",
    joinDate: "2024-01-01",
    lastActive: "2024-01-01",
    auth: {
      provider: "manual" as const,
      lastLogin: "2024-01-01",
      isVerified: false,
    },
    community: {
      bio: "",
      expertise: [],
      mentorAvailable: false,
      menteeInterested: false,
      reputation: 0,
      contributionCount: 0,
      helpfulReviews: 0,
    },
    trading: {
      points: 150,
      level: 2,
      tradesCompleted: 0,
      termsContributed: 0,
      averageRating: 0,
      achievements: [],
      tradingHistory: [],
    },
    version: 1,
    migrated: false,
  },
  isLoading: false,
  isAuthenticated: true,
  createProfile: vi.fn(),
  updateProfile: vi.fn(),
  signInWithGoogle: vi.fn(),
  signOut: vi.fn(),
});

describe("Basar", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Setup default mock returns
    (
      BasarService.getInstance as MockedFunction<
        typeof BasarService.getInstance
      >
    ).mockReturnValue(mockBasarService);
  });

  it("renders user setup dialog when no profile exists", () => {
    // Mock no profile
    vi.spyOn(useUnifiedProfileModule, "useUnifiedProfile").mockReturnValue({
      profile: null,
      isLoading: false,
      isAuthenticated: false,
      createProfile: vi.fn(),
      updateProfile: vi.fn(),
      signInWithGoogle: vi.fn(),
      signOut: vi.fn(),
      migrateLegacyProfiles: vi.fn(),
    });

    renderBasar();

    expect(
      screen.getByText("🏪 Willkommen im ABC-Listen Basar!"),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Erstellen Sie Ihr Händlerprofil, um am Wissensaustausch teilzunehmen.",
      ),
    ).toBeInTheDocument();
    // Should now show unified profile creation interface
    expect(
      screen.getByTestId("unified-user-profile"),
    ).toBeInTheDocument();
  });

  it("renders marketplace when profile exists", () => {
    const mockProfile = {
      id: "user1",
      displayName: "Test User",
      trading: {
        points: 150,
        level: 2,
      },
    };

    // Mock profile exists
    vi.spyOn(useUnifiedProfileModule, "useUnifiedProfile").mockReturnValue({
      profile: mockProfile,
      isLoading: false,
      isAuthenticated: true,
      createProfile: vi.fn(),
      updateProfile: vi.fn(),
      signInWithGoogle: vi.fn(),
      signOut: vi.fn(),
      migrateLegacyProfiles: vi.fn(),
    });

    renderBasar();

    expect(screen.getByText("🏪 ABC-Listen Basar")).toBeInTheDocument();
    expect(screen.getByText("Test User")).toBeInTheDocument();
    expect(screen.getByText("💰 150 Punkte")).toBeInTheDocument();
    expect(screen.getByText("📈 Level 2")).toBeInTheDocument();
  });

  it("shows unified profile creation interface when no profile exists", async () => {
    const mockCreateProfile = vi.fn();
    const mockSignInWithGoogle = vi.fn();

    // Mock no profile initially
    vi.spyOn(useUnifiedProfileModule, "useUnifiedProfile").mockReturnValue({
      profile: null,
      isLoading: false,
      isAuthenticated: false,
      createProfile: mockCreateProfile,
      updateProfile: vi.fn(),
      signInWithGoogle: mockSignInWithGoogle,
      signOut: vi.fn(),
      migrateLegacyProfiles: vi.fn(),
    });

    renderBasar();

    // Should show the unified profile component
    expect(screen.getByTestId("unified-user-profile")).toBeInTheDocument();
  });

  it("displays marketplace terms when available", () => {
    // Mock unified profile for marketplace access
    vi.spyOn(useUnifiedProfileModule, "useUnifiedProfile").mockReturnValue(
      createMockUnifiedProfile(),
    );

    const mockUser = {
      id: "user1",
      name: "Test User",
      points: 100,
      level: 1,
      joinDate: "2024-01-01",
      tradesCompleted: 0,
      termsContributed: 0,
      averageRating: 0,
      achievements: [],
      tradingHistory: [],
    };

    const mockTerms = [
      {
        id: "term1",
        text: "Test Term",
        explanation: "Test explanation",
        letter: "t",
        listName: "Test List",
        sellerId: "seller1",
        sellerName: "Seller",
        price: 15,
        quality: 4.5,
        ratingCount: 2,
        dateAdded: "2024-01-01",
        version: 1,
        imported: false,
      },
    ];

    mockBasarService.getCurrentUser.mockReturnValue(mockUser);
    mockBasarService.getMarketplaceTerms.mockReturnValue(mockTerms);

    renderBasar();

    expect(screen.getByText("Test Term")).toBeInTheDocument();
    expect(screen.getByText('aus "Test List"')).toBeInTheDocument();
  });

  it("filters terms by search input", async () => {
    // Mock unified profile for marketplace access
    vi.spyOn(useUnifiedProfileModule, "useUnifiedProfile").mockReturnValue(
      createMockUnifiedProfile(),
    );

    const mockUser = {
      id: "user1",
      name: "Test User",
      points: 100,
      level: 1,
      joinDate: "2024-01-01",
      tradesCompleted: 0,
      termsContributed: 0,
      averageRating: 0,
      achievements: [],
      tradingHistory: [],
    };

    const mockTerms = [
      {
        id: "term1",
        text: "Algorithm",
        explanation: "Step by step instructions",
        letter: "a",
        listName: "Computer Science",
        sellerId: "seller1",
        sellerName: "Seller",
        price: 15,
        quality: 4.5,
        ratingCount: 2,
        dateAdded: "2024-01-01",
        version: 1,
        imported: false,
      },
      {
        id: "term2",
        text: "Biology",
        explanation: "Study of life",
        letter: "b",
        listName: "Science",
        sellerId: "seller1",
        sellerName: "Seller",
        price: 10,
        quality: 4.0,
        ratingCount: 1,
        dateAdded: "2024-01-01",
        version: 1,
        imported: false,
      },
    ];

    mockBasarService.getCurrentUser.mockReturnValue(mockUser);
    mockBasarService.getMarketplaceTerms.mockReturnValue(mockTerms);

    renderBasar();

    // Both terms should be visible initially
    expect(screen.getByText("Algorithm")).toBeInTheDocument();
    expect(screen.getByText("Biology")).toBeInTheDocument();

    // Filter by search term
    const searchInput = screen.getByPlaceholderText(
      "Begriff, Erklärung oder Liste...",
    );
    fireEvent.change(searchInput, {target: {value: "Algorithm"}});

    await waitFor(() => {
      expect(screen.getByText("Algorithm")).toBeInTheDocument();
      expect(screen.queryByText("Biology")).not.toBeInTheDocument();
    });
  });

  it("switches between marketplace and profile tabs", () => {
    // Mock unified profile for marketplace access
    vi.spyOn(useUnifiedProfileModule, "useUnifiedProfile").mockReturnValue(
      createMockUnifiedProfile(),
    );

    const mockUser = {
      id: "user1",
      name: "Test User",
      points: 100,
      level: 1,
      joinDate: "2024-01-01",
      tradesCompleted: 0,
      termsContributed: 0,
      averageRating: 0,
      achievements: [],
      tradingHistory: [],
    };

    mockBasarService.getCurrentUser.mockReturnValue(mockUser);

    renderBasar();

    // Should start on marketplace tab
    expect(screen.getByText("🔍 Begriff suchen")).toBeInTheDocument();

    // Switch to profile tab
    const profileButton = screen.getByText("👤 Profil");
    fireEvent.click(profileButton);

    // Check that we're now in the profile view (profile view should show more elements)
    expect(screen.getAllByText("Test User")).toHaveLength(2); // Header + profile
    expect(screen.getByText(/Mitglied seit/)).toBeInTheDocument();
  });
});
