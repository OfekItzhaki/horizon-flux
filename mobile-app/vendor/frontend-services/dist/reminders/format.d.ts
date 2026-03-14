/**
 * Format reminder for display (shared: web + mobile).
 * Optional i18n `t` for web; mobile can omit it.
 */
import type { ReminderConfig } from './types';
type T = ((key: string, opts?: {
    defaultValue?: string;
    count?: number;
}) => string) | undefined;
export interface FormatReminderOptions {
    /** When false, times are shown in 12h (e.g. 9:00 AM). When true, 24h (e.g. 09:00). Default: true. */
    use24h?: boolean;
}
/**
 * Format a time string (HH:mm) for display.
 * @param timeStr - 24h time like "09:00" or "14:30"
 * @param use24h - true = "09:00" / "14:30", false = "9:00 AM" / "2:30 PM"
 */
export declare function formatTimeForDisplay(timeStr: string, use24h: boolean): string;
export declare function formatReminderDisplay(reminder: ReminderConfig, t?: T, options?: FormatReminderOptions): string;
export {};
