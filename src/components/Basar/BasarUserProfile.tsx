import React, {useState} from "react";
import {Button} from "../ui/button";
import {Input} from "../ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../ui/dialog";
import {Card, CardContent} from "../ui/card";
import {Tabs, TabsList, TabsTrigger, TabsContent} from "../ui/tabs";
import {UserProfile, DEFAULT_ACHIEVEMENTS} from "./types";
import {BasarService} from "./BasarService";
import {WordWithExplanation} from "../List/types";
import {toast} from "sonner";

interface BasarUserProfileProps {
  user: UserProfile;
  onUserUpdate: (user: UserProfile) => void;
  basarService: BasarService;
}

export function BasarUserProfile({
  user,
  onUserUpdate,
  basarService,
}: BasarUserProfileProps) {
  const [showSellDialog, setShowSellDialog] = useState(false);
  const [selectedList, setSelectedList] = useState("");
  const [selectedLetter, setSelectedLetter] = useState("");
  const [availableTerms, setAvailableTerms] = useState<WordWithExplanation[]>(
    [],
  );
  const [selectedTerm, setSelectedTerm] = useState<WordWithExplanation | null>(
    null,
  );
  const [sellPrice, setSellPrice] = useState(15);
  const [activeTab, setActiveTab] = useState<
    "overview" | "history" | "achievements" | "sell"
  >("overview");

  const loadTermsForLetter = (list: string, letter: string) => {
    const storageKey = `abcList-${list}:${letter}`;
    const stored = localStorage.getItem(storageKey);
    try {
      const terms: WordWithExplanation[] = stored ? JSON.parse(stored) : [];
      setAvailableTerms(terms);
    } catch (e) {
      console.error("Failed to parse terms from localStorage", e);
      setAvailableTerms([]);
    }
    setSelectedTerm(null);
  };

  const getAvailableLists = (): string[] => {
    const stored = localStorage.getItem("abcLists");
    try {
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  };

  const handleSellTerm = () => {
    if (!selectedTerm || !selectedList || !selectedLetter) {
      toast.error("Bitte wählen Sie einen Begriff aus");
      return;
    }

    if (sellPrice < 1 || sellPrice > 100) {
      toast.error("Preis muss zwischen 1 und 100 Punkten liegen");
      return;
    }

    const newTerm = basarService.addTermToMarketplace(
      selectedTerm,
      selectedLetter,
      selectedList,
      sellPrice,
    );

    if (newTerm) {
      const updatedUser = basarService.getCurrentUser();
      if (updatedUser) {
        onUserUpdate(updatedUser);
      }
      setShowSellDialog(false);
      setSelectedList("");
      setSelectedLetter("");
      setSelectedTerm(null);
      setSellPrice(15);
      toast.success(`"${selectedTerm.text}" wurde im Basar eingestellt!`);
    } else {
      toast.error("Fehler beim Einstellen des Begriffs");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("de-DE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const alphabet = Array.from({length: 26}, (_, i) =>
    String.fromCharCode(97 + i),
  );

  const availableLists = getAvailableLists();

  const progressToNextLevel = ((user.points % 100) / 100) * 100;

  return (
    <>
      <Card className="shadow-lg">
        <CardContent className="p-6">
          {/* Tab Navigation */}
          <Tabs
            defaultValue="overview"
            value={activeTab}
            onValueChange={(value) => setActiveTab(value as typeof activeTab)}
          >
            <TabsList className="grid w-full grid-cols-4 mb-6">
              <TabsTrigger value="overview">📊 Übersicht</TabsTrigger>
              <TabsTrigger value="history">📜 Historie</TabsTrigger>
              <TabsTrigger value="achievements">🏆 Erfolge</TabsTrigger>
              <TabsTrigger value="sell">💼 Verkaufen</TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <div className="space-y-6">
                {/* User Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-lg">
                    <div className="text-2xl font-bold">{user.points}</div>
                    <div className="text-sm opacity-90">💰 Punkte</div>
                  </div>
                  <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-lg">
                    <div className="text-2xl font-bold">
                      {user.tradesCompleted}
                    </div>
                    <div className="text-sm opacity-90">
                      🤝 Handelsgeschäfte
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-4 rounded-lg">
                    <div className="text-2xl font-bold">
                      {user.termsContributed}
                    </div>
                    <div className="text-sm opacity-90">
                      📚 Begriffe beigetragen
                    </div>
                  </div>
                </div>

                {/* Level Progress */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">Level {user.level}</span>
                    <span className="text-sm text-gray-600">
                      {user.points % 100}/100 XP
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{width: `${progressToNextLevel}%`}}
                    />
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Nächstes Level bei {Math.ceil(user.points / 100) * 100}{" "}
                    Punkten
                  </div>
                </div>

                {/* Recent Achievements */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">
                    🏆 Letzte Erfolge
                  </h3>
                  {user.achievements.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {user.achievements
                        .slice(-4)
                        .reverse()
                        .map((achievement) => (
                          <div
                            key={achievement.id}
                            className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg"
                          >
                            <div className="flex items-center space-x-2">
                              <span className="text-2xl">
                                {achievement.icon}
                              </span>
                              <div>
                                <div className="font-medium text-yellow-800">
                                  {achievement.name}
                                </div>
                                <div className="text-sm text-yellow-600">
                                  +{achievement.points} Punkte
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <div className="text-gray-500 text-center py-4">
                      Noch keine Erfolge freigeschaltet
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="history">
              <div>
                <h3 className="text-lg font-semibold mb-4">
                  📜 Handelsgeschichte
                </h3>
                {user.tradingHistory.length > 0 ? (
                  <div className="space-y-3">
                    {user.tradingHistory
                      .slice()
                      .reverse()
                      .map((trade) => (
                        <div
                          key={trade.id}
                          className={`p-3 rounded-lg border ${
                            trade.type === "buy"
                              ? "bg-red-50 border-red-200"
                              : "bg-green-50 border-green-200"
                          }`}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="font-medium">
                                {trade.type === "buy"
                                  ? "🛒 Gekauft"
                                  : "💰 Verkauft"}
                                : {trade.termText} ({trade.letter.toUpperCase()}
                                )
                              </div>
                              <div className="text-sm text-gray-600">
                                {trade.type === "buy" ? "Von" : "An"}:{" "}
                                {trade.partnerName}
                              </div>
                              <div className="text-xs text-gray-500">
                                {formatDate(trade.date)}
                              </div>
                            </div>
                            <div
                              className={`font-bold ${
                                trade.type === "buy"
                                  ? "text-red-600"
                                  : "text-green-600"
                              }`}
                            >
                              {trade.type === "buy" ? "-" : "+"}
                              {trade.price} Punkte
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="text-gray-500 text-center py-8">
                    <div className="text-4xl mb-2">📝</div>
                    <div>Noch keine Handelsgeschäfte</div>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="achievements">
              <div>
                <h3 className="text-lg font-semibold mb-4">🏆 Erfolge</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {DEFAULT_ACHIEVEMENTS.map((achievement) => {
                    const earned = user.achievements.find(
                      (a) => a.id === achievement.id,
                    );
                    return (
                      <div
                        key={achievement.id}
                        className={`p-4 rounded-lg border ${
                          earned
                            ? "bg-yellow-50 border-yellow-300"
                            : "bg-gray-50 border-gray-200"
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          <span
                            className={`text-3xl ${
                              earned ? "" : "filter grayscale"
                            }`}
                          >
                            {achievement.icon}
                          </span>
                          <div className="flex-1">
                            <div
                              className={`font-medium ${
                                earned ? "text-yellow-800" : "text-gray-600"
                              }`}
                            >
                              {achievement.name}
                            </div>
                            <div
                              className={`text-sm ${
                                earned ? "text-yellow-600" : "text-gray-500"
                              }`}
                            >
                              {achievement.description}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              💰 {achievement.points} Punkte
                            </div>
                            {earned && (
                              <div className="text-xs text-yellow-600 mt-1">
                                ✅ Erreicht am {formatDate(earned.dateEarned)}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="sell">
              <div>
                <h3 className="text-lg font-semibold mb-4">
                  💼 Begriffe verkaufen
                </h3>
                <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg mb-4">
                  <h4 className="font-medium text-blue-800 mb-2">
                    💡 So verkaufen Sie Begriffe:
                  </h4>
                  <ol className="text-sm text-blue-700 list-decimal list-inside space-y-1">
                    <li>Wählen Sie eine ABC-Liste aus</li>
                    <li>Wählen Sie einen Buchstaben</li>
                    <li>Wählen Sie einen Begriff aus</li>
                    <li>Legen Sie einen fairen Preis fest</li>
                    <li>Stellen Sie den Begriff im Basar ein</li>
                  </ol>
                </div>

                <Button
                  onClick={() => setShowSellDialog(true)}
                  className="w-full bg-green-500 hover:bg-green-600"
                  disabled={availableLists.length === 0}
                >
                  🏷️ Begriff zum Verkauf anbieten
                </Button>

                {availableLists.length === 0 && (
                  <div className="text-center text-gray-500 mt-4">
                    <div className="text-4xl mb-2">📝</div>
                    <div>
                      Erstellen Sie zuerst ABC-Listen, um Begriffe verkaufen zu
                      können.
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Sell Dialog */}
      <Dialog open={showSellDialog} onOpenChange={setShowSellDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>🏷️ Begriff verkaufen</DialogTitle>
            <DialogDescription>
              Wählen Sie einen Begriff aus Ihren ABC-Listen zum Verkaufen aus.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label
                htmlFor="list-select"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                ABC-Liste auswählen:
              </label>
              <select
                id="list-select"
                value={selectedList}
                onChange={(e) => {
                  const newList = e.target.value;
                  setSelectedList(newList);
                  setSelectedLetter("");
                  setAvailableTerms([]);
                  setSelectedTerm(null);
                }}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">-- Liste wählen --</option>
                {availableLists.map((list) => (
                  <option key={list} value={list}>
                    {list}
                  </option>
                ))}
              </select>
            </div>

            {selectedList && (
              <div>
                <label
                  htmlFor="letter-select"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Buchstabe auswählen:
                </label>
                <select
                  id="letter-select"
                  value={selectedLetter}
                  onChange={(e) => {
                    const newLetter = e.target.value;
                    setSelectedLetter(newLetter);
                    if (selectedList && newLetter) {
                      loadTermsForLetter(selectedList, newLetter);
                    } else {
                      setAvailableTerms([]);
                    }
                    setSelectedTerm(null);
                  }}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">-- Buchstabe wählen --</option>
                  {alphabet.map((letter) => (
                    <option key={letter} value={letter}>
                      {letter.toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {selectedLetter && availableTerms.length > 0 && (
              <div>
                <label
                  htmlFor="term-select"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Begriff auswählen:
                </label>
                <select
                  id="term-select"
                  value={selectedTerm?.text || ""}
                  onChange={(e) => {
                    const term = availableTerms.find(
                      (t) => t.text === e.target.value,
                    );
                    setSelectedTerm(term || null);
                  }}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">-- Begriff wählen --</option>
                  {availableTerms.map((term, index) => (
                    <option key={index} value={term.text}>
                      {term.text}
                      {term.explanation &&
                        ` - ${term.explanation.substring(0, 30)}...`}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {selectedTerm && (
              <>
                <div className="bg-gray-50 p-3 rounded border">
                  <div className="font-medium">{selectedTerm.text}</div>
                  {selectedTerm.explanation && (
                    <div className="text-sm text-gray-600 italic">
                      &quot;{selectedTerm.explanation}&quot;
                    </div>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="sell-price"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Verkaufspreis (1-100 Punkte):
                  </label>
                  <Input
                    id="sell-price"
                    type="number"
                    min="1"
                    max="100"
                    value={sellPrice}
                    onChange={(e) => setSellPrice(Number(e.target.value))}
                    className="w-full"
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    Empfohlener Preis: 10-20 Punkte für einfache Begriffe, 15-30
                    für detaillierte Erklärungen
                  </div>
                </div>
              </>
            )}

            {selectedLetter && availableTerms.length === 0 && (
              <div className="text-center text-gray-500 py-4">
                Keine Begriffe für Buchstabe &quot;
                {selectedLetter.toUpperCase()}&quot; in dieser Liste gefunden.
              </div>
            )}
          </div>

          <DialogFooter className="flex gap-2">
            <Button
              onClick={handleSellTerm}
              disabled={!selectedTerm || sellPrice < 1 || sellPrice > 100}
              className="flex-1"
            >
              🏷️ Zum Verkauf anbieten
            </Button>
            <Button
              variant="secondary"
              onClick={() => setShowSellDialog(false)}
            >
              Abbrechen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
