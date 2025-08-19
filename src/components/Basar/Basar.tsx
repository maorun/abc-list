import React, {useState, useEffect, useCallback} from "react";
import {toast} from "sonner";
import {Button} from "../ui/button";
import {Input} from "../ui/input";
import {BasarService} from "./BasarService";
import {MarketplaceTerm} from "./types";
import {BasarTermCard} from "./BasarTermCard";
import {useUnifiedProfile} from "../../hooks/useUnifiedProfile";
import {UnifiedUserProfile} from "../Profile/UnifiedUserProfile";

export function Basar() {
  const [marketplaceTerms, setMarketplaceTerms] = useState<MarketplaceTerm[]>(
    [],
  );
  const [filteredTerms, setFilteredTerms] = useState<MarketplaceTerm[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLetter, setSelectedLetter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"date" | "price" | "quality">("date");
  const [showUserSetup, setShowUserSetup] = useState(false);
  const [activeTab, setActiveTab] = useState<"marketplace" | "profile">(
    "marketplace",
  );

  // Use unified profile system
  const {profile: userProfile} = useUnifiedProfile();
  const basarService = BasarService.getInstance();

  const loadMarketplaceTerms = useCallback(() => {
    const terms = basarService.getMarketplaceTerms();
    setMarketplaceTerms(terms);
  }, [basarService]);

  const filterTerms = useCallback(() => {
    let filtered = [...marketplaceTerms];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (term) =>
          term.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
          term.explanation?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          term.listName.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    // Filter by letter
    if (selectedLetter !== "all") {
      filtered = filtered.filter((term) => term.letter === selectedLetter);
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "price":
          return a.price - b.price;
        case "quality":
          return b.quality - a.quality;
        case "date":
        default:
          return (
            new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime()
          );
      }
    });

    setFilteredTerms(filtered);
  }, [marketplaceTerms, searchTerm, selectedLetter, sortBy]);

  const initializeData = useCallback(() => {
    basarService.initializeSampleData();

    // Check if user profile exists, if not show setup
    if (!userProfile) {
      setShowUserSetup(true);
    }

    loadMarketplaceTerms();
  }, [basarService, loadMarketplaceTerms, userProfile]);

  useEffect(() => {
    initializeData();
  }, [initializeData]);

  useEffect(() => {
    filterTerms();
  }, [filterTerms]);

  const handleBuyTerm = (termId: string) => {
    if (!userProfile) return;

    const success = basarService.buyTerm(termId);
    if (success) {
      loadMarketplaceTerms();
      toast.success(
        "Begriff erfolgreich gekauft! Er wurde zu 'Marketplace Käufe' hinzugefügt.",
      );
    } else {
      toast.error("Kauf fehlgeschlagen. Überprüfen Sie Ihre Punkte.");
    }
  };

  const handleRateTerm = (termId: string, rating: number, comment?: string) => {
    if (!userProfile) return;

    const success = basarService.rateTerm(termId, rating, comment);
    if (success) {
      loadMarketplaceTerms();
      toast.success("Bewertung abgegeben!");
    } else {
      toast.error("Bewertung fehlgeschlagen");
    }
  };

  const alphabet = Array.from({length: 26}, (_, i) =>
    String.fromCharCode(97 + i),
  );

  if (showUserSetup) {
    return (
      <div className="p-4 max-w-2xl mx-auto">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold mb-2">
            🏪 Willkommen im ABC-Listen Basar!
          </h1>
          <p className="text-gray-600">
            Erstellen Sie Ihr Händlerprofil, um am Wissensaustausch
            teilzunehmen.
          </p>
        </div>

        <div className="mb-6 text-sm text-gray-600 bg-blue-50 p-4 rounded-lg">
          <p className="font-medium text-blue-800 mb-2">
            🎯 Im Basar können Sie:
          </p>
          <ul className="list-disc list-inside space-y-1 text-blue-700">
            <li>Begriffe aus Ihren ABC-Listen verkaufen</li>
            <li>Hochwertige Begriffe von anderen kaufen</li>
            <li>Begriffe bewerten und kommentieren</li>
            <li>Punkte sammeln und Achievements freischalten</li>
          </ul>
          <p className="mt-2 text-xs text-blue-600">
            Sie starten mit 100 Punkten für Ihre ersten Käufe!
          </p>
        </div>

        <UnifiedUserProfile
          showCreateProfile={false}
          setShowCreateProfile={(show) => !show && setShowUserSetup(false)}
        />
      </div>
    );
  }

  if (!userProfile) {
    return <div>Laden...</div>;
  }

  return (
    <div className="p-4 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-center mb-2">
          🏪 ABC-Listen Basar
        </h1>
        <p className="text-center text-gray-600">
          Handeln Sie mit Wissen! Kaufen und verkaufen Sie ABC-Listen-Begriffe.
        </p>
      </div>

      {/* User Info Bar */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-lg mb-6">
        <div className="flex flex-wrap justify-between items-center gap-4">
          <div className="flex-grow">
            <span className="font-semibold">{userProfile.displayName}</span>
            <span className="ml-4">💰 {userProfile.trading.points} Punkte</span>
            <span className="ml-4">📈 Level {userProfile.trading.level}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={activeTab === "marketplace" ? "secondary" : "ghost"}
              onClick={() => setActiveTab("marketplace")}
              className="text-white hover:text-slate-900"
            >
              🏪 Marktplatz
            </Button>
            <Button
              variant={activeTab === "profile" ? "secondary" : "ghost"}
              onClick={() => setActiveTab("profile")}
              className="text-white hover:text-slate-900"
            >
              👤 Profil
            </Button>
          </div>
        </div>
      </div>

      {activeTab === "marketplace" && (
        <>
          {/* Search and Filter Controls */}
          <div className="bg-white p-4 rounded-lg shadow mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label
                  htmlFor="search-input"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  🔍 Begriff suchen
                </label>
                <Input
                  id="search-input"
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Begriff, Erklärung oder Liste..."
                  className="w-full"
                />
              </div>
              <div>
                <label
                  htmlFor="letter-filter"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  🔤 Buchstabe
                </label>
                <select
                  id="letter-filter"
                  value={selectedLetter}
                  onChange={(e) => setSelectedLetter(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">Alle</option>
                  {alphabet.map((letter) => (
                    <option key={letter} value={letter}>
                      {letter.toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label
                  htmlFor="sort-select"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  📊 Sortierung
                </label>
                <select
                  id="sort-select"
                  value={sortBy}
                  onChange={(e) =>
                    setSortBy(e.target.value as "date" | "price" | "quality")
                  }
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="date">Neueste zuerst</option>
                  <option value="price">Preis aufsteigend</option>
                  <option value="quality">Beste Bewertung</option>
                </select>
              </div>
              <div className="flex items-end">
                <div className="w-full text-center">
                  <div className="text-sm text-gray-600">
                    📦 {filteredTerms.length} Begriffe
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Marketplace Terms Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTerms.map((term) => (
              <BasarTermCard
                key={term.id}
                term={term}
                currentUser={userProfile}
                onBuy={handleBuyTerm}
                onRate={handleRateTerm}
                basarService={basarService}
              />
            ))}
          </div>

          {filteredTerms.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">🔍</div>
              <h3 className="text-lg font-medium text-gray-600 mb-2">
                Keine Begriffe gefunden
              </h3>
              <p className="text-gray-500">
                Versuchen Sie andere Suchkriterien oder erstellen Sie eigene
                Begriffe zum Verkaufen.
              </p>
            </div>
          )}
        </>
      )}

      {activeTab === "profile" && <UnifiedUserProfile />}
    </div>
  );
}
