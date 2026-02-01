import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from 'react-error-boundary';
import { Toaster } from 'react-hot-toast';
import * as Sentry from '@sentry/react';
import App from './App.tsx';
import ErrorFallback from './components/ErrorFallback';
import './i18n';
import './index.css';

const sentryDsn = import.meta.env.VITE_SENTRY_DSN?.trim();
if (sentryDsn) {
  Sentry.init({
    dsn: sentryDsn,
    environment: import.meta.env.MODE || 'development',
    integrations: [Sentry.browserTracingIntegration()],
    tracesSampleRate: import.meta.env.PROD ? 0.1 : 1.0,
    beforeSend(event) {
      if (event.request?.headers) {
        const headers = { ...event.request.headers };
        if (headers['Authorization']) headers['Authorization'] = '[Redacted]';
        if (headers['authorization']) headers['authorization'] = '[Redacted]';
        event.request = { ...event.request, headers };
      }
      if (event.request?.data && typeof event.request.data === 'object') {
        const data = event.request.data as Record<string, unknown>;
        const scrubbed: Record<string, unknown> = {};
        for (const [k, v] of Object.entries(data)) {
          if (['password', 'token', 'accessToken', 'refreshToken'].includes(k)) scrubbed[k] = '[Redacted]';
          else if (k === 'email' && typeof v === 'string') scrubbed[k] = v.replace(/(.{2}).*@(.*)/, '$1***@$2');
          else scrubbed[k] = v;
        }
        event.request = { ...event.request, data: scrubbed };
      }
      return event;
    },
  });
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Increased staleTime for better caching - data is considered fresh for 5 minutes
      staleTime: 5 * 60 * 1000, // 5 minutes
      // Keep data in cache for 10 minutes after last use
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      retry: 1,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      // Don't refetch on mount if data is still fresh
      refetchOnMount: false,
    },
    mutations: {
      retry: 0,
    },
  },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary
        FallbackComponent={ErrorFallback}
        onError={(error) => {
          if (sentryDsn) Sentry.captureException(error);
        }}
      >
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <App />
        </BrowserRouter>
      </ErrorBoundary>
      <Toaster position="top-right" />
    </QueryClientProvider>
  </StrictMode>
);
