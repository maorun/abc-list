import React, {useState, useEffect} from "react";
import {useNavigate} from "react-router-dom";
import {NewStringItem, NewItemWithSaveKey} from "../NewStringItem";
import {DeleteConfirm} from "../DeleteConfirm";
import {Button} from "../ui/button";

const KAWA_STORAGE_KEY = "Kawas";

export function Kawa() {
  const [kawas, setKawas] = useState<NewItemWithSaveKey[]>([]);
  const [itemToDelete, setItemToDelete] = useState<
    NewItemWithSaveKey | undefined
  >(undefined);
  const navigate = useNavigate();

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
    <div className="p-4">
      <NewStringItem title={"Neues Kawa"} onSave={saveKawa} />
      <h2 className="text-2xl font-bold text-center my-4">Bisherige Kawas</h2>

      <DeleteConfirm
        isVisible={itemToDelete !== undefined}
        itemToDelete={itemToDelete}
        onDelete={deleteKawa}
        onAbort={() => setItemToDelete(undefined)}
      />

      <div className="space-y-2">
        {kawas.map((kawa) => (
          <Button
            key={kawa.key}
            variant="default"
            className="w-full"
            onClick={() => navigate(`/kawa/${kawa.key}`, {state: {item: kawa}})}
            onContextMenu={(e) => {
              e.preventDefault();
              setItemToDelete(kawa);
            }}
          >
            {kawa.text}
          </Button>
        ))}
      </div>
      <p className="text-center text-gray-500 mt-4">
        Tipp: Rechtsklick zum Löschen
      </p>
    </div>
  );
}
