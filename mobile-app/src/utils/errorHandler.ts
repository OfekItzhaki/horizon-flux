import { Alert } from 'react-native';

/**
 * Check if an error message is technical/internal (should not be shown to users)
 */
function isTechnicalError(message: string): boolean {
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
  ];
  
  return technicalPatterns.some(pattern => pattern.test(message));
}

/**
 * Extract error message from various error formats
 * Always returns user-friendly messages, never technical errors
 */
export function extractErrorMessage(error: any, defaultMessage: string): string {
  if (!error) return defaultMessage;
  
  try {
    let message: string | null = null;
    
    // Axios error format (preferred - usually user-friendly)
    if (error?.response?.data?.message) {
      message = String(error.response.data.message);
    }
    // Direct message property
    else if (error?.message) {
      message = String(error.message);
    }
    // String error
    else if (typeof error === 'string') {
      message = error;
    }
    // Try to stringify the error
    else if (error?.toString && typeof error.toString === 'function') {
      const errorString = error.toString();
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
  } catch {
    // If anything fails, return default message
    return defaultMessage;
  }
}

/**
 * Check if error is an authentication error (401)
 */
export function isAuthError(error: any): boolean {
  if (!error) return false;
  
  try {
    const statusCode = error?.response?.status;
    const message = (error?.message || '').toLowerCase();
    
    return statusCode === 401 || message.includes('unauthorized');
  } catch {
    return false;
  }
}

/**
 * Check if error is a timeout error
 */
export function isTimeoutError(error: any): boolean {
  if (!error) return false;
  
  try {
    const message = extractErrorMessage(error, '').toLowerCase();
    const code = error?.code;
    
    return (
      message.includes('too long') ||
      message.includes('timeout') ||
      code === 'ECONNABORTED'
    );
  } catch {
    return false;
  }
}

/**
 * Show error alert with consistent formatting
 */
export function showErrorAlert(
  title: string,
  error: any,
  defaultMessage?: string,
): void {
  const message = extractErrorMessage(error, defaultMessage || 'An error occurred. Please try again.');
  Alert.alert(title, message);
}

/**
 * Handle API errors with automatic auth error detection
 */
export function handleApiError(
  error: any,
  defaultMessage: string,
  onAuthError?: () => void,
): void {
  if (isAuthError(error)) {
    // Auth errors are handled by api-client interceptor
    // But we can call a callback if needed
    if (onAuthError) {
      onAuthError();
    }
    return;
  }
  
  // For timeout errors, show user-friendly message
  if (isTimeoutError(error)) {
    const timeoutMessage = defaultMessage.includes('timeout') 
      ? defaultMessage 
      : 'The request is taking too long. Please try again later.';
    showErrorAlert('Request Timeout', timeoutMessage);
    return;
  }
  
  // For other errors, show the error message
  showErrorAlert('Error', error, defaultMessage);
}

/**
 * Get user-friendly error message for common scenarios
 */
export function getFriendlyErrorMessage(error: any, operation: string): string {
  if (isTimeoutError(error)) {
    return `${operation} is taking too long. Please try again later.`;
  }
  
  if (isAuthError(error)) {
    return 'Your session has expired. Please log in again.';
  }
  
  return extractErrorMessage(error, `Unable to ${operation.toLowerCase()}. Please try again.`);
}
