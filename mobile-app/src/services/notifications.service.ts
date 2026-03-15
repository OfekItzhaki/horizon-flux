import * as Notifications from 'expo-notifications';
import { Platform, Linking, Alert } from 'react-native';
import {
  type ReminderConfig,
  ReminderTimeframe,
  ReminderSpecificDate,
} from '@tasks-management/frontend-services';
import Constants from 'expo-constants';
import { apiClient, ApiError } from '../utils/api-client';
import { remindersService } from './reminders.service';

// Track if notification handler has been configured
let notificationHandlerConfigured = false;

/**
 * Check if we're running in Expo Go (where notifications don't work)
 * Made extra safe to never throw
 */
function isExpoGo(): boolean {
  try {
    // Check multiple ways to detect Expo Go
    const appOwnership = Constants?.appOwnership;
    if (appOwnership === 'expo' || appOwnership === 'guest') {
      return true;
    }
    // Also check executionEnvironment for newer Expo versions
    const exEnv = (Constants as any)?.executionEnvironment;
    if (exEnv === 'storeClient' || exEnv === 'standalone') {
      return false; // Production build
    }
    // Default to true (Expo Go) to be safe
    return appOwnership !== 'standalone';
  } catch {
    // If anything fails, assume Expo Go to be safe
    return true;
  }
}

/**
 * Configure notification channel for Android (required for scheduled notifications)
 * Deferred to be called explicitly, not at module load
 */
async function setupNotificationChannel(): Promise<void> {
  if (isExpoGo()) {
    return;
  }

  try {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Task Reminders',
        description: 'Notifications for task reminders',
        importance: Notifications.AndroidImportance.HIGH,
        sound: 'default', // Use string instead of boolean for Android compatibility
        vibrationPattern: [0, 250, 250, 250],
        enableVibrate: true,
      });

      // Create a separate channel for daily tasks (persistent notification)
      await Notifications.setNotificationChannelAsync('daily-tasks', {
        name: 'Daily Tasks',
        description: 'Persistent notification showing all tasks for today',
        importance: Notifications.AndroidImportance.LOW,
        enableVibrate: false,
        showBadge: false,
      });
    }
  } catch (error) {
    console.error('Error setting up notification channel:', error);
  }
}

/**
 * Set up Android notification channels:
 * - "Task Reminders" (HIGH importance) for reminder notifications
 * - "Daily Tasks" (LOW importance) for daily summary notifications
 *
 * No-op on iOS or in Expo Go.
 * Requirements: 2.6, 2.7
 */
export async function setupAndroidChannels(): Promise<void> {
  if (isExpoGo()) {
    if (__DEV__) {
      console.log('[NotificationService] Skipping Android channel setup — running in Expo Go');
    }
    return;
  }

  if (Platform.OS !== 'android') {
    return;
  }

  try {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Task Reminders',
      description: 'Notifications for task reminders',
      importance: Notifications.AndroidImportance.HIGH,
      sound: 'default',
      vibrationPattern: [0, 250, 250, 250],
      enableVibrate: true,
    });

    await Notifications.setNotificationChannelAsync('daily-tasks', {
      name: 'Daily Tasks',
      description: 'Persistent notification showing all tasks for today',
      importance: Notifications.AndroidImportance.LOW,
      enableVibrate: false,
      showBadge: false,
    });

    if (__DEV__) {
      console.log('[NotificationService] Android notification channels configured');
    }
  } catch (error) {
    console.error('[NotificationService] Error setting up Android channels:', error);
  }
}

/**
 * Register the device's Expo push token with the backend.
 * Calls POST /me/push-token with { token, platform }.
 *
 * No-op in Expo Go.
 * Requirements: 1.3
 */
export async function registerPushToken(token: string): Promise<void> {
  if (isExpoGo()) {
    if (__DEV__) {
      console.log('[NotificationService] Skipping push token registration — running in Expo Go');
    }
    return;
  }

  try {
    await apiClient.post('/me/push-token', {
      token,
      platform: Platform.OS as 'ios' | 'android',
    });

    if (__DEV__) {
      console.log('[NotificationService] Push token registered successfully');
    }
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(0, 'Failed to register push token');
  }
}

/**
 * Configure notification handler - called lazily, not at module load
 * This prevents issues with module-level code execution in Expo Go
 */
