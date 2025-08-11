import React, {useState, useEffect} from "react";
import {WordWithExplanation} from "../List/SavedWord";
import {Button} from "../ui/button";
import {SokratesReview} from "./SokratesReview";
import {SokratesDashboard} from "./SokratesDashboard";

interface SokratesData {
  listName: string;
  letter: string;
  word: WordWithExplanation;
}

export function SokratesCheck() {
  const [view, setView] = useState<"dashboard" | "review">("dashboard");
  const [allTerms, setAllTerms] = useState<SokratesData[]>([]);
  const [reviewTerms, setReviewTerms] = useState<SokratesData[]>([]);

  useEffect(() => {
    loadAllTerms();
  }, []);

  const loadAllTerms = () => {
    // Get all ABC-Lists
    const listsData = localStorage.getItem("abcLists");
    if (!listsData) return;

    const lists: string[] = JSON.parse(listsData);
    const allTermsData: SokratesData[] = [];

    lists.forEach((listName) => {
      // For each list, check all letters A-Z
      const alphabet = Array.from({length: 26}, (_, i) =>
        String.fromCharCode(97 + i),
      );

      alphabet.forEach((letter) => {
        const storageKey = `abcList-${listName}:${letter}`;
        const storedData = localStorage.getItem(storageKey);
        if (storedData) {
          const words: WordWithExplanation[] = JSON.parse(storedData);
          words.forEach((word) => {
            allTermsData.push({
              listName,
              letter,
              word,
            });
          });
        }
      });
    });

    setAllTerms(allTermsData);

    // Filter terms that need review
    const needsReview = allTermsData.filter((term) => {
      // Terms need review if:
      // 1. No rating yet
      // 2. Rating is 1-3 (poor understanding)
      // 3. Haven't been reviewed in the last 7 days and rating <= 4

      if (!term.word.rating) return true;
      if (term.word.rating <= 3) return true;

      if (term.word.rating <= 4 && term.word.lastReviewed) {
        const lastReviewDate = new Date(term.word.lastReviewed);
        const daysDiff =
          (Date.now() - lastReviewDate.getTime()) / (1000 * 60 * 60 * 24);
        return daysDiff >= 7;
      }

      return false;
    });

    setReviewTerms(needsReview);
  };

  const handleTermUpdate = (
    listName: string,
    letter: string,
    updatedWord: WordWithExplanation,
  ) => {
    // Update localStorage
    const storageKey = `abcList-${listName}:${letter}`;
    const storedData = localStorage.getItem(storageKey);
    if (storedData) {
      const words: WordWithExplanation[] = JSON.parse(storedData);
      const updatedWords = words.map((word) =>
        word.text === updatedWord.text ? updatedWord : word,
      );
      localStorage.setItem(storageKey, JSON.stringify(updatedWords));
    }

    // Reload terms to reflect changes
    loadAllTerms();
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6 flex-wrap">
        <h1 className="text-3xl font-bold">Sokrates-Check</h1>
        <div className="flex gap-2 flex-wrap">
          <Button
            variant={view === "dashboard" ? "default" : "outline"}
            onClick={() => setView("dashboard")}
          >
            📊 Dashboard
          </Button>
          <Button
            variant={view === "review" ? "default" : "outline"}
            onClick={() => setView("review")}
            disabled={reviewTerms.length === 0}
          >
            📚 Überprüfen ({reviewTerms.length})
          </Button>
        </div>
      </div>

      <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h2 className="font-semibold text-blue-800 mb-2">
          💡 Was ist der Sokrates-Check?
        </h2>
        <p className="text-sm text-blue-700">
          Der Sokrates-Check ist ein wichtiges Birkenbihl-Tool zur
          Selbstüberprüfung. Bewerten Sie Ihr Verständnis der
          ABC-Listen-Begriffe auf einer Skala von 1-5. Begriffe mit niedriger
          Bewertung werden zur Wiederholung vorgeschlagen, um Ihren
          Lernfortschritt zu optimieren.
        </p>
      </div>

      {view === "dashboard" && (
        <SokratesDashboard
          allTerms={allTerms}
          reviewTerms={reviewTerms}
          onSwitchToReview={() => setView("review")}
        />
      )}

      {view === "review" && (
        <SokratesReview
          reviewTerms={reviewTerms}
          onTermUpdate={handleTermUpdate}
          onFinish={() => setView("dashboard")}
        />
      )}
    </div>
  );
}
