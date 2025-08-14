/**
 * MentorshipManager Component - Handles mentor/mentee matching and connections
 * Provides intelligent matching based on expertise areas and availability
 */

import React, {useState, useEffect} from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {Textarea} from "../ui/textarea";
import {Label} from "../ui/label";
import {
  Users,
  Star,
  MessageCircle,
  Send,
  Award,
  BookOpen,
  Shield,
} from "lucide-react";
import {
  CommunityService,
  CommunityProfile,
  MentorshipConnection,
} from "../../lib/CommunityService";

interface MentorshipManagerProps {
  userProfile: CommunityProfile | null;
}

// Extract handlers outside component to prevent recreation on every render
const handleRequestMentorshipAction =
  (
    mentorId: string,
    expertiseArea: string,
    message: string,
    setShowRequestDialog: (show: boolean) => void,
    setRequestMessage: (message: string) => void,
  ) =>
  () => {
    const communityService = CommunityService.getInstance();
    try {
      communityService.requestMentorship(mentorId, expertiseArea);
      setShowRequestDialog(false);
      setRequestMessage("");
    } catch (error) {
      console.error("Failed to request mentorship:", error);
    }
  };

const handleFindMentorsAction =
  (
    selectedArea: string,
    setAvailableMentors: (mentors: CommunityProfile[]) => void,
  ) =>
  () => {
    if (!selectedArea) return;

    const communityService = CommunityService.getInstance();
    const mentors = communityService.findMentors(selectedArea);
    setAvailableMentors(mentors);
  };

