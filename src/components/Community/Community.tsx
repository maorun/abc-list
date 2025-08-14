/**
 * Community Hub - Main interface for community features
 * Provides tabbed access to profiles, mentoring, challenges, reviews, and success stories
 */

import React, {useState, useEffect} from "react";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "../ui/tabs";
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
  Users,
  Award,
  MessageCircle,
  Star,
  Trophy,
  BookOpen,
} from "lucide-react";
import {
  CommunityService,
  CommunityProfile,
  CommunityChallenge,
  SuccessStory,
} from "../../lib/CommunityService";
import {UserProfile} from "./UserProfile";
import {MentorshipManager} from "./MentorshipManager";
import {CommunityChallenge as ChallengeComponent} from "./CommunityChallenge";
import {PeerReview} from "./PeerReview";
import {FeaturedUsers} from "./FeaturedUsers";

// Extract handlers outside component to prevent recreation on every render
const handleTabChangeAction = (
  value: string,
  setActiveTab: (tab: string) => void,
) => {
  setActiveTab(value);
};

const handleCreateProfileAction =
  (setShowCreateProfile: (show: boolean) => void) => () => {
    setShowCreateProfile(true);
  };

export function Community() {
  const [activeTab, setActiveTab] = useState("overview");
  const [communityData, setCommunityData] = useState({
    userProfile: null as CommunityProfile | null,
    challenges: [] as CommunityChallenge[],
    featuredStories: [] as SuccessStory[],
  });
  const [showCreateProfile, setShowCreateProfile] = useState(false);

  const communityService = CommunityService.getInstance();

  useEffect(() => {
    const loadCommunityData = () => {
      setCommunityData({
        userProfile: communityService.getUserProfile(),
        challenges: communityService.getCommunityCharges(),
        featuredStories: communityService.getFeaturedStories(),
      });
    };

    loadCommunityData();
    communityService.addListener(loadCommunityData);

    return () => {
      communityService.removeListener(loadCommunityData);
    };
  }, [communityService]);

  // Create stable handler references
  const handleTabChange = (value: string) =>
    handleTabChangeAction(value, setActiveTab);
  const handleCreateProfile = handleCreateProfileAction(setShowCreateProfile);

  const {userProfile, challenges, featuredStories} = communityData;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Community Hub</h1>
          <p className="text-gray-600 mt-2">
            Verbinde dich mit anderen Lernenden, teile Wissen und wachse
            gemeinsam
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          {!userProfile && (
            <Button onClick={handleCreateProfile} className="w-full sm:w-auto">
              <Users className="h-4 w-4 mr-2" />
              Profil erstellen
            </Button>
          )}
        </div>
      </div>

      {/* Community Stats Overview */}
      {userProfile && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <Trophy className="h-8 w-8 text-yellow-500 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Reputation
                  </p>
                  <p className="text-2xl font-bold">{userProfile.reputation}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <BookOpen className="h-8 w-8 text-blue-500 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Beiträge</p>
                  <p className="text-2xl font-bold">
                    {userProfile.contributionCount}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <MessageCircle className="h-8 w-8 text-green-500 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Hilfreiche Reviews
                  </p>
                  <p className="text-2xl font-bold">
                    {userProfile.helpfulReviews}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <Star className="h-8 w-8 text-purple-500 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Expertise-Bereiche
                  </p>
                  <p className="text-2xl font-bold">
                    {userProfile.expertise.length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Tabbed Interface */}
      <Tabs
        value={activeTab}
        onValueChange={handleTabChange}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-6 gap-1">
          <TabsTrigger value="overview" className="text-xs sm:text-sm">
            Übersicht
          </TabsTrigger>
          <TabsTrigger value="profile" className="text-xs sm:text-sm">
            Profil
          </TabsTrigger>
          <TabsTrigger value="mentoring" className="text-xs sm:text-sm">
            Mentoring
          </TabsTrigger>
          <TabsTrigger value="challenges" className="text-xs sm:text-sm">
            Challenges
          </TabsTrigger>
          <TabsTrigger value="reviews" className="text-xs sm:text-sm">
            Reviews
          </TabsTrigger>
          <TabsTrigger value="featured" className="text-xs sm:text-sm">
            Erfolgsgeschichten
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Active Challenges */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Award className="h-5 w-5 mr-2" />
                  Aktive Challenges
                </CardTitle>
                <CardDescription>
                  Nimm an Community-Challenges teil und verdiene Punkte
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {challenges.slice(0, 3).map((challenge) => (
                    <div key={challenge.id} className="border rounded-lg p-3">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium">{challenge.title}</h4>
                        <Badge
                          variant={
                            challenge.difficulty === "easy"
                              ? "secondary"
                              : challenge.difficulty === "medium"
                                ? "default"
                                : "destructive"
                          }
                        >
                          {challenge.difficulty}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        {challenge.description}
                      </p>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-blue-600">
                          {challenge.points} Punkte
                        </span>
                        <span className="text-xs text-gray-500">
                          {challenge.participants.length} Teilnehmer
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Featured Success Stories */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Trophy className="h-5 w-5 mr-2" />
                  Erfolgsgeschichten
                </CardTitle>
                <CardDescription>
                  Lass dich von anderen Community-Mitgliedern inspirieren
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {featuredStories.slice(0, 2).map((story) => (
                    <div key={story.id} className="border rounded-lg p-3">
                      <h4 className="font-medium mb-2">{story.title}</h4>
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                        {story.story}
                      </p>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          <Star className="h-4 w-4 text-yellow-500 mr-1" />
                          <span className="text-sm">{story.likes} Likes</span>
                        </div>
                        <Badge variant="secondary">Featured</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Getting Started Guide for New Users */}
          {!userProfile && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Willkommen in der Community!</CardTitle>
                <CardDescription>
                  Starte deine Community-Reise mit diesen einfachen Schritten
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <Users className="h-12 w-12 text-blue-500 mx-auto mb-3" />
                    <h4 className="font-medium mb-2">1. Profil erstellen</h4>
                    <p className="text-sm text-gray-600">
                      Erstelle dein Profil und teile deine Expertise-Bereiche
                    </p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <BookOpen className="h-12 w-12 text-green-500 mx-auto mb-3" />
                    <h4 className="font-medium mb-2">2. Lernen & Teilen</h4>
                    <p className="text-sm text-gray-600">
                      Finde Mentoren oder werde selbst zum Mentor für andere
                    </p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <Award className="h-12 w-12 text-purple-500 mx-auto mb-3" />
                    <h4 className="font-medium mb-2">3. Erfolge feiern</h4>
                    <p className="text-sm text-gray-600">
                      Nimm an Challenges teil und teile deine Erfolgsgeschichten
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="profile" className="mt-6">
          <UserProfile
            userProfile={userProfile}
            showCreateProfile={showCreateProfile}
            setShowCreateProfile={setShowCreateProfile}
          />
        </TabsContent>

        <TabsContent value="mentoring" className="mt-6">
          <MentorshipManager userProfile={userProfile} />
        </TabsContent>

        <TabsContent value="challenges" className="mt-6">
          <ChallengeComponent
            challenges={challenges}
            userProfile={userProfile}
          />
        </TabsContent>

        <TabsContent value="reviews" className="mt-6">
          <PeerReview userProfile={userProfile} />
        </TabsContent>

        <TabsContent value="featured" className="mt-6">
          <FeaturedUsers
            featuredStories={featuredStories}
            userProfile={userProfile}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
