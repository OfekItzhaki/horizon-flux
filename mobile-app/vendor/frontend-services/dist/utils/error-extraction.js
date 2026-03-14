/**
 * Check if an error message is technical/internal (should not be shown to users)
 */
export function isTechnicalError(message) {
    const technicalPatterns = [
        /^ReferenceError:/i,
        /^TypeError:/i,
        /^SyntaxError:/i,
        /is not a function/i,
        /is undefined/i,
        /Cannot read property/i,
        /Cannot access/i,
        /Property.*doesn't exist/i,
        /Property.*does not exist/i,
        /_services/i,
        /\.get[A-Z]/,
        /at \w+ \(/,
        /at Object\./,
        /UserSTorage/i,
        /UserStorage/i,
        /TokenStorage/i,
    ];
    return technicalPatterns.some((pattern) => pattern.test(message));
}
/**
 * Extract error message from various error formats
 * Always returns user-friendly messages, never technical errors
 */
export function extractErrorMessage(error, defaultMessage) {
    if (!error)
        return defaultMessage;
    try {
        let message = null;
        // ApiError format (from frontend-services)
        const apiError = error;
        if (apiError?.message) {
            if (Array.isArray(apiError.message)) {
                message = apiError.message.join(', ');
            }
            else if (typeof apiError.message === 'string') {
                message = apiError.message;
            }
        }
        // Standard Error format
        else if (error instanceof Error && error.message) {
            message = error.message;
        }
        // String error
        else if (typeof error === 'string') {
            message = error;
        }
        // Try to stringify the error
        else if (error && typeof error === 'object' && 'toString' in error) {
            // For objects that are not null, check if they have a non-default toString
            const errorString = String(error);
            if (errorString !== '[object Object]') {
                message = errorString;
            }
        }
        // If we have a message, check if it's technical
        if (message && !isTechnicalError(message)) {
            return message;
        }
        // If message is technical or we couldn't extract one, return default
        return defaultMessage;
    }
    catch {
        // If anything fails, return default message
        return defaultMessage;
    }
}
/**
 * Check if error is an authentication error (401)
 */
export function isAuthError(error) {
    if (!error)
        return false;
    try {
        const e = error;
        const statusCode = e?.statusCode ?? e?.response?.status;
        const message = extractErrorMessage(error, '').toLowerCase();
        return statusCode === 401 || message.includes('unauthorized');
    }
    catch {
        return false;
    }
}
/**
 * Check if error is a timeout error
 */
export function isTimeoutError(error) {
    if (!error)
        return false;
    try {
        const message = extractErrorMessage(error, '').toLowerCase();
        const apiError = error;
        const code = apiError?.code;
        return message.includes('too long') || message.includes('timeout') || code === 'ECONNABORTED';
    }
    catch {
        return false;
    }
}
