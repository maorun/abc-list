/**
 * FeaturedUsers Component - Showcases success stories and community highlights
 * Motivates users through peer achievements and inspiring content
 */

import React, {useState} from "react";
import {Button} from "../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
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
  Trophy,
  Star,
  Heart,
  Plus,
  Award,
  TrendingUp,
  Users,
} from "lucide-react";
import {
  CommunityService,
  CommunityProfile,
  SuccessStory,
} from "../../lib/CommunityService";

interface FeaturedUsersProps {
  featuredStories: SuccessStory[];
  userProfile: CommunityProfile | null;
}

// Extract handlers outside component to prevent recreation on every render
const handleSubmitStoryAction =
  (
    storyData: {
      title: string;
      story: string;
      achievements: string[];
      before: string;
      after: string;
    },
    userProfile: CommunityProfile,
    setShowStoryDialog: (show: boolean) => void,
    resetForm: () => void,
  ) =>
  () => {
    const communityService = CommunityService.getInstance();

    communityService.submitSuccessStory({
      userId: userProfile.userId,
      title: storyData.title,
      story: storyData.story,
      achievements: storyData.achievements,
      beforeAfter: {
        before: storyData.before,
        after: storyData.after,
      },
    });

    setShowStoryDialog(false);
    resetForm();
  };

const handleLikeStoryAction =
  (storyId: string, communityService: CommunityService) => () => {
    communityService.likeStory(storyId);
  };

const handleAddAchievementAction =
  (
    newAchievement: string,
    achievements: string[],
    setAchievements: (achievements: string[]) => void,
    setNewAchievement: (achievement: string) => void,
  ) =>
  () => {
    if (
      newAchievement.trim() &&
      !achievements.includes(newAchievement.trim())
    ) {
      setAchievements([...achievements, newAchievement.trim()]);
      setNewAchievement("");
    }
  };

const handleRemoveAchievementAction =
  (
    achievement: string,
    achievements: string[],
    setAchievements: (achievements: string[]) => void,
  ) =>
  () => {
    setAchievements(achievements.filter((a) => a !== achievement));
  };

// Success story form component
function StoryForm({
  userProfile,
  onClose,
}: {
  userProfile: CommunityProfile;
  onClose: () => void;
}) {
  const [title, setTitle] = useState("");
  const [story, setStory] = useState("");
  const [achievements, setAchievements] = useState<string[]>([]);
  const [before, setBefore] = useState("");
  const [after, setAfter] = useState("");
  const [newAchievement, setNewAchievement] = useState("");

  const resetForm = () => {
    setTitle("");
    setStory("");
    setAchievements([]);
    setBefore("");
    setAfter("");
    setNewAchievement("");
  };

  // Create stable handler references
  const handleSubmitStory = handleSubmitStoryAction(
    {
      title,
      story,
      achievements,
      before,
      after,
    },
    userProfile,
    onClose,
    resetForm,
  );

  const handleAddAchievement = handleAddAchievementAction(
    newAchievement,
    achievements,
    setAchievements,
    setNewAchievement,
  );

  const handleRemoveAchievement = (achievement: string) =>
    handleRemoveAchievementAction(achievement, achievements, setAchievements)();

  const canSubmit =
    title.trim() && story.trim() && before.trim() && after.trim();

  return (
    <div className="space-y-6">
      {/* Story Title */}
      <div>
        <Label htmlFor="title">Titel deiner Erfolgsgeschichte</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="z.B. 'Von 0 auf 100: Meine Physik-Transformation'"
        />
      </div>

      {/* Main Story */}
      <div>
        <Label htmlFor="story">Deine Geschichte</Label>
        <Textarea
          id="story"
          value={story}
          onChange={(e) => setStory(e.target.value)}
          placeholder="Erzähle deine Erfolgsgeschichte. Was war deine Motivation? Welche Herausforderungen hattest du? Wie hast du sie überwunden?"
          rows={6}
        />
      </div>

      {/* Before/After */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="before">Vorher</Label>
          <Textarea
            id="before"
            value={before}
            onChange={(e) => setBefore(e.target.value)}
            placeholder="Wie war deine Situation vor dem Erfolg?"
            rows={3}
          />
        </div>
        <div>
          <Label htmlFor="after">Nachher</Label>
          <Textarea
            id="after"
            value={after}
            onChange={(e) => setAfter(e.target.value)}
            placeholder="Was hat sich durch deinen Erfolg verändert?"
            rows={3}
          />
        </div>
      </div>

      {/* Achievements */}
      <div>
        <Label>Erreichte Ziele</Label>
        <div className="flex gap-2 mt-2">
          <Input
            value={newAchievement}
            onChange={(e) => setNewAchievement(e.target.value)}
            placeholder="z.B. 'Physik-Prüfung bestanden'"
            onKeyPress={(e) => e.key === "Enter" && handleAddAchievement()}
          />
          <Button
            type="button"
            onClick={handleAddAchievement}
            disabled={!newAchievement.trim()}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {achievements.map((achievement) => (
            <Badge
              key={achievement}
              variant="secondary"
              className="flex items-center gap-1"
            >
              {achievement}
              <button
                type="button"
                onClick={() => handleRemoveAchievement(achievement)}
                className="ml-1 hover:text-red-500"
              >
                ×
              </button>
            </Badge>
          ))}
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onClose}>
          Abbrechen
        </Button>
        <Button onClick={handleSubmitStory} disabled={!canSubmit}>
          Geschichte einreichen
        </Button>
      </div>
    </div>
  );
}

