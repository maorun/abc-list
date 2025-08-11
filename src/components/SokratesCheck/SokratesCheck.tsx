import React, {useState, useEffect} from "react";
import {WordWithExplanation} from "../List/SavedWord";
import {Button} from "../ui/button";
import {SokratesReview} from "./SokratesReview";
import {SokratesDashboard} from "./SokratesDashboard";
import {SpacedRepetitionSettings} from "./SpacedRepetitionSettings";
import {
  isTermDueForReview,
  getSpacedRepetitionStats,
} from "../../lib/spacedRepetition";
import {
  initializeNotifications,
  setupPeriodicNotifications,
} from "../../lib/notifications";

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

  useEffect(() => {
    // Initialize notifications system
    const getDueReviewsCount = () => reviewTerms.length;

    // Check immediately
    initializeNotifications(getDueReviewsCount);

    // Set up periodic checking
    const cleanup = setupPeriodicNotifications(getDueReviewsCount);

    return cleanup;
  }, [reviewTerms.length]);

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

    // Filter terms that need review using enhanced spaced repetition logic
    const needsReview = allTermsData.filter((term) => {
      return isTermDueForReview(
        term.word.lastReviewed,
        term.word.interval,
        term.word.nextReviewDate,
      );
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

  const handleSettingsChange = () => {
    // Reload terms when settings change to recalculate due reviews
    loadAllTerms();
  };

  // Get spaced repetition statistics for dashboard
  const spacedRepetitionStats = getSpacedRepetitionStats(
    allTerms.map((term) => ({
      rating: term.word.rating,
      lastReviewed: term.word.lastReviewed,
      repetitionCount: term.word.repetitionCount,
      interval: term.word.interval,
      nextReviewDate: term.word.nextReviewDate,
    })),
  );

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Sokrates-Check</h1>
        <div className="flex gap-2">
          <SpacedRepetitionSettings onSettingsChange={handleSettingsChange} />
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
          💡 Wissenschaftliche Spaced Repetition
        </h2>
        <p className="text-sm text-blue-700">
          Der Sokrates-Check nutzt einen wissenschaftlich fundierten
          Wiederholungsalgorithmus basierend auf der Ebbinghaus-Vergessenskurve.
          Begriffe werden optimal terminiert für maximale Lerneffizienz und
          Langzeitretention. Browser-Benachrichtigungen erinnern Sie automatisch
          an fällige Wiederholungen.
        </p>
      </div>

      {view === "dashboard" && (
        <SokratesDashboard
          allTerms={allTerms}
          reviewTerms={reviewTerms}
          spacedRepetitionStats={spacedRepetitionStats}
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
