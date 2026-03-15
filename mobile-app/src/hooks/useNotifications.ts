import { useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { useAuthStore } from '../store/useAuthStore';
import {
  requestNotificationPermissions,
  rescheduleAllReminders,
} from '../services/notifications.service';
import { usersService } from '../services/users.service';

/**
 * Check if the app is running inside Expo Go.
 * Push notifications are not supported in Expo Go.
 */
function isExpoGo(): boolean {
  try {
    const appOwnership = Constants?.appOwnership;
    if (appOwnership === 'expo' || appOwnership === 'guest') {
      return true;
    }
    const exEnv = (Constants as any)?.executionEnvironment;
    if (exEnv === 'storeClient' || exEnv === 'standalone') {
      return false;
    }
    return appOwnership !== 'standalone';
  } catch {
    return true;
  }
}

/**
 * Attempt to obtain an Expo push token and register it with the backend.
 * Retries once after 5 seconds on failure, then silently fails.
 *
 * Requirements: 1.1, 1.2, 1.3, 1.5
 */
async function registerPushTokenWithRetry(): Promise<void> {
  const attempt = async (): Promise<void> => {
    const granted = await requestNotificationPermissions();
    if (!granted) {
      return;
    }

    const tokenData = await Notifications.getExpoPushTokenAsync();
    await usersService.registerPushToken(tokenData.data);
  };

  try {
    await attempt();
  } catch (error) {
    if (__DEV__) {
      console.warn('[useNotifications] Push token registration failed, retrying in 5s…', error);
    }
    // Retry once after 5 seconds, then silently fail (Requirement 1.5)
    setTimeout(async () => {
      try {
        await attempt();
      } catch (retryError) {
        if (__DEV__) {
          console.warn('[useNotifications] Push token registration failed after retry — giving up.', retryError);
        }
        // Silently fail
      }
    }, 5000);
  }
}

/**
 * `useNotifications` — single entry point for all notification concerns.
 *
 * - On mount (authenticated): requests permission, obtains push token, registers with backend.
 * - On mount (authenticated): calls `rescheduleAllReminders` to restore scheduled notifications.
 * - On logout (user becomes null): cancels all scheduled notifications.
 * - Expo Go guard: skips all paths and logs a dev warning.
 *
 * Invoke once at the root of the authenticated navigation tree (e.g. inside `MainTabs`).
 *
 * Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 2.4, 11.1, 11.2, 11.3, 11.4, 11.5
 */
export function useNotifications(): void {
  const user = useAuthStore((state) => state.user);

  // Track whether we've already run the registration + reschedule for this session
  // so we don't repeat on unrelated re-renders.
  const hasInitialised = useRef(false);
  // Keep a ref to the previous user so we can detect logout transitions.
  const prevUserRef = useRef(user);

  useEffect(() => {
    // Expo Go guard — skip everything and warn (Requirement 1.6)
    if (isExpoGo()) {
      if (__DEV__) {
        console.warn(
          '[useNotifications] Running in Expo Go — push notification registration and scheduling are disabled.',
        );
      }
      return;
    }

    const wasAuthenticated = prevUserRef.current != null;
    const isAuthenticated = user != null;

    prevUserRef.current = user;

    if (isAuthenticated && !hasInitialised.current) {
      // Mark as initialised so we don't repeat on re-renders
      hasInitialised.current = true;

      // Register push token (with retry on failure) — Requirements 1.1, 1.2, 1.3, 1.5
      registerPushTokenWithRetry();

      // Reschedule all reminders — Requirements 2.4, 11.3
      rescheduleAllReminders(user.id).catch((err) => {
        if (__DEV__) {
          console.warn('[useNotifications] rescheduleAllReminders failed:', err);
        }
      });
    }

    if (wasAuthenticated && !isAuthenticated) {
      // User logged out — cancel all scheduled notifications (Requirement 11.5)
      hasInitialised.current = false;
      Notifications.cancelAllScheduledNotificationsAsync().catch((err) => {
        if (__DEV__) {
          console.warn('[useNotifications] cancelAllScheduledNotificationsAsync failed:', err);
        }
      });
    }
  }, [user]);
}
