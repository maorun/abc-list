import React, {useEffect, useCallback} from "react";
import {useLocation, useNavigate} from "react-router-dom";
import {KawaLetter} from "./KawaLetter";
import {NewItemWithSaveKey} from "../NewStringItem";

// Extract handler action outside component
const handleBackToKawasAction = (navigate: ReturnType<typeof useNavigate>) => {
  navigate("/kawa");
};

export function KawaItem() {
  const location = useLocation();
  const navigate = useNavigate();
  const item = location.state?.item as NewItemWithSaveKey;

  useEffect(() => {
    if (item) {
      document.title = `Kawa für ${item.text}`;
    }
  }, [item]);

  // Create stable back navigation handler using useCallback
  const backToKawas = useCallback(
    () => handleBackToKawasAction(navigate),
    [navigate],
  );

  if (!item) {
    // TODO: Handle case where item is not in location state, e.g. direct navigation
    // Could fetch from localStorage if needed
    return (
      <div className="p-4 text-center">
        <button
          onClick={backToKawas}
          className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded flex items-center justify-center gap-2 mb-4 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
        >
          <span className="flex items-center">←</span> Zurück zu Kawas
        </button>
        <div>Kawa nicht gefunden. Bitte gehe zurück zur Übersicht.</div>
      </div>
    );
  }

  const letters = item.text.split("");

  return (
    <div className="p-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4 mb-4">
        <button
          onClick={backToKawas}
          className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded flex items-center justify-center gap-2 mb-2 sm:mb-0 w-full sm:w-auto focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          title="Zurück zur Kawa-Übersicht"
          aria-label="Zurück zur Kawa Übersicht"
        >
          <span className="flex items-center">←</span> Zurück zu Kawas
        </button>
        <h1 className="text-3xl font-bold text-center sm:text-left">
          Kawa für &quot;{item.text}&quot;
        </h1>
      </div>
      <div className="flex flex-col items-center space-y-4">
        {letters.map((letter, index) => (
          <KawaLetter
            key={index}
            letter={letter}
            index={`${item.key}_${index}`}
          />
        ))}
      </div>
    </div>
  );
}
