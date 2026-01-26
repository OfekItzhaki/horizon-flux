// Reminder configuration types (matching mobile app)
export enum ReminderTimeframe {
  SPECIFIC_DATE = 'SPECIFIC_DATE',
  EVERY_DAY = 'EVERY_DAY',
  EVERY_WEEK = 'EVERY_WEEK',
  EVERY_MONTH = 'EVERY_MONTH',
  EVERY_YEAR = 'EVERY_YEAR',
}

export enum ReminderSpecificDate {
  START_OF_WEEK = 'START_OF_WEEK',
  START_OF_MONTH = 'START_OF_MONTH',
  START_OF_YEAR = 'START_OF_YEAR',
  CUSTOM_DATE = 'CUSTOM_DATE',
}

export interface ReminderConfig {
  id: string;
  timeframe: ReminderTimeframe;
  time?: string;
  specificDate?: ReminderSpecificDate;
  customDate?: string;
  dayOfWeek?: number; // 0-6 (Sunday-Saturday)
  daysBefore?: number; // Days before due date
  hasAlarm?: boolean;
}

export const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

/**
 * Convert backend format to ReminderConfig format
 */
export const convertBackendToReminders = (
  reminderDaysBefore: number[] | undefined,
  specificDayOfWeek: number | null | undefined,
  dueDate: string | null | undefined,
): ReminderConfig[] => {
  const reminders: ReminderConfig[] = [];

  // Convert reminderDaysBefore array to ReminderConfig
  if (reminderDaysBefore && reminderDaysBefore.length > 0 && dueDate) {
    reminderDaysBefore.forEach((days) => {
      reminders.push({
        id: `days-before-${days}`,
        timeframe: ReminderTimeframe.SPECIFIC_DATE,
        time: '09:00',
        daysBefore: days,
      });
    });
  }

  // Convert specificDayOfWeek to ReminderConfig
  if (specificDayOfWeek !== null && specificDayOfWeek !== undefined && specificDayOfWeek >= 0 && specificDayOfWeek <= 6) {
    reminders.push({
      id: `day-of-week-${specificDayOfWeek}`,
      timeframe: ReminderTimeframe.EVERY_WEEK,
      time: '09:00',
      dayOfWeek: specificDayOfWeek,
    });
  }

  return reminders;
};

/**
 * Convert reminder configurations to backend format
 */
export const convertRemindersToBackend = (
  reminders: ReminderConfig[],
  dueDate?: string,
): { reminderDaysBefore?: number[]; specificDayOfWeek?: number | null } => {
  const daysBefore: number[] = [];
  let dayOfWeek: number | undefined;

  reminders.forEach((reminder) => {
    // Skip EVERY_DAY reminders (client-side only)
    if (reminder.timeframe === ReminderTimeframe.EVERY_DAY) {
      return;
    }

    // For reminders with daysBefore (relative to due date)
    if (reminder.daysBefore !== undefined && reminder.daysBefore > 0) {
      if (dueDate) {
        daysBefore.push(reminder.daysBefore);
      }
    }

    // For weekly reminders
    if (reminder.timeframe === ReminderTimeframe.EVERY_WEEK && reminder.dayOfWeek !== undefined) {
      dayOfWeek = reminder.dayOfWeek;
    }
  });

  const result: { reminderDaysBefore?: number[]; specificDayOfWeek?: number | null } = {};

  if (daysBefore.length > 0) {
    result.reminderDaysBefore = [...new Set(daysBefore)].sort((a, b) => b - a);
  } else {
    result.reminderDaysBefore = [];
  }

  if (dayOfWeek !== undefined && dayOfWeek >= 0 && dayOfWeek <= 6) {
    result.specificDayOfWeek = dayOfWeek;
  } else {
    result.specificDayOfWeek = null;
  }

  return result;
};

/**
 * Format a reminder configuration for display
 */
export const formatReminderDisplay = (reminder: ReminderConfig, t?: (key: string, options?: any) => string): string => {
  const timeStr = reminder.time || '09:00';
  let description = '';

  // Check daysBefore first
  if (reminder.daysBefore !== undefined && reminder.daysBefore > 0) {
    const daysText = reminder.daysBefore === 1 ? 'day' : 'days';
    return t 
      ? `${reminder.daysBefore} ${t('reminders.daysBefore', { count: reminder.daysBefore, defaultValue: daysText })} ${t('reminders.beforeDueDate', { defaultValue: 'before due date' })} ${t('reminders.at', { defaultValue: 'at' })} ${timeStr}`
      : `${reminder.daysBefore} ${daysText} before due date at ${timeStr}`;
  }

  switch (reminder.timeframe) {
    case ReminderTimeframe.SPECIFIC_DATE:
      if (reminder.specificDate === ReminderSpecificDate.START_OF_WEEK) {
        description = t 
          ? `${t('reminders.everyMonday', { defaultValue: 'Every Monday' })} ${t('reminders.at', { defaultValue: 'at' })} ${timeStr}`
          : `Every Monday at ${timeStr}`;
      } else if (reminder.specificDate === ReminderSpecificDate.START_OF_MONTH) {
        description = t
          ? `${t('reminders.firstOfMonth', { defaultValue: '1st of every month' })} ${t('reminders.at', { defaultValue: 'at' })} ${timeStr}`
          : `1st of every month at ${timeStr}`;
      } else if (reminder.specificDate === ReminderSpecificDate.START_OF_YEAR) {
        description = t
          ? `${t('reminders.janFirst', { defaultValue: 'Jan 1st every year' })} ${t('reminders.at', { defaultValue: 'at' })} ${timeStr}`
          : `Jan 1st every year at ${timeStr}`;
      } else if (reminder.customDate) {
        const date = new Date(reminder.customDate);
        description = `${date.toLocaleDateString()} at ${timeStr}`;
      } else {
        description = t
          ? `${t('reminders.specificDate', { defaultValue: 'Specific date' })} ${t('reminders.at', { defaultValue: 'at' })} ${timeStr}`
          : `Specific date at ${timeStr}`;
      }
      break;
    case ReminderTimeframe.EVERY_DAY:
      description = t
        ? `${t('reminders.everyDay', { defaultValue: 'Every day' })} ${t('reminders.at', { defaultValue: 'at' })} ${timeStr}`
        : `Every day at ${timeStr}`;
      break;
    case ReminderTimeframe.EVERY_WEEK:
      const dayName = reminder.dayOfWeek !== undefined ? DAY_NAMES[reminder.dayOfWeek] : 'Monday';
      description = t
        ? `${t('reminders.every', { defaultValue: 'Every' })} ${dayName} ${t('reminders.at', { defaultValue: 'at' })} ${timeStr}`
        : `Every ${dayName} at ${timeStr}`;
      break;
    case ReminderTimeframe.EVERY_MONTH:
      description = t
        ? `${t('reminders.firstOfMonth', { defaultValue: '1st of every month' })} ${t('reminders.at', { defaultValue: 'at' })} ${timeStr}`
        : `1st of every month at ${timeStr}`;
      break;
    case ReminderTimeframe.EVERY_YEAR:
      description = t
        ? `${t('reminders.sameDateYearly', { defaultValue: 'Same date every year' })} ${t('reminders.at', { defaultValue: 'at' })} ${timeStr}`
        : `Same date every year at ${timeStr}`;
      break;
  }

  return description;
};
