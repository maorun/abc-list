// Comprehensive Gamification System for ABC-List App
// Tracks activities across all components: Lists, KaWa, KaGa, Stadt-Land-Fluss, Sokrates, and Basar

export interface ActivityType {
  type:
    | "list_created"
    | "word_added"
    | "kawa_created"
    | "kaga_created"
    | "slf_game_played"
    | "sokrates_session"
    | "basar_trade"
    | "daily_login"
    | "streak_milestone"
    | "challenge_completed"
    | "interrogation_session";
  points: number;
  description: string;
}

export interface UserStreak {
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: string;
  streakStartDate: string;
}

export interface Challenge {
  id: string;
  name: string;
  description: string;
  type: "weekly" | "monthly";
  target: number;
  progress: number;
  startDate: string;
  endDate: string;
  reward: number;
  activity: string;
  icon: string;
  completed: boolean;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: "common" | "rare" | "epic" | "legendary";
  dateEarned?: string;
  progress?: number;
  target?: number;
}

export interface GamificationProfile {
  id: string;
  totalPoints: number;
  level: number;
  experience: number;
  experienceToNextLevel: number;
  streak: UserStreak;
  badges: Badge[];
  achievements: GamificationAchievement[];
  challenges: Challenge[];
  statistics: UserStatistics;
  lastUpdated: string;
}

export interface GamificationAchievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: "learning" | "creativity" | "social" | "dedication" | "mastery";
  rarity: "common" | "rare" | "epic" | "legendary";
  points: number;
  requirement: {
    type: string;
    value: number;
    description: string;
  };
  dateEarned?: string;
  progress?: number;
}

export interface UserStatistics {
  listsCreated: number;
  wordsAdded: number;
  kawasCreated: number;
  kagasCreated: number;
  slfGamesPlayed: number;
  sokratesSessions: number;
  basarTrades: number;
  interrogationSessions: number;
  totalActiveDays: number;
  averageWordsPerList: number;
  favoriteActivity: string;
}

export interface LeaderboardEntry {
  userId: string;
  username: string;
  value: number;
  rank: number;
  level: number;
  badge?: string;
}

export interface LeaderboardType {
  id: string;
  name: string;
  description: string;
  icon: string;
  metric: keyof UserStatistics | "totalPoints" | "level" | "currentStreak";
}

// Activity Points Configuration
export const ACTIVITY_POINTS: Record<string, ActivityType> = {
  list_created: {
    type: "list_created",
    points: 10,
    description: "ABC-Liste erstellt",
  },
  word_added: {
    type: "word_added",
    points: 2,
    description: "Begriff hinzugefügt",
  },
  kawa_created: {
    type: "kawa_created",
    points: 15,
    description: "KaWa erstellt",
  },
  kaga_created: {
    type: "kaga_created",
    points: 20,
    description: "KaGa erstellt",
  },
  slf_game_played: {
    type: "slf_game_played",
    points: 8,
    description: "Stadt-Land-Fluss gespielt",
  },
  sokrates_session: {
    type: "sokrates_session",
    points: 5,
    description: "Sokrates-Check durchgeführt",
  },
  basar_trade: {
    type: "basar_trade",
    points: 12,
    description: "Basar-Handel abgeschlossen",
  },
  interrogation_session: {
    type: "interrogation_session",
    points: 10,
    description: "Elaborative Interrogation durchgeführt",
  },
  daily_login: {type: "daily_login", points: 3, description: "Täglicher Login"},
  streak_milestone: {
    type: "streak_milestone",
    points: 25,
    description: "Streak-Meilenstein erreicht",
  },
  challenge_completed: {
    type: "challenge_completed",
    points: 50,
    description: "Challenge abgeschlossen",
  },
};

