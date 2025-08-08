import React, {useState, useEffect} from "react";
import {useNavigate} from "react-router-dom";
import {NewStringItem} from "../NewStringItem";
import {Button} from "../ui/button";

export const cacheKey = "slfGames";

export function StadtLandFluss() {
  const [games, setGames] = useState<string[]>([]);
  const [isReversed, setIsReversed] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const storedData = localStorage.getItem(cacheKey);
    if (storedData) {
      setGames(JSON.parse(storedData));
    }
  }, []);

  const updateStorage = (newData: string[]) => {
    localStorage.setItem(cacheKey, JSON.stringify(newData));
  };

  const deleteGame = (gameToDelete: string) => {
    const newData = games.filter((game) => game !== gameToDelete);
    setGames(newData);
    updateStorage(newData);
    localStorage.removeItem("slf-" + gameToDelete);
  };

  const clearAll = () => {
    games.forEach((game) => {
      localStorage.removeItem("slf-" + game);
    });
    setGames([]);
    updateStorage([]);
  };

  const showGame = (game: string) => {
    navigate(`/slf/${game}`);
  };

  const createNewGame = (newGame: string) => {
    if (newGame && !games.includes(newGame)) {
      const newData = [...games, newGame];
      setGames(newData);
      updateStorage(newData);
      showGame(newGame);
    }
  };

  return (
    <div className="space-y-4">
      {/* Mobile-first button layout */}
      <div className="flex flex-col sm:flex-row sm:justify-center sm:items-center gap-2 sm:gap-2">
        <NewStringItem
          title={"Neues Stadt-Land-Fluss Spiel"}
          onSave={(item) => createNewGame(item.text)}
        />
        <div className="flex gap-2">
          <Button
            variant="destructive"
            onClick={clearAll}
            className="text-sm flex-1 sm:flex-none"
          >
            Alle löschen
          </Button>
          <Button
            variant="secondary"
            onClick={() => setIsReversed(!isReversed)}
            className="text-sm flex-1 sm:flex-none"
          >
            Sortierung umkehren
          </Button>
        </div>
      </div>

      <h2 className="text-xl sm:text-2xl font-bold text-center my-4 sm:my-6">
        Stadt-Land-Fluss Spiele
      </h2>

      <div className="text-center mb-6 px-2">
        <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
          Der &quot;Stadt-Land-Fluss-Effekt&quot; nach Vera F. Birkenbihl
          trainiert das schnelle Abrufen von Wissen aus dem Gedächtnis.
        </p>
      </div>

      <ul className="space-y-2 sm:space-y-3">
        {games
          .slice()
          .sort((a, b) =>
            isReversed ? b.localeCompare(a) : a.localeCompare(b),
          )
          .map((game) => (
            <li key={game} className="flex items-stretch gap-2 sm:gap-3">
              <Button
                variant="default"
                className="flex-1 text-left justify-start py-3 px-4"
                onClick={() => showGame(game)}
              >
                {game}
              </Button>
              <Button
                variant="destructive"
                className="w-12 sm:w-16 flex-shrink-0"
                onClick={() => deleteGame(game)}
              >
                ✕
              </Button>
            </li>
          ))}
      </ul>
    </div>
  );
}
