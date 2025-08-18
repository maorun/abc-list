import React, {useState, useEffect, useCallback, useRef} from "react";
import {useParams, useNavigate} from "react-router-dom";
import {toast} from "sonner";

// Extract handler action outside component
const handleBackToStadtLandFlussAction = (
  navigate: ReturnType<typeof useNavigate>,
) => {
  navigate("/slf");
};

// Default categories for Stadt-Land-Fluss
const DEFAULT_CATEGORIES = [
  "Stadt",
  "Land",
  "Fluss",
  "Tier",
  "Beruf",
  "Name",
  "Lebensmittel",
  "Gegenstand",
];

// All letters except difficult ones
const GAME_LETTERS = "ABCDEFGHIJKLMNOPRSTUVWZ".split("");

interface GameData {
  categories: string[];
  currentLetter: string;
  isGameActive: boolean;
  timeLeft: number;
  gameDuration: number;
  answers: Record<string, string>;
  rounds: Array<{
    letter: string;
    answers: Record<string, string>;
    points: Record<string, number>;
    totalPoints: number;
    timeUsed: number;
  }>;
  totalScore: number;
}

export function StadtLandFlussGame() {
  const {game} = useParams<{game: string}>();
  const navigate = useNavigate();
  const [gameData, setGameData] = useState<GameData>({
    categories: DEFAULT_CATEGORIES,
    currentLetter: "",
    isGameActive: false,
    timeLeft: 0,
    gameDuration: 120, // 2 minutes default
    answers: {},
    rounds: [],
    totalScore: 0,
  });
  const [editingCategories, setEditingCategories] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const timerIntervalRef = useRef<number | null>(null);
  const endRoundCalledRef = useRef(false);

  // Create stable back navigation handler using useCallback
  const backToStadtLandFluss = useCallback(
    () => handleBackToStadtLandFlussAction(navigate),
    [navigate],
  );

  const loadGameData = useCallback(() => {
    const cacheKey = "slf-" + game;
    const storedData = localStorage.getItem(cacheKey);
    if (storedData) {
      const parsed = JSON.parse(storedData);
      setGameData((prev) => ({...prev, ...parsed}));
    }
  }, [game]);

  const saveGameData = useCallback(
    (data: GameData) => {
      localStorage.setItem("slf-" + game, JSON.stringify(data));
    },
    [game],
  );

  const generateRandomLetter = (): string => {
    return GAME_LETTERS[Math.floor(Math.random() * GAME_LETTERS.length)];
  };

  const calculatePoints = (
    answers: Record<string, string>,
    timeUsed: number,
    currentLetter: string,
    gameDuration: number,
  ): Record<string, number> => {
    const points: Record<string, number> = {};
    const speedBonus =
      gameDuration > 0
        ? Math.max(0, (gameDuration - timeUsed) / gameDuration)
        : 0;

    Object.entries(answers).forEach(([category, answer]) => {
      let categoryPoints = 0;

      if (
        answer.trim() &&
        currentLetter &&
        answer.toUpperCase().startsWith(currentLetter)
      ) {
        categoryPoints = 10; // Base points for valid answer
        categoryPoints += Math.floor(speedBonus * 5); // Speed bonus (0-5 points)

        // Creativity bonus for longer words
        if (answer.length > 6) {
          categoryPoints += 2;
        }
      }

      points[category] = categoryPoints;
    });

    return points;
  };

  const endRound = useCallback(() => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);

    setGameData((currentGameData) => {
      const timeUsed = currentGameData.gameDuration - currentGameData.timeLeft;
      const points = calculatePoints(
        currentGameData.answers,
        timeUsed,
        currentGameData.currentLetter,
        currentGameData.gameDuration,
      );
      const totalPoints = Object.values(points).reduce((sum, p) => sum + p, 0);

      const newRound = {
        letter: currentGameData.currentLetter,
        answers: {...currentGameData.answers},
        points,
        totalPoints,
        timeUsed,
      };

      const newGameData = {
        ...currentGameData,
        isGameActive: false,
        rounds: [...currentGameData.rounds, newRound],
        totalScore: currentGameData.totalScore + totalPoints,
        currentLetter: "",
        timeLeft: 0,
      };

      saveGameData(newGameData);
      toast.success(`Runde beendet! Punkte: ${totalPoints}`);
      return newGameData;
    });
  }, [saveGameData]);

  useEffect(() => {
    if (game) {
      document.title = `Stadt-Land-Fluss: ${game}`;
      loadGameData();
    }
  }, [game, loadGameData]);

  useEffect(() => {
    if (gameData.isGameActive) {
      const interval = setInterval(() => {
        setGameData((prev) => {
          if (prev.timeLeft <= 1) {
            // Time is up, end the round
            if (!endRoundCalledRef.current) {
              endRoundCalledRef.current = true;
              setTimeout(() => endRound(), 0);
            }
            return {
              ...prev,
              timeLeft: 0,
            };
          }
          return {
            ...prev,
            timeLeft: prev.timeLeft - 1,
          };
        });
      }, 1000);
      timerIntervalRef.current = interval;
      return () => clearInterval(interval);
    }
  }, [gameData.isGameActive, endRound]);

  // Reset endRoundCalled flag when game becomes inactive
  useEffect(() => {
    if (!gameData.isGameActive) {
      endRoundCalledRef.current = false;
    }
  }, [gameData.isGameActive]);

  const startNewRound = () => {
    const letter = generateRandomLetter();
    const newGameData = {
      ...gameData,
      currentLetter: letter,
      isGameActive: true,
      timeLeft: gameData.gameDuration,
      answers: gameData.categories.reduce(
        (acc, cat) => ({...acc, [cat]: ""}),
        {},
      ),
    };
    setGameData(newGameData);
    saveGameData(newGameData);
    toast.success(`Neue Runde gestartet! Buchstabe: ${letter}`);
  };

  const updateAnswer = (category: string, value: string) => {
    const newAnswers = {...gameData.answers, [category]: value};
    const newGameData = {...gameData, answers: newAnswers};
    setGameData(newGameData);
    saveGameData(newGameData);
  };

  const addCategory = () => {
    if (
      newCategory.trim() &&
      !gameData.categories.includes(newCategory.trim())
    ) {
      const newCategories = [...gameData.categories, newCategory.trim()];
      const newGameData = {...gameData, categories: newCategories};
      setGameData(newGameData);
      saveGameData(newGameData);
      setNewCategory("");
    }
  };

  const removeCategory = (category: string) => {
    if (gameData.categories.length > 1) {
      const newCategories = gameData.categories.filter((c) => c !== category);
      const newGameData = {...gameData, categories: newCategories};
      setGameData(newGameData);
      saveGameData(newGameData);
    }
  };

  const resetGame = () => {
    const newGameData = {
      ...gameData,
      rounds: [],
      totalScore: 0,
      isGameActive: false,
      currentLetter: "",
      timeLeft: 0,
      answers: {},
    };
    setGameData(newGameData);
    saveGameData(newGameData);
    toast.success("Spiel zurückgesetzt!");
  };

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4">
          <button
            onClick={backToStadtLandFluss}
            className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded flex items-center justify-center gap-2 mb-2 sm:mb-0 w-full sm:w-auto focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            title="Zurück zur Stadt-Land-Fluss Übersicht"
            aria-label="Zurück zur Stadt-Land-Fluss Übersicht"
          >
            <span className="flex items-center">←</span> Zurück zu Spielen
          </button>
          <h1 className="text-3xl font-bold">Stadt-Land-Fluss: {game}</h1>
        </div>
        <div className="text-xl font-bold text-blue-600">
          Gesamtpunkte: {gameData.totalScore}
        </div>
      </div>

      {/* Game Controls */}
      <div className="bg-gray-100 p-4 rounded-lg mb-6">
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex gap-2 items-center">
            <label htmlFor="game-duration" className="font-medium">
              Spielzeit:
            </label>
            <select
              id="game-duration"
              value={gameData.gameDuration}
              onChange={(e) =>
                setGameData((prev) => ({
                  ...prev,
                  gameDuration: parseInt(e.target.value),
                }))
              }
              disabled={gameData.isGameActive}
              className="px-2 py-1 border rounded"
            >
              <option value={60}>1 Minute</option>
              <option value={120}>2 Minuten</option>
              <option value={180}>3 Minuten</option>
              <option value={300}>5 Minuten</option>
            </select>
          </div>

          <div className="flex gap-2">
            <button
              onClick={startNewRound}
              disabled={gameData.isGameActive}
              className="bg-green-500 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded"
            >
              {gameData.rounds.length === 0 ? "Spiel starten" : "Neue Runde"}
            </button>

            {gameData.isGameActive && (
              <button
                onClick={endRound}
                className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded"
              >
                Runde beenden
              </button>
            )}

            <button
              onClick={resetGame}
              disabled={gameData.isGameActive}
              className="bg-red-500 hover:bg-red-700 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded"
            >
              Spiel zurücksetzen
            </button>
          </div>
        </div>
      </div>

      {/* Current Round */}
      {gameData.isGameActive && (
        <div className="bg-blue-50 p-6 rounded-lg mb-6">
          <div className="text-center mb-4">
            <div className="text-4xl font-bold text-blue-600 mb-2">
              Buchstabe: {gameData.currentLetter}
            </div>
            <div className="text-2xl font-bold text-red-600">
              Zeit: {formatTime(gameData.timeLeft)}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {gameData.categories.map((category) => (
              <div key={category} className="bg-white p-3 rounded">
                <label className="block font-medium mb-1">{category}:</label>
                <input
                  type="text"
                  value={gameData.answers[category] || ""}
                  onChange={(e) => updateAnswer(category, e.target.value)}
                  className="w-full px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={`${category} mit ${gameData.currentLetter}...`}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Categories Configuration */}
      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold">Kategorien</h3>
          <button
            onClick={() => setEditingCategories(!editingCategories)}
            disabled={gameData.isGameActive}
            className="bg-blue-500 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-1 px-3 rounded text-sm"
          >
            {editingCategories ? "Fertig" : "Bearbeiten"}
          </button>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {gameData.categories.map((category) => (
            <span
              key={category}
              className="inline-flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
            >
              {category}
              {editingCategories && (
                <button
                  onClick={() => removeCategory(category)}
                  className="ml-2 text-red-500 hover:text-red-700"
                >
                  ×
                </button>
              )}
            </span>
          ))}
        </div>

        {editingCategories && (
          <div className="flex gap-2">
            <input
              type="text"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && addCategory()}
              placeholder="Neue Kategorie..."
              className="flex-1 px-2 py-1 border rounded"
            />
            <button
              onClick={addCategory}
              className="bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-3 rounded"
            >
              Hinzufügen
            </button>
          </div>
        )}
      </div>

      {/* Game History */}
      {gameData.rounds.length > 0 && (
        <div className="bg-white p-4 rounded-lg border">
          <h3 className="text-lg font-bold mb-4">Spielverlauf</h3>
          <div className="space-y-4">
            {gameData.rounds.map((round, index) => (
              <div key={index} className="border-l-4 border-blue-500 pl-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold">
                    Runde {index + 1} - Buchstabe: {round.letter}
                  </span>
                  <span className="text-blue-600 font-bold">
                    {round.totalPoints} Punkte
                  </span>
                </div>
                <div className="text-sm text-gray-600 mb-2">
                  Zeit benötigt: {formatTime(round.timeUsed)}
                </div>
                <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3 text-sm">
                  {Object.entries(round.answers).map(([category, answer]) => (
                    <div key={category} className="flex justify-between">
                      <span>{category}:</span>
                      <span className="font-medium">
                        {answer || "-"}
                        {answer && (
                          <span className="text-blue-600 ml-1">
                            ({round.points[category]} P)
                          </span>
                        )}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
