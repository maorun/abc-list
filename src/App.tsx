import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  NavLink,
  useLocation,
} from "react-router-dom";
import {Toaster} from "sonner";
import {Button} from "./components/ui/button";
import {List} from "./components/List/List";
import {ListItem} from "./components/List/ListItem";
import {Kawa} from "./components/Kawa/Kawa";
import {KawaItem} from "./components/Kawa/KawaItem";
import {Kaga} from "./components/Kaga/Kaga";
import {KagaItem} from "./components/Kaga/KagaItem";
import {LinkLists} from "./components/LinkLists/LinkLists";
import {StadtLandFluss} from "./components/StadtLandFluss/StadtLandFluss";
import {StadtLandFlussGame} from "./components/StadtLandFluss/StadtLandFlussGame";
import {Analytics} from "./components/Analytics/Analytics";

function Navigation() {
  const location = useLocation();

  const NavButton = ({to, children}: {to: string; children: React.ReactNode}) => (
    <NavLink to={to}>
      <Button
        variant={location.pathname === to ? "secondary" : "ghost"}
        className="text-white hover:text-slate-900"
      >
        {children}
      </Button>
    </NavLink>
  );

  return (
    <nav className="bg-blue-800">
      <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
        <div className="relative flex h-16 items-center justify-between">
          <div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
            <div className="flex-shrink-0 items-center text-white font-bold">
              ABC-Listen App
            </div>
            <div className="hidden sm:ml-6 sm:block">
              <div className="flex space-x-4">
                <NavButton to="/">Listen</NavButton>
                <NavButton to="/link">Verknüpfen</NavButton>
                <NavButton to="/kawa">Kawas</NavButton>
                <NavButton to="/kaga">KaGa</NavButton>
                <NavButton to="/slf">Stadt-Land-Fluss</NavButton>
                <NavButton to="/analytics">Analytics</NavButton>
              </div>
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
      <div>
        <Navigation />
        <main className="p-4">
          <Routes>
            <Route path="/" element={<List />} />
            <Route path="/list/:item" element={<ListItem />} />
            <Route path="/link" element={<LinkLists />} />
            <Route path="/kawa" element={<Kawa />} />
            <Route path="/kawa/:key" element={<KawaItem />} />
            <Route path="/kaga" element={<Kaga />} />
            <Route path="/kaga/:key" element={<KagaItem />} />
            <Route path="/slf" element={<StadtLandFluss />} />
            <Route path="/slf/:game" element={<StadtLandFlussGame />} />
            <Route path="/analytics" element={<Analytics />} />
          </Routes>
        </main>
        <Toaster />
      </div>
    </Router>
  );
}

export default App;
