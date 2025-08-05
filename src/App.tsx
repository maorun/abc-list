import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  NavLink,
} from "react-router-dom";
import {List} from "./components/List/List";
import {ListItem} from "./components/List/ListItem";
import {Kawa} from "./components/Kawa/Kawa";
import {KawaItem} from "./components/Kawa/KawaItem";

function App() {
  const navLinkClasses =
    "text-white hover:bg-blue-700 px-3 py-2 rounded-md text-sm font-medium";
  const activeNavLinkClasses = "bg-blue-900";

  return (
    <Router>
      <div>
        <nav className="bg-blue-800">
          <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
            <div className="relative flex h-16 items-center justify-between">
              <div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
                <div className="flex-shrink-0 items-center text-white font-bold">
                  ABC-Listen App
                </div>
                <div className="hidden sm:ml-6 sm:block">
                  <div className="flex space-x-4">
                    <NavLink
                      to="/"
                      className={({isActive}) =>
                        isActive
                          ? `${navLinkClasses} ${activeNavLinkClasses}`
                          : navLinkClasses
                      }
                    >
                      Listen
                    </NavLink>
                    <NavLink
                      to="/kawa"
                      className={({isActive}) =>
                        isActive
                          ? `${navLinkClasses} ${activeNavLinkClasses}`
                          : navLinkClasses
                      }
                    >
                      Kawas
                    </NavLink>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </nav>
        <main className="p-4">
          <Routes>
            <Route path="/" element={<List />} />
            <Route path="/list/:item" element={<ListItem />} />
            <Route path="/kawa" element={<Kawa />} />
            <Route path="/kawa/:key" element={<KawaItem />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
