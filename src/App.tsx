import React, {useState} from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  NavLink,
  useLocation,
} from "react-router-dom";
import {Toaster} from "sonner";
import {Menu} from "lucide-react";
import {Button} from "./components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./components/ui/sheet";
import {AccessibilityProvider} from "./contexts/AccessibilityContext";
import {AccessibilityToolbar} from "./components/AccessibilityToolbar";
import {PWAProvider} from "./contexts/PWAContext";
import {CloudSyncProvider} from "./contexts/CloudSyncContext";
import {PWAInstallPrompt} from "./components/PWAInstallPrompt";
import {OfflineStatusIndicator} from "./components/OfflineStatusIndicator";
import {SyncStatusIndicator} from "./components/SyncStatusIndicator";
import {useKeyboardNavigation} from "./hooks/useKeyboardNavigation";
import {List} from "./components/List/List";
import {ListItem} from "./components/List/ListItem";
import {MultiColumnList} from "./components/List/MultiColumnList";
import {MultiColumnListItem} from "./components/List/MultiColumnListItem";
import {Kawa} from "./components/Kawa/Kawa";
import {KawaItem} from "./components/Kawa/KawaItem";
import {Kaga} from "./components/Kaga/Kaga";
import {KagaItem} from "./components/Kaga/KagaItem";
import {LinkLists} from "./components/LinkLists/LinkLists";
import {StadtLandFluss} from "./components/StadtLandFluss/StadtLandFluss";
import {StadtLandFlussGame} from "./components/StadtLandFluss/StadtLandFlussGame";
import {Analytics} from "./components/Analytics/Analytics";
import {SokratesCheck} from "./components/SokratesCheck/SokratesCheck";
import {Basar} from "./components/Basar/Basar";
import {GamificationDashboard} from "./components/Gamification/GamificationDashboard";
import {SearchAndFilter} from "./components/Search/SearchAndFilter";
import {Community} from "./components/Community/Community";
import {StatusIndicators} from "./components/StatusIndicators";
import {CloudSyncStatusIndicator} from "./components/CloudSync/CloudSyncStatusIndicator";

// Extract navigation items to prevent recreation on every render
const navigationItems = [
  {to: "/", label: "Listen", description: "ABC-Listen erstellen und verwalten"},
  {
    to: "/search",
    label: "Suchen",
    description: "Umfassende Suche und Filter",
  },
  {
    to: "/link",
    label: "Verknüpfen",
    description: "Listen miteinander verknüpfen",
  },
  {to: "/kawa", label: "Kawas", description: "Wort-Assoziationen erstellen"},
  {
    to: "/kaga",
    label: "KaGa",
    description: "Grafische Assoziationen erstellen",
  },
  {to: "/slf", label: "Stadt-Land-Fluss", description: "Lernspiel spielen"},
  {to: "/basar", label: "Basar", description: "Listen teilen und entdecken"},
  {
    to: "/community",
    label: "Community",
    description: "Community Hub und Mentoring",
  },
  {to: "/sokrates", label: "Sokrates-Check", description: "Lernerfolg prüfen"},
  {
    to: "/gamification",
    label: "Erfolge",
    description: "Gamification Dashboard",
  },
  {
    to: "/analytics",
    label: "Analytics",
    description: "Lernstatistiken anzeigen",
  },
] as const;

// Extract NavButton interface outside component
interface NavButtonProps {
  to: string;
  children: React.ReactNode;
  onClick: () => void;
  isActive: boolean;
  description: string;
}

// Extract NavButton component completely outside to eliminate function recreation
const NavButton = React.memo(function NavButton({
  to,
  children,
  onClick,
  isActive,
  description,
}: NavButtonProps) {
  return (
    <NavLink to={to} onClick={onClick}>
      <Button
        variant={isActive ? "secondary" : "ghost"}
        className={`w-full justify-start hover:text-slate-900 sm:w-auto sm:justify-center ${
          isActive ? "text-black" : "text-white"
        }`}
        aria-label={`${children} - ${description}`}
        aria-current={isActive ? "page" : undefined}
      >
        {children}
      </Button>
    </NavLink>
  );
});

// Extract handler functions outside Navigation component to prevent recreation
const createCloseHandler = (setIsOpen: (open: boolean) => void) => () =>
  setIsOpen(false);
const noOpHandler = () => {};

