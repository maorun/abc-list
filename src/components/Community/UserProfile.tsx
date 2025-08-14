/**
 * UserProfile Component - Manages user community profiles with expertise areas
 * Integrates with existing gamification system for a cohesive experience
 */

import React, {useState} from "react";
import {Button} from "../ui/button";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "../ui/card";
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
import {Badge} from "../ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {Switch} from "../ui/switch";
import {
  User,
  Edit,
  Star,
  Award,
  Calendar,
  Plus,
  X,
  Shield,
  BookOpen,
} from "lucide-react";
import {
  CommunityService,
  CommunityProfile,
  UserExpertise,
  EXPERTISE_AREAS,
  ExpertiseArea,
} from "../../lib/CommunityService";

interface UserProfileProps {
  userProfile: CommunityProfile | null;
  showCreateProfile: boolean;
  setShowCreateProfile: (show: boolean) => void;
}

// Extract handlers outside component to prevent recreation on every render
const handleSaveProfileAction = (
  profileData: Partial<CommunityProfile>,
  userProfile: CommunityProfile | null,
  setShowCreateProfile: (show: boolean) => void,
  setShowEditProfile: (show: boolean) => void,
) => () => {
  const communityService = CommunityService.getInstance();
  
  if (userProfile) {
    communityService.updateUserProfile(profileData);
    setShowEditProfile(false);
  } else {
    communityService.createUserProfile(profileData);
    setShowCreateProfile(false);
  }
};

const handleAddExpertiseAction = (
  newExpertise: UserExpertise,
  expertise: UserExpertise[],
  setExpertise: (expertise: UserExpertise[]) => void,
  setShowAddExpertise: (show: boolean) => void,
) => () => {
  if (newExpertise.area && !expertise.some(e => e.area === newExpertise.area)) {
    setExpertise([...expertise, newExpertise]);
    setShowAddExpertise(false);
  }
};

const handleRemoveExpertiseAction = (
  area: string,
  expertise: UserExpertise[],
  setExpertise: (expertise: UserExpertise[]) => void,
) => () => {
  setExpertise(expertise.filter(e => e.area !== area));
};

const handleMentorToggleAction = (
  mentorAvailable: boolean,
  setMentorAvailable: (available: boolean) => void,
) => (checked: boolean) => {
  setMentorAvailable(checked);
};

const handleMenteeToggleAction = (
  menteeInterested: boolean,
  setMenteeInterested: (interested: boolean) => void,
) => (checked: boolean) => {
  setMenteeInterested(checked);
};

