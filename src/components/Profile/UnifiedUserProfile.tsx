/**
 * Unified User Profile Component
 * Consolidates Community and Basar profile functionality with Google login
 */

import React, {useState} from "react";
import {useUnifiedProfile} from "../../hooks/useUnifiedProfile";
import {
  CreateProfileData,
  UpdateProfileData,
  UserExpertise,
} from "../../types/profile";
import {EXPERTISE_AREAS} from "../../lib/CommunityService";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import {Button} from "../ui/button";
import {Input} from "../ui/input";
import {Label} from "../ui/label";
import {Textarea} from "../ui/textarea";
import {Switch} from "../ui/switch";
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
import {
  User,
  Edit,
  Mail,
  Calendar,
  Star,
  Trophy,
  TrendingUp,
  Users,
  MessageCircle,
  Award,
} from "lucide-react";
import {toast} from "sonner";

interface UnifiedUserProfileProps {
  showCreateProfile?: boolean;
  setShowCreateProfile?: (show: boolean) => void;
}

// Extracted handlers to prevent recreation on every render
const handleGoogleSignInAction = async (
  signInWithGoogle: () => Promise<{success: boolean; error?: string}>,
) => {
  const result = await signInWithGoogle();
  if (result.success) {
    toast.success("Erfolgreich mit Google angemeldet!");
  } else {
    toast.error(result.error || "Anmeldung fehlgeschlagen");
  }
};

const handleSignOutAction = async (signOut: () => Promise<void>) => {
  await signOut();
  toast.success("Erfolgreich abgemeldet");
};