function Navigation() {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  // Extract handlers to stable references
  const closeNavigation = createCloseHandler(setIsOpen);
  const currentPath = location.pathname;

  return (
    <nav
      className="bg-blue-800 sticky top-0 z-50"
      role="navigation"
      aria-label="Hauptnavigation"
    >
      {/* Skip navigation link */}
      <a
        href="#main-content"
        className="skip-link"
        aria-label="Springe zum Hauptinhalt"
      >
        Zum Hauptinhalt springen
      </a>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative flex h-16 items-center justify-between">
          {/* Mobile-first: Logo + Hamburger */}
          <div className="flex items-center justify-between w-full sm:w-auto">
            <h1 className="flex-shrink-0 text-white font-bold text-lg">
              ABC-Listen App
            </h1>

            {/* Mobile hamburger menu */}
            <div className="sm:hidden">
              <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white hover:text-slate-900"
                    aria-label="Navigation öffnen"
                    aria-expanded={isOpen}
                    aria-controls="mobile-navigation"
                  >
                    <Menu className="h-6 w-6" />
                    <span className="sr-only">Navigation öffnen</span>
                  </Button>
                </SheetTrigger>
                <SheetContent
                  id="mobile-navigation"
                  side="right"
                  className="w-3/5 max-w-xs bg-blue-800 border-blue-700 overflow-hidden flex flex-col"
                  role="dialog"
                  aria-label="Navigationsmenü"
                >
                  <SheetHeader className="flex-shrink-0">
                    <SheetTitle className="text-white text-left">
                      Navigation
                    </SheetTitle>
                  </SheetHeader>

                  {/* Scrollable content container */}
                  <div className="flex-1 overflow-y-auto">
                    <nav
                      className="flex flex-col space-y-1 mt-4"
                      role="list"
                      aria-label="Hauptnavigation"
                    >
                      {navigationItems.map((item) => (
                        <div key={item.to} role="listitem">
                          <NavButton
                            to={item.to}
                            isActive={currentPath === item.to}
                            onClick={closeNavigation}
                            description={item.description}
                          >
                            {item.label}
                          </NavButton>
                        </div>
                      ))}
                    </nav>

                    {/* Mobile Status Indicators */}
                    <StatusIndicators isMobile={true} />
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>

          {/* Desktop navigation */}
          <div className="hidden sm:ml-6 sm:flex sm:items-center sm:gap-4">
            <div
              className="flex space-x-2"
              role="list"
              aria-label="Hauptnavigation"
            >
              {navigationItems.map((item) => (
                <div key={item.to} role="listitem">
                  <NavButton
                    to={item.to}
                    isActive={currentPath === item.to}
                    onClick={noOpHandler}
                    description={item.description}
                  >
                    {item.label}
                  </NavButton>
                </div>
              ))}
            </div>

            {/* Desktop Status Indicators */}
            <StatusIndicators isMobile={false} />
          </div>
        </div>
      </div>
    </nav>
  );
}

function AppContent() {
  // Enable keyboard navigation
  useKeyboardNavigation();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <OfflineStatusIndicator />
      <main
        id="main-content"
        className="p-4 sm:p-6 lg:p-8"
        role="main"
        aria-label="Hauptinhalt"
      >
        <div className="mx-auto max-w-7xl">
          <Routes>
            <Route path="/" element={<List />} />
            <Route path="/list/:item" element={<ListItem />} />
            <Route path="/multi-list" element={<MultiColumnList />} />
            <Route path="/multi-list/:item" element={<MultiColumnListItem />} />
            <Route path="/search" element={<SearchAndFilter />} />
            <Route path="/link" element={<LinkLists />} />
            <Route path="/kawa" element={<Kawa />} />
            <Route path="/kawa/:key" element={<KawaItem />} />
            <Route path="/kaga" element={<Kaga />} />
            <Route path="/kaga/:key" element={<KagaItem />} />
            <Route path="/slf" element={<StadtLandFluss />} />
            <Route path="/slf/:game" element={<StadtLandFlussGame />} />
            <Route path="/basar" element={<Basar />} />
            <Route path="/community" element={<Community />} />
            <Route path="/sokrates" element={<SokratesCheck />} />
            <Route path="/gamification" element={<GamificationDashboard />} />
            <Route path="/analytics" element={<Analytics />} />
          </Routes>
        </div>
      </main>
      <AccessibilityToolbar />
      <PWAInstallPrompt />
      <SyncStatusIndicator />
      <CloudSyncStatusIndicator />
      <Toaster />
    </div>
  );
}

function App() {
  return (
    <PWAProvider>
      <CloudSyncProvider>
        <AccessibilityProvider>
          <Router>
            <AppContent />
          </Router>
        </AccessibilityProvider>
      </CloudSyncProvider>
    </PWAProvider>
  );
}

export default App;
