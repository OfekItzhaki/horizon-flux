// Ensure API base URL matches MSW handlers (http://localhost:3000)
if (typeof process !== 'undefined' && process.env) {
  process.env.API_BASE_URL = 'http://localhost:3000';
}

// Set Turnstile site key for testing
import.meta.env.VITE_TURNSTILE_SITE_KEY = '1x00000000000000000000AA';

import { afterEach, beforeAll, afterAll, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { server } from './mocks/server';

// Mock the TurnstileWidget component for all tests
vi.mock('../components/TurnstileWidget', async () => {
  const mockModule = await import('./mocks/TurnstileWidget');
  return { default: mockModule.default };
});

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => {
  server.resetHandlers();
  cleanup();
});
afterAll(() => server.close());
