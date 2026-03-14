/**
 * Check if an error message is technical/internal (should not be shown to users)
 */
export declare function isTechnicalError(message: string): boolean;
/**
 * Extract error message from various error formats
 * Always returns user-friendly messages, never technical errors
 */
export declare function extractErrorMessage(error: unknown, defaultMessage: string): string;
/**
 * Check if error is an authentication error (401)
 */
export declare function isAuthError(error: unknown): boolean;
/**
 * Check if error is a timeout error
 */
export declare function isTimeoutError(error: unknown): boolean;
