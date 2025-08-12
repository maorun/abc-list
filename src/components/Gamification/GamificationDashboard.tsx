import React, {useState, useEffect} from "react";
import {Card, CardContent, CardHeader, CardTitle} from "../ui/card";
import {Button} from "../ui/button";
import {Progress} from "../ui/progress";
import {Badge} from "../ui/badge";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "../ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../ui/dialog";
import {GamificationService} from "../../lib/GamificationService";
import {
  GamificationProfile,
  GamificationAchievement,
  Challenge,
  Badge as GamificationBadge,
  LeaderboardEntry,
  LEADERBOARD_TYPES,
} from "../../lib/gamification";

// Extract handlers outside component to prevent recreation
const handleTabChange = (setActiveTab: (tab: string) => void) => (value: string) => {
  setActiveTab(value);
};

const handleAchievementClick = (
  achievement: GamificationAchievement,
  setSelectedAchievement: (achievement: GamificationAchievement | null) => void,
  setShowAchievementModal: (show: boolean) => void,
) => () => {
  setSelectedAchievement(achievement);
  setShowAchievementModal(true);
};

const handleCloseModal = (
  setShowAchievementModal: (show: boolean) => void,
  setSelectedAchievement: (achievement: GamificationAchievement | null) => void,
) => () => {
  setShowAchievementModal(false);
  setSelectedAchievement(null);
};

const handleLeaderboardRefresh = (
  activeLeaderboard: string,
  setLeaderboardData: (data: LeaderboardEntry[]) => void,
  gamificationService: GamificationService,
) => () => {
  const data = gamificationService.generateLeaderboard(activeLeaderboard);
  setLeaderboardData(data);
};

// Level progress component
function LevelProgress({profile}: {profile: GamificationProfile}) {
  const progressPercentage = profile.experienceToNextLevel > 0
    ? ((profile.experience - (Math.pow(profile.level - 1, 2) * 100)) / (Math.pow(profile.level, 2) * 100 - Math.pow(profile.level - 1, 2) * 100)) * 100
    : 100;

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Level {profile.level}</span>
          <Badge variant="secondary">{profile.totalPoints} Punkte</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <Progress value={Math.max(0, Math.min(100, progressPercentage))} className="w-full" />
          <p className="text-sm text-gray-600">
            {profile.experienceToNextLevel > 0 
              ? `${profile.experienceToNextLevel} XP bis Level ${profile.level + 1}`
              : 'Maximales Level erreicht!'
            }
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

// Streak display component
function StreakDisplay({profile}: {profile: GamificationProfile}) {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span>🔥</span>
          <span>Aktuelle Streak</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center">
          <div className="text-4xl font-bold text-orange-600 mb-2">
            {profile.streak.currentStreak}
          </div>
          <p className="text-sm text-gray-600 mb-2">
            Tage hintereinander aktiv
          </p>
          <p className="text-xs text-gray-500">
            Längste Streak: {profile.streak.longestStreak} Tage
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

// Statistics overview component
function StatisticsOverview({profile}: {profile: GamificationProfile}) {
  const stats = profile.statistics;

  const statItems = [
    {label: 'ABC-Listen', value: stats.listsCreated, icon: '📚'},
    {label: 'Begriffe', value: stats.wordsAdded, icon: '📝'},
    {label: 'KaWas', value: stats.kawasCreated, icon: '🎨'},
    {label: 'KaGas', value: stats.kagasCreated, icon: '🖼️'},
    {label: 'Spiele', value: stats.slfGamesPlayed, icon: '🎮'},
    {label: 'Sokrates', value: stats.sokratesSessions, icon: '🎓'},
    {label: 'Handel', value: stats.basarTrades, icon: '🤝'},
    {label: 'Aktive Tage', value: stats.totalActiveDays, icon: '📅'},
  ];

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Statistiken</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {statItems.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-2xl mb-1">{stat.icon}</div>
              <div className="text-lg font-semibold">{stat.value}</div>
              <div className="text-xs text-gray-600">{stat.label}</div>
            </div>
          ))}
        </div>
        <div className="mt-4 text-center">
          <Badge variant="outline">
            Lieblings-Aktivität: {
              stats.favoriteActivity === 'learning' ? '📚 Lernen' :
              stats.favoriteActivity === 'creativity' ? '🎨 Kreativität' :
              stats.favoriteActivity === 'gaming' ? '🎮 Spielen' : '🤝 Social'
            }
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}

