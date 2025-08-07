import React, {useState, useEffect} from "react";
import {useNavigate} from "react-router-dom";
import {NewStringItem} from "../NewStringItem";

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
    <div className="p-4">
      <div className="flex justify-center items-center space-x-2">
        <NewStringItem
          title={"Neues Stadt-Land-Fluss Spiel"}
          onSave={(item) => createNewGame(item.text)}
        />
        <button
          className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
          onClick={clearAll}
        >
          Alle löschen
        </button>
        <button
          className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
          onClick={() => setIsReversed(!isReversed)}
        >
          Sortierung umkehren
        </button>
      </div>
      <h2 className="text-2xl font-bold text-center my-4">
        Stadt-Land-Fluss Spiele
      </h2>
      <div className="text-center mb-6">
        <p className="text-gray-600">
          Der &quot;Stadt-Land-Fluss-Effekt&quot; nach Vera F. Birkenbihl
          trainiert das schnelle Abrufen von Wissen aus dem Gedächtnis.
        </p>
      </div>
      <ul className="space-y-2">
        {games
          .slice()
          .sort((a, b) =>
            isReversed ? b.localeCompare(a) : a.localeCompare(b),
          )
          .map((game) => (
            <li
              key={game}
              className="flex items-center justify-center space-x-2"
            >
              <button
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-4/5"
                onClick={() => showGame(game)}
              >
                {game}
              </button>
              <button
                className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded w-1/5"
                onClick={() => deleteGame(game)}
              >
                X
              </button>
            </li>
          ))}
      </ul>
    </div>
  );
}