async function ensureNotificationHandlerConfigured(): Promise<void> {
  if (notificationHandlerConfigured || isExpoGo()) {
    return;
  }

  try {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });

    await setupNotificationChannel();
    notificationHandlerConfigured = true;
  } catch (error) {
    console.error('Error configuring notification handler:', error);
  }
}

// NOTE: We no longer run notification setup at module load time
// It will be initialized lazily when requestNotificationPermissions is called

export interface ScheduledNotification {
  identifier: string;
  taskId: string;
  reminderId: string;
}

/**
 * Open Android notification settings for the app
 */
async function openAndroidNotificationSettings(): Promise<void> {
  try {
    const packageName = Constants?.expoConfig?.android?.package;
    if (!packageName) {
      // Fallback to generic settings
      await Linking.openSettings();
      return;
    }

    // Try to open app-specific notification settings (Android 8+)
    try {
      await Linking.sendIntent('android.settings.APP_NOTIFICATION_SETTINGS', [
        {
          key: 'android.provider.extra.APP_PACKAGE',
          value: packageName,
        },
      ]);
    } catch {
      // Fallback to app settings
      await Linking.openSettings();
    }
  } catch (error) {
    console.error('Error opening notification settings:', error);
    // Final fallback
    await Linking.openSettings();
  }
}

/**
 * Request notification permissions with user guidance
 * Returns false silently in Expo Go where notifications aren't supported
 */
export async function requestNotificationPermissions(showGuidance = false): Promise<boolean> {
  // Skip in Expo Go
  if (isExpoGo()) {
    if (__DEV__) {
      console.log('Skipping notification permissions - running in Expo Go');
    }
    return false;
  }

  try {
    // Initialize notification handler and channel (deferred from module load)
    await ensureNotificationHandlerConfigured();

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      // Show guidance before requesting if this is the first time
      if (showGuidance && Platform.OS === 'android') {
        const androidVersion = Platform.Version;
        const isAndroid12Plus = typeof androidVersion === 'number' && androidVersion >= 31;

        if (isAndroid12Plus) {
          // Show guidance alert and wait for user response
          return new Promise<boolean>((resolve) => {
            Alert.alert(
              'Enable Notifications',
              'To receive task reminders, please:\n\n1. Allow notifications when prompted\n2. After granting permission, enable "Pop on screen" in notification settings for heads-up notifications\n\nWe\'ll open the settings for you after you grant permission.',
              [
                {
                  text: 'Cancel',
                  style: 'cancel',
                  onPress: () => resolve(false),
                },
                {
                  text: 'Continue',
                  onPress: async () => {
                    const { status } = await Notifications.requestPermissionsAsync({
                      ios: {
                        allowAlert: true,
                        allowBadge: true,
                        allowSound: true,
                      },
                    });
                    finalStatus = status;

                    if (status === 'granted') {
                      // Show additional guidance for Android 12+
                      setTimeout(() => {
                        Alert.alert(
                          'Enable "Pop on screen"',
                          'For the best experience, please enable "Pop on screen" in your notification settings. This allows reminders to appear as popups even when the app is closed.\n\nWould you like to open notification settings now?',
                          [
                            {
                              text: 'Not Now',
                              style: 'cancel',
                            },
                            {
                              text: 'Open Settings',
                              onPress: () => openAndroidNotificationSettings(),
                            },
                          ],
                        );
                      }, 500);
                    }

                    resolve(status === 'granted');
                  },
                },
              ],
            );
          });
        }
      }

      // Standard permission request
      const { status } = await Notifications.requestPermissionsAsync({
        ios: {
          allowAlert: true,
          allowBadge: true,
          allowSound: true,
        },
      });
      finalStatus = status;
    }

    const granted = finalStatus === 'granted';
    if (__DEV__) {
      console.log(
        `Notification permissions: ${granted ? 'GRANTED' : 'DENIED'} (status: ${finalStatus})`,
      );
    }
    return granted;
  } catch (error) {
    console.error('Error requesting notification permissions:', error);
    return false;
  }
}

/**
 * Schedule a notification for a reminder
 */
