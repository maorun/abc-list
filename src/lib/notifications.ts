/**
 * Browser Notification System for Spaced Repetition Reviews
 * Provides subtle, non-intrusive notifications for due reviews
 */

export interface NotificationSettings {
  enabled: boolean;
  frequency: 'daily' | 'twice-daily' | 'hourly'; // How often to check for due reviews
  quietHours: {
    start: number; // Hour (0-23)
    end: number; // Hour (0-23)
  };
  maxNotifications: number; // Maximum notifications per day
}

export const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  enabled: true,
  frequency: 'daily',
  quietHours: {
    start: 22, // 10 PM
    end: 8, // 8 AM
  },
  maxNotifications: 3,
};

const NOTIFICATION_STORAGE_KEY = 'spacedRepetition_notifications';
const NOTIFICATION_COUNT_KEY = 'spacedRepetition_notificationCount';
const LAST_NOTIFICATION_KEY = 'spacedRepetition_lastNotification';

/**
 * Request notification permission from the browser
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) {
    console.warn('This browser does not support notifications');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission === 'denied') {
    return false;
  }

  const permission = await Notification.requestPermission();
  return permission === 'granted';
}

/**
 * Check if notifications are currently allowed (considering quiet hours)
 */
export function areNotificationsAllowed(settings: NotificationSettings): boolean {
  if (!settings.enabled) return false;
  if (Notification.permission !== 'granted') return false;

  const now = new Date();
  const currentHour = now.getHours();
  
  // Check quiet hours
  const { start, end } = settings.quietHours;
  if (start > end) {
    // Quiet hours span midnight (e.g., 22:00 to 8:00)
    if (currentHour >= start || currentHour < end) {
      return false;
    }
  } else {
    // Quiet hours within same day (e.g., 1:00 to 6:00)
    if (currentHour >= start && currentHour < end) {
      return false;
    }
  }

  // Check daily notification limit
  const today = now.toDateString();
  const notificationData = getNotificationCount();
  if (notificationData.date === today && notificationData.count >= settings.maxNotifications) {
    return false;
  }

  return true;
}

/**
 * Show a notification for due reviews
 */
export function showReviewNotification(dueCount: number): void {
  if (!areNotificationsAllowed(getNotificationSettings())) {
    return;
  }

  const title = '🧠 ABC-Listen Wiederholung';
  const body = dueCount === 1 
    ? 'Ein Begriff ist zur Wiederholung fällig'
    : `${dueCount} Begriffe sind zur Wiederholung fällig`;

  const notification = new Notification(title, {
    body,
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    tag: 'spaced-repetition', // Replaces previous notifications
    requireInteraction: false,
    silent: true, // Non-intrusive
  });

  // Auto-close after 5 seconds
  setTimeout(() => {
    notification.close();
  }, 5000);

  // Open app when clicked
  notification.onclick = () => {
    window.focus();
    // Navigate to Sokrates-Check if possible
    if (window.location.pathname !== '/sokrates') {
      window.location.href = '/abc-list/sokrates';
    }
    notification.close();
  };

  // Update notification count
  incrementNotificationCount();
}

/**
 * Get notification settings from localStorage
 */
export function getNotificationSettings(): NotificationSettings {
  try {
    const stored = localStorage.getItem(NOTIFICATION_STORAGE_KEY);
    if (stored) {
      return { ...DEFAULT_NOTIFICATION_SETTINGS, ...JSON.parse(stored) };
    }
  } catch (error) {
    console.warn('Failed to load notification settings:', error);
  }
  return DEFAULT_NOTIFICATION_SETTINGS;
}

/**
 * Save notification settings to localStorage
 */
export function saveNotificationSettings(settings: NotificationSettings): void {
  try {
    localStorage.setItem(NOTIFICATION_STORAGE_KEY, JSON.stringify(settings));
  } catch (error) {
    console.warn('Failed to save notification settings:', error);
  }
}

