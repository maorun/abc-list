import React, {useState, useEffect} from "react";
import {
  MultiColumnListData,
  ColumnConfig,
  getMultiColumnStorageKey,
  WordWithExplanation,
  PredictionData,
} from "./types";
import {Button} from "../ui/button";
import {Input} from "../ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

interface PredictionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  listData: MultiColumnListData;
  specialtyColumn: ColumnConfig;
}

export function PredictionDialog({
  isOpen,
  onClose,
  listData,
  specialtyColumn,
}: PredictionDialogProps) {
  const [predictions, setPredictions] = useState<Record<string, string>>({});
  const [currentLetter, setCurrentLetter] = useState<string>("a");
  const [results, setResults] = useState<PredictionData[]>([]);
  const [showResults, setShowResults] = useState(false);

  const alphabet = Array.from({length: 26}, (_, i) =>
    String.fromCharCode(97 + i),
  );

  useEffect(() => {
    if (isOpen) {
      // Reset state when dialog opens
      setPredictions({});
      setCurrentLetter("a");
      setResults([]);
      setShowResults(false);
    }
  }, [isOpen]);

  const handlePredictionChange = (letter: string, prediction: string) => {
    setPredictions((prev) => ({
      ...prev,
      [letter]: prediction,
    }));
  };

  const nextLetter = () => {
    const currentIndex = alphabet.indexOf(currentLetter);
    if (currentIndex < alphabet.length - 1) {
      setCurrentLetter(alphabet[currentIndex + 1]);
    } else {
      // All letters done, analyze predictions
      analyzePredictions();
    }
  };

  const previousLetter = () => {
    const currentIndex = alphabet.indexOf(currentLetter);
    if (currentIndex > 0) {
      setCurrentLetter(alphabet[currentIndex - 1]);
    }
  };

  const skipLetter = () => {
    nextLetter();
  };

  const analyzePredictions = () => {
    const predictionResults: PredictionData[] = [];

    alphabet.forEach((letter) => {
      const storageKey = getMultiColumnStorageKey(
        listData.name,
        specialtyColumn.id,
        letter,
      );
      const storedData = localStorage.getItem(storageKey);
      const actualWords: WordWithExplanation[] = storedData
        ? JSON.parse(storedData)
        : [];
      const actualTexts = actualWords.map((w) => w.text.toLowerCase());

      const predictedWords = predictions[letter]
        ? predictions[letter]
            .split(",")
            .map((w) => w.trim().toLowerCase())
            .filter((w) => w.length > 0)
        : [];

      let correctPredictions = 0;
      predictedWords.forEach((pred) => {
        if (
          actualTexts.some(
            (actual) => actual.includes(pred) || pred.includes(actual),
          )
        ) {
          correctPredictions++;
        }
      });

      const accuracy =
        predictedWords.length > 0
          ? (correctPredictions / predictedWords.length) * 100
          : 0;

      predictionResults.push({
        letter,
        predictedWords: predictions[letter]
          ? predictions[letter].split(",").map((w) => w.trim())
          : [],
        actualWords: actualWords.map((w) => w.text),
        accuracy,
      });
    });

    setResults(predictionResults);
    setShowResults(true);
  };

  const currentIndex = alphabet.indexOf(currentLetter);
  const progress = ((currentIndex + 1) / alphabet.length) * 100;
  const overallAccuracy =
    results.length > 0
      ? results.reduce((sum, r) => sum + r.accuracy, 0) / results.length
      : 0;

  if (showResults) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              🎯 Prognose-Ergebnisse für {specialtyColumn.theme}
            </DialogTitle>
            <DialogDescription>
              Analyse Ihrer Vorhersagen vs. tatsächliche Wörter
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Overall Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded text-center">
                <div className="text-2xl font-bold text-blue-800">
                  {overallAccuracy.toFixed(1)}%
                </div>
                <div className="text-sm text-blue-600">
                  Durchschnittliche Genauigkeit
                </div>
              </div>
              <div className="p-4 bg-green-50 border border-green-200 rounded text-center">
                <div className="text-2xl font-bold text-green-800">
                  {results.reduce((sum, r) => sum + r.predictedWords.length, 0)}
                </div>
                <div className="text-sm text-green-600">Vorhersagen gesamt</div>
              </div>
              <div className="p-4 bg-purple-50 border border-purple-200 rounded text-center">
                <div className="text-2xl font-bold text-purple-800">
                  {results.reduce((sum, r) => sum + r.actualWords.length, 0)}
                </div>
                <div className="text-sm text-purple-600">
                  Tatsächliche Wörter
                </div>
              </div>
            </div>

            {/* Detailed Results */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300 text-sm">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-300 px-2 py-1">
                      Buchstabe
                    </th>
                    <th className="border border-gray-300 px-2 py-1">
                      Vorhersagen
                    </th>
                    <th className="border border-gray-300 px-2 py-1">
                      Tatsächlich
                    </th>
                    <th className="border border-gray-300 px-2 py-1">
                      Genauigkeit
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((result) => (
                    <tr key={result.letter} className="hover:bg-gray-50">
                      <td className="border border-gray-300 px-2 py-1 text-center font-mono font-bold">
                        {result.letter.toUpperCase()}
                      </td>
                      <td className="border border-gray-300 px-2 py-1">
                        {result.predictedWords.length > 0
                          ? result.predictedWords.join(", ")
                          : "-"}
                      </td>
                      <td className="border border-gray-300 px-2 py-1">
                        {result.actualWords.length > 0
                          ? result.actualWords.join(", ")
                          : "-"}
                      </td>
                      <td className="border border-gray-300 px-2 py-1 text-center">
                        <span
                          className={`px-2 py-1 rounded text-xs ${
                            result.accuracy >= 80
                              ? "bg-green-100 text-green-800"
                              : result.accuracy >= 50
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                          }`}
                        >
                          {result.accuracy.toFixed(0)}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Insights */}
            <div className="p-4 bg-gray-50 border border-gray-200 rounded">
              <h3 className="font-semibold text-gray-800 mb-2">
                📈 Erkenntnisse
              </h3>
              <div className="text-sm text-gray-700 space-y-2">
                <p>
                  <strong>Beste Buchstaben:</strong>{" "}
                  {results
                    .filter((r) => r.accuracy > 0)
                    .sort((a, b) => b.accuracy - a.accuracy)
                    .slice(0, 3)
                    .map((r) => r.letter.toUpperCase())
                    .join(", ") || "Keine"}
                </p>
                <p>
                  <strong>Verbesserungsbedarf:</strong>{" "}
                  {results
                    .filter(
                      (r) => r.accuracy < 50 && r.predictedWords.length > 0,
                    )
                    .map((r) => r.letter.toUpperCase())
                    .join(", ") || "Keine"}
                </p>
                <p className="italic">
                  Diese Prognose-Analyse zeigt, wie gut Sie Ihr Spezialgebiet
                  kennen und wo Sie Ihr Wissen vertiefen können.
                </p>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button onClick={onClose}>Schließen</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>🎯 Prognose für {specialtyColumn.theme}</DialogTitle>
          <DialogDescription>
            Vorhersage für Buchstabe {currentLetter.toUpperCase()} - versuchen
            Sie zu erraten, welche Wörter Sie bereits haben!
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{width: `${progress}%`}}
            />
          </div>
          <div className="text-center text-sm text-gray-600">
            Buchstabe {currentIndex + 1} von {alphabet.length}
          </div>

          {/* Current Letter */}
          <div className="text-center">
            <div className="text-6xl font-bold text-blue-600 mb-4">
              {currentLetter.toUpperCase()}
            </div>
          </div>

          {/* Prediction Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Welche Wörter haben Sie vermutlich für &quot;
              {currentLetter.toUpperCase()}&quot;?
            </label>
            <Input
              value={predictions[currentLetter] || ""}
              onChange={(e) =>
                handlePredictionChange(currentLetter, e.target.value)
              }
              placeholder="z.B. Apfel, Auto, Arbeit (durch Komma getrennt)"
              className="w-full"
            />
            <p className="text-xs text-gray-500 mt-1">
              Trennen Sie mehrere Wörter durch Kommas
            </p>
          </div>
        </div>

        <DialogFooter className="flex justify-between">
          <div className="flex gap-2">
            <Button
              onClick={previousLetter}
              disabled={currentIndex === 0}
              variant="outline"
              size="sm"
            >
              ← Zurück
            </Button>
            <Button onClick={skipLetter} variant="outline" size="sm">
              Überspringen
            </Button>
          </div>
          <Button onClick={nextLetter}>
            {currentIndex === alphabet.length - 1 ? "Analysieren" : "Weiter →"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
