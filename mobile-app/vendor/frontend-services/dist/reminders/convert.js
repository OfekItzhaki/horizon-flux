/**
 * Convert between backend reminder format and ReminderConfig (shared: web + mobile).
 */
import { ReminderTimeframe } from './types';
export function convertBackendToReminders(reminderDaysBefore, specificDayOfWeek, dueDate, reminderConfig) {
    const reminders = [];
    // 1. Process reminderConfig first (it has the most data: hasAlarm, location, etc.)
    if (reminderConfig != null) {
        let parsed = reminderConfig;
        if (typeof reminderConfig === 'string') {
            try {
                parsed = JSON.parse(reminderConfig);
            }
            catch {
                parsed = null;
            }
        }
        const push = (c) => {
            if (!c || !c.timeframe)
                return;
            const tf = typeof c.timeframe === 'string'
                ? c.timeframe
                : c.timeframe;
            reminders.push({
                id: c.id || `reminder-${Date.now()}-${Math.random()}`,
                timeframe: tf,
                time: c.time || '09:00',
                specificDate: c.specificDate,
                customDate: c.customDate,
                dayOfWeek: c.dayOfWeek,
                daysBefore: c.daysBefore,
                hasAlarm: Boolean(c.hasAlarm),
                location: typeof c.location === 'string' ? c.location : undefined,
            });
        };
        if (Array.isArray(parsed)) {
            parsed.forEach(push);
        }
        else if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
            push(parsed);
        }
    }
    // 2. Process legacy fields, but avoid duplicates if they were already in reminderConfig
    if (reminderDaysBefore?.length && dueDate) {
        reminderDaysBefore.forEach((days) => {
            const exists = reminders.some((r) => r.timeframe === ReminderTimeframe.SPECIFIC_DATE && r.daysBefore === days);
            if (!exists) {
                reminders.push({
                    id: `days-before-${days}`,
                    timeframe: ReminderTimeframe.SPECIFIC_DATE,
                    time: '09:00',
                    daysBefore: days,
                });
            }
        });
    }
    if (specificDayOfWeek != null && specificDayOfWeek >= 0 && specificDayOfWeek <= 6) {
        const exists = reminders.some((r) => r.timeframe === ReminderTimeframe.EVERY_WEEK && r.dayOfWeek === specificDayOfWeek);
        if (!exists) {
            reminders.push({
                id: `day-of-week-${specificDayOfWeek}`,
                timeframe: ReminderTimeframe.EVERY_WEEK,
                time: '09:00',
                dayOfWeek: specificDayOfWeek,
            });
        }
    }
    return reminders;
}
export function convertRemindersToBackend(reminders, dueDate) {
    const daysBefore = [];
    let dayOfWeek;
    // All reminders now stay in config to preserve hasAlarm, location, etc.
    const configs = reminders;
    reminders.forEach((r) => {
        // Keep syncing to legacy fields for backend filtering visibility
        if (r.daysBefore != null && r.daysBefore > 0 && dueDate) {
            daysBefore.push(r.daysBefore);
        }
        if (r.timeframe === ReminderTimeframe.EVERY_WEEK && r.dayOfWeek != null) {
            dayOfWeek = r.dayOfWeek;
        }
    });
    const result = {
        reminderDaysBefore: daysBefore.length ? [...new Set(daysBefore)].sort((a, b) => b - a) : [],
        specificDayOfWeek: dayOfWeek != null && dayOfWeek >= 0 && dayOfWeek <= 6 ? dayOfWeek : null,
        reminderConfig: configs.length ? configs : null,
    };
    return result;
}