export async function scheduleReminderNotification(
  taskId: string,
  taskDescription: string,
  reminder: ReminderConfig,
  dueDate: Date | string | null,
): Promise<string | null> {
  // Skip in Expo Go
  if (isExpoGo()) {
    return null;
  }

  try {
    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) {
      return null;
    }

    // Build trigger based on reminder type
    let trigger: Notifications.NotificationTriggerInput;
    const timeParts = (reminder.time || '09:00').split(':');
    const hours = parseInt(timeParts[0] || '9', 10);
    const minutes = parseInt(timeParts[1] || '0', 10);

    // For recurring daily reminders, use daily trigger
    if (reminder.timeframe === ReminderTimeframe.EVERY_DAY) {
      // Ensure notification channel is set up
      await setupNotificationChannel();

      trigger = {
        type: 'daily',
        hour: hours,
        minute: minutes,
      } as Notifications.DailyTriggerInput;
      if (__DEV__) {
        console.log(
          `Scheduling daily reminder at ${hours}:${minutes.toString().padStart(2, '0')} (repeats: true)`,
        );
      }
    }
    // For recurring weekly reminders, use weekly trigger
    else if (
      reminder.timeframe === ReminderTimeframe.EVERY_WEEK &&
      reminder.dayOfWeek !== undefined
    ) {
      // Ensure notification channel is set up
      await setupNotificationChannel();

      trigger = {
        type: 'weekly',
        weekday: reminder.dayOfWeek + 1, // expo-notifications uses 1-7 (Sunday = 1)
        hour: hours,
        minute: minutes,
      } as Notifications.WeeklyTriggerInput;
      if (__DEV__) {
        console.log(
          `Scheduling weekly reminder: weekday ${reminder.dayOfWeek + 1} at ${hours}:${minutes.toString().padStart(2, '0')} (repeats: true)`,
        );
      }
    }
    // For other reminders, calculate the date first
    else {
      const triggerDate = calculateNotificationDate(reminder, dueDate);
      if (!triggerDate) {
        return null;
      }

      // Don't schedule if the date is in the past (for one-time notifications)
      if (
        triggerDate < new Date() &&
        reminder.timeframe !== ReminderTimeframe.EVERY_MONTH &&
        reminder.timeframe !== ReminderTimeframe.EVERY_YEAR
      ) {
        return null;
      }

      trigger = {
        type: 'date',
        date: triggerDate,
      } as Notifications.DateTriggerInput;
    }

    // Ensure notification channel is set up before scheduling
    await setupNotificationChannel();

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: `Reminder: ${taskDescription}`,
        body: formatNotificationBody(reminder, dueDate),
        sound: reminder.hasAlarm === true ? 'default' : undefined, // Use string for Android compatibility
        data: {
          taskId,
          reminderId: reminder.id,
        },
        // Android requires channelId in content
        ...(Platform.OS === 'android' && { channelId: 'default' }),
      },
      trigger,
    });

    if (__DEV__) {
      console.log(
        `Scheduled notification ${notificationId} for task ${taskId}, reminder ${reminder.id} (${reminder.timeframe})`,
      );
    }

    return notificationId;
  } catch (error) {
    console.error('Error scheduling notification:', error);
    return null;
  }
}

/**
 * Calculate the exact date/time for a notification based on reminder config
 */
