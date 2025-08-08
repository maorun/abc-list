import React, {useState} from "react";
import {DeleteConfirm} from "../DeleteConfirm";

export interface WordWithExplanation {
  text: string;
  explanation?: string;
  version?: number;
  imported?: boolean;
  rating?: number; // 1-5 scale for Sokrates-Check self-assessment
  lastReviewed?: string; // ISO date string
}

interface SavedWordProps {
  text: string;
  explanation?: string;
  imported?: boolean;
  rating?: number;
  onDelete?: () => void;
  onExplanationChange?: (explanation: string) => void;
  onRatingChange?: (rating: number) => void;
}

export function SavedWord({
  text,
  explanation,
  imported,
  rating,
  onDelete,
  onExplanationChange,
  onRatingChange,
}: SavedWordProps) {
  const [showDelete, setShowDelete] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [editingExplanation, setEditingExplanation] = useState(false);
  const [explanationText, setExplanationText] = useState(explanation || "");
  const [showRating, setShowRating] = useState(false);

  const handleDelete = () => {
    setShowDelete(false);
    if (onDelete) {
      onDelete();
    }
  };

  const handleSaveExplanation = () => {
    if (onExplanationChange) {
      onExplanationChange(explanationText);
    }
    setEditingExplanation(false);
  };

  const handleRatingClick = (newRating: number) => {
    if (onRatingChange) {
      onRatingChange(newRating);
    }
    setShowRating(false);
  };

  const renderStars = (currentRating?: number, interactive = false) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      const filled = currentRating && i <= currentRating;
      stars.push(
        <span
          key={i}
          className={`text-lg ${
            interactive
              ? "cursor-pointer hover:text-yellow-400"
              : "cursor-default"
          } ${filled ? "text-yellow-500" : "text-gray-300"}`}
          onClick={interactive ? () => handleRatingClick(i) : undefined}
          title={interactive ? `Bewertung: ${i}/5` : undefined}
        >
          ★
        </span>,
      );
    }
    return stars;
  };

  const handleRightClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowExplanation(!showExplanation);
  };

  return (
    <div className="my-1">
      <div className="relative">
        <button
          className={`p-2 border rounded cursor-pointer hover:bg-gray-100 w-full text-left ${
            imported ? "border-blue-300 bg-blue-50" : ""
          } ${explanation ? "border-l-4 border-l-green-400" : ""}`}
          onClick={() => setShowDelete(true)}
          onContextMenu={handleRightClick}
          title={
            imported
              ? "Importierter Begriff"
              : explanation
                ? "Hat Erklärung - Rechtsklick zum Anzeigen"
                : "Rechtsklick für Erklärung"
          }
        >
          <div className="flex items-center justify-between">
            <span>{text}</span>
            <div className="flex gap-1 items-center">
              {imported && <span className="text-blue-600 text-xs">📥</span>}
              {explanation && (
                <span className="text-green-600 text-xs">💬</span>
              )}
              {rating && (
                <div className="flex items-center">
                  <span className="text-yellow-500 text-xs">★</span>
                  <span className="text-xs text-gray-600">{rating}</span>
                </div>
              )}
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  setShowRating(!showRating);
                }}
                className="text-xs text-blue-600 hover:text-blue-800 cursor-pointer"
                title="Bewertung ändern"
              >
                📊
              </span>
            </div>
          </div>
        </button>

        {showRating && (
          <div className="absolute z-10 mt-1 p-3 bg-white border rounded-lg shadow-lg w-full min-w-64">
            <div className="flex justify-between items-center mb-2">
              <h4 className="font-semibold text-sm">
                Sokrates-Check: &ldquo;{text}&rdquo;
              </h4>
              <button
                onClick={() => setShowRating(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="mb-3">
              <p className="text-xs text-gray-600 mb-2">
                Wie gut verstehen Sie diesen Begriff? (1 = gar nicht, 5 = sehr
                gut)
              </p>
              <div className="flex gap-1">
                {renderStars(undefined, true)}
              </div>
            </div>

            {rating && (
              <div className="text-xs text-gray-600">
                Aktuelle Bewertung: {renderStars(rating)}
              </div>
            )}
          </div>
        )}

        {showExplanation && (
          <div className="absolute z-10 mt-1 p-3 bg-white border rounded-lg shadow-lg w-full min-w-64">
            <div className="flex justify-between items-center mb-2">
              <h4 className="font-semibold text-sm">
                Erklärung für &ldquo;{text}&rdquo;
              </h4>
              <button
                onClick={() => setShowExplanation(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            {editingExplanation ? (
              <div>
                <textarea
                  value={explanationText}
                  onChange={(e) => setExplanationText(e.target.value)}
                  className="w-full p-2 border rounded text-sm resize-none"
                  rows={3}
                  placeholder="Fügen Sie hier Ihre Erklärung hinzu..."
                />
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={handleSaveExplanation}
                    className="bg-blue-500 hover:bg-blue-700 text-white text-xs px-2 py-1 rounded"
                  >
                    Speichern
                  </button>
                  <button
                    onClick={() => {
                      setEditingExplanation(false);
                      setExplanationText(explanation || "");
                    }}
                    className="bg-gray-500 hover:bg-gray-700 text-white text-xs px-2 py-1 rounded"
                  >
                    Abbrechen
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <p className="text-sm text-gray-700 mb-2">
                  {explanation || "Keine Erklärung vorhanden"}
                </p>
                <button
                  onClick={() => setEditingExplanation(true)}
                  className="bg-green-500 hover:bg-green-700 text-white text-xs px-2 py-1 rounded"
                >
                  {explanation ? "Bearbeiten" : "Hinzufügen"}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <DeleteConfirm
        itemToDelete={text}
        isVisible={showDelete}
        onAbort={() => setShowDelete(false)}
        onDelete={handleDelete}
      />
    </div>
  );
}
