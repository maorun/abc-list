import React, {useState} from "react";
import {Button} from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../ui/dialog";
import {MarketplaceTerm, UserProfile} from "./types";
import {BasarService} from "./BasarService";

interface BasarTermCardProps {
  term: MarketplaceTerm;
  currentUser: UserProfile;
  onBuy: (termId: string) => void;
  onRate: (termId: string, rating: number, comment?: string) => void;
  basarService: BasarService;
}

export function BasarTermCard({
  term,
  currentUser,
  onBuy,
  onRate,
  basarService,
}: BasarTermCardProps) {
  const [showRatingDialog, setShowRatingDialog] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [userComment, setUserComment] = useState("");

  const existingRating = basarService.getUserRating(term.id, currentUser.id);
  const canBuy =
    currentUser.points >= term.price && term.sellerId !== currentUser.id;
  const isOwnTerm = term.sellerId === currentUser.id;

  const handleOpenRating = () => {
    if (existingRating) {
      setUserRating(existingRating.rating);
      setUserComment(existingRating.comment || "");
    } else {
      setUserRating(0);
      setUserComment("");
    }
    setShowRatingDialog(true);
  };

  const handleSubmitRating = () => {
    if (userRating === 0) return;
    onRate(term.id, userRating, userComment.trim() || undefined);
    setShowRatingDialog(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("de-DE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const renderStars = (
    rating: number,
    interactive = false,
    size = "text-sm",
  ) => {
    return (
      <div className={`flex items-center ${size}`}>
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={interactive ? () => setUserRating(star) : undefined}
            className={`${
              interactive
                ? "hover:scale-110 transition-transform cursor-pointer"
                : ""
            } ${star <= rating ? "text-yellow-400" : "text-gray-300"}`}
            disabled={!interactive}
          >
            ⭐
          </button>
        ))}
        {!interactive && (
          <span className="ml-1 text-xs text-gray-500">
            ({term.ratingCount})
          </span>
        )}
      </div>
    );
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-4 border border-gray-200">
        {/* Header */}
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-blue-600 bg-blue-100 w-8 h-8 rounded-full flex items-center justify-center text-sm">
              {term.letter.toUpperCase()}
            </span>
            <div>
              <h3 className="font-bold text-lg text-gray-800">{term.text}</h3>
              <p className="text-xs text-gray-500">
                aus &quot;{term.listName}&quot;
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-green-600">
              💰 {term.price}
            </div>
            <div className="text-xs text-gray-500">Punkte</div>
          </div>
        </div>

        {/* Explanation */}
        {term.explanation && (
          <div className="mb-3">
            <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded italic">
              &quot;{term.explanation}&quot;
            </p>
          </div>
        )}

        {/* Quality Rating */}
        <div className="mb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {term.ratingCount > 0 ? (
                renderStars(term.quality)
              ) : (
                <span className="text-xs text-gray-400">
                  Noch nicht bewertet
                </span>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleOpenRating}
              className="text-xs text-blue-600 hover:text-blue-800"
            >
              {existingRating ? "⭐ Bearbeiten" : "⭐ Bewerten"}
            </Button>
          </div>
        </div>

        {/* Seller Info */}
        <div className="mb-3 text-xs text-gray-500">
          <div className="flex justify-between">
            <span>👤 {term.sellerName}</span>
            <span>📅 {formatDate(term.dateAdded)}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-2">
          {isOwnTerm ? (
            <Button disabled className="flex-1 bg-gray-300">
              🏷️ Ihr Begriff
            </Button>
          ) : (
            <Button
              onClick={() => onBuy(term.id)}
              disabled={!canBuy}
              className={`flex-1 ${
                canBuy
                  ? "bg-green-500 hover:bg-green-600"
                  : "bg-gray-300 cursor-not-allowed"
              }`}
            >
              {currentUser.points < term.price
                ? `💸 Zu wenig Punkte`
                : "🛒 Kaufen"}
            </Button>
          )}
        </div>

        {!canBuy && !isOwnTerm && (
          <div className="mt-2 text-xs text-red-500 text-center">
            Sie benötigen {term.price - currentUser.points} weitere Punkte
          </div>
        )}
      </div>

      {/* Rating Dialog */}
      <Dialog open={showRatingDialog} onOpenChange={setShowRatingDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Begriff bewerten</DialogTitle>
            <DialogDescription>
              Bewerten Sie &quot;{term.text}&quot; von {term.sellerName}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label
                htmlFor="user-rating"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Ihre Bewertung:
              </label>
              <div className="flex justify-center">
                {renderStars(userRating, true, "text-2xl")}
              </div>
              <div className="text-center mt-1 text-sm text-gray-500">
                {userRating === 0 && "Klicken Sie auf einen Stern"}
                {userRating === 1 && "⭐ Sehr schlecht"}
                {userRating === 2 && "⭐⭐ Schlecht"}
                {userRating === 3 && "⭐⭐⭐ Okay"}
                {userRating === 4 && "⭐⭐⭐⭐ Gut"}
                {userRating === 5 && "⭐⭐⭐⭐⭐ Ausgezeichnet"}
              </div>
            </div>

            <div>
              <label
                htmlFor="user-comment"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Kommentar (optional):
              </label>
              <textarea
                id="user-comment"
                value={userComment}
                onChange={(e) => setUserComment(e.target.value)}
                placeholder="Was finden Sie an diesem Begriff gut oder verbesserungswürdig?"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={3}
                maxLength={200}
              />
              <div className="text-xs text-gray-400 mt-1">
                {userComment.length}/200 Zeichen
              </div>
            </div>
          </div>

          <DialogFooter className="flex gap-2">
            <Button
              onClick={handleSubmitRating}
              disabled={userRating === 0}
              className="flex-1"
            >
              ⭐ Bewertung abgeben
            </Button>
            <Button
              variant="secondary"
              onClick={() => setShowRatingDialog(false)}
            >
              Abbrechen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