// Profile creation/edit form component
function ProfileForm({
  userProfile,
  onClose,
}: {
  userProfile: CommunityProfile | null;
  onClose: () => void;
}) {
  const [displayName, setDisplayName] = useState(userProfile?.displayName || "");
  const [bio, setBio] = useState(userProfile?.bio || "");
  const [expertise, setExpertise] = useState<UserExpertise[]>(
    userProfile?.expertise || [],
  );
  const [mentorAvailable, setMentorAvailable] = useState(
    userProfile?.mentorAvailable || false,
  );
  const [menteeInterested, setMenteeInterested] = useState(
    userProfile?.menteeInterested || false,
  );
  const [showAddExpertise, setShowAddExpertise] = useState(false);
  const [newExpertiseArea, setNewExpertiseArea] = useState<ExpertiseArea | "">("");
  const [newExpertiseLevel, setNewExpertiseLevel] = useState<
    "Beginner" | "Intermediate" | "Advanced" | "Expert"
  >("Beginner");

  const isEditing = !!userProfile;

  // Create stable handler references
  const handleSaveProfile = handleSaveProfileAction(
    {
      displayName,
      bio,
      expertise,
      mentorAvailable,
      menteeInterested,
    },
    userProfile,
    onClose,
    onClose,
  );

  const handleAddExpertise = handleAddExpertiseAction(
    {
      area: newExpertiseArea as string,
      level: newExpertiseLevel,
      verified: false,
      endorsements: 0,
    },
    expertise,
    setExpertise,
    setShowAddExpertise,
  );

  const handleRemoveExpertise = (area: string) =>
    handleRemoveExpertiseAction(area, expertise, setExpertise)();

  const handleMentorToggle = handleMentorToggleAction(
    mentorAvailable,
    setMentorAvailable,
  );

  const handleMenteeToggle = handleMenteeToggleAction(
    menteeInterested,
    setMenteeInterested,
  );

  return (
    <div className="space-y-6">
      {/* Basic Profile Information */}
      <div className="space-y-4">
        <div>
          <Label htmlFor="displayName">Anzeigename</Label>
          <Input
            id="displayName"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Dein Name in der Community"
          />
        </div>
        <div>
          <Label htmlFor="bio">Über mich</Label>
          <Textarea
            id="bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Erzähle etwas über dich und deine Lernziele..."
            rows={4}
          />
        </div>
      </div>

      {/* Expertise Areas */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Label>Expertise-Bereiche</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowAddExpertise(true)}
          >
            <Plus className="h-4 w-4 mr-1" />
            Hinzufügen
          </Button>
        </div>

        <div className="flex flex-wrap gap-2">
          {expertise.map((exp) => (
            <Badge key={exp.area} variant="secondary" className="flex items-center gap-1">
              {exp.area} ({exp.level})
              {exp.verified && <Shield className="h-3 w-3 text-green-500" />}
              <button
                type="button"
                onClick={() => handleRemoveExpertise(exp.area)}
                className="ml-1 hover:text-red-500"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>

        {showAddExpertise && (
          <Card>
            <CardContent className="p-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="expertiseArea">Fachbereich</Label>
                  <Select
                    value={newExpertiseArea}
                    onValueChange={(value) => setNewExpertiseArea(value as ExpertiseArea)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Wähle einen Bereich" />
                    </SelectTrigger>
                    <SelectContent>
                      {EXPERTISE_AREAS.map((area) => (
                        <SelectItem key={area} value={area}>
                          {area}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="expertiseLevel">Level</Label>
                  <Select
                    value={newExpertiseLevel}
                    onValueChange={(value) =>
                      setNewExpertiseLevel(
                        value as "Beginner" | "Intermediate" | "Advanced" | "Expert",
                      )
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Beginner">Anfänger</SelectItem>
                      <SelectItem value="Intermediate">Fortgeschritten</SelectItem>
                      <SelectItem value="Advanced">Erfahren</SelectItem>
                      <SelectItem value="Expert">Experte</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAddExpertise(false)}
                >
                  Abbrechen
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={handleAddExpertise}
                  disabled={!newExpertiseArea}
                >
                  Hinzufügen
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Mentoring Preferences */}
      <div className="space-y-4">
        <Label>Mentoring-Einstellungen</Label>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="mentorAvailable">Als Mentor verfügbar</Label>
              <p className="text-sm text-gray-600">
                Ich möchte andere bei ihrem Lernprozess unterstützen
              </p>
            </div>
            <Switch
              id="mentorAvailable"
              checked={mentorAvailable}
              onCheckedChange={handleMentorToggle}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="menteeInterested">An Mentoring interessiert</Label>
              <p className="text-sm text-gray-600">
                Ich suche einen Mentor für meine Lernziele
              </p>
            </div>
            <Switch
              id="menteeInterested"
              checked={menteeInterested}
              onCheckedChange={handleMenteeToggle}
            />
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onClose}>
          Abbrechen
        </Button>
        <Button
          type="button"
          onClick={handleSaveProfile}
          disabled={!displayName.trim()}
        >
          {isEditing ? "Speichern" : "Profil erstellen"}
        </Button>
      </div>
    </div>
  );
}

export function UserProfile({
  userProfile,
  showCreateProfile,
  setShowCreateProfile,
}: UserProfileProps) {
  const [showEditProfile, setShowEditProfile] = useState(false);

  if (!userProfile && !showCreateProfile) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <User className="h-5 w-5 mr-2" />
            Community-Profil
          </CardTitle>
          <CardDescription>
            Erstelle dein Profil, um Teil der Lern-Community zu werden
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <User className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Noch kein Profil erstellt</h3>
            <p className="text-gray-600 mb-4">
              Erstelle dein Community-Profil, um mit anderen Lernenden in Kontakt zu treten,
              Mentoren zu finden oder selbst zum Mentor zu werden.
            </p>
            <Button onClick={() => setShowCreateProfile(true)}>
              <User className="h-4 w-4 mr-2" />
              Profil erstellen
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (showCreateProfile) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Community-Profil erstellen</CardTitle>
          <CardDescription>
            Teile deine Expertise und verbinde dich mit anderen Lernenden
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProfileForm
            userProfile={null}
            onClose={() => setShowCreateProfile(false)}
          />
        </CardContent>
      </Card>
    );
  }

  if (!userProfile) return null;

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-2" />
                {userProfile.displayName}
              </CardTitle>
              <CardDescription>
                Mitglied seit {new Date(userProfile.joinDate).toLocaleDateString("de-DE")}
              </CardDescription>
            </div>
            <Dialog open={showEditProfile} onOpenChange={setShowEditProfile}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Edit className="h-4 w-4 mr-2" />
                  Bearbeiten
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Profil bearbeiten</DialogTitle>
                  <DialogDescription>
                    Aktualisiere deine Profilinformationen und Expertise-Bereiche
                  </DialogDescription>
                </DialogHeader>
                <ProfileForm
                  userProfile={userProfile}
                  onClose={() => setShowEditProfile(false)}
                />
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Bio */}
            {userProfile.bio && (
              <div>
                <Label>Über mich</Label>
                <p className="text-gray-700 mt-1">{userProfile.bio}</p>
              </div>
            )}

            {/* Expertise Areas */}
            <div>
              <Label>Expertise-Bereiche</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {userProfile.expertise.map((exp) => (
                  <Badge key={exp.area} variant="secondary" className="flex items-center gap-1">
                    {exp.area} ({exp.level})
                    {exp.verified && <Shield className="h-3 w-3 text-green-500" />}
                    {exp.endorsements > 0 && (
                      <span className="text-xs">({exp.endorsements} ⭐)</span>
                    )}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Mentoring Status */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-blue-500" />
                <span className="text-sm">
                  {userProfile.mentorAvailable ? "Mentor verfügbar" : "Nicht als Mentor verfügbar"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-yellow-500" />
                <span className="text-sm">
                  {userProfile.menteeInterested ? "Sucht Mentor" : "Sucht aktuell keinen Mentor"}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Award className="h-8 w-8 text-yellow-500 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-600">Reputation</p>
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
                <p className="text-2xl font-bold">{userProfile.contributionCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Star className="h-8 w-8 text-green-500 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-600">Hilfreiche Reviews</p>
                <p className="text-2xl font-bold">{userProfile.helpfulReviews}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity placeholder */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Letzte Aktivität
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            Zuletzt aktiv: {new Date(userProfile.lastActive).toLocaleString("de-DE")}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}