function calculateNotificationDate(
  reminder: ReminderConfig,
  dueDate: Date | string | null,
): Date | null {
  const now = new Date();
  const timeParts = (reminder.time || '09:00').split(':');
  const hours = parseInt(timeParts[0] || '9', 10);
  const minutes = parseInt(timeParts[1] || '0', 10);

  // Don't calculate for recurring daily/weekly - they use recurring triggers
  if (
    reminder.timeframe === ReminderTimeframe.EVERY_DAY ||
    (reminder.timeframe === ReminderTimeframe.EVERY_WEEK && reminder.dayOfWeek !== undefined)
  ) {
    return null;
  }

  let notificationDate: Date;

  // If reminder is relative to due date
  if (reminder.daysBefore !== undefined && reminder.daysBefore >= 0 && dueDate) {
    const due = typeof dueDate === 'string' ? new Date(dueDate) : dueDate;
    notificationDate = new Date(due);
    notificationDate.setDate(notificationDate.getDate() - reminder.daysBefore);
    notificationDate.setHours(hours, minutes, 0, 0);
    return notificationDate;
  }

  // Handle different timeframes
  switch (reminder.timeframe) {
    case ReminderTimeframe.SPECIFIC_DATE:
      if (reminder.customDate) {
        notificationDate = new Date(reminder.customDate);
        notificationDate.setHours(hours, minutes, 0, 0);
        return notificationDate;
      }
      // For START_OF_WEEK, START_OF_MONTH, START_OF_YEAR - calculate next occurrence
      if (reminder.specificDate === ReminderSpecificDate.START_OF_WEEK) {
        // Next Monday
        const daysUntilMonday = (1 - now.getDay() + 7) % 7 || 7;
        notificationDate = new Date(now);
        notificationDate.setDate(notificationDate.getDate() + daysUntilMonday);
        notificationDate.setHours(hours, minutes, 0, 0);
        return notificationDate;
      }
      if (reminder.specificDate === ReminderSpecificDate.START_OF_MONTH) {
        // 1st of next month
        notificationDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        notificationDate.setHours(hours, minutes, 0, 0);
        return notificationDate;
      }
      if (reminder.specificDate === ReminderSpecificDate.START_OF_YEAR) {
        // Jan 1st of next year
        notificationDate = new Date(now.getFullYear() + 1, 0, 1);
        notificationDate.setHours(hours, minutes, 0, 0);
        return notificationDate;
      }
      break;

    // Note: EVERY_DAY and EVERY_WEEK are handled earlier with recurring triggers
    // and return null from this function, so they're not included in this switch

    case ReminderTimeframe.EVERY_MONTH:
      // 1st of next month
      notificationDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      notificationDate.setHours(hours, minutes, 0, 0);
      return notificationDate;

    case ReminderTimeframe.EVERY_YEAR:
      // Same date next year
      notificationDate = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());
      notificationDate.setHours(hours, minutes, 0, 0);
      return notificationDate;
  }

  return null;
}

/**
 * Format notification body text
 * Includes location when set.
 */
function formatNotificationBody(reminder: ReminderConfig, dueDate: Date | string | null): string {
  const parts: string[] = [];
  if (reminder.location?.trim()) {
    parts.push(`📍 ${reminder.location.trim()}`);
  }

  if (reminder.daysBefore !== undefined && reminder.daysBefore >= 0 && dueDate) {
    const due = typeof dueDate === 'string' ? new Date(dueDate) : dueDate;
    const daysUntil = Math.ceil((due.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    if (daysUntil === 0) {
      parts.push('This task is due today!');
    } else if (daysUntil === 1) {
      parts.push('This task is due tomorrow.');
    } else {
      parts.push(`This task is due in ${daysUntil} days.`);
    }
  } else {
    parts.push('Reminder for your task');
  }

  return parts.join(' • ');
}

/**
 * Cancel a scheduled notification
 */
export async function cancelNotification(notificationId: string): Promise<void> {
  // Skip in Expo Go
  if (isExpoGo()) {
    return;
  }

  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  } catch (error) {
    // Silently fail if notifications aren't available
  }
}

/**
 * Cancel all notifications for a task
 */
export async function cancelAllTaskNotifications(taskId: string): Promise<void> {
  // Skip in Expo Go
  if (isExpoGo()) {
    return;
  }

  try {
    const allNotifications = await Notifications.getAllScheduledNotificationsAsync();
    const taskNotifications = allNotifications.filter(
      (notification) => notification.content.data?.taskId === taskId,
    );

    for (const notification of taskNotifications) {
      await Notifications.cancelScheduledNotificationAsync(notification.identifier);
    }
  } catch (error) {
    // Silently fail if notifications aren't available
  }
}

/**
 * Schedule multiple notifications for a task's reminders
 */
export async function scheduleTaskReminders(
  taskId: string,
  taskDescription: string,
  reminders: ReminderConfig[],
  dueDate: Date | string | null,
): Promise<string[]> {
  // First cancel all existing notifications for this task
  await cancelAllTaskNotifications(taskId);

  const notificationIds: string[] = [];

  for (const reminder of reminders) {
    const id = await scheduleReminderNotification(taskId, taskDescription, reminder, dueDate);
    if (id) {
      notificationIds.push(id);
    }
  }

  return notificationIds;
}

/**
 * Get all scheduled notifications (for debugging)
 */
export async function getAllScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
  if (isExpoGo()) {
    return [];
  }
  try {
    return await Notifications.getAllScheduledNotificationsAsync();
  } catch (error) {
    console.error('Error getting scheduled notifications:', error);
    return [];
  }
}

/**
 * Get all tasks for today (both repeatable and non-repeatable)
 * This includes tasks with dueDate today, daily reminders, and weekly reminders for today
 */
