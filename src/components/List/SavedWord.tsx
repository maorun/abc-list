import React, {useState} from "react";
import {DeleteConfirm} from "../DeleteConfirm";
import {VisualElementsEditor} from "../DualCoding/VisualElementsEditor";
import {getSymbolById} from "@/lib/symbolLibrary";

export interface WordWithExplanation {
  text: string;
  explanation?: string;
  version?: number;
  imported?: boolean;
  rating?: number; // 1-5 scale for Sokrates-Check self-assessment
  lastReviewed?: string; // ISO date string
  // Enhanced spaced repetition fields
  repetitionCount?: number; // How many times reviewed
  easeFactor?: number; // Individual ease factor for this term
  interval?: number; // Current interval in days
  nextReviewDate?: string; // Calculated next review date (ISO string)
  // Dual-Coding Support: Visual elements for enhanced learning
  emoji?: string; // Unicode emoji for visual association
  symbol?: string; // Symbol ID from symbol library
  imageUrl?: string; // External image URL for visual learning
}

interface SavedWordProps {
  text: string;
  explanation?: string;
  imported?: boolean;
  rating?: number;
  emoji?: string;
  symbol?: string;
  imageUrl?: string;
  onDelete?: () => void;
  onExplanationChange?: (explanation: string) => void;
  onRatingChange?: (rating: number) => void;
  onVisualElementsChange?: (data: {
    emoji?: string;
    symbol?: string;
    imageUrl?: string;
  }) => void;
}

// Extracted function handlers to prevent recreation on every render
const handleDeleteAction =
  (setShowDelete: (show: boolean) => void, onDelete?: () => void) => () => {
    setShowDelete(false);
    if (onDelete) {
      onDelete();
    }
  };

const handleSaveExplanationAction =
  (
    explanationText: string,
    setEditingExplanation: (editing: boolean) => void,
    onExplanationChange?: (explanation: string) => void,
  ) =>
  () => {
    if (onExplanationChange) {
      onExplanationChange(explanationText);
    }
    setEditingExplanation(false);
  };

const handleRatingClickAction =
  (
    setShowRating: (show: boolean) => void,
    onRatingChange?: (rating: number) => void,
  ) =>
  (newRating: number) => {
    if (onRatingChange) {
      onRatingChange(newRating);
    }
    setShowRating(false);
  };

const handleRightClickAction =
  (showExplanation: boolean, setShowExplanation: (show: boolean) => void) =>
  (e: React.MouseEvent) => {
    e.preventDefault();
    setShowExplanation(!showExplanation);
  };

const handleRatingToggleAction =
  (showRating: boolean, setShowRating: (show: boolean) => void) =>
  (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowRating(!showRating);
  };

const handleRatingKeyDownAction =
  (showRating: boolean, setShowRating: (show: boolean) => void) =>
  (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      e.stopPropagation();
      setShowRating(!showRating);
    }
  };

const handleCancelExplanationAction =
  (
    explanation: string | undefined,
    setEditingExplanation: (editing: boolean) => void,
    setExplanationText: (text: string) => void,
  ) =>
  () => {
    setEditingExplanation(false);
    setExplanationText(explanation || "");
  };

const setShowDeleteTrueAction =
  (setShowDelete: (show: boolean) => void) => () => {
    setShowDelete(true);
  };

const setShowDeleteFalseAction =
  (setShowDelete: (show: boolean) => void) => () => {
    setShowDelete(false);
  };

const setShowExplanationFalseAction =
  (setShowExplanation: (show: boolean) => void) => () => {
    setShowExplanation(false);
  };

const setShowRatingFalseAction =
  (setShowRating: (show: boolean) => void) => () => {
    setShowRating(false);
  };

const setEditingExplanationTrueAction =
  (setEditingExplanation: (editing: boolean) => void) => () => {
    setEditingExplanation(true);
  };

const handleVisualElementsToggleAction =
  (
    showVisualElements: boolean,
    setShowVisualElements: (show: boolean) => void,
  ) =>
  (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowVisualElements(!showVisualElements);
  };

const handleVisualElementsSaveAction =
  (
    onVisualElementsChange:
      | ((data: {emoji?: string; symbol?: string; imageUrl?: string}) => void)
      | undefined,
    setShowVisualElements: (show: boolean) => void,
  ) =>
  (data: {emoji?: string; symbol?: string; imageUrl?: string}) => {
    if (onVisualElementsChange) {
      onVisualElementsChange(data);
    }
    setShowVisualElements(false);
  };

