/**
 * Convert between backend reminder format and ReminderConfig (shared: web + mobile).
 */

import type { ReminderConfig } from './types';
import { ReminderTimeframe } from './types';

export function convertBackendToReminders(
  reminderDaysBefore: number[] | undefined,
  specificDayOfWeek: number | null | undefined,
  dueDate: string | null | undefined,
  reminderConfig?: unknown,
): ReminderConfig[] {
  const reminders: ReminderConfig[] = [];

  if (reminderDaysBefore?.length && dueDate) {
    reminderDaysBefore.forEach((days) => {
      reminders.push({
        id: `days-before-${days}`,
        timeframe: ReminderTimeframe.SPECIFIC_DATE,
        time: '09:00',
        daysBefore: days,
      });
    });
  }

  if (specificDayOfWeek != null && specificDayOfWeek >= 0 && specificDayOfWeek <= 6) {
    reminders.push({
      id: `day-of-week-${specificDayOfWeek}`,
      timeframe: ReminderTimeframe.EVERY_WEEK,
      time: '09:00',
      dayOfWeek: specificDayOfWeek,
    });
  }

  if (reminderConfig != null) {
    let parsed: unknown = reminderConfig;
    if (typeof reminderConfig === 'string') {
      try {
        parsed = JSON.parse(reminderConfig) as unknown;
      } catch {
        parsed = null;
      }
    }

    const push = (c: Record<string, unknown>) => {
      if (!c || !c.timeframe) return;
      const tf =
        typeof c.timeframe === 'string' ? (c.timeframe as ReminderTimeframe) : (c.timeframe as ReminderTimeframe);
      reminders.push({
        id: (c.id as string) || `reminder-${Date.now()}-${Math.random()}`,
        timeframe: tf,
        time: (c.time as string) || '09:00',
        specificDate: c.specificDate as ReminderConfig['specificDate'],
        customDate: c.customDate as string | undefined,
        dayOfWeek: c.dayOfWeek as number | undefined,
        daysBefore: c.daysBefore as number | undefined,
        hasAlarm: Boolean(c.hasAlarm),
        location: typeof c.location === 'string' ? c.location : undefined,
      });
    };

    if (Array.isArray(parsed)) {
      (parsed as Record<string, unknown>[]).forEach(push);
    } else if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      push(parsed as Record<string, unknown>);
    }
  }

  return reminders;
}

export function convertRemindersToBackend(
  reminders: ReminderConfig[],
  dueDate?: string,
): { reminderDaysBefore?: number[]; specificDayOfWeek?: number | null; reminderConfig?: ReminderConfig[] | null } {
  const daysBefore: number[] = [];
  let dayOfWeek: number | undefined;
  const configs: ReminderConfig[] = [];

  reminders.forEach((r) => {
    if (r.timeframe === ReminderTimeframe.EVERY_DAY) {
      configs.push(r);
      return;
    }
    if (r.timeframe === ReminderTimeframe.SPECIFIC_DATE && r.customDate) {
      configs.push(r);
      return;
    }
    if (r.timeframe === ReminderTimeframe.SPECIFIC_DATE && r.specificDate) {
      configs.push(r);
      return;
    }
    if (
      r.timeframe === ReminderTimeframe.EVERY_MONTH ||
      r.timeframe === ReminderTimeframe.EVERY_YEAR
    ) {
      configs.push(r);
      return;
    }
    if (r.daysBefore != null && r.daysBefore > 0 && dueDate) {
      daysBefore.push(r.daysBefore);
    }
    if (r.timeframe === ReminderTimeframe.EVERY_WEEK && r.dayOfWeek != null) {
      dayOfWeek = r.dayOfWeek;
    }
  });

  const result: {
    reminderDaysBefore?: number[];
    specificDayOfWeek?: number | null;
    reminderConfig?: ReminderConfig[] | null;
  } = {
    reminderDaysBefore: daysBefore.length ? [...new Set(daysBefore)].sort((a, b) => b - a) : [],
    specificDayOfWeek:
      dayOfWeek != null && dayOfWeek >= 0 && dayOfWeek <= 6 ? dayOfWeek : null,
    reminderConfig: configs.length ? configs : null,
  };

  return result;
}
