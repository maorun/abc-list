import React, {useState, useEffect} from "react";
import {Badge} from "../ui/badge";
import {GamificationService} from "../../lib/GamificationService";
import {GamificationProfile} from "../../lib/gamification";

// Extract handlers to prevent recreation
const handleIndicatorClick = (onClick?: () => void) => () => {
  if (onClick) onClick();
};

export function GamificationStatusIndicator({onClick}: {onClick?: () => void}) {
  const [profile, setProfile] = useState<GamificationProfile | null>(null);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [showAchievement, setShowAchievement] = useState(false);

  const gamificationService = GamificationService.getInstance();

  useEffect(() => {
    const currentProfile = gamificationService.getProfile();
    setProfile(currentProfile);

    // Listen for gamification events
    const handleEvent = (event: string, data: any) => {
      if (event === 'level_up') {
        setShowLevelUp(true);
        setTimeout(() => setShowLevelUp(false), 3000);
      } else if (event === 'achievement_unlocked') {
        setShowAchievement(true);
        setTimeout(() => setShowAchievement(false), 3000);
      }
      
      // Update profile
      const updatedProfile = gamificationService.getProfile();
      setProfile(updatedProfile);
    };

    gamificationService.addEventListener(handleEvent);

    return () => {
      gamificationService.removeEventListener(handleEvent);
    };
  }, [gamificationService]);

  const clickHandler = handleIndicatorClick(onClick);

  if (!profile) {
    return null;
  }

  return (
    <div 
      className="flex items-center gap-2 cursor-pointer transition-all hover:scale-105"
      onClick={clickHandler}
      role="button"
      tabIndex={0}
      aria-label={`Level ${profile.level}, ${profile.totalPoints} Punkte, ${profile.streak.currentStreak} Tage Streak`}
    >
      {/* Level indicator */}
      <Badge 
        variant="outline" 
        className={`text-xs transition-all ${showLevelUp ? 'animate-pulse bg-yellow-100' : ''}`}
      >
        Level {profile.level}
      </Badge>

      {/* Points indicator */}
      <Badge variant="secondary" className="text-xs">
        {profile.totalPoints} 💎
      </Badge>

      {/* Streak indicator */}
      {profile.streak.currentStreak > 0 && (
        <Badge variant="outline" className="text-xs">
          {profile.streak.currentStreak} 🔥
        </Badge>
      )}

      {/* Achievement notification */}
      {showAchievement && (
        <Badge variant="default" className="text-xs animate-bounce">
          🏆 Neuer Erfolg!
        </Badge>
      )}
    </div>
  );
}