// Achievement Definitions
export const GAMIFICATION_ACHIEVEMENTS: GamificationAchievement[] = [
  // Learning Category
  {
    id: "first_list",
    name: "Erster Schritt",
    description: "Erstelle deine erste ABC-Liste",
    icon: "📝",
    category: "learning",
    rarity: "common",
    points: 20,
    requirement: {
      type: "listsCreated",
      value: 1,
      description: "1 ABC-Liste erstellen",
    },
  },
  {
    id: "list_master",
    name: "Listen-Meister",
    description: "Erstelle 10 ABC-Listen",
    icon: "📚",
    category: "learning",
    rarity: "rare",
    points: 100,
    requirement: {
      type: "listsCreated",
      value: 10,
      description: "10 ABC-Listen erstellen",
    },
  },
  {
    id: "word_collector",
    name: "Wort-Sammler",
    description: "Sammle 100 Begriffe",
    icon: "💎",
    category: "learning",
    rarity: "epic",
    points: 200,
    requirement: {
      type: "wordsAdded",
      value: 100,
      description: "100 Begriffe sammeln",
    },
  },
  {
    id: "vocabulary_legend",
    name: "Vokabular-Legende",
    description: "Sammle 1000 Begriffe",
    icon: "👑",
    category: "mastery",
    rarity: "legendary",
    points: 1000,
    requirement: {
      type: "wordsAdded",
      value: 1000,
      description: "1000 Begriffe sammeln",
    },
  },

  // Creativity Category
  {
    id: "creative_mind",
    name: "Kreativer Geist",
    description: "Erstelle dein erstes KaWa",
    icon: "🎨",
    category: "creativity",
    rarity: "common",
    points: 30,
    requirement: {
      type: "kawasCreated",
      value: 1,
      description: "1 KaWa erstellen",
    },
  },
  {
    id: "visual_artist",
    name: "Visueller Künstler",
    description: "Erstelle dein erstes KaGa",
    icon: "🖼️",
    category: "creativity",
    rarity: "common",
    points: 40,
    requirement: {
      type: "kagasCreated",
      value: 1,
      description: "1 KaGa erstellen",
    },
  },
  {
    id: "creative_genius",
    name: "Kreativ-Genie",
    description: "Erstelle 25 KaWas und KaGas zusammen",
    icon: "⭐",
    category: "creativity",
    rarity: "epic",
    points: 300,
    requirement: {
      type: "combined_creative",
      value: 25,
      description: "25 KaWas + KaGas erstellen",
    },
  },

  // Dedication Category
  {
    id: "daily_learner",
    name: "Täglicher Lerner",
    description: "Erreiche eine 7-Tage-Streak",
    icon: "🔥",
    category: "dedication",
    rarity: "rare",
    points: 150,
    requirement: {
      type: "currentStreak",
      value: 7,
      description: "7 Tage hintereinander aktiv",
    },
  },
  {
    id: "streak_master",
    name: "Streak-Meister",
    description: "Erreiche eine 30-Tage-Streak",
    icon: "🏆",
    category: "dedication",
    rarity: "epic",
    points: 500,
    requirement: {
      type: "currentStreak",
      value: 30,
      description: "30 Tage hintereinander aktiv",
    },
  },
  {
    id: "unstoppable",
    name: "Unaufhaltsam",
    description: "Erreiche eine 100-Tage-Streak",
    icon: "💫",
    category: "dedication",
    rarity: "legendary",
    points: 1500,
    requirement: {
      type: "currentStreak",
      value: 100,
      description: "100 Tage hintereinander aktiv",
    },
  },

  // Social Category (Basar-related)
  {
    id: "first_trader",
    name: "Erster Händler",
    description: "Führe deinen ersten Basar-Handel durch",
    icon: "🤝",
    category: "social",
    rarity: "common",
    points: 25,
    requirement: {
      type: "basarTrades",
      value: 1,
      description: "1 Basar-Handel durchführen",
    },
  },
  {
    id: "merchant_king",
    name: "Handels-König",
    description: "Führe 100 Basar-Handelsgeschäfte durch",
    icon: "👑",
    category: "social",
    rarity: "legendary",
    points: 800,
    requirement: {
      type: "basarTrades",
      value: 100,
      description: "100 Basar-Handelsgeschäfte durchführen",
    },
  },

  // Game Category
  {
    id: "game_enthusiast",
    name: "Spiel-Enthusiast",
    description: "Spiele 10 Runden Stadt-Land-Fluss",
    icon: "🎮",
    category: "learning",
    rarity: "common",
    points: 80,
    requirement: {
      type: "slfGamesPlayed",
      value: 10,
      description: "10 Stadt-Land-Fluss Spiele",
    },
  },

  // Mastery Category
  {
    id: "sokrates_student",
    name: "Sokrates-Schüler",
    description: "Führe 50 Sokrates-Checks durch",
    icon: "🎓",
    category: "mastery",
    rarity: "rare",
    points: 250,
    requirement: {
      type: "sokratesSessions",
      value: 50,
      description: "50 Sokrates-Check Sessions",
    },
  },
  {
    id: "wisdom_seeker",
    name: "Weisheitssucher",
    description: "Erreiche Level 10",
    icon: "🧠",
    category: "mastery",
    rarity: "epic",
    points: 400,
    requirement: {type: "level", value: 10, description: "Level 10 erreichen"},
  },
];