/**
 * Get today's notification count
 */
function getNotificationCount(): { date: string; count: number } {
  try {
    const stored = localStorage.getItem(NOTIFICATION_COUNT_KEY);
    if (stored) {
      const data = JSON.parse(stored);
      const today = new Date().toDateString();
      if (data.date === today) {
        return data;
      }
    }
  } catch (error) {
    console.warn('Failed to load notification count:', error);
  }
  
  // Return fresh count for today
  const today = new Date().toDateString();
  return { date: today, count: 0 };
}

/**
 * Increment today's notification count
 */
function incrementNotificationCount(): void {
  try {
    const today = new Date().toDateString();
    const current = getNotificationCount();
    const newCount = current.date === today ? current.count + 1 : 1;
    
    localStorage.setItem(NOTIFICATION_COUNT_KEY, JSON.stringify({
      date: today,
      count: newCount,
    }));
  } catch (error) {
    console.warn('Failed to update notification count:', error);
  }
}

/**
 * Check if enough time has passed since last notification
 */
export function shouldCheckForDueReviews(settings: NotificationSettings): boolean {
  try {
    const lastCheck = localStorage.getItem(LAST_NOTIFICATION_KEY);
    const now = Date.now();
    
    if (!lastCheck) {
      return true;
    }
    
    const lastCheckTime = parseInt(lastCheck, 10);
    const timeDiff = now - lastCheckTime;
    
    // Convert frequency to milliseconds
    let interval: number;
    switch (settings.frequency) {
      case 'hourly':
        interval = 60 * 60 * 1000; // 1 hour
        break;
      case 'twice-daily':
        interval = 12 * 60 * 60 * 1000; // 12 hours
        break;
      case 'daily':
      default:
        interval = 24 * 60 * 60 * 1000; // 24 hours
        break;
    }
    
    return timeDiff >= interval;
  } catch (error) {
    console.warn('Failed to check last notification time:', error);
    return true; // Default to checking if there's an error
  }
}

/**
 * Update the last notification check time
 */
export function updateLastNotificationCheck(): void {
  try {
    localStorage.setItem(LAST_NOTIFICATION_KEY, Date.now().toString());
  } catch (error) {
    console.warn('Failed to update last notification check:', error);
  }
}

/**
 * Initialize notification system and check for due reviews
 */
export async function initializeNotifications(getDueReviewsCount: () => number): Promise<void> {
  const settings = getNotificationSettings();
  
  if (!settings.enabled) {
    return;
  }

  // Request permission if not already granted
  const hasPermission = await requestNotificationPermission();
  if (!hasPermission) {
    console.info('Notification permission not granted');
    return;
  }

  // Check if we should look for due reviews
  if (!shouldCheckForDueReviews(settings)) {
    return;
  }

  // Check for due reviews
  const dueCount = getDueReviewsCount();
  if (dueCount > 0) {
    showReviewNotification(dueCount);
  }

  // Update last check time
  updateLastNotificationCheck();
}

/**
 * Set up periodic checking for due reviews
 */
export function setupPeriodicNotifications(getDueReviewsCount: () => number): () => void {
  const settings = getNotificationSettings();
  
  if (!settings.enabled) {
    return () => {}; // Return empty cleanup function
  }

  // Set up interval based on frequency
  let intervalMs: number;
  switch (settings.frequency) {
    case 'hourly':
      intervalMs = 60 * 60 * 1000; // 1 hour
      break;
    case 'twice-daily':
      intervalMs = 12 * 60 * 60 * 1000; // 12 hours
      break;
    case 'daily':
    default:
      intervalMs = 24 * 60 * 60 * 1000; // 24 hours
      break;
  }

  const intervalId = setInterval(() => {
    initializeNotifications(getDueReviewsCount);
  }, intervalMs);

  // Return cleanup function
  return () => {
    clearInterval(intervalId);
  };
}