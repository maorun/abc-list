import {useEffect, useCallback} from "react";
import {GamificationService} from "../lib/GamificationService";
import {ACTIVITY_POINTS} from "../lib/gamification";

export function useGamification() {
  const gamificationService = GamificationService.getInstance();

  // Track activity with logging for debugging
  const trackActivity = useCallback(
    (activityType: keyof typeof ACTIVITY_POINTS, metadata?: unknown) => {
      try {
        gamificationService.trackActivity(activityType);
        console.log(
          `[Gamification] Activity tracked: ${activityType}`,
          metadata,
        );
      } catch (error) {
        console.error("[Gamification] Error tracking activity:", error);
      }
    },
    [gamificationService],
  );

  // Initialize daily login tracking
  useEffect(() => {
    // Track daily login when hook is first used
    const hasTrackedToday = localStorage.getItem("gamification_daily_login");
    const today = new Date().toISOString().split("T")[0];

    if (hasTrackedToday !== today) {
      trackActivity("daily_login");
      localStorage.setItem("gamification_daily_login", today);
    }
  }, [trackActivity]);

  // Convenience methods for common activities
  const trackListCreated = useCallback(
    (listName?: string) => {
      trackActivity("list_created", {listName});
    },
    [trackActivity],
  );

  const trackWordAdded = useCallback(
    (word?: string, listName?: string) => {
      trackActivity("word_added", {word, listName});
    },
    [trackActivity],
  );

  const trackKawaCreated = useCallback(
    (kawaKey?: string) => {
      trackActivity("kawa_created", {kawaKey});
    },
    [trackActivity],
  );

  const trackKagaCreated = useCallback(
    (kagaKey?: string) => {
      trackActivity("kaga_created", {kagaKey});
    },
    [trackActivity],
  );

  const trackStadtLandFlussGame = useCallback(
    (gameData?: unknown) => {
      trackActivity("slf_game_played", gameData);
    },
    [trackActivity],
  );

  const trackSokratesSession = useCallback(
    (sessionData?: unknown) => {
      trackActivity("sokrates_session", sessionData);
    },
    [trackActivity],
  );

  const trackBasarTrade = useCallback(
    (tradeData?: unknown) => {
      trackActivity("basar_trade", tradeData);
    },
    [trackActivity],
  );

  const trackInterrogationSession = useCallback(
    (sessionData?: unknown) => {
      trackActivity("interrogation_session", sessionData);
    },
    [trackActivity],
  );

  return {
    // Core tracking function
    trackActivity,

    // Convenience methods
    trackListCreated,
    trackWordAdded,
    trackKawaCreated,
    trackKagaCreated,
    trackStadtLandFlussGame,
    trackSokratesSession,
    trackBasarTrade,
    trackInterrogationSession,

    // Service access
    gamificationService,
  };
}
