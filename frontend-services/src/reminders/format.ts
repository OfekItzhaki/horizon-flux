/**
 * Format reminder for display (shared: web + mobile).
 * Optional i18n `t` for web; mobile can omit it.
 */

import type { ReminderConfig } from './types';
import { ReminderTimeframe, ReminderSpecificDate, DAY_NAMES } from './types';

type T = ((key: string, opts?: { defaultValue?: string; count?: number }) => string) | undefined;

export function formatReminderDisplay(reminder: ReminderConfig, t?: T): string {
  const timeStr = reminder.time || '09:00';
  let description = '';

  if (reminder.daysBefore != null && reminder.daysBefore > 0) {
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
    case ReminderTimeframe.EVERY_WEEK: {
      const dayName = reminder.dayOfWeek != null ? DAY_NAMES[reminder.dayOfWeek] : 'Monday';
      description = t
        ? `${t('reminders.every', { defaultValue: 'Every' })} ${dayName} ${t('reminders.at', { defaultValue: 'at' })} ${timeStr}`
        : `Every ${dayName} at ${timeStr}`;
      break;
    }
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
}
