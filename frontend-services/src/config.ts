// Get API base URL - works in both Node.js and browser environments
const getApiBaseUrl = (): string => {
  // 1. Try process.env first - works in Node, Jest, and Expo
  // We check for EXPO_PUBLIC_API_URL first for mobile, then API_BASE_URL for backend/other
  if (typeof process !== 'undefined' && process.env) {
    const env = process.env;
    if (env.EXPO_PUBLIC_API_URL) return env.EXPO_PUBLIC_API_URL;
    if (env.API_BASE_URL) return env.API_BASE_URL;
    // Vite sometimes polyfills process.env.VITE_...
    if ((env as any).VITE_API_URL) return (env as any).VITE_API_URL;
  }

  // 2. Try Vite specific environment variables (import.meta.env)
  // We wrap this in a try-catch and use a more cautious check to avoid breaking Jest/Babel parsers
  try {
    // @ts-ignore
    const meta = import.meta;
    if (meta && (meta as any).env && (meta as any).env.VITE_API_URL) {
      return (meta as any).env.VITE_API_URL;
    }
  } catch (e) {
    // Silently fail if import.meta is not supported (e.g. in Jest/Node CJS)
  }

  // Default fallback
  return 'http://localhost:3000';
};

export const API_CONFIG = {
  baseURL: getApiBaseUrl(),
  timeout: 30000, // 30 seconds
};

export const getApiUrl = (path: string): string => {
  const base = API_CONFIG.baseURL.replace(/\/$/, '');

  // Handle absolute paths by stripping the leading slash
  const cleanPath = path.startsWith('/') ? path : `/${path}`;

  // Special case: if path is already an absolute URL, return it
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }

  return `${base}${cleanPath}`;
};

/**
 * Helper to get the root URL (without /api/v1) for static assets like uploads
 */
export const getAssetUrl = (path: string): string => {
  const root = API_CONFIG.baseURL.split('/api/v1')[0];
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${root}${cleanPath}`;
};
