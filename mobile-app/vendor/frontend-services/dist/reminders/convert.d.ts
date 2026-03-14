/**
 * Convert between backend reminder format and ReminderConfig (shared: web + mobile).
 */
import type { ReminderConfig } from './types';
export declare function convertBackendToReminders(reminderDaysBefore: number[] | undefined, specificDayOfWeek: number | null | undefined, dueDate: string | null | undefined, reminderConfig?: unknown): ReminderConfig[];
export declare function convertRemindersToBackend(reminders: ReminderConfig[], dueDate?: string): {
    reminderDaysBefore?: number[];
    specificDayOfWeek?: number | null;
    reminderConfig?: ReminderConfig[] | null;
};