async function getTodayTasks(): Promise<Array<{ description: string; isRepeating: boolean }>> {
  try {
    const { tasksService } = await import('./tasks.service');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString().split('T')[0];

    // Get all tasks
    const allTasks = await tasksService.getAll();

    // Get today's day of week (0 = Sunday, 6 = Saturday)
    const todayDayOfWeek = today.getDay();

    const todayTasks: Array<{ description: string; isRepeating: boolean }> = [];

    for (const task of allTasks) {
      // Skip completed tasks
      if (task.completed) {
        continue;
      }

      let isToday = false;
      let isRepeating = false;

      // Check if task is due today
      if (task.dueDate) {
        const dueDate = new Date(task.dueDate);
        dueDate.setHours(0, 0, 0, 0);
        if (dueDate.getTime() === today.getTime()) {
          isToday = true;
        }
      }

      // Check if task has daily reminder from reminderConfig
      if (task.reminderConfig && Array.isArray(task.reminderConfig)) {
        const hasDailyReminder = task.reminderConfig.some(
          (r: any) => r.timeframe === ReminderTimeframe.EVERY_DAY,
        );
        if (hasDailyReminder) {
          isToday = true;
          isRepeating = true;
        }
      }

      // Check if task has weekly reminder for today
      if (task.specificDayOfWeek !== null && task.specificDayOfWeek !== undefined) {
        if (task.specificDayOfWeek === todayDayOfWeek) {
          isToday = true;
          isRepeating = true;
        }
      }

      if (isToday) {
        todayTasks.push({
          description: task.description,
          isRepeating,
        });
      }
    }

    return todayTasks;
  } catch (error) {
    console.error('Error getting today tasks:', error);
    return [];
  }
}

/**
 * Update the daily tasks persistent notification
 * This shows all tasks for today in a persistent notification
 */
export async function updateDailyTasksNotification(): Promise<void> {
  // Skip in Expo Go
  if (isExpoGo()) {
    return;
  }

  try {
    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) {
      return;
    }

    await setupNotificationChannel();

    const todayTasks = await getTodayTasks();

    if (todayTasks.length === 0) {
      // Cancel the notification if no tasks
      try {
        await Notifications.cancelScheduledNotificationAsync('daily-tasks-persistent');
      } catch {
        // Ignore if notification doesn't exist
      }
      return;
    }

    // Separate repeating and non-repeating tasks
    const repeatingTasks = todayTasks.filter((t) => t.isRepeating);
    const nonRepeatingTasks = todayTasks.filter((t) => !t.isRepeating);

    // Build notification body
    let body = '';
    if (repeatingTasks.length > 0) {
      body += `Repeating (${repeatingTasks.length}):\n`;
      repeatingTasks.slice(0, 5).forEach((task, index) => {
        body += `• ${task.description}\n`;
      });
      if (repeatingTasks.length > 5) {
        body += `... and ${repeatingTasks.length - 5} more\n`;
      }
    }

    if (nonRepeatingTasks.length > 0) {
      if (body) body += '\n';
      body += `One-time (${nonRepeatingTasks.length}):\n`;
      nonRepeatingTasks.slice(0, 5).forEach((task) => {
        body += `• ${task.description}\n`;
      });
      if (nonRepeatingTasks.length > 5) {
        body += `... and ${nonRepeatingTasks.length - 5} more`;
      }
    }

    // Schedule as a persistent notification (ongoing)
    // Use a fixed identifier so we can update it
    const notificationId = 'daily-tasks-persistent';

    // Cancel existing notification first
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
    } catch {
      // Ignore if doesn't exist
    }

    // Schedule immediate notification that will be persistent
    // Note: Expo Notifications doesn't directly support ongoing/sticky notifications
    // but we can use a low-priority channel and update it frequently
    await Notifications.scheduleNotificationAsync({
      identifier: notificationId,
      content: {
        title: `📋 Today's Tasks (${todayTasks.length})`,
        body: body.trim(),
        data: {
          type: 'daily-tasks',
        },
        // Android-specific options
        ...(Platform.OS === 'android' && {
          channelId: 'daily-tasks',
        }),
      },
      trigger: null, // Immediate notification
    });

    if (__DEV__) {
      console.log(`Updated daily tasks notification with ${todayTasks.length} tasks`);
    }
  } catch (error) {
    console.error('Error updating daily tasks notification:', error);
  }
}

/**
 * Schedule daily update for tasks notification
 * This will update the notification every day at midnight
 */