// Achievement card component
function AchievementCard({
  achievement,
  onClick,
}: {
  achievement: GamificationAchievement;
  onClick: () => void;
}) {
  const isEarned = !!achievement.dateEarned;
  const progress = achievement.progress || 0;
  const target = achievement.requirement.value;
  const progressPercentage = (progress / target) * 100;

  const rarityColors = {
    common: 'bg-gray-100 border-gray-300',
    rare: 'bg-blue-100 border-blue-300',
    epic: 'bg-purple-100 border-purple-300',
    legendary: 'bg-yellow-100 border-yellow-300',
  };

  return (
    <Card 
      className={`cursor-pointer transition-all hover:shadow-md ${
        isEarned ? rarityColors[achievement.rarity] : 'bg-gray-50 opacity-70'
      }`}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="text-center">
          <div className={`text-3xl mb-2 ${isEarned ? '' : 'grayscale'}`}>
            {achievement.icon}
          </div>
          <h3 className="font-semibold text-sm mb-1">{achievement.name}</h3>
          <p className="text-xs text-gray-600 mb-2">{achievement.description}</p>
          
          {!isEarned && (
            <div className="space-y-1">
              <Progress value={progressPercentage} className="w-full h-2" />
              <p className="text-xs">
                {progress} / {target}
              </p>
            </div>
          )}
          
          {isEarned && (
            <Badge variant="secondary" className="text-xs">
              +{achievement.points} Punkte
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Challenge card component
function ChallengeCard({challenge}: {challenge: Challenge}) {
  const progressPercentage = (challenge.progress / challenge.target) * 100;
  const isCompleted = challenge.completed;
  const timeLeft = new Date(challenge.endDate).getTime() - new Date().getTime();
  const daysLeft = Math.max(0, Math.ceil(timeLeft / (1000 * 60 * 60 * 24)));

  return (
    <Card className={isCompleted ? 'bg-green-50 border-green-200' : ''}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="text-2xl">{challenge.icon}</div>
          <div className="flex-1">
            <h3 className="font-semibold text-sm mb-1">{challenge.name}</h3>
            <p className="text-xs text-gray-600 mb-2">{challenge.description}</p>
            
            {!isCompleted && (
              <div className="space-y-2">
                <Progress value={progressPercentage} className="w-full h-2" />
                <div className="flex justify-between text-xs">
                  <span>{challenge.progress} / {challenge.target}</span>
                  <span>{daysLeft} Tag(e) übrig</span>
                </div>
              </div>
            )}
            
            <div className="flex justify-between items-center mt-2">
              <Badge variant={challenge.type === 'weekly' ? 'default' : 'secondary'} className="text-xs">
                {challenge.type === 'weekly' ? 'Wöchentlich' : 'Monatlich'}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {isCompleted ? '✓ Abgeschlossen' : `+${challenge.reward} Punkte`}
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Leaderboard component
function LeaderboardView({
  activeLeaderboard,
  leaderboardData,
  onRefresh,
}: {
  activeLeaderboard: string;
  leaderboardData: LeaderboardEntry[];
  onRefresh: () => void;
}) {
  const leaderboardType = LEADERBOARD_TYPES.find((lt) => lt.id === activeLeaderboard);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">
          {leaderboardType?.icon} {leaderboardType?.name}
        </h3>
        <Button variant="outline" size="sm" onClick={onRefresh}>
          🔄 Aktualisieren
        </Button>
      </div>
      
      <div className="space-y-2">
        {leaderboardData.map((entry) => (
          <Card key={entry.userId} className={entry.userId.startsWith('gp_') ? 'bg-blue-50 border-blue-200' : ''}>
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="text-lg font-bold min-w-[30px]">
                    {entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : entry.rank === 3 ? '🥉' : `#${entry.rank}`}
                  </div>
                  <div>
                    <div className="font-semibold">{entry.username}</div>
                    <div className="text-sm text-gray-600">Level {entry.level}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold">{entry.value}</div>
                  {entry.badge && <div className="text-lg">{entry.badge}</div>}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export function GamificationDashboard() {
  const [profile, setProfile] = useState<GamificationProfile | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedAchievement, setSelectedAchievement] = useState<GamificationAchievement | null>(null);
  const [showAchievementModal, setShowAchievementModal] = useState(false);
  const [activeLeaderboard, setActiveLeaderboard] = useState('points');
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);

  const gamificationService = GamificationService.getInstance();

  useEffect(() => {
    const currentProfile = gamificationService.getProfile();
    setProfile(currentProfile);

    // Load initial leaderboard
    if (currentProfile) {
      const data = gamificationService.generateLeaderboard(activeLeaderboard);
      setLeaderboardData(data);
    }
  }, [activeLeaderboard, gamificationService]);

  if (!profile) {
    return (
      <div className="p-4 text-center">
        <div className="text-gray-500">Lade Gamification-Profil...</div>
      </div>
    );
  }

  const earnedAchievements = gamificationService.getEarnedAchievements();
  const progressAchievements = gamificationService.getProgressAchievements();
  const activeChallenges = gamificationService.getActiveChallenges();
  const completedChallenges = gamificationService.getCompletedChallenges();

  // Create stable handlers
  const tabChangeHandler = handleTabChange(setActiveTab);
  const achievementClickHandler = (achievement: GamificationAchievement) =>
    handleAchievementClick(achievement, setSelectedAchievement, setShowAchievementModal)();
  const closeModalHandler = handleCloseModal(setShowAchievementModal, setSelectedAchievement);
  const refreshLeaderboardHandler = handleLeaderboardRefresh(activeLeaderboard, setLeaderboardData, gamificationService);

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-bold mb-2">🏆 Gamification Dashboard</h1>
        <p className="text-gray-600">Verfolge deinen Lernfortschritt und sammle Erfolge!</p>
      </div>

      <LevelProgress profile={profile} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <StreakDisplay profile={profile} />
        <StatisticsOverview profile={profile} />
      </div>

      <Tabs value={activeTab} onValueChange={tabChangeHandler}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Übersicht</TabsTrigger>
          <TabsTrigger value="achievements">Erfolge</TabsTrigger>
          <TabsTrigger value="leaderboard">Rangliste</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-4">🎯 Aktuelle Challenges</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeChallenges.map((challenge) => (
                <ChallengeCard key={challenge.id} challenge={challenge} />
              ))}
            </div>
            
            {completedChallenges.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-3">✅ Abgeschlossene Challenges</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {completedChallenges.slice(0, 4).map((challenge) => (
                    <ChallengeCard key={challenge.id} challenge={challenge} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="achievements" className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-4">🏅 Erfolge ({earnedAchievements.length})</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {earnedAchievements.map((achievement) => (
                <AchievementCard
                  key={achievement.id}
                  achievement={achievement}
                  onClick={() => achievementClickHandler(achievement)}
                />
              ))}
            </div>
          </div>

          {progressAchievements.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">🎯 In Arbeit</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {progressAchievements.map((achievement) => (
                  <AchievementCard
                    key={achievement.id}
                    achievement={achievement}
                    onClick={() => achievementClickHandler(achievement)}
                  />
                ))}
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="leaderboard" className="space-y-6">
          <div className="flex flex-wrap gap-2 mb-4">
            {LEADERBOARD_TYPES.map((type) => (
              <Button
                key={type.id}
                variant={activeLeaderboard === type.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveLeaderboard(type.id)}
              >
                {type.icon} {type.name}
              </Button>
            ))}
          </div>
          
          <LeaderboardView
            activeLeaderboard={activeLeaderboard}
            leaderboardData={leaderboardData}
            onRefresh={refreshLeaderboardHandler}
          />
        </TabsContent>
      </Tabs>

      {/* Achievement Detail Modal */}
      <Dialog open={showAchievementModal} onOpenChange={closeModalHandler}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span className="text-2xl">{selectedAchievement?.icon}</span>
              {selectedAchievement?.name}
            </DialogTitle>
            <DialogDescription>
              {selectedAchievement?.description}
            </DialogDescription>
          </DialogHeader>
          
          {selectedAchievement && (
            <div className="space-y-4">
              <div className="text-center">
                <Badge variant="secondary" className="mb-2">
                  {selectedAchievement.category}
                </Badge>
                <div className="text-sm text-gray-600">
                  Seltenheit: <Badge variant="outline">{selectedAchievement.rarity}</Badge>
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-lg font-semibold">
                  +{selectedAchievement.points} Punkte
                </div>
                {selectedAchievement.dateEarned && (
                  <div className="text-sm text-gray-600">
                    Erhalten am: {new Date(selectedAchievement.dateEarned).toLocaleDateString('de-DE')}
                  </div>
                )}
              </div>
              
              {!selectedAchievement.dateEarned && selectedAchievement.progress !== undefined && (
                <div className="space-y-2">
                  <Progress 
                    value={(selectedAchievement.progress / selectedAchievement.requirement.value) * 100} 
                    className="w-full"
                  />
                  <div className="text-center text-sm">
                    {selectedAchievement.progress} / {selectedAchievement.requirement.value}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}