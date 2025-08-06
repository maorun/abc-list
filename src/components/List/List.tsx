import React, {useState, useEffect} from "react";
import {useNavigate} from "react-router-dom";
import {NewStringItem} from "../NewStringItem";

export const cacheKey = "abcLists";

export function List() {
  const [data, setData] = useState<string[]>([]);
  const [isReversed, setIsReversed] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const storedData = localStorage.getItem(cacheKey);
    if (storedData) {
      setData(JSON.parse(storedData));
    }
  }, []);

  const updateStorage = (newData: string[]) => {
    localStorage.setItem(cacheKey, JSON.stringify(newData));
  };

  const deleteItem = (itemToDelete: string) => {
    const newData = data.filter((item) => item !== itemToDelete);
    setData(newData);
    updateStorage(newData);
    localStorage.removeItem("abcList-" + itemToDelete);
  };

  const clearAll = () => {
    data.forEach((item) => {
      localStorage.removeItem("abcList-" + item);
    });
    setData([]);
    updateStorage([]);
  };

  const showAbcList = (item: string) => {
    navigate(`/list/${item}`);
  };

  const createNewItem = (newItem: string) => {
    if (newItem && !data.includes(newItem)) {
      const newData = [...data, newItem];
      setData(newData);
      updateStorage(newData);
      showAbcList(newItem);
    }
  };

  return (
    <div className="p-4">
      <div className="flex justify-center items-center space-x-2">
        <NewStringItem
          title={"Neue ABC-Liste"}
          onSave={(item) => createNewItem(item.text)}
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
        Bisherige ABC-Listen
      </h2>
      <ul className="space-y-2">
        {data
          .slice()
          .sort((a, b) => (isReversed ? b.localeCompare(a) : a.localeCompare(b)))
          .map((item) => (
            <li
              key={item}
              className="flex items-center justify-center space-x-2"
            >
              <button
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-4/5"
              onClick={() => showAbcList(item)}
            >
              {item}
            </button>
            <button
              className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded w-1/5"
              onClick={() => deleteItem(item)}
            >
              X
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
