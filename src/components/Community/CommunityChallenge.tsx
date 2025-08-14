/**
 * CommunityChallenge Component - Manages community challenges and competitions
 * Extends existing gamification system with collaborative challenges
 */

import React, {useState} from "react";
import {Button} from "../ui/button";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "../ui/card";
import {Badge} from "../ui/badge";
import {Progress} from "../ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import {
  Trophy,
  Calendar,
  Users,
  Target,
  Clock,
  Award,
  Star,
  CheckCircle,
  Play,
} from "lucide-react";
import {
  CommunityService,
  CommunityProfile,
  CommunityChallenge as Challenge,
} from "../../lib/CommunityService";

interface CommunityChallengeProps {
  challenges: Challenge[];
  userProfile: CommunityProfile | null;
}

// Extract handlers outside component to prevent recreation on every render
const handleParticipateAction = (
  challengeId: string,
  communityService: CommunityService,
) => () => {
  communityService.participateInChallenge(challengeId);
};

const handleViewDetailsAction = (
  challenge: Challenge,
  setSelectedChallenge: (challenge: Challenge | null) => void,
  setShowDetails: (show: boolean) => void,
) => () => {
  setSelectedChallenge(challenge);
  setShowDetails(true);
};

// Challenge detail modal component
function ChallengeDetails({
  challenge,
  userProfile,
  onClose,
}: {
  challenge: Challenge;
  userProfile: CommunityProfile | null;
  onClose: () => void;
}) {
  const communityService = CommunityService.getInstance();
  const isParticipating = userProfile
    ? challenge.participants.includes(userProfile.userId)
    : false;

  const daysRemaining = Math.ceil(
    (new Date(challenge.endDate).getTime() - new Date().getTime()) /
      (1000 * 60 * 60 * 24),
  );

  const handleParticipate = handleParticipateAction(challenge.id, communityService);

  return (
    <div className="space-y-6">
      {/* Challenge Header */}
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-xl font-bold">{challenge.title}</h3>
          <div className="flex items-center gap-2 mt-2">
            <Badge
              variant={
                challenge.difficulty === "easy"
                  ? "secondary"
                  : challenge.difficulty === "medium"
                  ? "default"
                  : "destructive"
              }
            >
              {challenge.difficulty === "easy" && "Einfach"}
              {challenge.difficulty === "medium" && "Mittel"}
              {challenge.difficulty === "hard" && "Schwer"}
            </Badge>
            <Badge variant="outline">
              {challenge.type === "learning" && "Lernen"}
              {challenge.type === "creation" && "Kreativität"}
              {challenge.type === "collaboration" && "Zusammenarbeit"}
              {challenge.type === "review" && "Bewertung"}
            </Badge>
            <Badge
              variant={
                challenge.status === "active"
                  ? "default"
                  : challenge.status === "upcoming"
                  ? "secondary"
                  : "outline"
              }
            >
              {challenge.status === "active" && "Aktiv"}
              {challenge.status === "upcoming" && "Bald verfügbar"}
              {challenge.status === "completed" && "Abgeschlossen"}
            </Badge>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-blue-600">{challenge.points}</div>
          <div className="text-sm text-gray-500">Punkte</div>
        </div>
      </div>

      {/* Challenge Description */}
      <div>
        <h4 className="font-medium mb-2">Beschreibung</h4>
        <p className="text-gray-700">{challenge.description}</p>
      </div>

      {/* Requirements */}
      <div>
        <h4 className="font-medium mb-2">Anforderungen</h4>
        <ul className="space-y-1">
          {challenge.requirements.map((req, index) => (
            <li key={index} className="flex items-center text-sm">
              <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
              {req}
            </li>
          ))}
        </ul>
      </div>

      {/* Challenge Timeline */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <h4 className="font-medium mb-2 flex items-center">
            <Calendar className="h-4 w-4 mr-2" />
            Zeitrahmen
          </h4>
          <div className="text-sm text-gray-600">
            <p>Start: {new Date(challenge.startDate).toLocaleDateString("de-DE")}</p>
            <p>Ende: {new Date(challenge.endDate).toLocaleDateString("de-DE")}</p>
            {daysRemaining > 0 && (
              <p className="text-blue-600 font-medium mt-1">
                Noch {daysRemaining} Tag{daysRemaining !== 1 ? "e" : ""}
              </p>
            )}
          </div>
        </div>
        <div>
          <h4 className="font-medium mb-2 flex items-center">
            <Users className="h-4 w-4 mr-2" />
            Teilnahme
          </h4>
          <div className="text-sm text-gray-600">
            <p>{challenge.participants.length} Teilnehmer</p>
            {challenge.winners.length > 0 && (
              <p className="text-green-600 font-medium">
                {challenge.winners.length} Gewinner
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Participation Button */}
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onClose}>
          Schließen
        </Button>
        {userProfile && challenge.status === "active" && (
          <Button
            onClick={handleParticipate}
            disabled={isParticipating}
            variant={isParticipating ? "secondary" : "default"}
          >
            {isParticipating ? (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Bereits teilgenommen
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Teilnehmen
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}

export function CommunityChallenge({challenges, userProfile}: CommunityChallengeProps) {
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string>("all");

  const communityService = CommunityService.getInstance();

  // Filter challenges based on active filter
  const filteredChallenges = challenges.filter((challenge) => {
    if (activeFilter === "all") return true;
    if (activeFilter === "active") return challenge.status === "active";
    if (activeFilter === "participating") {
      return userProfile ? challenge.participants.includes(userProfile.userId) : false;
    }
    return challenge.type === activeFilter;
  });

  // Create stable handler references
  const handleViewDetails = (challenge: Challenge) =>
    handleViewDetailsAction(challenge, setSelectedChallenge, setShowDetails)();

  if (!userProfile) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Trophy className="h-5 w-5 mr-2" />
            Community-Challenges
          </CardTitle>
          <CardDescription>
            Erstelle zuerst ein Community-Profil, um an Challenges teilzunehmen
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Trophy className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Profil erforderlich</h3>
            <p className="text-gray-600">
              Um an Community-Challenges teilzunehmen und Punkte zu sammeln, benötigst du
              ein Community-Profil.
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
          <h2 className="text-2xl font-bold text-gray-900">Community-Challenges</h2>
          <p className="text-gray-600 mt-1">
            Nimm an Challenges teil, sammle Punkte und konkurriere mit anderen Lernenden
          </p>
        </div>
      </div>

      {/* Filter Buttons */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={activeFilter === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => setActiveFilter("all")}
        >
          Alle
        </Button>
        <Button
          variant={activeFilter === "active" ? "default" : "outline"}
          size="sm"
          onClick={() => setActiveFilter("active")}
        >
          Aktive
        </Button>
        <Button
          variant={activeFilter === "participating" ? "default" : "outline"}
          size="sm"
          onClick={() => setActiveFilter("participating")}
        >
          Meine Teilnahmen
        </Button>
        <Button
          variant={activeFilter === "learning" ? "default" : "outline"}
          size="sm"
          onClick={() => setActiveFilter("learning")}
        >
          Lernen
        </Button>
        <Button
          variant={activeFilter === "creation" ? "default" : "outline"}
          size="sm"
          onClick={() => setActiveFilter("creation")}
        >
          Kreativität
        </Button>
        <Button
          variant={activeFilter === "review" ? "default" : "outline"}
          size="sm"
          onClick={() => setActiveFilter("review")}
        >
          Bewertung
        </Button>
      </div>

      {/* Challenges Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredChallenges.map((challenge) => {
          const isParticipating = challenge.participants.includes(userProfile.userId);
          const daysRemaining = Math.ceil(
            (new Date(challenge.endDate).getTime() - new Date().getTime()) /
              (1000 * 60 * 60 * 24),
          );
          const progressPercent = challenge.status === "completed" ? 100 : 
            Math.max(0, Math.min(100, ((new Date().getTime() - new Date(challenge.startDate).getTime()) / 
            (new Date(challenge.endDate).getTime() - new Date(challenge.startDate).getTime())) * 100));

          return (
            <Card key={challenge.id} className={isParticipating ? "border-blue-500" : ""}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{challenge.title}</CardTitle>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge
                        variant={
                          challenge.difficulty === "easy"
                            ? "secondary"
                            : challenge.difficulty === "medium"
                            ? "default"
                            : "destructive"
                        }
                      >
                        {challenge.difficulty === "easy" && "Einfach"}
                        {challenge.difficulty === "medium" && "Mittel"}
                        {challenge.difficulty === "hard" && "Schwer"}
                      </Badge>
                      <Badge variant="outline">
                        {challenge.type === "learning" && "Lernen"}
                        {challenge.type === "creation" && "Kreativität"}
                        {challenge.type === "collaboration" && "Zusammenarbeit"}
                        {challenge.type === "review" && "Bewertung"}
                      </Badge>
                      {isParticipating && (
                        <Badge variant="default">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Teilgenommen
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold text-blue-600">
                      {challenge.points}
                    </div>
                    <div className="text-xs text-gray-500">Punkte</div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Description */}
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {challenge.description}
                  </p>

                  {/* Progress Bar */}
                  {challenge.status === "active" && (
                    <div>
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>Fortschritt</span>
                        <span>{Math.round(progressPercent)}%</span>
                      </div>
                      <Progress value={progressPercent} className="h-2" />
                    </div>
                  )}

                  {/* Stats */}
                  <div className="flex justify-between items-center text-sm">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-1 text-gray-400" />
                        <span>{challenge.participants.length}</span>
                      </div>
                      {daysRemaining > 0 && challenge.status === "active" && (
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1 text-gray-400" />
                          <span>{daysRemaining}d</span>
                        </div>
                      )}
                      {challenge.winners.length > 0 && (
                        <div className="flex items-center">
                          <Star className="h-4 w-4 mr-1 text-yellow-500" />
                          <span>{challenge.winners.length} Gewinner</span>
                        </div>
                      )}
                    </div>
                    <Badge
                      variant={
                        challenge.status === "active"
                          ? "default"
                          : challenge.status === "upcoming"
                          ? "secondary"
                          : "outline"
                      }
                    >
                      {challenge.status === "active" && "Aktiv"}
                      {challenge.status === "upcoming" && "Bald"}
                      {challenge.status === "completed" && "Beendet"}
                    </Badge>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <Dialog open={showDetails} onOpenChange={setShowDetails}>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewDetails(challenge)}
                          className="flex-1"
                        >
                          Details anzeigen
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Challenge Details</DialogTitle>
                          <DialogDescription>
                            Vollständige Informationen zur Challenge
                          </DialogDescription>
                        </DialogHeader>
                        {selectedChallenge && (
                          <ChallengeDetails
                            challenge={selectedChallenge}
                            userProfile={userProfile}
                            onClose={() => setShowDetails(false)}
                          />
                        )}
                      </DialogContent>
                    </Dialog>

                    {challenge.status === "active" && (
                      <Button
                        size="sm"
                        onClick={handleParticipateAction(challenge.id, communityService)}
                        disabled={isParticipating}
                        variant={isParticipating ? "secondary" : "default"}
                      >
                        {isParticipating ? (
                          <>
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Teilgenommen
                          </>
                        ) : (
                          <>
                            <Play className="h-4 w-4 mr-1" />
                            Teilnehmen
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredChallenges.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Trophy className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Keine Challenges gefunden</h3>
            <p className="text-gray-600">
              {activeFilter === "all"
                ? "Derzeit sind keine Challenges verfügbar."
                : `Keine Challenges in der Kategorie "${activeFilter}" gefunden.`}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}