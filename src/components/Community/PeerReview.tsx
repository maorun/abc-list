/**
 * PeerReview Component - Manages peer review system for Basar contributions
 * Integrates with existing Basar system to enhance content quality
 */

import React, {useState, useEffect} from "react";
import {Button} from "../ui/button";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "../ui/card";
import {Badge} from "../ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import {Input} from "../ui/input";
import {Label} from "../ui/label";
import {Textarea} from "../ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  MessageCircle,
  Star,
  ThumbsUp,
  Edit,
  Eye,
  Award,
  Filter,
  CheckCircle,
} from "lucide-react";
import {
  CommunityService,
  CommunityProfile,
  PeerReview as Review,
} from "../../lib/CommunityService";

interface PeerReviewProps {
  userProfile: CommunityProfile | null;
}

// Extract handlers outside component to prevent recreation on every render
const handleSubmitReviewAction = (
  reviewData: {
    itemId: string;
    itemType: string;
    rating: number;
    comment: string;
    categories: {
      accuracy: number;
      usefulness: number;
      clarity: number;
      creativity: number;
    };
  },
  userProfile: CommunityProfile,
  setShowReviewDialog: (show: boolean) => void,
  resetForm: () => void,
) => () => {
  const communityService = CommunityService.getInstance();
  
  communityService.submitReview({
    ...reviewData,
    reviewerId: userProfile.userId,
  });
  
  setShowReviewDialog(false);
  resetForm();
};

const handleRatingChangeAction = (
  category: string,
  setCategories: (categories: any) => void,
  categories: any,
) => (rating: number) => {
  setCategories({
    ...categories,
    [category]: rating,
  });
};

// Star rating component
function StarRating({
  rating,
  onRatingChange,
  readonly = false,
}: {
  rating: number;
  onRatingChange?: (rating: number) => void;
  readonly?: boolean;
}) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => !readonly && onRatingChange?.(star)}
          className={`${
            readonly ? "cursor-default" : "cursor-pointer hover:scale-110"
          } transition-transform`}
        >
          <Star
            className={`h-5 w-5 ${
              star <= rating
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300"
            }`}
          />
        </button>
      ))}
    </div>
  );
}

// Review form component
function ReviewForm({
  userProfile,
  onClose,
}: {
  userProfile: CommunityProfile;
  onClose: () => void;
}) {
  const [itemId, setItemId] = useState("");
  const [itemType, setItemType] = useState<"abc-list" | "kawa" | "kaga">("abc-list");
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [categories, setCategories] = useState({
    accuracy: 0,
    usefulness: 0,
    clarity: 0,
    creativity: 0,
  });

  const resetForm = () => {
    setItemId("");
    setItemType("abc-list");
    setRating(0);
    setComment("");
    setCategories({
      accuracy: 0,
      usefulness: 0,
      clarity: 0,
      creativity: 0,
    });
  };

  // Create stable handler references
  const handleSubmitReview = handleSubmitReviewAction(
    {
      itemId,
      itemType,
      rating,
      comment,
      categories,
    },
    userProfile,
    onClose,
    resetForm,
  );

  const handleCategoryRating = (category: string) =>
    handleRatingChangeAction(category, setCategories, categories);

  const canSubmit = itemId.trim() && rating > 0 && comment.trim() &&
    Object.values(categories).every(c => c > 0);

  return (
    <div className="space-y-6">
      {/* Item Selection */}
      <div className="space-y-4">
        <div>
          <Label htmlFor="itemType">Beitragstyp</Label>
          <Select value={itemType} onValueChange={(value) => setItemType(value as any)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="abc-list">ABC-Liste</SelectItem>
              <SelectItem value="kawa">KaWa</SelectItem>
              <SelectItem value="kaga">KaGa</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="itemId">Beitrags-ID oder Titel</Label>
          <Input
            id="itemId"
            value={itemId}
            onChange={(e) => setItemId(e.target.value)}
            placeholder="ID oder Titel des zu bewertenden Beitrags"
          />
        </div>
      </div>

      {/* Overall Rating */}
      <div>
        <Label>Gesamtbewertung</Label>
        <div className="flex items-center gap-2 mt-2">
          <StarRating rating={rating} onRatingChange={setRating} />
          <span className="text-sm text-gray-600">
            ({rating}/5 {rating === 1 ? "Stern" : "Sterne"})
          </span>
        </div>
      </div>

      {/* Category Ratings */}
      <div className="space-y-4">
        <Label>Detailbewertung</Label>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label className="text-sm">Genauigkeit</Label>
            <div className="flex items-center gap-2 mt-1">
              <StarRating
                rating={categories.accuracy}
                onRatingChange={handleCategoryRating("accuracy")}
              />
              <span className="text-xs text-gray-500">
                ({categories.accuracy}/5)
              </span>
            </div>
          </div>
          
          <div>
            <Label className="text-sm">Nützlichkeit</Label>
            <div className="flex items-center gap-2 mt-1">
              <StarRating
                rating={categories.usefulness}
                onRatingChange={handleCategoryRating("usefulness")}
              />
              <span className="text-xs text-gray-500">
                ({categories.usefulness}/5)
              </span>
            </div>
          </div>
          
          <div>
            <Label className="text-sm">Klarheit</Label>
            <div className="flex items-center gap-2 mt-1">
              <StarRating
                rating={categories.clarity}
                onRatingChange={handleCategoryRating("clarity")}
              />
              <span className="text-xs text-gray-500">
                ({categories.clarity}/5)
              </span>
            </div>
          </div>
          
          <div>
            <Label className="text-sm">Kreativität</Label>
            <div className="flex items-center gap-2 mt-1">
              <StarRating
                rating={categories.creativity}
                onRatingChange={handleCategoryRating("creativity")}
              />
              <span className="text-xs text-gray-500">
                ({categories.creativity}/5)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Comment */}
      <div>
        <Label htmlFor="comment">Kommentar</Label>
        <Textarea
          id="comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Teile deine detaillierte Bewertung und konstruktives Feedback..."
          rows={4}
        />
      </div>

      {/* Submit Button */}
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onClose}>
          Abbrechen
        </Button>
        <Button onClick={handleSubmitReview} disabled={!canSubmit}>
          Review einreichen
        </Button>
      </div>
    </div>
  );
}