export function MentorshipManager({userProfile}: MentorshipManagerProps) {
  const [mentorships, setMentorships] = useState<MentorshipConnection[]>([]);
  const [availableMentors, setAvailableMentors] = useState<CommunityProfile[]>(
    [],
  );
  const [selectedArea, setSelectedArea] = useState<string>("");
  const [showRequestDialog, setShowRequestDialog] = useState(false);
  const [selectedMentor, setSelectedMentor] = useState<CommunityProfile | null>(
    null,
  );
  const [requestMessage, setRequestMessage] = useState("");

  const communityService = CommunityService.getInstance();

  useEffect(() => {
    const loadMentorshipData = () => {
      setMentorships(communityService.getMentorships());
    };

    loadMentorshipData();
    communityService.addListener(loadMentorshipData);

    return () => {
      communityService.removeListener(loadMentorshipData);
    };
  }, [communityService]);

  // Create stable handler references
  const handleFindMentors = handleFindMentorsAction(
    selectedArea,
    setAvailableMentors,
  );

  const handleRequestMentorship = (mentorId: string, expertiseArea: string) =>
    handleRequestMentorshipAction(
      mentorId,
      expertiseArea,
      requestMessage,
      setShowRequestDialog,
      setRequestMessage,
    )();

  if (!userProfile) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="h-5 w-5 mr-2" />
            Mentoring System
          </CardTitle>
          <CardDescription>
            Erstelle zuerst ein Community-Profil, um das Mentoring-System zu
            nutzen
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Profil erforderlich</h3>
            <p className="text-gray-600">
              Um Mentoren zu finden oder selbst als Mentor zu agieren, benötigst
              du ein Community-Profil mit deinen Expertise-Bereichen.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const userMentorships = mentorships.filter(
    (m) =>
      m.mentorId === userProfile.userId || m.menteeId === userProfile.userId,
  );

  const userExpertiseAreas = userProfile.expertise.map((exp) => exp.area);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Mentoring System</h2>
          <p className="text-gray-600 mt-1">
            Verbinde dich mit erfahrenen Mentoren oder teile dein Wissen mit
            anderen
          </p>
        </div>
      </div>

      {/* Current Mentorships */}
      {userMentorships.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <MessageCircle className="h-5 w-5 mr-2" />
              Deine Mentorships
            </CardTitle>
            <CardDescription>
              Übersicht über deine aktiven und vergangenen Mentoring-Beziehungen
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {userMentorships.map((mentorship) => (
                <div key={mentorship.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-medium">
                        {mentorship.mentorId === userProfile.userId
                          ? "Mentee"
                          : "Mentor"}
                        :{" "}
                        {mentorship.mentorId === userProfile.userId
                          ? `User ${mentorship.menteeId.slice(-6)}`
                          : `User ${mentorship.mentorId.slice(-6)}`}
                      </h4>
                      <p className="text-sm text-gray-600">
                        Bereich: {mentorship.expertiseArea}
                      </p>
                    </div>
                    <Badge
                      variant={
                        mentorship.status === "active"
                          ? "default"
                          : mentorship.status === "pending"
                            ? "secondary"
                            : "outline"
                      }
                    >
                      {mentorship.status === "active" && "Aktiv"}
                      {mentorship.status === "pending" && "Ausstehend"}
                      {mentorship.status === "completed" && "Abgeschlossen"}
                      {mentorship.status === "cancelled" && "Abgebrochen"}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center text-sm text-gray-500">
                    <span>
                      {mentorship.sessionCount} Session
                      {mentorship.sessionCount !== 1 ? "s" : ""}
                    </span>
                    <span>
                      Seit{" "}
                      {new Date(mentorship.requestDate).toLocaleDateString(
                        "de-DE",
                      )}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Find Mentors Section */}
      {userProfile.menteeInterested && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BookOpen className="h-5 w-5 mr-2" />
              Mentoren finden
            </CardTitle>
            <CardDescription>
              Finde erfahrene Mentoren in deinen Interessensbereichen
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Expertise Area Selection */}
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="flex-1">
                  <Label htmlFor="expertiseSelect">Fachbereich wählen</Label>
                  <Select value={selectedArea} onValueChange={setSelectedArea}>
                    <SelectTrigger>
                      <SelectValue placeholder="Wähle deinen Interessensbereich" />
                    </SelectTrigger>
                    <SelectContent>
                      {userExpertiseAreas.map((area) => (
                        <SelectItem key={area} value={area}>
                          {area}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  onClick={handleFindMentors}
                  disabled={!selectedArea}
                  className="sm:mt-6"
                >
                  <Users className="h-4 w-4 mr-2" />
                  Mentoren suchen
                </Button>
              </div>

              {/* Available Mentors */}
              {availableMentors.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-medium">
                    Verfügbare Mentoren in {selectedArea}
                  </h4>
                  {availableMentors.map((mentor) => (
                    <div key={mentor.userId} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h5 className="font-medium flex items-center">
                            {mentor.displayName}
                            {mentor.expertise.some((exp) => exp.verified) && (
                              <Shield className="h-4 w-4 text-green-500 ml-1" />
                            )}
                          </h5>
                          <p className="text-sm text-gray-600 mt-1">
                            {mentor.bio}
                          </p>
                        </div>
                        <Dialog
                          open={showRequestDialog}
                          onOpenChange={setShowRequestDialog}
                        >
                          <DialogTrigger asChild>
                            <Button
                              size="sm"
                              onClick={() => setSelectedMentor(mentor)}
                            >
                              <Send className="h-4 w-4 mr-2" />
                              Anfragen
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Mentorship-Anfrage</DialogTitle>
                              <DialogDescription>
                                Sende eine Mentorship-Anfrage an{" "}
                                {selectedMentor?.displayName}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label htmlFor="requestMessage">
                                  Nachricht (optional)
                                </Label>
                                <Textarea
                                  id="requestMessage"
                                  value={requestMessage}
                                  onChange={(e) =>
                                    setRequestMessage(e.target.value)
                                  }
                                  placeholder="Beschreibe deine Lernziele und warum du dich für diesen Mentor interessierst..."
                                  rows={4}
                                />
                              </div>
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="outline"
                                  onClick={() => setShowRequestDialog(false)}
                                >
                                  Abbrechen
                                </Button>
                                <Button
                                  onClick={() =>
                                    selectedMentor &&
                                    handleRequestMentorship(
                                      selectedMentor.userId,
                                      selectedArea,
                                    )
                                  }
                                >
                                  Anfrage senden
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>

                      {/* Mentor Expertise */}
                      <div className="flex flex-wrap gap-1 mb-3">
                        {mentor.expertise
                          .filter((exp) => exp.area === selectedArea)
                          .map((exp) => (
                            <Badge
                              key={exp.area}
                              variant="secondary"
                              className="text-xs"
                            >
                              {exp.level}
                              {exp.endorsements > 0 && (
                                <span className="ml-1">
                                  ({exp.endorsements} ⭐)
                                </span>
                              )}
                            </Badge>
                          ))}
                      </div>

                      {/* Mentor Stats */}
                      <div className="flex justify-between text-sm text-gray-500">
                        <div className="flex items-center">
                          <Star className="h-4 w-4 mr-1" />
                          <span>Reputation: {mentor.reputation}</span>
                        </div>
                        <div className="flex items-center">
                          <Award className="h-4 w-4 mr-1" />
                          <span>{mentor.contributionCount} Beiträge</span>
                        </div>
                        <div className="flex items-center">
                          <MessageCircle className="h-4 w-4 mr-1" />
                          <span>{mentor.helpfulReviews} Reviews</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Become a Mentor Section */}
      {userProfile.mentorAvailable && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Award className="h-5 w-5 mr-2" />
              Als Mentor aktiv
            </CardTitle>
            <CardDescription>
              Du bist als Mentor in folgenden Bereichen verfügbar
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {userProfile.expertise.map((exp) => (
                  <Badge
                    key={exp.area}
                    variant="default"
                    className="flex items-center gap-1"
                  >
                    {exp.area} ({exp.level})
                    {exp.verified && <Shield className="h-3 w-3 text-white" />}
                  </Badge>
                ))}
              </div>
              <p className="text-sm text-gray-600">
                Andere Nutzer können dich als Mentor in diesen Bereichen finden
                und kontaktieren. Du erhältst Benachrichtigungen über neue
                Mentorship-Anfragen.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Getting Started Guide */}
      {!userProfile.mentorAvailable && !userProfile.menteeInterested && (
        <Card>
          <CardHeader>
            <CardTitle>Mentoring-System nutzen</CardTitle>
            <CardDescription>
              Aktiviere Mentoring in deinen Profil-Einstellungen
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="text-center p-4 border rounded-lg">
                <BookOpen className="h-12 w-12 text-blue-500 mx-auto mb-3" />
                <h4 className="font-medium mb-2">Als Mentee</h4>
                <p className="text-sm text-gray-600">
                  Finde erfahrene Mentoren, die dir bei deinen Lernzielen helfen
                  können
                </p>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <Award className="h-12 w-12 text-green-500 mx-auto mb-3" />
                <h4 className="font-medium mb-2">Als Mentor</h4>
                <p className="text-sm text-gray-600">
                  Teile dein Wissen und unterstütze andere bei ihrem Lernprozess
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