// Challenge Templates
export const WEEKLY_CHALLENGE_TEMPLATES = [
  {
    name: "Wörter-Woche",
    description: "Füge 50 neue Begriffe zu deinen Listen hinzu",
    activity: "wordsAdded",
    target: 50,
    reward: 100,
    icon: "📝",
  },
  {
    name: "Kreativ-Challenge",
    description: "Erstelle 3 neue KaWas oder KaGas",
    activity: "creativesCreated",
    target: 3,
    reward: 120,
    icon: "🎨",
  },
  {
    name: "Spiel-Woche",
    description: "Spiele 15 Runden Stadt-Land-Fluss",
    activity: "slfGamesPlayed",
    target: 15,
    reward: 80,
    icon: "🎮",
  },
  {
    name: "Lern-Streak",
    description: "Bleibe 7 Tage hintereinander aktiv",
    activity: "dailyStreak",
    target: 7,
    reward: 150,
    icon: "🔥",
  },
];

export const MONTHLY_CHALLENGE_TEMPLATES = [
  {
    name: "Listen-Monat",
    description: "Erstelle 10 neue ABC-Listen",
    activity: "listsCreated",
    target: 10,
    reward: 300,
    icon: "📚",
  },
  {
    name: "Vokabular-Boost",
    description: "Sammle 200 neue Begriffe",
    activity: "wordsAdded",
    target: 200,
    reward: 400,
    icon: "💎",
  },
  {
    name: "Handel-Menge",
    description: "Führe 20 Basar-Handelsgeschäfte durch",
    activity: "basarTrades",
    target: 20,
    reward: 350,
    icon: "🤝",
  },
  {
    name: "Allrounder",
    description: "Verwende alle App-Features mindestens 5 Mal",
    activity: "allFeatures",
    target: 5,
    reward: 500,
    icon: "⭐",
  },
];

// Leaderboard Configurations
export const LEADERBOARD_TYPES: LeaderboardType[] = [
  {
    id: "points",
    name: "Gesamt-Punkte",
    description: "Höchste Punktzahl aller Zeiten",
    icon: "💎",
    metric: "totalPoints",
  },
  {
    id: "level",
    name: "Level",
    description: "Höchstes erreichtes Level",
    icon: "🏆",
    metric: "level",
  },
  {
    id: "streak",
    name: "Aktuelle Streak",
    description: "Längste aktuelle Tages-Streak",
    icon: "🔥",
    metric: "currentStreak",
  },
  {
    id: "lists",
    name: "ABC-Listen",
    description: "Meiste erstellte ABC-Listen",
    icon: "📚",
    metric: "listsCreated",
  },
  {
    id: "words",
    name: "Begriffe",
    description: "Meiste gesammelte Begriffe",
    icon: "📝",
    metric: "wordsAdded",
  },
  {
    id: "trades",
    name: "Handel",
    description: "Meiste Basar-Handelsgeschäfte",
    icon: "🤝",
    metric: "basarTrades",
  },
];

// Storage Keys
export const GAMIFICATION_STORAGE_KEYS = {
  PROFILE: "gamificationProfile",
  CHALLENGES: "gamificationChallenges",
  LEADERBOARD: "gamificationLeaderboard",
  SETTINGS: "gamificationSettings",
  DAILY_ACTIVITY: "gamificationDailyActivity",
} as const;

// Level Calculation
export function calculateLevel(experience: number): number {
  // Level formula: Level = floor(sqrt(experience / 100))
  // This creates exponential growth: Level 1 = 100 XP, Level 2 = 400 XP, Level 3 = 900 XP, etc.
  return Math.floor(Math.sqrt(experience / 100)) + 1;
}

export function calculateExperienceToNextLevel(
  currentExperience: number,
): number {
  const currentLevel = calculateLevel(currentExperience);
  const nextLevelExperience = Math.pow(currentLevel, 2) * 100;
  return nextLevelExperience - currentExperience;
}

// Date Utilities for Streaks and Challenges
export function getTodayDateString(): string {
  return new Date().toISOString().split("T")[0];
}

export function getYesterdayDateString(): string {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return yesterday.toISOString().split("T")[0];
}

export function isStreakBroken(lastActivityDate: string): boolean {
  const today = getTodayDateString();
  const yesterday = getYesterdayDateString();
  return lastActivityDate !== today && lastActivityDate !== yesterday;
}

export function getWeekStartDate(): string {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const monday = new Date(today);
  monday.setDate(today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1));
  return monday.toISOString().split("T")[0];
}

export function getMonthStartDate(): string {
  const today = new Date();
  return new Date(today.getFullYear(), today.getMonth(), 1)
    .toISOString()
    .split("T")[0];
}