export function FeaturedUsers({
  featuredStories,
  userProfile,
}: FeaturedUsersProps) {
  const [showStoryDialog, setShowStoryDialog] = useState(false);
  const [selectedStory, setSelectedStory] = useState<SuccessStory | null>(null);
  const [showStoryDetails, setShowStoryDetails] = useState(false);

  const communityService = CommunityService.getInstance();

  // Create stable handler references
  const handleLikeStory = (storyId: string) =>
    handleLikeStoryAction(storyId, communityService)();

  const allStories = communityService.getSuccessStories();
  const recentStories = allStories
    .sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    )
    .slice(0, 6);

  if (!userProfile) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Trophy className="h-5 w-5 mr-2" />
            Erfolgsgeschichten
          </CardTitle>
          <CardDescription>
            Erstelle zuerst ein Community-Profil, um Erfolgsgeschichten zu
            teilen
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Trophy className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Profil erforderlich</h3>
            <p className="text-gray-600">
              Um deine eigenen Erfolgsgeschichten zu teilen und andere zu
              inspirieren, benötigst du ein Community-Profil.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Erfolgsgeschichten
          </h2>
          <p className="text-gray-600 mt-1">
            Lass dich von anderen inspirieren und teile deine eigenen Erfolge
          </p>
        </div>
        <Dialog open={showStoryDialog} onOpenChange={setShowStoryDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Geschichte teilen
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Deine Erfolgsgeschichte</DialogTitle>
              <DialogDescription>
                Teile deine Lernerfahrung und inspiriere andere in der Community
              </DialogDescription>
            </DialogHeader>
            <StoryForm
              userProfile={userProfile}
              onClose={() => setShowStoryDialog(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Featured Stories Section */}
      {featuredStories.length > 0 && (
        <div>
          <h3 className="text-xl font-semibold mb-4 flex items-center">
            <Star className="h-5 w-5 mr-2 text-yellow-500" />
            Hervorgehobene Geschichten
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {featuredStories.map((story) => (
              <Card key={story.id} className="border-yellow-200 bg-yellow-50">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{story.title}</CardTitle>
                      <CardDescription>
                        Von User {story.userId.slice(-6)} •{" "}
                        {new Date(story.timestamp).toLocaleDateString("de-DE")}
                      </CardDescription>
                    </div>
                    <Badge variant="secondary" className="bg-yellow-200">
                      <Star className="h-3 w-3 mr-1" />
                      Featured
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-gray-700 line-clamp-3">{story.story}</p>

                    {/* Achievements */}
                    {story.achievements.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {story.achievements
                          .slice(0, 3)
                          .map((achievement, index) => (
                            <Badge
                              key={index}
                              variant="outline"
                              className="text-xs"
                            >
                              {achievement}
                            </Badge>
                          ))}
                        {story.achievements.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{story.achievements.length - 3} weitere
                          </Badge>
                        )}
                      </div>
                    )}

                    {/* Story Actions */}
                    <div className="flex justify-between items-center pt-2">
                      <div className="flex items-center gap-4">
                        <button
                          onClick={() => handleLikeStory(story.id)}
                          className="flex items-center gap-1 text-sm text-gray-600 hover:text-red-500 transition-colors"
                        >
                          <Heart className="h-4 w-4" />
                          <span>{story.likes}</span>
                        </button>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedStory(story);
                          setShowStoryDetails(true);
                        }}
                      >
                        Mehr lesen
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Recent Stories Section */}
      <div>
        <h3 className="text-xl font-semibold mb-4 flex items-center">
          <TrendingUp className="h-5 w-5 mr-2 text-blue-500" />
          Neueste Geschichten
        </h3>

        {recentStories.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <Trophy className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">
                Noch keine Geschichten
              </h3>
              <p className="text-gray-600 mb-4">
                Sei der Erste und teile deine Erfolgsgeschichte mit der
                Community!
              </p>
              <Button onClick={() => setShowStoryDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Erste Geschichte schreiben
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentStories.map((story) => (
              <Card key={story.id}>
                <CardHeader>
                  <CardTitle className="text-base">{story.title}</CardTitle>
                  <CardDescription>
                    User {story.userId.slice(-6)} •{" "}
                    {new Date(story.timestamp).toLocaleDateString("de-DE")}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <p className="text-sm text-gray-700 line-clamp-2">
                      {story.story}
                    </p>

                    {/* Quick Stats */}
                    <div className="flex justify-between items-center text-xs text-gray-500">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center">
                          <Heart className="h-3 w-3 mr-1" />
                          {story.likes}
                        </div>
                        <div className="flex items-center">
                          <Award className="h-3 w-3 mr-1" />
                          {story.achievements.length}
                        </div>
                      </div>
                      {story.featured && (
                        <Badge variant="secondary" className="text-xs">
                          Featured
                        </Badge>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleLikeStory(story.id)}
                        className="flex-1"
                      >
                        <Heart className="h-3 w-3 mr-1" />
                        Like
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedStory(story);
                          setShowStoryDetails(true);
                        }}
                        className="flex-1"
                      >
                        Lesen
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Story Details Modal */}
      <Dialog open={showStoryDetails} onOpenChange={setShowStoryDetails}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedStory?.title}</DialogTitle>
            <DialogDescription>
              Von User {selectedStory?.userId.slice(-6)} •{" "}
              {selectedStory &&
                new Date(selectedStory.timestamp).toLocaleDateString("de-DE")}
            </DialogDescription>
          </DialogHeader>

          {selectedStory && (
            <div className="space-y-6">
              {/* Full Story */}
              <div>
                <h4 className="font-medium mb-2">Die Geschichte</h4>
                <p className="text-gray-700 whitespace-pre-wrap">
                  {selectedStory.story}
                </p>
              </div>

              {/* Before/After */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-red-50 rounded-lg">
                  <h4 className="font-medium mb-2 text-red-700">Vorher</h4>
                  <p className="text-sm text-red-600">
                    {selectedStory.beforeAfter.before}
                  </p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <h4 className="font-medium mb-2 text-green-700">Nachher</h4>
                  <p className="text-sm text-green-600">
                    {selectedStory.beforeAfter.after}
                  </p>
                </div>
              </div>

              {/* Achievements */}
              {selectedStory.achievements.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Erreichte Ziele</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedStory.achievements.map((achievement, index) => (
                      <Badge key={index} variant="secondary">
                        <Award className="h-3 w-3 mr-1" />
                        {achievement}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-between items-center pt-4 border-t">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => handleLikeStory(selectedStory.id)}
                    className="flex items-center gap-2 text-sm text-gray-600 hover:text-red-500 transition-colors"
                  >
                    <Heart className="h-4 w-4" />
                    <span>{selectedStory.likes} Likes</span>
                  </button>
                  {selectedStory.featured && (
                    <Badge variant="secondary">
                      <Star className="h-3 w-3 mr-1" />
                      Featured
                    </Badge>
                  )}
                </div>
                <Button
                  variant="outline"
                  onClick={() => setShowStoryDetails(false)}
                >
                  Schließen
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Community Impact Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="h-5 w-5 mr-2" />
            Community-Impact
          </CardTitle>
          <CardDescription>
            Wie unsere Erfolgsgeschichten andere inspirieren
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {allStories.length}
              </div>
              <div className="text-sm text-gray-600">Geteilte Geschichten</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {allStories.reduce((sum, story) => sum + story.likes, 0)}
              </div>
              <div className="text-sm text-gray-600">Insgesamt Likes</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">
                {allStories.reduce(
                  (sum, story) => sum + story.achievements.length,
                  0,
                )}
              </div>
              <div className="text-sm text-gray-600">Erreichte Ziele</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
