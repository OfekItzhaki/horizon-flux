/**
 * Shared reminder configuration types (web-app + mobile-app).
 */
export var ReminderTimeframe;
(function (ReminderTimeframe) {
    ReminderTimeframe["SPECIFIC_DATE"] = "SPECIFIC_DATE";
    ReminderTimeframe["EVERY_DAY"] = "EVERY_DAY";
    ReminderTimeframe["EVERY_WEEK"] = "EVERY_WEEK";
    ReminderTimeframe["EVERY_MONTH"] = "EVERY_MONTH";
    ReminderTimeframe["EVERY_YEAR"] = "EVERY_YEAR";
})(ReminderTimeframe || (ReminderTimeframe = {}));
export var ReminderSpecificDate;
(function (ReminderSpecificDate) {
    ReminderSpecificDate["START_OF_WEEK"] = "START_OF_WEEK";
    ReminderSpecificDate["START_OF_MONTH"] = "START_OF_MONTH";
    ReminderSpecificDate["START_OF_YEAR"] = "START_OF_YEAR";
    ReminderSpecificDate["CUSTOM_DATE"] = "CUSTOM_DATE";
})(ReminderSpecificDate || (ReminderSpecificDate = {}));
export const DAY_NAMES = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
];
