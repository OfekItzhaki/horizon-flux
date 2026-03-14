/**
 * Shared reminder configuration types (web-app + mobile-app).
 */
export declare enum ReminderTimeframe {
    SPECIFIC_DATE = "SPECIFIC_DATE",
    EVERY_DAY = "EVERY_DAY",
    EVERY_WEEK = "EVERY_WEEK",
    EVERY_MONTH = "EVERY_MONTH",
    EVERY_YEAR = "EVERY_YEAR"
}
export declare enum ReminderSpecificDate {
    START_OF_WEEK = "START_OF_WEEK",
    START_OF_MONTH = "START_OF_MONTH",
    START_OF_YEAR = "START_OF_YEAR",
    CUSTOM_DATE = "CUSTOM_DATE"
}
export interface ReminderConfig {
    id: string;
    timeframe: ReminderTimeframe;
    time?: string;
    specificDate?: ReminderSpecificDate;
    customDate?: string;
    dayOfWeek?: number;
    daysBefore?: number;
    hasAlarm?: boolean;
    /** Optional location for the reminder (e.g. address, place name). */
    location?: string;
}
export declare const DAY_NAMES: string[];
