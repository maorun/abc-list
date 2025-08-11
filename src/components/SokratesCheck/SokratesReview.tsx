import React, {useState} from "react";
import {WordWithExplanation} from "../List/SavedWord";
import {Button} from "../ui/button";

interface SokratesData {
  listName: string;
  letter: string;
  word: WordWithExplanation;
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

  if (reviewTerms.length === 0) {
    return (
      <div className="text-center py-8">
        <h2 className="text-2xl font-bold mb-4">
          🎉 Keine Begriffe zur Wiederholung!
        </h2>
        <p className="text-gray-600 mb-4">
          Alle Ihre Begriffe sind gut bewertet oder kürzlich überprüft worden.
        </p>
        <Button onClick={onFinish}>Zurück zum Dashboard</Button>
      </div>
    );
  }

  // Check if currentIndex is out of bounds
  if (currentIndex >= reviewTerms.length) {
    onFinish();
    return null;
  }

  const currentTerm = reviewTerms[currentIndex];
  if (!currentTerm) {
    onFinish();
    return null;
  }

  const progress = ((currentIndex + 1) / reviewTerms.length) * 100;

  const handleRating = (rating: number) => {
    const updatedWord: WordWithExplanation = {
      ...currentTerm.word,
      rating,
      lastReviewed: new Date().toISOString(),
    };

    onTermUpdate(currentTerm.listName, currentTerm.letter, updatedWord);

    // Move to next term or finish
    if (currentIndex < reviewTerms.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setShowExplanation(false);
    } else {
      // Review completed
      onFinish();
    }
  };

  const handleSkip = () => {
    if (currentIndex < reviewTerms.length - 1) {
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

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-lg font-semibold">
            Begriff {currentIndex + 1} von {reviewTerms.length}
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

          {currentTerm.word.rating && (
            <div className="text-sm text-gray-600 mb-4">
              Bisherige Bewertung: {"★".repeat(currentTerm.word.rating)}
              {"☆".repeat(5 - currentTerm.word.rating)}
            </div>
          )}
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

        {/* Rating Stars */}
        <div className="flex justify-center gap-2 mb-6 flex-wrap">{renderStars()}</div>

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
        <div className="flex justify-center gap-4 flex-wrap">
          <Button variant="outline" onClick={handleSkip}>
            Überspringen
          </Button>
          <Button variant="outline" onClick={onFinish}>
            Beenden
          </Button>
        </div>
      </div>

      {/* Help Text */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="font-semibold text-blue-800 mb-2">
          💡 Sokrates-Check Tipps
        </h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Seien Sie ehrlich bei der Bewertung Ihres Verständnisses</li>
          <li>
            • Niedrig bewertete Begriffe werden häufiger zur Wiederholung
            vorgeschlagen
          </li>
          <li>• Nutzen Sie die Erklärung, um Ihr Verständnis zu überprüfen</li>
          <li>• Begriffe mit 4-5 Sternen gelten als gut beherrscht</li>
        </ul>
      </div>
    </div>
  );
}
