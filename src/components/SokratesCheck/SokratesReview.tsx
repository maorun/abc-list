import React, {useState, useEffect} from "react";
import {WordWithExplanation} from "../List/SavedWord";
import {Button} from "../ui/button";
import {
  calculateNextReview,
  sortTermsByPriority,
  getRecommendedSessionSize,
} from "../../lib/spacedRepetition";

interface SokratesData {
  listName: string;
  letter: string;
  word: WordWithExplanation;
}

interface SortableTermWithData {
  rating?: number;
  lastReviewed?: string;
  interval?: number;
  nextReviewDate?: string;
  __termData: SokratesData;
}

interface SokratesReviewProps {
  reviewTerms: SokratesData[];
  onTermUpdate: (
    listName: string,
    letter: string,
    word: WordWithExplanation,
  ) => void;
  onFinish: () => void;
}

export function SokratesReview({
  reviewTerms,
  onTermUpdate,
  onFinish,
}: SokratesReviewProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showExplanation, setShowExplanation] = useState(false);

  // Check for bulk review mode
  const bulkReviewLists = localStorage.getItem("bulkReviewLists");
  const selectedLists = bulkReviewLists ? JSON.parse(bulkReviewLists) : null;

  // Filter review terms for bulk mode
  const filteredReviewTerms = selectedLists
    ? reviewTerms.filter((term) => selectedLists.includes(term.listName))
    : reviewTerms;

  const [sessionSize] = useState(() =>
    Math.min(
      getRecommendedSessionSize(filteredReviewTerms.length),
      filteredReviewTerms.length,
    ),
  );

  // Clear bulk review selection when component unmounts or finishes
  useEffect(() => {
    return () => {
      if (bulkReviewLists) {
        localStorage.removeItem("bulkReviewLists");
      }
    };
  }, [bulkReviewLists]);

  if (filteredReviewTerms.length === 0) {
    return (
      <div className="text-center py-8">
        <h2 className="text-2xl font-bold mb-4">
          🎉 Keine Begriffe zur Wiederholung!
        </h2>
        <p className="text-gray-600 mb-4">
          {selectedLists
            ? "Die ausgewählten Listen haben keine fälligen Begriffe."
            : "Alle Ihre Begriffe sind optimal terminiert nach dem wissenschaftlichen Spaced Repetition Algorithmus."}
        </p>
        <Button onClick={onFinish}>Zurück zum Dashboard</Button>
      </div>
    );
  }

  // Sort terms by priority (earliest due first, then by rating)
  const sortedTerms = sortTermsByPriority(
    filteredReviewTerms.map(
      (term) =>
        ({
          ...term.word,
          __termData: term, // Keep reference to original data
        }) as SortableTermWithData,
    ),
  ).map((term: SortableTermWithData) => term.__termData);

  // Use only session-sized portion
  const sessionTerms = sortedTerms.slice(0, sessionSize);

  // Check if currentIndex is out of bounds
  if (currentIndex >= sessionTerms.length) {
    onFinish();
    return null;
  }

  const currentTerm = sessionTerms[currentIndex];
  if (!currentTerm) {
    onFinish();
    return null;
  }

  const progress = ((currentIndex + 1) / sessionTerms.length) * 100;
  const isLastTerm = currentIndex === sessionTerms.length - 1;

  const handleRating = (rating: number) => {
    // Calculate next review using enhanced spaced repetition algorithm
    const reviewData = {
      rating: currentTerm.word.rating,
      lastReviewed: currentTerm.word.lastReviewed,
      repetitionCount: currentTerm.word.repetitionCount || 0,
      easeFactor: currentTerm.word.easeFactor || 2.5,
      interval: currentTerm.word.interval || 1,
    };

    const {nextReviewDate, newInterval, newEaseFactor, repetitionCount} =
      calculateNextReview(rating, reviewData);

    const updatedWord: WordWithExplanation = {
      ...currentTerm.word,
      rating,
      lastReviewed: new Date().toISOString(),
      repetitionCount,
      easeFactor: newEaseFactor,
      interval: newInterval,
      nextReviewDate: nextReviewDate.toISOString(),
    };

    onTermUpdate(currentTerm.listName, currentTerm.letter, updatedWord);

    // Move to next term or finish
    if (!isLastTerm) {
      setCurrentIndex(currentIndex + 1);
      setShowExplanation(false);
    } else {
      // Session completed
      onFinish();
    }
  };

  const handleSkip = () => {
    if (!isLastTerm) {
      setCurrentIndex(currentIndex + 1);
      setShowExplanation(false);
    } else {
      onFinish();
    }
  };

  const renderStars = (interactive = true) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <button
          key={i}
          onClick={interactive ? () => handleRating(i) : undefined}
          className={`text-4xl ${
            interactive
              ? "cursor-pointer hover:text-yellow-400 hover:scale-110 transition-all"
              : "cursor-default"
          } text-gray-300 hover:text-yellow-500`}
          title={`Bewertung: ${i}/5`}
          disabled={!interactive}
        >
          ★
        </button>,
      );
    }
    return stars;
  };

  const getNextIntervalPreview = (rating: number): number => {
    const reviewData = {
      rating: currentTerm.word.rating,
      lastReviewed: currentTerm.word.lastReviewed,
      repetitionCount: currentTerm.word.repetitionCount || 0,
      easeFactor: currentTerm.word.easeFactor || 2.5,
      interval: currentTerm.word.interval || 1,
    };

    return calculateNextReview(rating, reviewData).newInterval;
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-lg font-semibold">
            {selectedLists && (
              <span className="text-blue-600 text-sm mr-2">
                [Bulk-Modus: {selectedLists.length} Listen]
              </span>
            )}
            Begriff {currentIndex + 1} von {sessionTerms.length}
            {sessionTerms.length < filteredReviewTerms.length && (
              <span className="text-sm text-gray-600 ml-2">
                (Empfohlene Sitzung: {sessionTerms.length} von{" "}
                {filteredReviewTerms.length} fälligen Begriffen)
              </span>
            )}
          </h2>
          <span className="text-sm text-gray-600">{Math.round(progress)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{width: `${progress}%`}}
          ></div>
        </div>
      </div>

      {/* Current Term Card */}
      <div className="bg-white p-8 rounded-lg shadow-lg border">
        <div className="text-center mb-6">
          <div className="text-sm text-gray-500 mb-2">
            {currentTerm.listName} - Buchstabe{" "}
            {currentTerm.letter.toUpperCase()}
          </div>
          <h3 className="text-3xl font-bold text-gray-800 mb-4">
            {currentTerm.word.text}
          </h3>

          {/* Review History */}
          <div className="flex justify-center gap-4 text-sm text-gray-600 mb-4">
            {currentTerm.word.rating && (
              <div>
                Bisherige Bewertung: {"★".repeat(currentTerm.word.rating)}
                {"☆".repeat(5 - currentTerm.word.rating)}
              </div>
            )}
            {currentTerm.word.repetitionCount && (
              <div>Wiederholungen: {currentTerm.word.repetitionCount}</div>
            )}
            {currentTerm.word.interval && (
              <div>Letztes Intervall: {currentTerm.word.interval} Tage</div>
            )}
          </div>
        </div>

        {/* Question */}
        <div className="text-center mb-6">
          <p className="text-lg text-gray-700 mb-4">
            Wie gut verstehen Sie diesen Begriff?
          </p>
          <p className="text-sm text-gray-600 mb-6">
            1 = gar nicht verstanden • 5 = sehr gut verstanden
          </p>
        </div>

        {/* Rating Stars with Preview */}
        <div className="mb-6">
          <div className="flex justify-center gap-2 mb-4">{renderStars()}</div>

          {/* Interval Preview */}
          <div className="text-center">
            <p className="text-xs text-gray-500 mb-2">
              Nächste Wiederholung in:
            </p>
            <div className="flex justify-center gap-4 text-xs">
              {[1, 2, 3, 4, 5].map((rating) => (
                <div key={rating} className="text-center">
                  <div className="mb-1">
                    {"★".repeat(rating)}
                    {"☆".repeat(5 - rating)}
                  </div>
                  <div className="text-blue-600 font-medium">
                    {getNextIntervalPreview(rating)} Tag
                    {getNextIntervalPreview(rating) !== 1 ? "e" : ""}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Explanation Toggle */}
        {currentTerm.word.explanation && (
          <div className="mb-6">
            <Button
              variant="outline"
              onClick={() => setShowExplanation(!showExplanation)}
              className="w-full"
            >
              {showExplanation ? "Erklärung ausblenden" : "Erklärung anzeigen"}
            </Button>

            {showExplanation && (
              <div className="mt-4 p-4 bg-gray-50 rounded border">
                <h4 className="font-semibold mb-2">Ihre Erklärung:</h4>
                <p className="text-gray-700">{currentTerm.word.explanation}</p>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-center gap-4">
          <Button variant="outline" onClick={handleSkip}>
            Überspringen
          </Button>
          <Button variant="outline" onClick={onFinish}>
            Session beenden
          </Button>
        </div>
      </div>

      {/* Help Text */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="font-semibold text-blue-800 mb-2">
          🧠 Wissenschaftlich optimiert
        </h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>
            • Basiert auf der Ebbinghaus-Vergessenskurve für optimale Retention
          </li>
          <li>• Intervalle passen sich automatisch an Ihre Leistung an</li>
          <li>• Schlecht bewertete Begriffe erscheinen häufiger</li>
          <li>• Gut beherrschte Begriffe werden seltener wiederholt</li>
          <li>• Empfohlene Sitzungsgröße für kognitive Effizienz</li>
        </ul>
      </div>
    </div>
  );
}
