import React, {useState, useEffect} from "react";
import {useNavigate} from "react-router-dom";
import {NewStringItem, NewItemWithSaveKey} from "../NewStringItem";
import {DeleteConfirm} from "../DeleteConfirm";
import {Button} from "../ui/button";
import {useGamification} from "@/hooks/useGamification";

const KAWA_STORAGE_KEY = "Kawas";

export function Kawa() {
  const [kawas, setKawas] = useState<NewItemWithSaveKey[]>([]);
  const [itemToDelete, setItemToDelete] = useState<
    NewItemWithSaveKey | undefined
  >(undefined);
  const navigate = useNavigate();
  const {trackKawaCreated} = useGamification();

  useEffect(() => {
    const storedKawas = localStorage.getItem(KAWA_STORAGE_KEY);
    if (storedKawas) {
      setKawas(JSON.parse(storedKawas));
    }
  }, []);

  const updateStorage = (newKawas: NewItemWithSaveKey[]) => {
    localStorage.setItem(KAWA_STORAGE_KEY, JSON.stringify(newKawas));
  };

  const saveKawa = (newKawa: NewItemWithSaveKey) => {
    if (newKawa.text) {
      const newKawas = [...kawas, newKawa];
      setKawas(newKawas);
      updateStorage(newKawas);
      
      // Track gamification activity
      trackKawaCreated(newKawa.key);
      
      navigate(`/kawa/${newKawa.key}`, {state: {item: newKawa}});
    }
  };

  const deleteKawa = (kawaToDelete: NewItemWithSaveKey) => {
    const newKawas = kawas.filter((kawa) => kawa.key !== kawaToDelete.key);
    setKawas(newKawas);
    updateStorage(newKawas);
    setItemToDelete(undefined);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-center">
        <NewStringItem title={"Neues Kawa"} onSave={saveKawa} />
      </div>

      <h2 className="text-xl sm:text-2xl font-bold text-center my-4 sm:my-6">
        Bisherige Kawas
      </h2>

      <DeleteConfirm
        isVisible={itemToDelete !== undefined}
        itemToDelete={itemToDelete}
        onDelete={deleteKawa}
        onAbort={() => setItemToDelete(undefined)}
      />

      <div className="space-y-2 sm:space-y-3">
        {kawas.map((kawa) => (
          <div key={kawa.key} className="flex items-stretch gap-2 sm:gap-3">
            <Button
              variant="default"
              className="flex-1 text-left justify-start py-3 px-4"
              onClick={() =>
                navigate(`/kawa/${kawa.key}`, {state: {item: kawa}})
              }
            >
              {kawa.text}
            </Button>
            <Button
              variant="destructive"
              className="w-12 sm:w-16 flex-shrink-0"
              onClick={() => setItemToDelete(kawa)}
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
