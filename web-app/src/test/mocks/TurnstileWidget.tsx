import { forwardRef, useLayoutEffect, useRef } from 'react';
import { type TurnstileInstance } from '@marsidev/react-turnstile';

interface TurnstileWidgetProps {
  onSuccess: (token: string) => void;
  onError?: (error: string) => void;
  onExpire?: () => void;
}

/**
 * Mock TurnstileWidget for testing.
 * Automatically calls onSuccess with a test token when mounted.
 */
const TurnstileWidget = forwardRef<TurnstileInstance, TurnstileWidgetProps>(
  ({ onSuccess }, ref) => {
    const hasCalledSuccess = useRef(false);

    // Use useLayoutEffect to call onSuccess synchronously before paint
    // This ensures the token is set before any user interactions
    useLayoutEffect(() => {
      if (!hasCalledSuccess.current) {
        hasCalledSuccess.current = true;
        onSuccess('test-captcha-token');
      }
    }, [onSuccess]);

    // Expose reset method for testing
    useLayoutEffect(() => {
      if (ref && typeof ref === 'object') {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (ref as any).current = {
          reset: () => {
            // Re-generate token on reset
            hasCalledSuccess.current = false;
            onSuccess('test-captcha-token');
            hasCalledSuccess.current = true;
          },
        };
      }
    }, [ref, onSuccess]);

    return <div data-testid="turnstile-widget">CAPTCHA Widget (Test Mode)</div>;
  }
);

TurnstileWidget.displayName = 'TurnstileWidget';

export default TurnstileWidget;