export async function scheduleDailyTasksNotificationUpdate(): Promise<void> {
  // Skip in Expo Go
  if (isExpoGo()) {
    return;
  }

  try {
    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) {
      return;
    }

    await setupNotificationChannel();

    // Cancel existing scheduled update
    try {
      await Notifications.cancelScheduledNotificationAsync('daily-tasks-update');
    } catch {
      // Ignore if doesn't exist
    }

    // Schedule daily update at midnight
    await Notifications.scheduleNotificationAsync({
      identifier: 'daily-tasks-update',
      content: {
        title: 'Updating daily tasks',
        body: '',
        data: {
          type: 'daily-tasks-update',
        },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: 0,
        minute: 0,
      },
    });

    // Also update immediately
    await updateDailyTasksNotification();
  } catch (error) {
    console.error('Error scheduling daily tasks notification update:', error);
  }
}

/**
 * Reschedule all reminders for all tasks (call on app startup)
 * This ensures notifications are scheduled even after app restart.
 *
 * Fetches active reminders from GET /reminders/range, cancels stale scheduled
 * notifications, and schedules the active ones.
 *
 * Requirements: 2.4, 2.5
 */
export async function rescheduleAllReminders(userId?: string): Promise<void> {
  // Skip in Expo Go
  if (isExpoGo()) {
    if (__DEV__) {
      console.log('Skipping reminder rescheduling - running in Expo Go');
    }
    return;
  }

  try {
    // Fetch active reminders from the backend for the next 365 days
    const startDate = new Date().toISOString().split('T')[0];
    const endDateObj = new Date();
    endDateObj.setFullYear(endDateObj.getFullYear() + 1);
    const endDate = endDateObj.toISOString().split('T')[0];

    const activeReminders = await remindersService.getByRange(startDate, endDate);

    if (__DEV__) {
      console.log(`[NotificationService] Fetched ${activeReminders.length} active reminders from backend`);
    }

    // Get all currently scheduled notifications
    const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();

    // Build a set of taskIds that have active reminders
    const activeTaskIds = new Set(activeReminders.map((r) => r.taskId));

    // Cancel stale notifications (scheduled for tasks that no longer have active reminders)
    for (const notification of scheduledNotifications) {
      const taskId = notification.content.data?.taskId as string | undefined;
      if (taskId && !activeTaskIds.has(taskId)) {
        await Notifications.cancelScheduledNotificationAsync(notification.identifier);
        if (__DEV__) {
          console.log(`[NotificationService] Cancelled stale notification for task ${taskId}`);
        }
      }
    }

    // Schedule notifications for active reminders
    // Group reminders by taskId so we can use scheduleTaskReminders
    const remindersByTask = new Map<string, typeof activeReminders>();
    for (const reminder of activeReminders) {
      const existing = remindersByTask.get(reminder.taskId) ?? [];
      existing.push(reminder);
      remindersByTask.set(reminder.taskId, existing);
    }

    let scheduledCount = 0;
    for (const [taskId, reminders] of remindersByTask) {
      const firstReminder = reminders[0];
      if (!firstReminder) continue;

      // Convert backend reminder notifications to ReminderConfig format
      // Each ReminderNotification has taskId, taskDescription, dueDate, reminderDate, message, title
      // We need to build ReminderConfig objects from the reminderDate
      const reminderConfigs: ReminderConfig[] = reminders.map((r) => {
        const reminderDate = new Date(r.reminderDate);
        return {
          id: `${r.taskId}-${r.reminderDate}`,
          timeframe: ReminderTimeframe.SPECIFIC_DATE,
          customDate: r.reminderDate,
          time: `${reminderDate.getHours().toString().padStart(2, '0')}:${reminderDate.getMinutes().toString().padStart(2, '0')}`,
          hasAlarm: true,
        } as ReminderConfig;
      });

      await scheduleTaskReminders(
        taskId,
        firstReminder.taskDescription,
        reminderConfigs,
        firstReminder.dueDate || null,
      );
      scheduledCount += reminderConfigs.length;
    }

    if (__DEV__) {
      console.log(`[NotificationService] Rescheduled ${scheduledCount} reminders for ${remindersByTask.size} tasks`);
    }

    // Also update daily tasks notification
    await updateDailyTasksNotification();
    await scheduleDailyTasksNotificationUpdate();
  } catch (error) {
    console.error('Error rescheduling reminders:', error);
  }
}
