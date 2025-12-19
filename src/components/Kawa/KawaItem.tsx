import React, {useEffect, useCallback} from "react";
import {useLocation, useNavigate} from "react-router-dom";
import {toast} from "sonner";
import {KawaLetter} from "./KawaLetter";
import {NewItemWithSaveKey} from "../NewStringItem";
import {KawaExportUtils} from "@/lib/kawaExportUtils";

// Extract handler action outside component
const handleBackToKawasAction = (navigate: ReturnType<typeof useNavigate>) => {
  navigate("/kawa");
};

// Extract export handler functions outside component
const getKawaAssociations = (
  kawaKey: string,
  letters: string[],
): Record<string, string> => {
  const associations: Record<string, string> = {};

  letters.forEach((letter, index) => {
    const storageKey = `${kawaKey}_${index}`;
    const storedValue = localStorage.getItem(storageKey);
    if (storedValue) {
      associations[letter] = storedValue;
    } else {
      associations[letter] = "";
    }
  });

  return associations;
};

const handleExportAsPDF = (
  kawaWord: string,
  kawaKey: string,
  letters: string[],
) => {
  const associations = getKawaAssociations(kawaKey, letters);
  KawaExportUtils.exportToPDF(kawaWord, associations);
  toast.success("PDF-Export erfolgreich heruntergeladen!");
};

const handleExportAsCSV = (
  kawaWord: string,
  kawaKey: string,
  letters: string[],
) => {
  const associations = getKawaAssociations(kawaKey, letters);
  KawaExportUtils.exportToCSV(kawaWord, associations);
  toast.success("CSV-Export erfolgreich heruntergeladen!");
};

const handleExportAsMarkdown = (
  kawaWord: string,
  kawaKey: string,
  letters: string[],
) => {
  const associations = getKawaAssociations(kawaKey, letters);
  KawaExportUtils.exportToMarkdown(kawaWord, associations);
  toast.success("Markdown-Export erfolgreich heruntergeladen!");
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

  // Create stable export handlers
  const exportAsPDF = useCallback(() => {
    if (item) {
      handleExportAsPDF(item.text, item.key, item.text.split(""));
    }
  }, [item]);

  const exportAsCSV = useCallback(() => {
    if (item) {
      handleExportAsCSV(item.text, item.key, item.text.split(""));
    }
  }, [item]);

  const exportAsMarkdown = useCallback(() => {
    if (item) {
      handleExportAsMarkdown(item.text, item.key, item.text.split(""));
    }
  }, [item]);

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
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4 mb-2 md:mb-0">
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
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={exportAsPDF}
            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded flex items-center gap-1 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            title="Als PDF exportieren"
            aria-label="KaWa als PDF exportieren"
          >
            📄 PDF
          </button>
          <button
            onClick={exportAsCSV}
            className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded flex items-center gap-1 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2"
            title="Als CSV exportieren"
            aria-label="KaWa als CSV exportieren"
          >
            📊 CSV
          </button>
          <button
            onClick={exportAsMarkdown}
            className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded flex items-center gap-1 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
            title="Als Markdown exportieren"
            aria-label="KaWa als Markdown exportieren"
          >
            📝 MD
          </button>
        </div>
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
