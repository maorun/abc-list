import React, {useState, useEffect} from "react";
import {useNavigate} from "react-router-dom";
import {Button} from "../ui/button";
import {NewStringItem} from "../NewStringItem";
import {MULTI_COLUMN_CACHE_KEY, MultiColumnListData} from "./types";

export function MultiColumnList() {
  const [data, setData] = useState<string[]>([]);
  const [isReversed, setIsReversed] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const storedData = localStorage.getItem(MULTI_COLUMN_CACHE_KEY);
    if (storedData) {
      setData(JSON.parse(storedData));
    }
  }, []);

  const updateStorage = (newData: string[]) => {
    localStorage.setItem(MULTI_COLUMN_CACHE_KEY, JSON.stringify(newData));
  };

  const deleteItem = (itemToDelete: string) => {
    const newData = data.filter((item) => item !== itemToDelete);
    setData(newData);
    updateStorage(newData);

    // Clean up all related storage for this multi-column list
    const metaKey = `multiColumnMeta-${itemToDelete}`;
    const metaData = localStorage.getItem(metaKey);
    if (metaData) {
      const listData: MultiColumnListData = JSON.parse(metaData);
      // Remove all column data
      const alphabet = Array.from({length: 26}, (_, i) =>
        String.fromCharCode(97 + i),
      );
      listData.columns.forEach((column) => {
        alphabet.forEach((letter) => {
          const storageKey = `multiColumn-${itemToDelete}-${column.id}:${letter}`;
          localStorage.removeItem(storageKey);
        });
      });
      localStorage.removeItem(metaKey);
    }
  };

  const clearAll = () => {
    data.forEach((item) => {
      deleteItem(item);
    });
    setData([]);
    updateStorage([]);
  };

  const showMultiColumnList = (item: string) => {
    navigate(`/multi-list/${item}`);
  };

  const createNewItem = (newItem: string) => {
    if (newItem && !data.includes(newItem)) {
      const newData = [...data, newItem];
      setData(newData);
      updateStorage(newData);
      showMultiColumnList(newItem);
    }
  };

  return (
    <div className="p-4">
      <div className="flex justify-center items-center space-x-2">
        <NewStringItem
          title={"Neue Mehrspaltige ABC-Liste"}
          onSave={(item) => createNewItem(item.text)}
        />
        <Button variant="destructive" onClick={clearAll}>
          Alle löschen
        </Button>
        <Button variant="secondary" onClick={() => setIsReversed(!isReversed)}>
          Sortierung umkehren
        </Button>
      </div>
      <h2 className="text-2xl font-bold text-center my-4">
        Mehrspaltige ABC-Listen
      </h2>
      <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded">
        <h3 className="font-semibold text-blue-800 mb-2">
          ℹ️ Mehrspaltiges ABC-System
        </h3>
        <p className="text-sm text-blue-700">
          Nach Vera F. Birkenbihl können Sie verschiedene Themen in separaten
          Spalten bearbeiten: Spalte 1: allgemeines Thema, Spalte 2: anderes
          Thema, Spalte 3-5: Spezialgebiete mit Prognose-Funktion.
        </p>
      </div>
      <ul className="space-y-2">
        {data
          .slice()
          .sort((a, b) =>
            isReversed ? b.localeCompare(a) : a.localeCompare(b),
          )
          .map((item) => (
            <li
              key={item}
              className="flex items-center justify-center space-x-2"
            >
              <Button
                variant="default"
                className="w-4/5"
                onClick={() => showMultiColumnList(item)}
              >
                {item}
              </Button>
              <Button
                variant="destructive"
                className="w-1/5"
                onClick={() => deleteItem(item)}
              >
                X
              </Button>
            </li>
          ))}
      </ul>
    </div>
  );
}
