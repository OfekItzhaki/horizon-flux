import { Alert } from 'react-native';

/**
 * Extract error message from various error formats
 */
export function extractErrorMessage(error: any, defaultMessage: string): string {
  if (!error) return defaultMessage;
  
  // Axios error format
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }
  
  // Direct message property
  if (error?.message) {
    return error.message;
  }
  
  // String error
  if (typeof error === 'string') {
    return error;
  }
  
  return defaultMessage;
}

/**
 * Check if error is an authentication error (401)
 */
export function isAuthError(error: any): boolean {
  if (!error) return false;
  
  const statusCode = error?.response?.status;
  const message = error?.message?.toLowerCase() || '';
  
  return statusCode === 401 || message.includes('unauthorized');
}

/**
 * Check if error is a timeout error
 */
export function isTimeoutError(error: any): boolean {
  if (!error) return false;
  
  const message = extractErrorMessage(error, '').toLowerCase();
  const code = error?.code;
  
  return (
    message.includes('too long') ||
    message.includes('timeout') ||
    code === 'ECONNABORTED'
  );
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
