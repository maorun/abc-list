import React, {useState, useEffect} from "react";
import {useNavigate} from "react-router-dom";
import {NewStringItem, NewItemWithSaveKey} from "../NewStringItem";
import {DeleteConfirm} from "../DeleteConfirm";

const KAGA_STORAGE_KEY = "Kagas";

export function Kaga() {
  const [kagas, setKagas] = useState<NewItemWithSaveKey[]>([]);
  const [itemToDelete, setItemToDelete] = useState<
    NewItemWithSaveKey | undefined
  >(undefined);
  const navigate = useNavigate();

  useEffect(() => {
    const storedKagas = localStorage.getItem(KAGA_STORAGE_KEY);
    if (storedKagas) {
      setKagas(JSON.parse(storedKagas));
    }
  }, []);

  const updateStorage = (newKagas: NewItemWithSaveKey[]) => {
    localStorage.setItem(KAGA_STORAGE_KEY, JSON.stringify(newKagas));
  };

  const saveKaga = (newKaga: NewItemWithSaveKey) => {
    if (newKaga.text) {
      const newKagas = [...kagas, newKaga];
      setKagas(newKagas);
      updateStorage(newKagas);
      navigate(`/kaga/${newKaga.key}`, {state: {item: newKaga}});
    }
  };

  const deleteKaga = (kagaToDelete: NewItemWithSaveKey) => {
    const newKagas = kagas.filter((kaga) => kaga.key !== kagaToDelete.key);
    setKagas(newKagas);
    updateStorage(newKagas);
    // Also remove the canvas data from localStorage
    localStorage.removeItem(`kagaCanvas-${kagaToDelete.key}`);
    setItemToDelete(undefined);
  };

  return (
    <div className="p-4">
      <NewStringItem title={"Neues KaGa"} onSave={saveKaga} />
      <h2 className="text-2xl font-bold text-center my-4">Bisherige KaGas</h2>

      <DeleteConfirm
        isVisible={itemToDelete !== undefined}
        itemToDelete={itemToDelete}
        onDelete={deleteKaga}
        onAbort={() => setItemToDelete(undefined)}
      />

      <div className="space-y-2">
        {kagas.map((kaga) => (
          <button
            key={kaga.key}
            className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            onClick={() => navigate(`/kaga/${kaga.key}`, {state: {item: kaga}})}
            onContextMenu={(e) => {
              e.preventDefault();
              setItemToDelete(kaga);
            }}
          >
            {kaga.text}
          </button>
        ))}
      </div>
      <p className="text-center text-gray-500 mt-4">
        Tipp: Rechtsklick zum Löschen
      </p>
    </div>
  );
}
