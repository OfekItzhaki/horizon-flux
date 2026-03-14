/**
 * Validation helpers for task due dates and reminder date/time fields.
 */
export interface ValidationResult {
    valid: boolean;
    error?: string;
}
/**
 * Validate task due date (YYYY-MM-DD). Empty is valid (clears due date).
 * Past dates are allowed (e.g. overdue tasks).
 */
export declare function validateDueDate(value: string): ValidationResult;
/**
 * Validate reminder time (HH:mm, 24h).
 */
export declare function validateTime(value: string): ValidationResult;
/**
 * Validate custom reminder date (YYYY-MM-DD). Required, must be valid and not in the past.
 */
export declare function validateCustomReminderDate(value: string): ValidationResult;
/**
 * Validate "days before due date" (non‑negative integer). Empty is valid (optional).
 */
export declare function validateDaysBefore(value: string): ValidationResult;
/**
 * Normalize time to HH:mm, or undefined if invalid.
 */
export declare function normalizeTime(value: string): string | undefined;
