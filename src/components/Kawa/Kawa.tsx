import React, {useState, useEffect} from "react";
import {useNavigate} from "react-router-dom";
import {toast} from "sonner";
import {NewStringItem, NewItemWithSaveKey} from "../NewStringItem";
import {DeleteConfirm} from "../DeleteConfirm";
import {Button} from "../ui/button";
import {useGamification} from "@/hooks/useGamification";
import {KawaTemplates, KawaTemplate} from "./KawaTemplates";

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

  const handleTemplateSelect = (template: KawaTemplate) => {
    const kawaKey = template.word.toLowerCase().replace(/\s+/g, "-");
    const existingKawa = kawas.find((k) => k.key === kawaKey);

    if (existingKawa) {
      toast.error(`KaWa "${template.word}" existiert bereits.`);
      return;
    }

    const newKawa: NewItemWithSaveKey = {
      text: template.word,
      key: kawaKey,
    };

    const newKawas = [...kawas, newKawa];
    setKawas(newKawas);
    updateStorage(newKawas);

    // Save template associations to localStorage
    Object.entries(template.associations).forEach(([letter, texts]) => {
      texts.forEach((text, index) => {
        // Construct a unique key for each association to avoid overwriting.
        // The original logic was flawed because multiple letters can be the same.
        // A better approach is to find all indices of a letter and use them.
        const indices = template.word
          .split("")
          .map((l, i) => (l.toLowerCase() === letter.toLowerCase() ? i : -1))
          .filter((i) => i !== -1);

        if (indices[index] !== undefined) {
          const storageKey = `KawaItem_${letter}_${newKawa.key}_${indices[index]}`;
          localStorage.setItem(storageKey, JSON.stringify({text}));
        }
      });
    });

    // Track gamification activity
    trackKawaCreated(kawaKey);

    toast.success(`Vorlage "${template.name}" erfolgreich geladen!`);
    navigate(`/kawa/${kawaKey}`, {state: {item: newKawa}});
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-center gap-2">
        <NewStringItem title={"Neues Kawa"} onSave={saveKawa} />
        <KawaTemplates onTemplateSelect={handleTemplateSelect} />
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
