/**
 * Enhanced PWA Push Notification System
 * Extends the existing notification system with PWA push notification capabilities
 */

import {
  NotificationSettings,
  DEFAULT_NOTIFICATION_SETTINGS,
  requestNotificationPermission as requestBasicPermission,
  areNotificationsAllowed,
  getNotificationSettings as getBasicSettings,
} from "./notifications";

export interface PWANotificationSettings extends NotificationSettings {
  pushEnabled: boolean;
  vapidKey?: string;
  endpoint?: string;
  subscriptionData?: PushSubscription;
}

export const DEFAULT_PWA_NOTIFICATION_SETTINGS: PWANotificationSettings = {
  ...DEFAULT_NOTIFICATION_SETTINGS,
  pushEnabled: false,
};

const PWA_NOTIFICATION_STORAGE_KEY = "pwa_notification_settings";
const PUSH_SUBSCRIPTION_KEY = "pwa_push_subscription";

/**
 * Request both basic and push notification permissions
 */
export async function requestPWANotificationPermission(): Promise<{
  basicPermission: boolean;
  pushPermission: boolean;
  subscription?: PushSubscription;
}> {
  // First request basic notification permission
  const basicPermission = await requestBasicPermission();

  if (!basicPermission) {
    return {basicPermission: false, pushPermission: false};
  }

  // Then try to set up push notifications
  try {
    const pushPermission = await setupPushNotifications();
    const subscription = pushPermission
      ? await getPushSubscription()
      : undefined;

    return {
      basicPermission: true,
      pushPermission,
      subscription,
    };
  } catch (error) {
    console.error("[PWANotifications] Push setup failed:", error);
    return {basicPermission: true, pushPermission: false};
  }
}

/**
 * Set up push notification subscription
 */
async function setupPushNotifications(): Promise<boolean> {
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
    console.log("[PWANotifications] Push notifications not supported");
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.ready;

    // Check if already subscribed
    let subscription = await registration.pushManager.getSubscription();

    if (!subscription) {
      // Create new subscription
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: generateVAPIDKey(), // In real app, use your VAPID key
      });
    }

    // Store subscription
    storePushSubscription(subscription);

    console.log("[PWANotifications] Push subscription created:", subscription);
    return true;
  } catch (error) {
    console.error("[PWANotifications] Push subscription failed:", error);
    return false;
  }
}

/**
 * Generate a VAPID key for development (in production, use your own)
 */
function generateVAPIDKey(): Uint8Array {
  // This is a dummy key for development
  // In production, replace with your actual VAPID public key
  const key =
    "BChI_ZQh9xH-w3VbJ7qwKU4GUyKyPJM1CtWB7I-sK3I8aQrL5g0JKqJKGi9xNjwKU4GUyKyPJM1CtWB7I-sK3I8";
  return new Uint8Array(
    atob(key.replace(/-/g, "+").replace(/_/g, "/"))
      .split("")
      .map((char) => char.charCodeAt(0)),
  );
}

/**
 * Store push subscription
 */
function storePushSubscription(subscription: PushSubscription): void {
  try {
    localStorage.setItem(
      PUSH_SUBSCRIPTION_KEY,
      JSON.stringify(subscription.toJSON()),
    );
  } catch (error) {
    console.error("[PWANotifications] Failed to store subscription:", error);
  }
}

/**
 * Get stored push subscription
 */
async function getPushSubscription(): Promise<PushSubscription | null> {
  try {
    const stored = localStorage.getItem(PUSH_SUBSCRIPTION_KEY);
    if (!stored) return null;

    const registration = await navigator.serviceWorker.ready;
    return await registration.pushManager.getSubscription();
  } catch (error) {
    console.error("[PWANotifications] Failed to get subscription:", error);
    return null;
  }
}

/**
 * Get PWA notification settings
 */
export function getPWANotificationSettings(): PWANotificationSettings {
  try {
    const stored = localStorage.getItem(PWA_NOTIFICATION_STORAGE_KEY);
    if (stored) {
      return {...DEFAULT_PWA_NOTIFICATION_SETTINGS, ...JSON.parse(stored)};
    }
  } catch (error) {
    console.error("[PWANotifications] Failed to load settings:", error);
  }
  return DEFAULT_PWA_NOTIFICATION_SETTINGS;
}

/**
 * Save PWA notification settings
 */
export function savePWANotificationSettings(
  settings: PWANotificationSettings,
): void {
  try {
    localStorage.setItem(
      PWA_NOTIFICATION_STORAGE_KEY,
      JSON.stringify(settings),
    );
  } catch (error) {
    console.error("[PWANotifications] Failed to save settings:", error);
  }
}

/**
 * Schedule a push notification (simulated - in production this would go through your server)
 */