export function SavedWord({
  text,
  explanation,
  imported,
  rating,
  emoji,
  symbol,
  imageUrl,
  onDelete,
  onExplanationChange,
  onRatingChange,
  onVisualElementsChange,
}: SavedWordProps) {
  const [showDelete, setShowDelete] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [editingExplanation, setEditingExplanation] = useState(false);
  const [explanationText, setExplanationText] = useState(explanation || "");
  const [showRating, setShowRating] = useState(false);
  const [showVisualElements, setShowVisualElements] = useState(false);

  const symbolData = symbol ? getSymbolById(symbol) : undefined;
  const hasVisualElements = !!(emoji || symbol || imageUrl);

  // Create stable function references inside component
  const handleDelete = handleDeleteAction(setShowDelete, onDelete);
  const handleSaveExplanation = handleSaveExplanationAction(
    explanationText,
    setEditingExplanation,
    onExplanationChange,
  );
  const handleRatingClick = handleRatingClickAction(
    setShowRating,
    onRatingChange,
  );
  const handleRightClick = handleRightClickAction(
    showExplanation,
    setShowExplanation,
  );
  const handleRatingToggle = handleRatingToggleAction(
    showRating,
    setShowRating,
  );
  const handleRatingKeyDown = handleRatingKeyDownAction(
    showRating,
    setShowRating,
  );
  const handleCancelExplanation = handleCancelExplanationAction(
    explanation,
    setEditingExplanation,
    setExplanationText,
  );
  const showDeleteTrue = setShowDeleteTrueAction(setShowDelete);
  const showDeleteFalse = setShowDeleteFalseAction(setShowDelete);
  const showExplanationFalse =
    setShowExplanationFalseAction(setShowExplanation);
  const showRatingFalse = setShowRatingFalseAction(setShowRating);
  const editingExplanationTrue = setEditingExplanationTrueAction(
    setEditingExplanation,
  );
  const handleVisualElementsToggle = handleVisualElementsToggleAction(
    showVisualElements,
    setShowVisualElements,
  );
  const handleVisualElementsSave = handleVisualElementsSaveAction(
    onVisualElementsChange,
    setShowVisualElements,
  );

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
          onKeyDown={
            interactive
              ? (e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleRatingClick(i);
                  }
                }
              : undefined
          }
          role={interactive ? "button" : undefined}
          tabIndex={interactive ? 0 : undefined}
          title={interactive ? `Bewertung: ${i}/5` : undefined}
          aria-label={interactive ? `${i} von 5 Sternen bewerten` : undefined}
        >
          ★
        </span>,
      );
    }
    return stars;
  };

  return (
    <div className="my-1">
      <div className="relative">
        <button
          className={`p-2 border rounded cursor-pointer hover:bg-gray-100 w-full text-left ${
            imported ? "border-blue-300 bg-blue-50" : ""
          } ${explanation ? "border-l-4 border-l-green-400" : ""}`}
          onClick={showDeleteTrue}
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
            <div className="flex items-center gap-2">
              {emoji && <span className="text-xl">{emoji}</span>}
              {symbolData && (
                <span className="text-xl">{symbolData.emoji}</span>
              )}
              {imageUrl && <span className="text-sm">🖼️</span>}
              <span>{text}</span>
            </div>
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
                onClick={handleVisualElementsToggle}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    e.stopPropagation();
                    handleVisualElementsToggle(
                      e as unknown as React.MouseEvent,
                    );
                  }
                }}
                role="button"
                tabIndex={0}
                className={`text-xs ${hasVisualElements ? "text-purple-600" : "text-gray-400"} hover:text-purple-800 cursor-pointer`}
                title="Visuelle Elemente (Dual-Coding)"
                aria-label="Visuelle Elemente bearbeiten"
              >
                🎨
              </span>
              <span
                onClick={handleRatingToggle}
                onKeyDown={handleRatingKeyDown}
                role="button"
                tabIndex={0}
                className="text-xs text-blue-600 hover:text-blue-800 cursor-pointer"
                title="Bewertung ändern"
                aria-label="Bewertung ändern"
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
                onClick={showRatingFalse}
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
              <div className="flex gap-1">{renderStars(undefined, true)}</div>
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
                onClick={showExplanationFalse}
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
                    onClick={handleCancelExplanation}
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
                  onClick={editingExplanationTrue}
                  className="bg-green-500 hover:bg-green-700 text-white text-xs px-2 py-1 rounded"
                >
                  {explanation ? "Bearbeiten" : "Hinzufügen"}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <VisualElementsEditor
        isOpen={showVisualElements}
        onClose={() => setShowVisualElements(false)}
        currentEmoji={emoji}
        currentSymbol={symbol}
        currentImageUrl={imageUrl}
        onSave={handleVisualElementsSave}
      />

      <DeleteConfirm
        itemToDelete={text}
        isVisible={showDelete}
        onAbort={showDeleteFalse}
        onDelete={handleDelete}
      />
    </div>
  );
}