export function UnifiedUserProfile({
  showCreateProfile = false,
  setShowCreateProfile,
}: UnifiedUserProfileProps) {
  const {
    profile,
    isLoading,
    createProfile,
    updateProfile,
    signInWithGoogle,
    signOut,
  } = useUnifiedProfile();

  const [showEditProfile, setShowEditProfile] = useState(false);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center">Profil wird geladen...</div>
        </CardContent>
      </Card>
    );
  }

  // Create stable references for handlers
  const handleGoogleSignIn = () => handleGoogleSignInAction(signInWithGoogle);
  const handleSignOut = () => handleSignOutAction(signOut);

  if (!profile && !showCreateProfile) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <User className="h-5 w-5 mr-2" />
            Benutzerprofil
          </CardTitle>
          <CardDescription>
            Erstelle dein Profil für die Community und den Basar
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 space-y-4">
            <User className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">
              Noch kein Profil erstellt
            </h3>
            <p className="text-gray-600 mb-6">
              Erstelle dein Profil, um alle Funktionen von ABC-List zu nutzen:
              Community-Features, Mentoring und den Basar
            </p>

            <div className="space-y-3">
              <Button onClick={handleGoogleSignIn} className="w-full">
                <Mail className="h-4 w-4 mr-2" />
                Mit Google anmelden
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Oder
                  </span>
                </div>
              </div>

              <Button
                variant="outline"
                onClick={() => setShowCreateProfile?.(true)}
                className="w-full"
              >
                <User className="h-4 w-4 mr-2" />
                Manuell erstellen
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (showCreateProfile) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Profil erstellen</CardTitle>
          <CardDescription>
            Erstelle dein ABC-List Profil für Community und Basar
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProfileForm
            profile={null}
            onClose={() => setShowCreateProfile?.(false)}
            onSave={createProfile}
          />
        </CardContent>
      </Card>
    );
  }

  if (!profile) return null;

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-2" />
                {profile.displayName}
                {profile.auth.provider === "google" && (
                  <Badge variant="secondary" className="ml-2">
                    <Mail className="h-3 w-3 mr-1" />
                    Google
                  </Badge>
                )}
              </CardTitle>
              <CardDescription className="flex items-center gap-4">
                <span className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  Mitglied seit{" "}
                  {new Date(profile.joinDate).toLocaleDateString("de-DE")}
                </span>
                {profile.auth.email && (
                  <span className="flex items-center">
                    <Mail className="h-4 w-4 mr-1" />
                    {profile.auth.email}
                  </span>
                )}
              </CardDescription>
            </div>
            <div className="flex gap-2">
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
                      Aktualisiere deine Profilinformationen
                    </DialogDescription>
                  </DialogHeader>
                  <ProfileForm
                    profile={profile}
                    onClose={() => setShowEditProfile(false)}
                    onSave={(data) => {
                      updateProfile({id: profile.id, ...data});
                      setShowEditProfile(false);
                    }}
                  />
                </DialogContent>
              </Dialog>

              {profile.auth.provider === "google" && (
                <Button variant="outline" size="sm" onClick={handleSignOut}>
                  Abmelden
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Community Info */}
            <div className="space-y-4">
              <h3 className="font-semibold flex items-center">
                <Users className="h-4 w-4 mr-2" />
                Community
              </h3>

              {profile.community.bio && (
                <div>
                  <Label>Über mich</Label>
                  <p className="text-gray-700 mt-1">{profile.community.bio}</p>
                </div>
              )}

              <div>
                <Label>Expertise-Bereiche</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {profile.community.expertise.map((exp) => (
                    <Badge key={exp.area} variant="secondary">
                      {exp.area} ({exp.level})
                    </Badge>
                  ))}
                  {profile.community.expertise.length === 0 && (
                    <p className="text-gray-500 text-sm">
                      Keine Expertise-Bereiche angegeben
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center">
                  <Star className="h-4 w-4 mr-2 text-yellow-500" />
                  <span>{profile.community.reputation} Reputation</span>
                </div>
                <div className="flex items-center">
                  <MessageCircle className="h-4 w-4 mr-2 text-blue-500" />
                  <span>{profile.community.helpfulReviews} Reviews</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Mentor verfügbar</span>
                  <Badge
                    variant={
                      profile.community.mentorAvailable
                        ? "default"
                        : "secondary"
                    }
                  >
                    {profile.community.mentorAvailable ? "Ja" : "Nein"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Sucht Mentoring</span>
                  <Badge
                    variant={
                      profile.community.menteeInterested
                        ? "default"
                        : "secondary"
                    }
                  >
                    {profile.community.menteeInterested ? "Ja" : "Nein"}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Trading/Basar Info */}
            <div className="space-y-4">
              <h3 className="font-semibold flex items-center">
                <Trophy className="h-4 w-4 mr-2" />
                Basar & Trading
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {profile.trading.points}
                  </div>
                  <div className="text-sm text-blue-800">Punkte</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {profile.trading.level}
                  </div>
                  <div className="text-sm text-green-800">Level</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center">
                  <TrendingUp className="h-4 w-4 mr-2 text-green-500" />
                  <span>{profile.trading.tradesCompleted} Handel</span>
                </div>
                <div className="flex items-center">
                  <Award className="h-4 w-4 mr-2 text-purple-500" />
                  <span>{profile.trading.termsContributed} Begriffe</span>
                </div>
              </div>

              {profile.trading.averageRating > 0 && (
                <div className="flex items-center">
                  <Star className="h-4 w-4 mr-2 text-yellow-500" />
                  <span>
                    {profile.trading.averageRating.toFixed(1)} ⭐ Bewertung
                  </span>
                </div>
              )}

              <div>
                <Label>Errungenschaften</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {profile.trading.achievements
                    .slice(0, 3)
                    .map((achievement) => (
                      <Badge key={achievement.id} variant="outline">
                        {achievement.icon} {achievement.name}
                      </Badge>
                    ))}
                  {profile.trading.achievements.length === 0 && (
                    <p className="text-gray-500 text-sm">
                      Noch keine Errungenschaften
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Profile creation/edit form component
function ProfileForm({
  profile,
  onClose,
  onSave,
}: {
  profile: UnifiedUserProfile | null;
  onClose: () => void;
  onSave: (data: CreateProfileData | UpdateProfileData) => void;
}) {
  const isEditing = profile !== null;
  const [displayName, setDisplayName] = useState(profile?.displayName || "");
  const [bio, setBio] = useState(profile?.community?.bio || "");
  const [expertise, setExpertise] = useState<UserExpertise[]>(
    profile?.community?.expertise || [],
  );
  const [mentorAvailable, setMentorAvailable] = useState(
    profile?.community?.mentorAvailable || false,
  );
  const [menteeInterested, setMenteeInterested] = useState(
    profile?.community?.menteeInterested || false,
  );

  const handleAddExpertise = (area: string, level: string) => {
    if (expertise.some((exp) => exp.area === area)) return;

    setExpertise([
      ...expertise,
      {
        area,
        level: level as "Beginner" | "Intermediate" | "Advanced" | "Expert",
        verified: false,
        endorsements: 0,
      },
    ]);
  };

  const handleRemoveExpertise = (area: string) => {
    setExpertise(expertise.filter((exp) => exp.area !== area));
  };

  const handleSave = () => {
    if (!displayName.trim()) return;

    const data = {
      displayName: displayName.trim(),
      bio: bio.trim(),
      expertise,
      mentorAvailable,
      menteeInterested,
    };

    onSave(data);
    onClose();
  };

  return (
    <div className="space-y-6">
      {/* Basic Information */}
      <div className="space-y-4">
        <div>
          <Label htmlFor="displayName">Anzeigename *</Label>
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
            rows={3}
          />
        </div>
      </div>

      {/* Expertise Areas */}
      <div className="space-y-4">
        <Label>Expertise-Bereiche</Label>
        <div className="space-y-2">
          {expertise.map((exp) => (
            <div
              key={exp.area}
              className="flex items-center justify-between p-2 bg-gray-50 rounded"
            >
              <span>
                {exp.area} ({exp.level})
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleRemoveExpertise(exp.area)}
              >
                ✕
              </Button>
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <Select
            onValueChange={(area) => handleAddExpertise(area, "Beginner")}
          >
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Expertise-Bereich hinzufügen" />
            </SelectTrigger>
            <SelectContent>
              {EXPERTISE_AREAS.filter(
                (area) => !expertise.some((exp) => exp.area === area),
              ).map((area) => (
                <SelectItem key={area} value={area}>
                  {area}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
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
              onCheckedChange={setMentorAvailable}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="menteeInterested">
                An Mentoring interessiert
              </Label>
              <p className="text-sm text-gray-600">
                Ich suche einen Mentor für meine Lernziele
              </p>
            </div>
            <Switch
              id="menteeInterested"
              checked={menteeInterested}
              onCheckedChange={setMenteeInterested}
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
          onClick={handleSave}
          disabled={!displayName.trim()}
        >
          {isEditing ? "Speichern" : "Profil erstellen"}
        </Button>
      </div>
    </div>
  );
}
