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

function Navigation() {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const navigationItems = [
    {to: "/", label: "Listen"},
    {to: "/link", label: "Verknüpfen"},
    {to: "/kawa", label: "Kawas"},
    {to: "/kaga", label: "KaGa"},
    {to: "/slf", label: "Stadt-Land-Fluss"},
    {to: "/basar", label: "Basar"},
    {to: "/sokrates", label: "Sokrates-Check"},
    {to: "/analytics", label: "Analytics"},
  ];

  const NavButton = ({
    to,
    children,
    onClick,
  }: {
    to: string;
    children: React.ReactNode;
    onClick?: () => void;
  }) => (
    <NavLink to={to} onClick={onClick}>
      <Button
        variant={location.pathname === to ? "secondary" : "ghost"}
        className="w-full justify-start text-white hover:text-slate-900 sm:w-auto sm:justify-center"
      >
        {children}
      </Button>
    </NavLink>
  );

  return (
    <nav className="bg-blue-800">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative flex h-16 items-center justify-between">
          {/* Mobile-first: Logo + Hamburger */}
          <div className="flex items-center justify-between w-full sm:w-auto">
            <div className="flex-shrink-0 text-white font-bold text-lg">
              ABC-Listen App
            </div>

            {/* Mobile hamburger menu */}
            <div className="sm:hidden">
              <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white hover:text-slate-900"
                  >
                    <Menu className="h-6 w-6" />
                    <span className="sr-only">Navigation öffnen</span>
                  </Button>
                </SheetTrigger>
                <SheetContent
                  side="right"
                  className="w-3/5 max-w-xs bg-blue-800 border-blue-700"
                >
                  <SheetHeader>
                    <SheetTitle className="text-white text-left">
                      Navigation
                    </SheetTitle>
                  </SheetHeader>
                  <div className="flex flex-col space-y-2 mt-6">
                    {navigationItems.map((item) => (
                      <NavButton
                        key={item.to}
                        to={item.to}
                        onClick={() => setIsOpen(false)}
                      >
                        {item.label}
                      </NavButton>
                    ))}
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>

          {/* Desktop navigation */}
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            <div className="flex space-x-2">
              {navigationItems.map((item) => (
                <NavButton key={item.to} to={item.to}>
                  {item.label}
                </NavButton>
              ))}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <main className="p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">
            <Routes>
              <Route path="/" element={<List />} />
              <Route path="/list/:item" element={<ListItem />} />
              <Route path="/multi-list" element={<MultiColumnList />} />
              <Route
                path="/multi-list/:item"
                element={<MultiColumnListItem />}
              />
              <Route path="/link" element={<LinkLists />} />
              <Route path="/kawa" element={<Kawa />} />
              <Route path="/kawa/:key" element={<KawaItem />} />
              <Route path="/kaga" element={<Kaga />} />
              <Route path="/kaga/:key" element={<KagaItem />} />
              <Route path="/slf" element={<StadtLandFluss />} />
              <Route path="/slf/:game" element={<StadtLandFlussGame />} />
              <Route path="/basar" element={<Basar />} />
              <Route path="/sokrates" element={<SokratesCheck />} />
              <Route path="/analytics" element={<Analytics />} />
            </Routes>
          </div>
        </main>
        <Toaster />
      </div>
    </Router>
  );
}

export default App;