export async function schedulePushNotification(
  title: string,
  body: string,
  delay: number = 0,
  data?: any,
): Promise<boolean> {
  const settings = getPWANotificationSettings();

  if (!settings.pushEnabled || !areNotificationsAllowed(settings)) {
    console.log(
      "[PWANotifications] Push notifications disabled or not allowed",
    );
    return false;
  }

  try {
    // In a real implementation, this would send the notification data to your server
    // which would then push it to the client. For demo purposes, we'll use local notifications

    setTimeout(() => {
      if ("serviceWorker" in navigator) {
        navigator.serviceWorker.ready.then((registration) => {
          registration.showNotification(title, {
            body,
            icon: "./assets/icon.png",
            badge: "./assets/favicon.png",
            tag: "learning-reminder",
            requireInteraction: false,
            actions: [
              {
                action: "open-app",
                title: "App öffnen",
              },
              {
                action: "dismiss",
                title: "Später",
              },
            ],
            data: {
              url: "./",
              ...data,
            },
          });
        });
      }
    }, delay);

    return true;
  } catch (error) {
    console.error(
      "[PWANotifications] Failed to schedule push notification:",
      error,
    );
    return false;
  }
}

/**
 * Show learning reminder notification
 */
export async function showLearningReminder(dueCount: number): Promise<void> {
  const title = "🧠 ABC-Listen Wiederholung";
  const body =
    dueCount === 1
      ? "Du hast 1 Begriff zu wiederholen"
      : `Du hast ${dueCount} Begriffe zu wiederholen`;

  // Try push notification first, fallback to basic notification
  const pushSent = await schedulePushNotification(title, body, 0, {
    type: "learning-reminder",
    dueCount,
  });

  if (!pushSent) {
    // Fallback to basic notification
    if (areNotificationsAllowed(getBasicSettings())) {
      new Notification(title, {
        body,
        icon: "./assets/icon.png",
        tag: "learning-reminder",
      });
    }
  }
}

/**
 * Schedule daily learning reminders
 */
export function scheduleDailyReminders(): void {
  const settings = getPWANotificationSettings();

  if (!settings.enabled || !settings.pushEnabled) {
    return;
  }

  // Clear existing reminders first
  clearScheduledReminders();

  const now = new Date();
  const reminderTimes = getReminderTimes(settings);

  reminderTimes.forEach((reminderTime) => {
    const delay = reminderTime.getTime() - now.getTime();

    if (delay > 0) {
      schedulePushNotification(
        "🧠 Zeit zum Lernen!",
        "Schau nach, ob du heute etwas zu wiederholen hast.",
        delay,
        {type: "daily-reminder"},
      );
    }
  });

  console.log(
    `[PWANotifications] Scheduled ${reminderTimes.length} daily reminders`,
  );
}

/**
 * Get reminder times based on frequency settings
 */
function getReminderTimes(settings: PWANotificationSettings): Date[] {
  const times: Date[] = [];
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  switch (settings.frequency) {
    case "hourly": {
      // Every hour between end of quiet hours and start of quiet hours
      for (
        let hour = settings.quietHours.end;
        hour < settings.quietHours.start;
        hour += 2
      ) {
        const time = new Date(tomorrow);
        time.setHours(hour, 0, 0, 0);
        times.push(time);
      }
      break;
    }

    case "twice-daily": {
      // Morning and afternoon
      const morning = new Date(tomorrow);
      morning.setHours(settings.quietHours.end + 1, 0, 0, 0);
      times.push(morning);

      const afternoon = new Date(tomorrow);
      afternoon.setHours(14, 0, 0, 0); // 2 PM
      times.push(afternoon);
      break;
    }

    case "daily":
    default: {
      // Once per day at 10 AM
      const daily = new Date(tomorrow);
      daily.setHours(10, 0, 0, 0);
      times.push(daily);
      break;
    }
  }

  return times;
}

/**
 * Clear scheduled reminders (platform-specific implementation needed)
 */
function clearScheduledReminders(): void {
  // In a real implementation, this would clear scheduled notifications
  // For now, we just log it
  console.log("[PWANotifications] Clearing scheduled reminders");
}

/**
 * Check notification support
 */
export function checkPWANotificationSupport(): {
  basicNotifications: boolean;
  pushNotifications: boolean;
  serviceWorker: boolean;
} {
  return {
    basicNotifications: "Notification" in window,
    pushNotifications: "PushManager" in window,
    serviceWorker: "serviceWorker" in navigator,
  };
}

/**
 * Test push notification (for settings/debugging)
 */
export async function testPushNotification(): Promise<boolean> {
  return await schedulePushNotification(
    "🧪 Test Benachrichtigung",
    "Deine Push-Benachrichtigungen funktionieren!",
    0,
    {type: "test"},
  );
}