export function PeerReview({userProfile}: PeerReviewProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [filterType, setFilterType] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("newest");

  const communityService = CommunityService.getInstance();

  useEffect(() => {
    const loadReviews = () => {
      setReviews(communityService.getReviews());
    };

    loadReviews();
    communityService.addListener(loadReviews);

    return () => {
      communityService.removeListener(loadReviews);
    };
  }, [communityService]);

  // Filter and sort reviews
  const filteredAndSortedReviews = reviews
    .filter((review) => {
      if (filterType === "all") return true;
      if (filterType === "mine") return userProfile ? review.reviewerId === userProfile.userId : false;
      return review.itemType === filterType;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
        case "oldest":
          return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
        case "rating_high":
          return b.rating - a.rating;
        case "rating_low":
          return a.rating - b.rating;
        case "helpful":
          return b.helpfulnessRating - a.helpfulnessRating;
        default:
          return 0;
      }
    });

  if (!userProfile) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <MessageCircle className="h-5 w-5 mr-2" />
            Peer-Review System
          </CardTitle>
          <CardDescription>
            Erstelle zuerst ein Community-Profil, um Reviews zu schreiben und zu lesen
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <MessageCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Profil erforderlich</h3>
            <p className="text-gray-600">
              Um Reviews zu schreiben und die Qualität von Basar-Beiträgen zu verbessern,
              benötigst du ein Community-Profil.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const userReviews = reviews.filter(r => r.reviewerId === userProfile.userId);
  const averageRating = userReviews.length > 0 
    ? userReviews.reduce((sum, r) => sum + r.rating, 0) / userReviews.length 
    : 0;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Peer-Review System</h2>
          <p className="text-gray-600 mt-1">
            Bewerte Basar-Beiträge und hilf der Community mit konstruktivem Feedback
          </p>
        </div>
        <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
          <DialogTrigger asChild>
            <Button>
              <Edit className="h-4 w-4 mr-2" />
              Review schreiben
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Neues Review</DialogTitle>
              <DialogDescription>
                Bewerte einen Basar-Beitrag und teile dein Feedback
              </DialogDescription>
            </DialogHeader>
            <ReviewForm
              userProfile={userProfile}
              onClose={() => setShowReviewDialog(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* User Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Edit className="h-8 w-8 text-blue-500 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-600">Meine Reviews</p>
                <p className="text-2xl font-bold">{userReviews.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Star className="h-8 w-8 text-yellow-500 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-600">Ø Bewertung</p>
                <p className="text-2xl font-bold">{averageRating.toFixed(1)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <ThumbsUp className="h-8 w-8 text-green-500 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-600">Hilfreiche Reviews</p>
                <p className="text-2xl font-bold">{userProfile.helpfulReviews}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Award className="h-8 w-8 text-purple-500 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-600">Reputation</p>
                <p className="text-2xl font-bold">{userProfile.reputation}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Sorting */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Label htmlFor="filterType">Filter</Label>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle Reviews</SelectItem>
              <SelectItem value="mine">Meine Reviews</SelectItem>
              <SelectItem value="abc-list">ABC-Listen</SelectItem>
              <SelectItem value="kawa">KaWa</SelectItem>
              <SelectItem value="kaga">KaGa</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex-1">
          <Label htmlFor="sortBy">Sortierung</Label>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Neueste zuerst</SelectItem>
              <SelectItem value="oldest">Älteste zuerst</SelectItem>
              <SelectItem value="rating_high">Bewertung (hoch-niedrig)</SelectItem>
              <SelectItem value="rating_low">Bewertung (niedrig-hoch)</SelectItem>
              <SelectItem value="helpful">Hilfreichste zuerst</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {filteredAndSortedReviews.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <MessageCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Keine Reviews gefunden</h3>
              <p className="text-gray-600">
                {filterType === "all"
                  ? "Noch keine Reviews vorhanden. Sei der Erste und schreibe ein Review!"
                  : `Keine Reviews in der Kategorie "${filterType}" gefunden.`}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredAndSortedReviews.map((review) => (
            <Card key={review.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">
                      Review für {review.itemType === "abc-list" ? "ABC-Liste" : 
                                 review.itemType === "kawa" ? "KaWa" : "KaGa"}
                    </CardTitle>
                    <CardDescription>
                      Von User {review.reviewerId.slice(-6)} • {" "}
                      {new Date(review.timestamp).toLocaleDateString("de-DE")}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <StarRating rating={review.rating} readonly />
                    <Badge variant="outline">
                      {review.itemType === "abc-list" && "ABC-Liste"}
                      {review.itemType === "kawa" && "KaWa"}
                      {review.itemType === "kaga" && "KaGa"}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Main Comment */}
                  <p className="text-gray-700">{review.comment}</p>

                  {/* Category Ratings */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
                    <div className="text-center">
                      <p className="text-xs font-medium text-gray-600 mb-1">Genauigkeit</p>
                      <div className="flex justify-center">
                        <StarRating rating={review.categories.accuracy} readonly />
                      </div>
                    </div>
                    <div className="text-center">
                      <p className="text-xs font-medium text-gray-600 mb-1">Nützlichkeit</p>
                      <div className="flex justify-center">
                        <StarRating rating={review.categories.usefulness} readonly />
                      </div>
                    </div>
                    <div className="text-center">
                      <p className="text-xs font-medium text-gray-600 mb-1">Klarheit</p>
                      <div className="flex justify-center">
                        <StarRating rating={review.categories.clarity} readonly />
                      </div>
                    </div>
                    <div className="text-center">
                      <p className="text-xs font-medium text-gray-600 mb-1">Kreativität</p>
                      <div className="flex justify-center">
                        <StarRating rating={review.categories.creativity} readonly />
                      </div>
                    </div>
                  </div>

                  {/* Review Actions */}
                  <div className="flex justify-between items-center pt-2">
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>Item: {review.itemId}</span>
                      {review.helpfulnessRating > 0 && (
                        <div className="flex items-center">
                          <ThumbsUp className="h-4 w-4 mr-1" />
                          <span>{review.helpfulnessRating} hilfreich</span>
                        </div>
                      )}
                    </div>
                    <Badge
                      variant={
                        review.status === "published"
                          ? "default"
                          : review.status === "pending"
                          ? "secondary"
                          : "destructive"
                      }
                    >
                      {review.status === "published" && (
                        <>
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Veröffentlicht
                        </>
                      )}
                      {review.status === "pending" && "Ausstehend"}
                      {review.status === "flagged" && "Gemeldet"}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}