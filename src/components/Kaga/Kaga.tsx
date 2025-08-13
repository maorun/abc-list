import React, {useState, useEffect} from "react";
import {useNavigate} from "react-router-dom";
import {NewStringItem, NewItemWithSaveKey} from "../NewStringItem";
import {DeleteConfirm} from "../DeleteConfirm";
import {Button} from "../ui/button";
import {useGamification} from "@/hooks/useGamification";

const KAGA_STORAGE_KEY = "Kagas";

export function Kaga() {
  const [kagas, setKagas] = useState<NewItemWithSaveKey[]>([]);
  const [itemToDelete, setItemToDelete] = useState<
    NewItemWithSaveKey | undefined
  >(undefined);
  const navigate = useNavigate();
  const {trackKagaCreated} = useGamification();

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

      // Track gamification activity
      trackKagaCreated(newKaga.key);

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
    <div className="space-y-4">
      <div className="flex justify-center">
        <NewStringItem title={"Neues KaGa"} onSave={saveKaga} />
      </div>

      <h2 className="text-xl sm:text-2xl font-bold text-center my-4 sm:my-6">
        Bisherige KaGas
      </h2>

      <DeleteConfirm
        isVisible={itemToDelete !== undefined}
        itemToDelete={itemToDelete}
        onDelete={deleteKaga}
        onAbort={() => setItemToDelete(undefined)}
      />

      <div className="space-y-2 sm:space-y-3">
        {kagas.map((kaga) => (
          <div key={kaga.key} className="flex items-stretch gap-2 sm:gap-3">
            <Button
              variant="default"
              className="flex-1 text-left justify-start py-3 px-4"
              onClick={() =>
                navigate(`/kaga/${kaga.key}`, {state: {item: kaga}})
              }
            >
              {kaga.text}
            </Button>
            <Button
              variant="destructive"
              className="w-12 sm:w-16 flex-shrink-0"
              onClick={() => setItemToDelete(kaga)}
            >
              ✕
            </Button>
          </div>
        ))}
      </div>

      <p className="text-center text-gray-500 text-sm mt-4">
        Tipp: ✕ Button zum Löschen verwenden
      </p>
    </div>
  );
}
